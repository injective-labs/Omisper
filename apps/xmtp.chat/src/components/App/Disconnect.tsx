import { LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useXMTP } from "@/contexts/XMTPContext";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { useSettings } from "@/hooks/useSettings";
import { CenteredLayout } from "@/layouts/CenteredLayout";
import { getInjPassWallet } from "@/services/injpass-wallet";

export const Disconnect: React.FC = () => {
  const navigate = useNavigate();
  const { disconnect } = useConnectWallet();
  const { setAutoConnect, setEphemeralAccountEnabled } = useSettings();
  const { disconnect: disconnectClient } = useXMTP();

  useEffect(() => {
    // Check injpass singleton directly to avoid React state timing issues
    const injPassWallet = getInjPassWallet();

    if (injPassWallet.isConnected()) {
      // INJ Pass wallet — disconnect synchronously and navigate immediately
      injPassWallet.disconnect();
      disconnectClient();
      setEphemeralAccountEnabled(false);
      setAutoConnect(false);
      void navigate("/");
    } else {
      // Wagmi wallet (MetaMask, WalletConnect, Coinbase, etc.)
      disconnect(undefined, {
        onSuccess: () => {
          disconnectClient();
          setEphemeralAccountEnabled(false);
          setAutoConnect(false);
          void navigate("/");
        },
      });
    }
  }, []);

  return (
    <CenteredLayout>
      <LoadingOverlay visible={true} />
    </CenteredLayout>
  );
};
