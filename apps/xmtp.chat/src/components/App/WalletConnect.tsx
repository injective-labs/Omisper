import { Stack } from "@mantine/core";
import { ConnectorSelect } from "@/components/App/ConnectorSelect";
import { ConnectWallet } from "@/components/App/ConnectWallet";

export const WalletConnect = () => {
  return (
    <Stack gap="md">
      <ConnectorSelect />
      <ConnectWallet />
    </Stack>
  );
};
