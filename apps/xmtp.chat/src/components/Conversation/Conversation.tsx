import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Group as XmtpGroup } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { ConversationMenu } from "@/components/Conversation/ConversationMenu";
import { MembersList } from "@/components/Conversation/MembersList";
import { Messages } from "@/components/Messages/Messages";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { resolveAddresses } from "@/helpers/profiles";
import { getMemberAddress } from "@/helpers/xmtp";
import { useConversation } from "@/hooks/useConversation";
import { IconArrowBackUp } from "@/icons/IconArrowBackUp";
import { IconUsers } from "@/icons/IconUsers";
import { ContentLayout } from "@/layouts/ContentLayout";
import { Composer } from "./Composer";

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

export type ConversationProps = {
  conversationId: string;
};

export const Conversation: React.FC<ConversationProps> = ({
  conversationId,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [opened, { toggle }] = useDisclosure();
  const {
    conversation,
    name,
    sync,
    loading: conversationLoading,
    messages,
    members,
    syncing: conversationSyncing,
  } = useConversation(conversationId);

  useEffect(() => {
    const loadMessages = async () => {
      await sync(true);
    };
    void loadMessages();
  }, [conversationId]);

  useEffect(() => {
    void resolveAddresses(
      Array.from(members.values()).map((m) => getMemberAddress(m)),
    );
  }, [members]);

  const handleSync = useCallback(async () => {
    await sync(true);
  }, [sync, conversationId]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <ConversationProvider
        key={conversationId}
        conversationId={conversationId}>
        <ContentLayout
          title={name || "Untitled"}
          loading={messages.length === 0 && conversationLoading}
          headerActions={
            <Group gap="xxs">
              {isMobile && (
                <ActionIcon variant="default" onClick={handleBack}>
                  <IconArrowBackUp size={16} />
                </ActionIcon>
              )}
              <ConversationMenu
                conversationId={conversationId}
                type={conversation instanceof XmtpGroup ? "group" : "dm"}
                onSync={() => void handleSync()}
                disabled={conversationSyncing}
              />
              <Tooltip
                label={
                  opened ? (
                    <Text size="xs">Hide members</Text>
                  ) : (
                    <Text size="xs">Show members</Text>
                  )
                }>
                <ActionIcon
                  variant="default"
                  onClick={() => {
                    toggle();
                  }}>
                  <IconUsers />
                </ActionIcon>
              </Tooltip>
            </Group>
          }
          aside={
            <MembersList conversationId={conversationId} toggle={toggle} />
          }
          asideOpened={opened}
          footer={<Composer conversationId={conversationId} />}
          withScrollArea={false}>
          <Messages messages={messages} />
        </ContentLayout>
      </ConversationProvider>
      <Outlet context={{ conversationId }} />
    </>
  );
};
