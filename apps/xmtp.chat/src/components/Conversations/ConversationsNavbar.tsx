import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";
import { ConversationsList } from "@/components/Conversations/ConversationList";
import { ConversationsMenu } from "@/components/Conversations/ConversationsMenu";
import { useConversations } from "@/hooks/useConversations";
import { ContentLayout } from "@/layouts/ContentLayout";

export const ConversationsNavbar: React.FC = () => {
  const {
    sync,
    loading,
    syncing,
    conversations,
    stream,
    streamAllMessages,
    syncAll,
  } = useConversations();
  const stopConversationStreamRef = useRef<(() => void) | null>(null);
  const stopAllMessagesStreamRef = useRef<(() => void) | null>(null);

  const startStreams = useCallback(async () => {
    stopConversationStreamRef.current = await stream();
    stopAllMessagesStreamRef.current = await streamAllMessages();
  }, [stream, streamAllMessages]);

  const stopStreams = useCallback(() => {
    stopConversationStreamRef.current?.();
    stopConversationStreamRef.current = null;
    stopAllMessagesStreamRef.current?.();
    stopAllMessagesStreamRef.current = null;
  }, []);

  const handleSync = useCallback(async () => {
    stopStreams();
    await sync();
    await startStreams();
  }, [sync, startStreams, stopStreams]);

  const handleSyncAll = useCallback(async () => {
    stopStreams();
    await syncAll();
    await startStreams();
  }, [syncAll, startStreams, stopStreams]);

  // loading conversations on mount, and start streaming
  useEffect(() => {
    const loadConversations = async () => {
      await sync(true);
      await startStreams();
    };
    void loadConversations();
  }, []);

  // stop streaming on unmount
  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  return (
    <ContentLayout
      withBorders={false}
      title={
        <Group align="center" gap="sm">
          <Text size="md" fw={600} style={{ color: "var(--text-primary)" }}>
            Chats
          </Text>
          <Badge
            size="sm"
            radius="xl"
            variant="light"
            color="gray"
            style={{
              background: "var(--bg-primary)",
              color: "var(--text-secondary)",
            }}>
            {conversations.length}
          </Badge>
        </Group>
      }
      loading={conversations.length === 0 && loading}
      headerActions={
        <ConversationsMenu
          loading={syncing || loading}
          onSync={() => void handleSync()}
          onSyncAll={() => void handleSyncAll()}
          disabled={syncing}
        />
      }
      withScrollArea={false}>
      {conversations.length === 0 ? (
        <Box
          display="flex"
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            padding: 24,
          }}>
          <Text size="lg" style={{ color: "var(--text-muted)" }}>
            💬
          </Text>
          <Stack gap={4} align="center">
            <Text size="sm" fw={500} style={{ color: "var(--text-secondary)" }}>
              No conversations yet
            </Text>
            <Text size="xs" c="dimmed">
              Start a new chat to get going
            </Text>
          </Stack>
        </Box>
      ) : (
        <ConversationsList conversations={conversations} />
      )}
    </ContentLayout>
  );
};
