import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Text,
  TextInput,
} from "@mantine/core";
import {
  ContentTypeRemoteAttachment,
  type RemoteAttachment,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { ContentTypeText } from "@xmtp/content-type-text";
import { useCallback, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { useConversationContext } from "@/contexts/ConversationContext";
import { uploadAttachment, validateFile } from "@/helpers/attachment";
import { useConversation } from "@/hooks/useConversation";
import { IconPlus } from "@/icons/IconPlus";
import { AttachmentPreview } from "./AttachmentPreview";
import { ReplyPreview } from "./ReplyPreview";

export type ComposerProps = {
  conversationId: string;
};

export const Composer: React.FC<ComposerProps> = ({ conversationId }) => {
  const { send, sending } = useConversation(conversationId);
  const { replyTarget, setReplyTarget } = useConversationContext();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remoteAttachmentRef = useRef<RemoteAttachment | null>(null);
  const isSending = sending || uploadingAttachment;
  const hasContent = message.trim() !== "" || attachment;

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const validation = validateFile(file);
        if (validation.valid) {
          setAttachment(file);
        } else {
          setError(validation.error);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  const handleSend = useCallback(async () => {
    if (!hasContent || isSending) return;

    if (attachment) {
      try {
        if (!remoteAttachmentRef.current) {
          setUploadingAttachment(true);
          remoteAttachmentRef.current = await uploadAttachment(attachment);
        }
      } catch {
        setError("Failed to upload attachment");
        return;
      } finally {
        setUploadingAttachment(false);
      }

      try {
        if (replyTarget) {
          await send(
            {
              reference: replyTarget.id,
              referenceInboxId: replyTarget.senderInboxId,
              contentType: ContentTypeRemoteAttachment,
              content: remoteAttachmentRef.current,
            },
            ContentTypeReply,
          );
        } else {
          await send(remoteAttachmentRef.current, ContentTypeRemoteAttachment);
        }
        setAttachment(null);
        remoteAttachmentRef.current = null;
      } catch {
        setError("Failed to send attachment");
        return;
      }
    }

    if (message) {
      try {
        if (replyTarget) {
          await send(
            {
              reference: replyTarget.id,
              referenceInboxId: replyTarget.senderInboxId,
              contentType: ContentTypeText,
              content: message,
            },
            ContentTypeReply,
          );
        } else {
          await send(message, ContentTypeText);
        }
        setMessage("");
      } catch {
        setError("Failed to send message");
        return;
      }
    }

    setReplyTarget(undefined);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [
    message,
    attachment,
    sending,
    uploadingAttachment,
    replyTarget,
    send,
    setReplyTarget,
  ]);

  return (
    <>
      <Box
        style={{
          padding: "12px 16px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          background: "var(--bg-primary, #f5f5f5)",
          width: "100%",
        }}>
        {/* Reply preview */}
        {replyTarget && (
          <Box mb="sm">
            <ReplyPreview
              message={replyTarget}
              disabled={isSending}
              onCancel={() => {
                setReplyTarget(undefined);
              }}
            />
          </Box>
        )}

        {/* Attachment preview */}
        {attachment && (
          <Box mb="sm">
            <AttachmentPreview
              file={attachment}
              disabled={isSending}
              onCancel={() => {
                setAttachment(null);
              }}
            />
          </Box>
        )}

        {/* Input row */}
        <Group gap="sm" align="flex-end" wrap="nowrap">
          {/* Add attachment button */}
          <Menu shadow="md" position="top-start" offset={8}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                disabled={isSending}
                style={{
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}>
                <IconPlus size={22} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => fileInputRef.current?.click()}>
                <Text fw={500} size="sm">
                  📎 Attachment
                </Text>
                <Text size="xs" c="dimmed">
                  Image, Video, Audio (≤1MB)
                </Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Message input */}
          <TextInput
            ref={inputRef}
            disabled={isSending}
            size="md"
            radius="xl"
            placeholder="Type a message..."
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            styles={{
              root: { flex: 1 },
              input: {
                background: "var(--bg-secondary, #ffffff)",
                border: "1px solid var(--border-color, #e8e8e8)",
                minHeight: 44,
                paddingLeft: 16,
                paddingRight: 16,
              },
            }}
          />

          {/* Send button */}
          <Button
            disabled={!hasContent}
            loading={isSending}
            size="md"
            radius="xl"
            color="wechat"
            onClick={() => void handleSend()}
            style={{
              flexShrink: 0,
              minWidth: 72,
              height: 44,
            }}>
            Send
          </Button>
        </Group>
      </Box>

      {/* Error modal */}
      {error && (
        <Modal
          opened
          centered
          withCloseButton={false}
          closeOnEscape={false}
          closeOnClickOutside={false}
          size="sm"
          title="Error"
          onClose={() => {
            setError(null);
          }}>
          <Text ta="center" size="sm">
            {error}
          </Text>
          <Group mt="md" justify="center">
            <Button
              color="wechat"
              onClick={() => {
                setError(null);
              }}>
              OK
            </Button>
          </Group>
        </Modal>
      )}
    </>
  );
};
