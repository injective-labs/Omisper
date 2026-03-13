import type {
  Conversation,
  DecodedMessage,
  Identifier,
  SafeCreateGroupOptions,
} from "@xmtp/browser-sdk";
import { useState } from "react";
import { useClient, type ContentTypes } from "@/contexts/XMTPContext";
import { dateToNs } from "@/helpers/date";
import {
  useActions,
  useConversations as useConversationsState,
  useLastCreatedAt,
} from "@/stores/inbox/hooks";

export const useConversations = () => {
  const client = useClient();
  const { addConversations, addConversation, addMessage, setLastSyncedAt } =
    useActions();
  const conversations = useConversationsState();
  const lastCreatedAt = useLastCreatedAt();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const sync = async (fromNetwork: boolean = false) => {
    console.log('[useConversations] sync() called, fromNetwork:', fromNetwork);
    console.log('[useConversations] client:', !!client);
    console.log('[useConversations] lastCreatedAt:', lastCreatedAt);

    if (fromNetwork) {
      setSyncing(true);

      try {
        console.log('[useConversations] Calling client.conversations.sync()...');
        await client.conversations.sync();
        console.log('[useConversations] client.conversations.sync() completed');
      } catch (error) {
        console.error('[useConversations] sync() error:', error);
      } finally {
        setSyncing(false);
      }
    }

    setLoading(true);

    try {
      // When syncing from network, fetch all conversations without time filter
      // to ensure old conversations are not missed. When fromNetwork is false,
      // only fetch new conversations created after lastCreatedAt for efficiency.
      const options = fromNetwork ? {} : { createdAfterNs: lastCreatedAt };
      console.log('[useConversations] Calling client.conversations.list() with options:', options);
      const convos = await client.conversations.list(options);
      console.log('[useConversations] Got conversations:', convos.length);
      await addConversations(convos);
      setLastSyncedAt(dateToNs(new Date()));
      return convos;
    } catch (error) {
      console.error('[useConversations] list() error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);

    try {
      await client.conversations.syncAll();
    } finally {
      setSyncing(false);
    }
  };

  const getConversationById = async (conversationId: string) => {
    setLoading(true);

    try {
      const conversation =
        await client.conversations.getConversationById(conversationId);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const getDmByInboxId = async (inboxId: string) => {
    setLoading(true);

    try {
      const dm = await client.conversations.getDmByInboxId(inboxId);
      return dm;
    } finally {
      setLoading(false);
    }
  };

  const getMessageById = async (messageId: string) => {
    setLoading(true);

    try {
      const message = await client.conversations.getMessageById(messageId);
      return message;
    } finally {
      setLoading(false);
    }
  };

  const newGroup = async (
    inboxIds: string[],
    options?: SafeCreateGroupOptions,
  ) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newGroup(
        inboxIds,
        options,
      );
      void addConversation(conversation);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newGroupWithIdentifiers = async (
    identifiers: Identifier[],
    options?: SafeCreateGroupOptions,
  ) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newGroupWithIdentifiers(
        identifiers,
        options,
      );
      void addConversation(conversation);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newDm = async (inboxId: string) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newDm(inboxId);
      void addConversation(conversation);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newDmWithIdentifier = async (identifier: Identifier) => {
    setLoading(true);

    try {
      const conversation =
        await client.conversations.newDmWithIdentifier(identifier);
      void addConversation(conversation);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const stream = async () => {
    const onValue = (conversation: Conversation<ContentTypes>) => {
      const shouldAdd =
        conversation.metadata?.conversationType === "dm" ||
        conversation.metadata?.conversationType === "group";
      if (shouldAdd) {
        void addConversation(conversation);
      }
    };

    const stream = await client.conversations.stream({
      onValue,
    });

    return () => {
      void stream.end();
    };
  };

  const streamAllMessages = async () => {
    const onValue = (message: DecodedMessage<ContentTypes>) => {
      void addMessage(message.conversationId, message);
    };

    const stream = await client.conversations.streamAllMessages({
      onValue,
    });

    return () => {
      void stream.end();
    };
  };

  return {
    conversations,
    getConversationById,
    getDmByInboxId,
    getMessageById,
    loading,
    newDm,
    newDmWithIdentifier,
    newGroup,
    newGroupWithIdentifiers,
    stream,
    streamAllMessages,
    sync,
    syncAll,
    syncing,
  };
};
