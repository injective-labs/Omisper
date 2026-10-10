import { GroupMessageKind, SortDirection, type Client, type Identifier } from "@xmtp/browser-sdk";
import { useEffect, useRef } from "react";
import { hexToUint8Array } from "uint8array-extras";
import { type ContentTypes, useXMTP } from "@/contexts/XMTPContext";
import { createInjPassSigner } from "@/helpers/createSigner";
import { useSettings } from "@/hooks/useSettings";
import { getInjPassWallet } from "@/services/injpass-wallet";

const CHANNEL = "injpass-miniapp-v1";

interface AgentCommand {
  appId: string;
  action: string;
  rawText: string;
  language: string;
  params?: {
    addresses?: string[];
    message?: string;
  };
}

interface AgentResult {
  ok: boolean;
  key: string;
  data?: Record<string, unknown>;
  message?: string;
}

function hostOrigin(): string | null {
  if (typeof window === "undefined" || window.parent === window) return null;
  const params = new URLSearchParams(window.location.search);
  const configured = params.get("injpass_host_origin")
    || window.sessionStorage.getItem("injpass.miniapp.parentOrigin");
  try {
    return configured ? new URL(configured).origin : document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}

function identifier(address: string): Identifier {
  return {
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum",
  };
}

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object") {
    const value = content as Record<string, unknown>;
    if (typeof value.text === "string") return value.text;
    if (typeof value.content === "string") return value.content;
  }
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

function short(value: string, start = 6, end = 4): string {
  return value.length > start + end ? `${value.slice(0, start)}...${value.slice(-end)}` : value;
}

type AgentConversation = Awaited<ReturnType<Client<ContentTypes>["conversations"]["list"]>>[number];

// XMTP identifies people by inbox ID; the host should show their wallet address.
async function memberAddresses(conversation: AgentConversation): Promise<Map<string, string>> {
  const members = await conversation.members();
  return new Map(members.flatMap((member) => {
    const address = member.accountIdentifiers.find((item) => item.identifierKind === "Ethereum")?.identifier;
    return address ? [[member.inboxId, address] as const] : [];
  }));
}

// Newest application messages first from the local database, returned oldest-first.
async function recentMessages(conversation: AgentConversation, limit: bigint) {
  const messages = await conversation.messages({
    limit,
    direction: SortDirection.Descending,
    kind: GroupMessageKind.Application,
  });
  return messages.reverse();
}

async function conversationTitle(conversation: AgentConversation, ownInboxId: string | undefined): Promise<string> {
  const name = (conversation as unknown as { name?: string }).name;
  if (name) return name;
  const addresses = await memberAddresses(conversation);
  const peers = [...addresses].filter(([inboxId]) => inboxId !== ownInboxId).map(([, address]) => short(address));
  return peers.length > 0 ? peers.join(", ") : short(conversation.id);
}

