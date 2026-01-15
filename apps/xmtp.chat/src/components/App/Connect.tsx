import { Box, Progress, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ConnectXMTP } from "@/components/App/ConnectXMTP";
import { WalletConnect } from "@/components/App/WalletConnect";
import { useXMTP } from "@/contexts/XMTPContext";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { useConnectXmtp } from "@/hooks/useConnectXmtp";
import { useRedirect } from "@/hooks/useRedirect";
import { useSettings } from "@/hooks/useSettings";

export const Connect = () => {
  const { isConnected, disconnect, loading } = useConnectWallet();
  const {
    environment,
    ephemeralAccountEnabled,
    setEphemeralAccountEnabled,
    setAutoConnect,
  } = useSettings();
  const { client } = useXMTP();
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
    if (isConnected || ephemeralAccountEnabled) {
      setActive(1);
    } else {
      setActive(0);
    }
  }, [isConnected, ephemeralAccountEnabled]);

  // handle connection stages
  useEffect(() => {
    if (connectingXmtp) {
      setConnectionStage("connecting");
      const timer = setTimeout(() => {
        setConnectionStage("ready");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!client && (isConnected || ephemeralAccountEnabled)) {
      setConnectionStage("idle");
    }
  }, [connectingXmtp, client, isConnected, ephemeralAccountEnabled]);

  const handleDisconnectWallet = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      setEphemeralAccountEnabled(false);
    }
    setAutoConnect(false);
  }, [isConnected, disconnect]);

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
    if (isConnected || ephemeralAccountEnabled) {
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
  }, [client, connectionStage, isConnected, ephemeralAccountEnabled]);

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
