import { Button, Paper, Text, Group, Stack, Badge, Code, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useInjPassWallet } from '../hooks/useInjPassWallet';
import { useSettings } from '../hooks/useSettings';
import { InjPassWallet as InjPassIcon } from '../icons/InjPassWallet';

/**
 * INJ Pass Wallet Connect Button Component
 * 
 * Displays wallet connection status and provides connect/disconnect functionality
 */
export function InjPassWalletButton() {
  const { 
    address, 
    walletName,
    isConnected, 
    isConnecting, 
    error, 
    connect, 
    disconnect,
    showWallet 
  } = useInjPassWallet();

  const handleConnect = async () => {
    try {
      await connect();
      notifications.show({
        title: '✅ Connected',
        message: 'INJ Pass wallet connected successfully',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: '❌ Connection Failed',
        message: error || 'Failed to connect wallet',
        color: 'red',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    notifications.show({
      title: 'Disconnected',
      message: 'Wallet disconnected',
      color: 'blue',
    });
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect}
        loading={isConnecting}
        variant="gradient"
        gradient={{ from: 'grape', to: 'violet', deg: 90 }}
        leftSection={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" />
          </svg>
        }
      >
        {isConnecting ? 'Connecting...' : 'Connect INJ Pass'}
      </Button>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">INJ Pass Wallet</Text>
            {walletName && (
              <Badge variant="light" color="violet" size="sm">
                {walletName}
              </Badge>
            )}
          </div>
          <Button 
            size="xs" 
            variant="subtle" 
            onClick={handleDisconnect}
            color="red"
          >
            Disconnect
          </Button>
        </Group>
        
        <Code block style={{ wordBreak: 'break-all' }}>
          {address}
        </Code>

        <Button 
          size="xs" 
          variant="light" 
          onClick={showWallet}
          fullWidth
        >
          Show Wallet
        </Button>
      </Stack>
    </Paper>
  );
}

/**
 * Minimal inline connect button (for WalletConnect page)
 */
export function InjPassConnectButton() {
  const { isConnected, isConnecting, connect, disconnect, address, walletName } = useInjPassWallet();
  const { walletMethod, setWalletMethod } = useSettings();
  const isSelected = walletMethod === "INJ Pass";

  const handleConnect = () => {
    if (isConnecting) {
      return;
    }

    setWalletMethod("INJ Pass");
    void connect();
  };

  if (!isConnected) {
    return (
      <Box
        onClick={handleConnect}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 12,
          cursor: isConnecting ? "wait" : "pointer",
          background: isSelected ? "rgba(147, 51, 234, 0.08)" : "var(--bg-secondary)",
          border: isSelected ? "2px solid #C084FC" : "1px solid var(--border-color)",
          boxShadow: isSelected ? "0 0 0 1px rgba(192, 132, 252, 0.18)" : "none",
          opacity: isConnecting ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isConnecting && !isSelected) {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.borderColor = "#9333EA";
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnecting && !isSelected) {
            e.currentTarget.style.background = "var(--bg-secondary)";
            e.currentTarget.style.borderColor = "var(--border-color)";
          }
        }}
      >
        <Box
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src="/lambda.png"
            alt="lambda"
            style={{ width: 24, height: 24 }}
          />
        </Box>
        <Stack gap={2} style={{ flex: 1 }}>
          <Text fw={isSelected ? 600 : 500} size="sm">
            INJ Pass
          </Text>
          <Text size="xs" c="dimmed">
            {isConnecting ? "Connecting..." : "Passkey-based wallet"}
          </Text>
        </Stack>
        {isSelected && !isConnecting && (
          <Text
            fw={700}
            size="lg"
            style={{ color: "#9333EA", marginLeft: "auto" }}>
            ✓
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
        border: "2px solid #9333EA",
      }}
    >
      <Box
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <InjPassIcon />
      </Box>
      <Stack gap={2} style={{ flex: 1 }}>
        <Group gap="xs">
          <Text fw={600} size="sm" c="white">
            INJ Pass
          </Text>
          {walletName && (
            <Badge size="xs" variant="light" color="violet">
              {walletName}
            </Badge>
          )}
        </Group>
        <Text size="xs" c="gray.2" style={{ fontFamily: 'monospace' }}>
          {address?.slice(0, 12)}...{address?.slice(-8)}
        </Text>
      </Stack>
      <Button
        size="xs"
        variant="white"
        onClick={disconnect}
        style={{ flexShrink: 0 }}
      >
        Disconnect
      </Button>
    </Box>
  );
}