export function InjPassAgentBridge() {
  const { client, initialize } = useXMTP();
  const { encryptionKey, environment, loggingLevel } = useSettings();
  const clientRef = useRef(client);
  const initializeRef = useRef(initialize);
  const settingsRef = useRef({ encryptionKey, environment, loggingLevel });
  clientRef.current = client;
  initializeRef.current = initialize;
  settingsRef.current = { encryptionKey, environment, loggingLevel };

  useEffect(() => {
    const origin = hostOrigin();
    if (!origin) return;
    const wallet = getInjPassWallet();

    const respond = (id: string, result: AgentResult) => {
      window.parent.postMessage({
        channel: CHANNEL,
        type: "agent-command-result",
        id,
        result,
      }, origin);
    };

    const requireClient = async (): Promise<Client<ContentTypes> | null> => {
      if (clientRef.current) return clientRef.current;
      const address = wallet.getAddress();
      if (!address || !wallet.isConnected()) return null;
      const settings = settingsRef.current;
      const next = await initializeRef.current({
        dbEncryptionKey: settings.encryptionKey
          ? hexToUint8Array(settings.encryptionKey)
          : undefined,
        env: settings.environment,
        loggingLevel: settings.loggingLevel,
        signer: createInjPassSigner(address, (message) => wallet.signMessage(message)),
      });
      if (next) clientRef.current = next;
      return next || clientRef.current || null;
    };

    const handleCommand = async (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== origin) return;
      const payload = event.data as Record<string, unknown> | null;
      if (!payload || payload.channel !== CHANNEL || payload.type !== "agent-command" || typeof payload.id !== "string") return;
      const command = payload.command as AgentCommand | undefined;
      if (!command || command.appId !== "omisper") return;

      try {
        if (command.action === "open") {
          respond(payload.id, { ok: true, key: "app_ready" });
          return;
        }

        const xmtp = await requireClient();
        if (!xmtp) {
          respond(payload.id, { ok: false, key: "login_required" });
          return;
        }

        const addresses = (command.params?.addresses || []).filter((value, index, list) => (
          /^0x[a-fA-F0-9]{40}$/.test(value) && list.indexOf(value) === index
        ));
        const message = command.params?.message?.trim();

        const unavailableRecipients = async (targets: string[]) => {
          const availability = await xmtp.canMessage(targets.map(identifier));
          return targets.filter((target) => !availability.get(target.toLowerCase()));
        };

        if (command.action === "send") {
          if (!addresses[0]) {
            respond(payload.id, { ok: false, key: "missing_recipient" });
            return;
          }
          if (!message) {
            respond(payload.id, { ok: false, key: "missing_message" });
            return;
          }
          const unavailable = await unavailableRecipients([addresses[0]]);
          if (unavailable.length > 0) {
            respond(payload.id, {
              ok: false,
              key: "recipient_unavailable",
              data: { recipients: unavailable },
            });
            return;
          }
          const conversation = await xmtp.conversations.newDmWithIdentifier(identifier(addresses[0]));
          await conversation.send(message);
          respond(payload.id, {
            ok: true,
            key: "omisper_sent",
            data: {
              recipient: addresses[0],
              recipientCount: 1,
              conversationId: conversation.id,
              message,
            },
          });
          return;
        }

        if (command.action === "broadcast") {
          if (addresses.length < 2) {
            respond(payload.id, { ok: false, key: "missing_recipient" });
            return;
          }
          if (!message) {
            respond(payload.id, { ok: false, key: "missing_message" });
            return;
          }
          const unavailable = await unavailableRecipients(addresses);
          if (unavailable.length > 0) {
            respond(payload.id, {
              ok: false,
              key: "recipient_unavailable",
              data: { recipients: unavailable },
            });
            return;
          }
          const conversationIds = await Promise.all(addresses.map(async (address) => {
            const conversation = await xmtp.conversations.newDmWithIdentifier(identifier(address));
            await conversation.send(message);
            return conversation.id;
          }));
          respond(payload.id, {
            ok: true,
            key: "omisper_broadcast_sent",
            data: {
              recipientCount: addresses.length,
              conversationIds,
              message,
            },
          });
          return;
        }

        if (command.action === "group") {
          if (addresses.length < 2) {
            respond(payload.id, { ok: false, key: "missing_recipient" });
            return;
          }
          if (!message) {
            respond(payload.id, { ok: false, key: "missing_message" });
            return;
          }
          const unavailable = await unavailableRecipients(addresses);
          if (unavailable.length > 0) {
            respond(payload.id, {
              ok: false,
              key: "recipient_unavailable",
              data: { recipients: unavailable },
            });
            return;
          }
          const conversation = await xmtp.conversations.newGroupWithIdentifiers(addresses.map(identifier));
          await conversation.send(message);
          respond(payload.id, {
            ok: true,
            key: "omisper_group_sent",
            data: {
              recipientCount: addresses.length,
              conversationId: conversation.id,
              message,
            },
          });
          return;
        }

        if (command.action === "history") {
          if (!addresses[0]) {
            respond(payload.id, { ok: false, key: "missing_recipient" });
            return;
          }
          // syncAll also pulls new messages into conversations this device already has.
          await xmtp.conversations.syncAll();
          const conversation = await xmtp.conversations.getDmByIdentifier(identifier(addresses[0]));
          const messages = conversation ? await recentMessages(conversation, 10n) : [];
          const senders = conversation ? await memberAddresses(conversation) : new Map<string, string>();
          respond(payload.id, {
            ok: true,
            key: "omisper_history",
            data: {
              target: addresses[0],
              messages: messages.map((item) => ({
                sender: short(senders.get(item.senderInboxId) || item.senderInboxId),
                fromSelf: item.senderInboxId === xmtp.inboxId,
                content: contentText(item.content),
              })),
            },
          });
          return;
        }

        if (command.action === "inbox") {
          await xmtp.conversations.syncAll();
          const conversations = await xmtp.conversations.list();
          const latest = await Promise.all(conversations.slice(0, 12).map(async (conversation) => {
            const messages = await recentMessages(conversation, 5n);
            const senders = await memberAddresses(conversation);
            const last = messages[messages.length - 1];
            return {
              id: conversation.id,
              title: await conversationTitle(conversation, xmtp.inboxId),
              preview: last ? contentText(last.content) : "",
              sentAt: last?.sentAtNs.toString() || "0",
              messages: messages.map((item) => ({
                sender: short(senders.get(item.senderInboxId) || item.senderInboxId),
                fromSelf: item.senderInboxId === xmtp.inboxId,
                content: contentText(item.content),
              })),
            };
          }));
          latest.sort((left, right) => {
            const leftTime = BigInt(left.sentAt);
            const rightTime = BigInt(right.sentAt);
            return leftTime === rightTime ? 0 : leftTime > rightTime ? -1 : 1;
          });
          respond(payload.id, {
            ok: true,
            key: "omisper_inbox",
            data: { conversationCount: conversations.length, latest: latest.slice(0, 5) },
          });
          return;
        }

        respond(payload.id, { ok: false, key: "unknown_error" });
      } catch (error) {
        respond(payload.id, {
          ok: false,
          key: "unknown_error",
          message: error instanceof Error ? error.message : "Omisper command failed.",
        });
      }
    };

    window.addEventListener("message", handleCommand);
    window.parent.postMessage({ channel: CHANNEL, type: "ready" }, origin);
    return () => window.removeEventListener("message", handleCommand);
  }, []);

  return null;
}
