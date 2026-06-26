import { Button } from "@mantine/core";
import { useCallback } from "react";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { useSettings } from "@/hooks/useSettings";

type ConnectWalletProps = {
  disabled?: boolean;
};

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  disabled = false,
}) => {
  const { connect, disconnect, loading, isConnected } = useConnectWallet();
  const { connector, ephemeralAccountEnabled } = useSettings();

  const handleConnect = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect(connector)();
    }
  }, [connect, connector, isConnected, disconnect]);

  return (
    <Button
      fullWidth
      size="lg"
      variant={isConnected ? "light" : "filled"}
      color={isConnected ? "red" : "wechat"}
      onClick={handleConnect}
      loading={loading}
      disabled={ephemeralAccountEnabled || disabled}
      style={{
        fontWeight: 600,
        height: 48,
      }}>
      {isConnected ? "Disconnect Wallet" : `Connect ${connector}`}
    </Button>
  );
};
