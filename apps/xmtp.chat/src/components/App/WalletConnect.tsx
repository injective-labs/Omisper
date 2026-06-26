import { Stack, Divider, Text } from "@mantine/core";
import { ConnectorSelect } from "@/components/App/ConnectorSelect";
import { ConnectWallet } from "@/components/App/ConnectWallet";
import { InjPassConnectButton } from "@/components/InjPassWallet";
import { useInjPassWallet } from "@/hooks/useInjPassWallet";

export const WalletConnect = () => {
  const { isConnected, isConnecting } = useInjPassWallet();
  const injPassActive = isConnected || isConnecting;

  return (
    <Stack gap="md">
      {/* INJ Pass - Passkey-based wallet */}
      <Stack gap="xs">
        <Text size="sm" fw={600} c="dimmed">
          <img
            src="/lambda.png"
            alt="lambda"
            style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 4 }}
          />
          Passkey Wallet
        </Text>
        <InjPassConnectButton />
      </Stack>

      <Divider label="OR" labelPosition="center" />

      {/* Traditional Web3 Wallets */}
      <ConnectorSelect />
      <ConnectWallet disabled={injPassActive} />
    </Stack>
  );
};
