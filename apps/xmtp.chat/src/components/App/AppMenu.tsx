import { ActionIcon, Menu, Text } from "@mantine/core";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useSettings } from "@/hooks/useSettings";
import { IconDots } from "@/icons/IconDots";

export const AppMenu: React.FC = () => {
  const navigate = useNavigate();
  const { environment } = useSettings();

  const handleDisconnect = useCallback(() => {
    void navigate("/disconnect");
  }, [navigate]);

  return (
    <Menu shadow="lg" position="bottom-end" offset={8} radius="lg">
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          size="lg"
          radius="xl"
          style={{ color: "var(--text-secondary)" }}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={200}>
        <Menu.Label>
          <Text size="xs" c="dimmed">
            Actions
          </Text>
        </Menu.Label>
        <Menu.Item
          onClick={() => void navigate(`/${environment}/conversations/new-dm`)}
          leftSection={<Text size="sm">💬</Text>}>
          <Text size="sm" fw={500}>
            New Message
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
          onClick={() => void navigate(`/${environment}/identity`)}
          leftSection={<Text size="sm">👤</Text>}>
          <Text size="sm" fw={500}>
            My Profile
          </Text>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          onClick={handleDisconnect}
          color="red"
          leftSection={<Text size="sm">🚪</Text>}>
          <Text size="sm" fw={500}>
            Disconnect
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
