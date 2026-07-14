import { InjPassConnector } from "@injpass/cli";
import { stringToHex, toBytes, type Hex } from "viem";

const MINI_APP_CHANNEL = "injpass-miniapp-v1";

interface MiniAppSession {
  authenticated: boolean;
  address: string | null;
  walletName?: string;
  chainId: number;
  language?: string;
}

interface ConnectedWallet {
  address: string;
  walletName?: string;
  signer: {
    signMessage: (message: string) => Promise<Uint8Array>;
  };
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: number;
}

class EmbeddedInjPassConnector {
  private readonly hostOrigin: string;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly sessionListeners = new Set<(session: MiniAppSession) => void>();
  private session: MiniAppSession | null = null;
  private requestCounter = 0;

  static isEmbedded(): boolean {
    if (typeof window === "undefined" || window.parent === window) return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("injpass_miniapp") === "1"
      || window.sessionStorage.getItem("injpass.miniapp.active") === "1";
  }

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const configuredOrigin = params.get("injpass_host_origin")
      || window.sessionStorage.getItem("injpass.miniapp.parentOrigin")
      || (document.referrer ? new URL(document.referrer).origin : "");
    if (!configuredOrigin) throw new Error("Unable to determine the INJ Pass host origin.");
    this.hostOrigin = new URL(configuredOrigin).origin;
    window.sessionStorage.setItem("injpass.miniapp.active", "1");
    window.sessionStorage.setItem("injpass.miniapp.parentOrigin", this.hostOrigin);
    window.addEventListener("message", this.handleMessage);
    this.post({ type: "ready" });
  }

  getSession(): MiniAppSession | null {
    return this.session;
  }

  onSession(listener: (session: MiniAppSession) => void): () => void {
    this.sessionListeners.add(listener);
    if (this.session) queueMicrotask(() => listener(this.session as MiniAppSession));
    return () => this.sessionListeners.delete(listener);
  }

  async waitForSession(timeoutMs = 10_000): Promise<MiniAppSession> {
    if (this.session) return this.session;
    this.post({ type: "ready" });
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        unsubscribe();
        reject(new Error("INJ Pass host session was not received."));
      }, timeoutMs);
      const unsubscribe = this.onSession((session) => {
        window.clearTimeout(timer);
        unsubscribe();
        resolve(session);
      });
    });
  }

  async requestLogin(): Promise<MiniAppSession> {
    await this.request("injpass_requestLogin", []);
    const current = this.session;
    if (current?.authenticated && current.address) return current;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        unsubscribe();
        reject(new Error("INJ Pass login was not completed."));
      }, 180_000);
      const unsubscribe = this.onSession((session) => {
        if (!session.authenticated || !session.address) return;
        window.clearTimeout(timer);
        unsubscribe();
        resolve(session);
      });
    });
  }

  async requestLogout(): Promise<void> {
    await this.request("injpass_requestLogout", []);
  }

  async signMessage(message: string, address: string): Promise<Uint8Array> {
    const signature = await this.request("personal_sign", [stringToHex(message), address]);
    return toBytes(signature as Hex);
  }

  private request(method: string, params: unknown[]): Promise<unknown> {
    const id = `omisper-miniapp-${Date.now()}-${++this.requestCounter}`;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`INJ Pass timed out while handling ${method}.`));
      }, 180_000);
      this.pending.set(id, { resolve, reject, timer });
      this.post({ type: "rpc-request", id, method, params });
    });
  }

  private post(payload: Record<string, unknown>): void {
    window.parent.postMessage({ channel: MINI_APP_CHANNEL, ...payload }, this.hostOrigin);
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.source !== window.parent || event.origin !== this.hostOrigin) return;
    const message = event.data as Record<string, unknown> | null;
    if (!message || message.channel !== MINI_APP_CHANNEL) return;
    if (message.type === "session" && message.session && typeof message.session === "object") {
      this.session = message.session as MiniAppSession;
      this.sessionListeners.forEach((listener) => listener(this.session as MiniAppSession));
      return;
    }
    if (message.type !== "rpc-response" || typeof message.id !== "string") return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    window.clearTimeout(pending.timer);
    this.pending.delete(message.id);
    if (message.error && typeof message.error === "object") {
      const error = message.error as { message?: string };
      pending.reject(new Error(error.message || "INJ Pass request failed."));
    } else {
      pending.resolve(message.result);
    }
  };
}

export function isEmbeddedInjPassMiniApp(): boolean {
  return EmbeddedInjPassConnector.isEmbedded();
}

/**
 * INJ Pass Wallet Adapter for Omisper
 *
 * Integrates INJ Pass wallet using iframe connector
 */
