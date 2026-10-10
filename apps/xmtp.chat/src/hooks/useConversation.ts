import type { ContentTypeId } from "@xmtp/content-type-primitives";
import { useState } from "react";
import { type ContentTypes } from "@/contexts/XMTPContext";
import {
  useActions,
  useConversation as useConversationState,
  useLastSentAt,
  useMembers,
  useMessages,
  useMetadata,
  usePermissions,
} from "@/stores/inbox/hooks";

// Conversations whose stored history has been read in full this session. Until
// then lastSentAt may only reflect messages streamed in while the list was open,
// and reading after it would hide everything older.
const loadedHistory = new Set<string>();

export const useConversation = (conversationId: string) => {
  const { addMessages } = useActions();
  const conversation = useConversationState(conversationId);
  const members = useMembers(conversationId);
  const permissions = usePermissions(conversationId);
  const { name, description, imageUrl } = useMetadata(conversationId);
  const messages = useMessages(conversationId);
  const lastSentAt = useLastSentAt(conversationId);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);

  if (!conversation) {
    throw new Error(
      `useConversation: Conversation ${conversationId} not found`,
    );
  }

  const sync = async (fromNetwork: boolean = false) => {
    if (fromNetwork) {
      setSyncing(true);

      try {
        const isActive = await conversation.isActive();
        // ensure group is active before syncing
        if (isActive) {
          await conversation.sync();
        }
      } finally {
        setSyncing(false);
      }
    }

    setLoading(true);

    try {
      const since = loadedHistory.has(conversation.id) ? lastSentAt : undefined;
      const msgs = await conversation.messages({
        ...(since !== undefined && { sentAfterNs: since }),
      });
      await addMessages(conversation.id, msgs);
      loadedHistory.add(conversation.id);
      return msgs;
    } finally {
      setLoading(false);
    }
  };

  const send = async (message: ContentTypes, contentType?: ContentTypeId) => {
    setSending(true);

    try {
      await conversation.send(message, contentType);
    } finally {
      setSending(false);
    }
  };

  return {
    conversation,
    description,
    imageUrl,
    loading,
    members,
    messages,
    name,
    permissions,
    send,
    sending,
    sync,
    syncing,
  };
};
