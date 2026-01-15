import { Box, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useConversation } from "@/hooks/useConversation";
import { useSettings } from "@/hooks/useSettings";
import styles from "./ConversationCard.module.css";

export type ConversationCardProps = {
  conversationId: string;
};

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversationId,
}) => {
  const { name, members } = useConversation(conversationId);
  const navigate = useNavigate();
  const { conversationId: paramsConversationId } = useParams();
  const { environment } = useSettings();

  const memberCount = useMemo(() => {
    return members.size;
  }, [members]);

  const isSelected = conversationId === paramsConversationId;

  // generate avatar initials from name
  const avatarInitials = useMemo(() => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <Box
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          void navigate(`/${environment}/conversations/${conversationId}`);
        }
      }}
      onClick={() =>
        void navigate(`/${environment}/conversations/${conversationId}`)
      }
      className={[styles.root, isSelected && styles.selected]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-light, #f0f0f0)",
        cursor: "pointer",
      }}>
      {/* Avatar */}
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          background: isSelected
            ? "var(--wechat-green, #07C160)"
            : "linear-gradient(135deg, #e0e0e0, #bdbdbd)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isSelected ? "white" : "var(--text-secondary, #666)",
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}>
        {avatarInitials}
      </Box>

      {/* Content */}
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text
          fw={600}
          size="sm"
          truncate
          style={{
            color: "var(--text-primary, #191919)",
          }}>
          {name || "Untitled"}
        </Text>
        <Text
          size="xs"
          c="dimmed"
          truncate>
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </Text>
      </Stack>
    </Box>
  );
};
