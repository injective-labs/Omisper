import { ActionIcon, Menu, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import { useSettings } from "@/hooks/useSettings";
import { IconDots } from "@/icons/IconDots";
import { IconPlus } from "@/icons/IconPlus";

export type ConversationsMenuProps = {
  onSync: () => void;
  onSyncAll: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export const ConversationsMenu: React.FC<ConversationsMenuProps> = ({
  onSync,
  onSyncAll,
  disabled,
  loading,
}) => {
  const navigate = useNavigate();
  const { environment } = useSettings();

  return (
    <>
      {/* New chat button */}
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={() => void navigate(`/${environment}/conversations/new-dm`)}
        style={{ color: "var(--wechat-green)" }}>
        <IconPlus size={20} />
      </ActionIcon>

      {/* Menu */}
      <Menu shadow="lg" disabled={disabled} position="bottom-end" offset={8} radius="lg">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            loading={loading}
            style={{ color: "var(--text-secondary)" }}>
            <IconDots />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown miw={180}>
          <Menu.Label>
            <Text size="xs" c="dimmed">
              Actions
            </Text>
          </Menu.Label>
          <Menu.Item
            onClick={() => void navigate(`/${environment}/conversations/new-dm`)}
            leftSection={<Text size="sm">💬</Text>}>
            <Text size="sm" fw={500}>
              New Chat
            </Text>
          </Menu.Item>
          <Menu.Item
            onClick={() => void navigate(`/${environment}/conversations/new-group`)}
            leftSection={<Text size="sm">👥</Text>}>
            <Text size="sm" fw={500}>
              New Group
            </Text>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={onSync}
            leftSection={<Text size="sm">🔄</Text>}>
            <Text size="sm" fw={500}>
              Refresh
            </Text>
          </Menu.Item>
          <Menu.Item
            onClick={onSyncAll}
            leftSection={<Text size="sm">📥</Text>}>
            <Text size="sm" fw={500}>
              Sync All
            </Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
