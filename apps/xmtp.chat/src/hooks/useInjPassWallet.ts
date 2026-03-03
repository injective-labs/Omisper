import { useState, useEffect, useCallback } from 'react';
import { getInjPassWallet } from '../services/injpass-wallet';

interface UseInjPassWalletReturn {
  /** Ethereum-compatible 0x... address */
  address: string | null;
  walletName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<Uint8Array>;
  showWallet: () => void;
  hideWallet: () => void;
}

/**
 * React Hook for INJ Pass Wallet
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, connect, disconnect, isConnected } = useInjPassWallet();
 *   
 *   return (
 *     <div>
 *       {!isConnected ? (
 *         <button onClick={connect}>Connect INJ Pass</button>
 *       ) : (
 *         <div>
 *           <p>Connected: {address}</p>
 *           <button onClick={disconnect}>Disconnect</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInjPassWallet(): UseInjPassWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = getInjPassWallet();

  // Sync state from wallet adapter
  const syncState = useCallback(() => {
    const addr = wallet.getAddress();
    setAddress(addr);
    setWalletName(wallet.getWalletName());
    setIsConnected(wallet.isConnected());
  }, [wallet]);

  // Subscribe to wallet state changes
  useEffect(() => {
    // Initial sync
    syncState();
    
    // Subscribe to updates
    const unsubscribe = wallet.subscribe(syncState);
    
    return unsubscribe;
  }, [wallet, syncState]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await wallet.connect();
      // State will be synced via subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      console.error('INJ Pass connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [wallet]);

  const disconnect = useCallback(() => {
    wallet.disconnect();
    // State will be synced via subscription
    setError(null);
  }, [wallet]);

  const signMessage = useCallback(async (message: string): Promise<Uint8Array> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    return wallet.signMessage(message);
  }, [wallet, isConnected]);

  const showWallet = useCallback(() => {
    wallet.showWallet();
  }, [wallet]);

  const hideWallet = useCallback(() => {
    wallet.hideWallet();
  }, [wallet]);

  return {
    address,
    walletName,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
    showWallet,
    hideWallet,
  };
}