export class InjPassWalletAdapter {
  private connector: InjPassConnector | null = null;
  private miniAppConnector: EmbeddedInjPassConnector | null = null;
  private wallet: ConnectedWallet | null = null;
  private connected = false;
  private listeners: Set<() => void> = new Set();
  private isDisconnecting = false;

  constructor() {
    if (isEmbeddedInjPassMiniApp()) {
      this.miniAppConnector = new EmbeddedInjPassConnector();
      this.miniAppConnector.onSession((session) => {
        this.applyMiniAppSession(session);
      });
      void this.miniAppConnector.waitForSession().then((session) => {
        this.applyMiniAppSession(session);
      }).catch(() => undefined);
      return;
    }

    // Detect mobile for better UX
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    // Get embed URL from environment variable
    const embedUrl = import.meta.env.VITE_INJPASS_EMBED_URL || "http://localhost:3000/embed";

    this.connector = new InjPassConnector({
      embedUrl,
      mode: isMobile ? 'modal' : 'floating',
      position: { bottom: '20px', right: '20px' },
      size: isMobile
        ? { width: '90vw', height: '60vh' }
        : { width: '400px', height: '300px' },
      autoHide: true  // Hide iframe when connected to avoid covering the UI
    });

    // Listen for disconnect events from SDK (when user clicks disconnect in embed)
    // Use isDisconnecting flag to prevent infinite recursion
    this.connector.onDisconnect(() => {
      if (!this.isDisconnecting) {
        this.isDisconnecting = true;
        this.disconnect();
      }
    });
  }

  private applyMiniAppSession(session: MiniAppSession): void {
    if (session.authenticated && session.address && this.miniAppConnector) {
      const connector = this.miniAppConnector;
      const address = session.address;
      this.wallet = {
        address,
        walletName: session.walletName,
        signer: {
          signMessage: (message: string) => connector.signMessage(message, address),
        },
      };
      this.connected = true;
    } else {
      this.wallet = null;
      this.connected = false;
    }
    this.notifyListeners();
  }

  /**
   * Subscribe to connection state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all subscribers of state change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Connect to INJ Pass wallet
   * @returns Injective wallet address (inj1...)
   */
  async connect(): Promise<string> {
    if (this.connected && this.wallet) {
      return this.wallet.address;
    }

    try {
      if (this.miniAppConnector) {
        const initial = await this.miniAppConnector.waitForSession();
        const session = initial.authenticated && initial.address
          ? initial
          : await this.miniAppConnector.requestLogin();
        this.applyMiniAppSession(session);
        if (!this.wallet) throw new Error("INJ Pass wallet is not unlocked.");
        return this.wallet.address;
      }
      if (!this.connector) throw new Error("INJ Pass wallet connector is unavailable.");
      this.wallet = await this.connector.connect();
      this.connected = true;
      console.log('✅ INJ Pass connected:', {
        address: this.wallet.address,
        walletName: this.wallet.walletName,
      });
      this.notifyListeners();
      return this.wallet.address;
    } catch (error) {
      console.error('INJ Pass connection failed:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to connect to INJ Pass wallet'
      );
    }
  }

  /**
   * Get current wallet address (0x... EVM format)
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Get wallet name
   */
  getWalletName(): string | null {
    return this.wallet?.walletName || null;
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @returns Signature as Uint8Array
   */
  async signMessage(message: string): Promise<Uint8Array> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.wallet.signer.signMessage(message);
    } catch (error) {
      console.error('Signing failed:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to sign message'
      );
    }
  }

  /**
   * Sign transaction data for XMTP
   * @param data - Transaction data object
   * @returns Signature
   */
  async signTransaction(data: any): Promise<Uint8Array> {
    const message = JSON.stringify(data);
    return this.signMessage(message);
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    if (this.miniAppConnector) {
      void this.miniAppConnector.requestLogout();
    } else {
      this.connector?.disconnect();
    }
    this.wallet = null;
    this.connected = false;
    this.isDisconnecting = false;
    this.notifyListeners();
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connected && this.wallet !== null;
  }

  /**
   * Show wallet UI (if hidden)
   */
  showWallet(): void {
    this.connector?.show();
  }

  /**
   * Hide wallet UI
   */
  hideWallet(): void {
    this.connector?.hide();
  }
}

/**
 * Singleton instance for global use
 */
let injPassWallet: InjPassWalletAdapter | null = null;

/**
 * Get or create INJ Pass wallet instance
 */
export function getInjPassWallet(): InjPassWalletAdapter {
  if (!injPassWallet) {
    injPassWallet = new InjPassWalletAdapter();
  }
  return injPassWallet;
}
