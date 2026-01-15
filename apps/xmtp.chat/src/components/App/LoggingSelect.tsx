import { Group, Stack, Switch, Text } from "@mantine/core";
import { useSettings } from "@/hooks/useSettings";

export const LoggingSelect: React.FC = () => {
  const { loggingLevel, setLoggingLevel } = useSettings();

  const isDebugEnabled = loggingLevel === "debug";

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoggingLevel(event.currentTarget.checked ? "debug" : "warn");
  };

  return (
    <Stack gap={4}>
      <Group gap="xs" justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Enhanced Privacy (zk)
        </Text>
        <Switch
          size="sm"
          checked={isDebugEnabled}
          onChange={handleToggle}
          color="wechat"
        />
      </Group>
      <Text size="xs" c="dimmed">
        May slow down message delivery
      </Text>
    </Stack>
  );
};
