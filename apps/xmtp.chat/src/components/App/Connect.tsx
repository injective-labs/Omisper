import { Box, Progress, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ConnectXMTP } from "@/components/App/ConnectXMTP";
import { WalletConnect } from "@/components/App/WalletConnect";
import { useXMTP } from "@/contexts/XMTPContext";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { useConnectXmtp } from "@/hooks/useConnectXmtp";
import { useInjPassWallet } from "@/hooks/useInjPassWallet";
import { useRedirect } from "@/hooks/useRedirect";
import { useSettings } from "@/hooks/useSettings";

export const Connect = () => {
  const { isConnected, disconnect, loading } = useConnectWallet();
  const { isConnected: injPassConnected, disconnect: injPassDisconnect } = useInjPassWallet();
  const anyWalletConnected = isConnected || injPassConnected;
  const {
    environment,
    ephemeralAccountEnabled,
    setEphemeralAccountEnabled,
    setAutoConnect,
  } = useSettings();
  const { client, disconnect: disconnectXMTP } = useXMTP();
  const { loading: connectingXmtp } = useConnectXmtp();
  const navigate = useNavigate();
  const { redirectUrl, setRedirectUrl } = useRedirect();
  const [active, setActive] = useState(0);
  const [connectionStage, setConnectionStage] = useState<
    "idle" | "connecting" | "ready"
  >("idle");

  // redirect if there's already a client
  useEffect(() => {
    if (client) {
      if (redirectUrl) {
        setRedirectUrl("");
        void navigate(redirectUrl);
      } else {
        void navigate(`/${environment}`);
      }
    }
  }, [client, environment]);

  useEffect(() => {
    if (anyWalletConnected || ephemeralAccountEnabled) {
      setActive(1);
    } else {
      setActive(0);
    }
  }, [anyWalletConnected, ephemeralAccountEnabled, client]);

  // handle connection stages
  useEffect(() => {
    if (connectingXmtp) {
      setConnectionStage("connecting");
      const timer = setTimeout(() => {
        setConnectionStage("ready");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!client && (anyWalletConnected || ephemeralAccountEnabled)) {
      setConnectionStage("idle");
    }
  }, [connectingXmtp, client, anyWalletConnected, ephemeralAccountEnabled]);

  const handleDisconnectWallet = useCallback(() => {
    // For INJPass, explicitly disconnect XMTP client and navigate home
    // (MetaMask/wagmi is handled via onSuccess callback in Disconnect.tsx)
    if (injPassConnected) {
      injPassDisconnect();
      disconnectXMTP();
      setAutoConnect(false);
      void navigate("/");
      return;
    }

    if (isConnected) {
      disconnect();
    } else {
      setEphemeralAccountEnabled(false);
    }
    setAutoConnect(false);
  }, [isConnected, disconnect, injPassConnected, injPassDisconnect, disconnectXMTP, navigate, setAutoConnect, setEphemeralAccountEnabled]);

  const { progress, statusText, statusColor } = useMemo(() => {
    if (client) {
      return {
        progress: 100,
        statusText: "Connected",
        statusColor: "var(--wechat-green)",
      };
    }
    if (connectionStage === "ready") {
      return {
        progress: 100,
        statusText: "Ready to enter",
        statusColor: "var(--wechat-green)",
      };
    }
    if (connectionStage === "connecting") {
      return {
        progress: 60,
        statusText: "Connecting to XMTP...",
        statusColor: "var(--text-secondary)",
      };
    }
    if (anyWalletConnected || ephemeralAccountEnabled) {
      return {
        progress: 30,
        statusText: "Wallet connected",
        statusColor: "var(--text-secondary)",
      };
    }
    return {
      progress: 0,
      statusText: "Connect your wallet to start",
      statusColor: "var(--text-muted)",
    };
  }, [client, connectionStage, anyWalletConnected, ephemeralAccountEnabled]);

  return (
    <Stack gap="lg">
      {/* Step indicator */}
      <Box>
        <Progress
          value={progress}
          size="sm"
          radius="xl"
          color="wechat"
          style={{ marginBottom: 8 }}
        />
        <Text
          size="xs"
          fw={500}
          ta="center"
          style={{ color: statusColor }}>
          {statusText}
        </Text>
      </Box>

      {/* Active step content */}
      {active === 0 && <WalletConnect />}
      {active === 1 && <ConnectXMTP onDisconnectWallet={handleDisconnectWallet} />}
    </Stack>
  );
};
