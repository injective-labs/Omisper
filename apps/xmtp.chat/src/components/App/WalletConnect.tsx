import { Stack, Divider, Text, Box } from "@mantine/core";
import { ConnectorSelect } from "@/components/App/ConnectorSelect";
import { ConnectWallet } from "@/components/App/ConnectWallet";
import { InjPassConnectButton } from "@/components/InjPassWallet";

export const WalletConnect = () => {
  return (
    <Stack gap="md">
      {/* INJ Pass - Passkey-based wallet */}
      <Stack gap="xs">
        <Text size="sm" fw={600} c="dimmed">
          🔐 Passkey Wallet
        </Text>
        <Box
          style={{
            padding: "12px",
            borderRadius: 12,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <InjPassConnectButton />
        </Box>
      </Stack>

      <Divider label="OR" labelPosition="center" />

      {/* Traditional Web3 Wallets */}
      <ConnectorSelect />
      <ConnectWallet />
    </Stack>
  );
};
