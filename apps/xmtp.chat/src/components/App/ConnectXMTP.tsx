import { Box, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { useCallback } from "react";
import { ConnectedAddress } from "@/components/App/ConnectedAddress";
import { LoggingSelect } from "@/components/App/LoggingSelect";
import { NetworkSelect } from "@/components/App/NetworkSelect";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { useConnectXmtp } from "@/hooks/useConnectXmtp";
import { useEphemeralSigner } from "@/hooks/useEphemeralSigner";
import { useSettings } from "@/hooks/useSettings";

export type ConnectXMTPProps = {
  onDisconnectWallet: () => void;
};

export const ConnectXMTP = ({ onDisconnectWallet }: ConnectXMTPProps) => {
  const { isConnected, address } = useConnectWallet();
  const { address: ephemeralAddress } = useEphemeralSigner();
  const { connect, loading } = useConnectXmtp();
  const { ephemeralAccountEnabled } = useSettings();

  const handleConnectClick = useCallback(() => {
    connect();
  }, [connect]);

  return (
    <Stack gap="md">
      {/* Connected address display */}
      <Box
        style={{
          padding: "16px",
          background: "var(--bg-primary)",
          borderRadius: 12,
        }}>
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              Connected Wallet
            </Text>
            <ConnectedAddress
              size="sm"
              address={address ?? ephemeralAddress}
              onClick={onDisconnectWallet}
            />
          </Stack>
          <Button
            variant="subtle"
            size="xs"
            color="red"
            onClick={onDisconnectWallet}>
            Change
          </Button>
        </Group>
      </Box>

      <Divider />

      {/* Settings */}
      <Stack gap="sm">
        <NetworkSelect />
        <LoggingSelect />
      </Stack>

      {/* Enter button */}
      <Button
        fullWidth
        size="lg"
        variant="filled"
        color="wechat"
        disabled={!isConnected && !ephemeralAccountEnabled}
        onClick={handleConnectClick}
        loading={loading}
        style={{
          fontWeight: 600,
          height: 48,
        }}>
        Enter Arbisper
      </Button>
    </Stack>
  );
};
