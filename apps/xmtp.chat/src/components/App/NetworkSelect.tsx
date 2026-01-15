import { Group, Stack, Text } from "@mantine/core";

export const NetworkSelect: React.FC = () => {
  return (
    <Stack gap={4}>
      <Group gap="xs" justify="space-between" align="center">
        <Text size="sm" fw={500}>
          XMTP Network
        </Text>
        <Group gap={6} align="center">
          <Text
            size="xs"
            fw={600}
            style={{
              color: "var(--wechat-green)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--wechat-green)",
                display: "inline-block",
              }}
            />
            Online
          </Text>
        </Group>
      </Group>
      <Text size="xs" c="dimmed">
        Using development network for testing
      </Text>
    </Stack>
  );
};
