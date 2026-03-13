import { Button, Divider, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ConversationsList } from "@/components/Conversations/ConversationList";
import { useSettings } from "@/hooks/useSettings";
import { useConversations } from "@/hooks/useConversations";
import { ContentLayout } from "@/layouts/ContentLayout";

// Hook to detect mobile viewport
const useIsMobile = (breakpoint = 1080) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

export const SelectConversation = () => {
  const navigate = useNavigate();
  const { environment } = useSettings();
  const isMobile = useIsMobile();
  const { conversations, loading } = useConversations();

  // On mobile, show the conversation list instead of empty state
  if (isMobile) {
    return (
      <ContentLayout
        title="Chats"
        loading={loading && conversations.length === 0}
        withScrollArea={false}>
        {conversations.length === 0 ? (
          <Stack gap="lg" align="center" py="xl">
            <Text c="dimmed">No conversations yet</Text>
            <Button
              size="xs"
              onClick={() => {
                void navigate(`/${environment}/conversations/new-dm`);
              }}>
              Start a new conversation
            </Button>
          </Stack>
        ) : (
          <ConversationsList conversations={conversations} />
        )}
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="No conversation selected">
      <Stack gap="lg" align="center" py="xl">
        <Text>
          Select a conversation in the left sidebar to display its messages.
        </Text>
        <Divider
          label="or"
          w="80%"
          styles={{
            label: {
              fontSize: "var(--mantine-font-size-md)",
              color: "var(--mantine-color-text)",
            },
          }}
        />
        <Stack gap="xs">
          <Button
            size="xs"
            onClick={() => {
              void navigate(`/${environment}/conversations/new-dm`);
            }}>
            Create a new direct message
          </Button>
        </Stack>
      </Stack>
    </ContentLayout>
  );
};
