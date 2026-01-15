import { Box, Button, Collapse, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useConnectWallet,
  type ConnectorString,
} from "@/hooks/useConnectWallet";
import { useSettings } from "@/hooks/useSettings";
import { CoinbaseWallet } from "@/icons/CoinbaseWallet";
import { MetamaskWallet } from "@/icons/MetamaskWallet";
import { WalletConnectWallet } from "@/icons/WalletConnectWallet";

type WalletOptionProps = {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

const WalletOption: React.FC<WalletOptionProps> = ({
  icon,
  label,
  selected,
  disabled,
  onClick,
}) => (
  <Box
    onClick={disabled ? undefined : onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 12,
      cursor: disabled ? "not-allowed" : "pointer",
      background: selected
        ? "var(--bg-active)"
        : "var(--bg-secondary)",
      border: selected
        ? "2px solid var(--wechat-green)"
        : "1px solid var(--border-color)",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled && !selected) {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.borderColor = "var(--wechat-green)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !selected) {
        e.currentTarget.style.background = "var(--bg-secondary)";
        e.currentTarget.style.borderColor = "var(--border-color)";
      }
    }}>
    <Box
      style={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
      {icon}
    </Box>
    <Text fw={500} size="sm">
      {label}
    </Text>
    {selected && (
      <Text
        c="wechat"
        fw={700}
        size="lg"
        style={{ marginLeft: "auto" }}>
        ✓
      </Text>
    )}
  </Box>
);

export const ConnectorSelect: React.FC = () => {
  const { isConnected, loading } = useConnectWallet();
  const { connector, setConnector, ephemeralAccountEnabled, useSCW } =
    useSettings();
  const [opened, { toggle }] = useDisclosure(false);

  const handleWalletConnect = (connectorName: ConnectorString) => () => {
    setConnector(connectorName);
  };

  const isDisabled = isConnected || loading || ephemeralAccountEnabled;

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600} c="dimmed">
        Choose Wallet
      </Text>

      <WalletOption
        selected={connector === "MetaMask"}
        disabled={isDisabled || useSCW}
        icon={<MetamaskWallet />}
        label="MetaMask"
        onClick={handleWalletConnect("MetaMask")}
      />

      <Collapse in={opened}>
        <Stack gap="sm">
          <WalletOption
            selected={connector === "Coinbase Wallet"}
            disabled={isDisabled}
            icon={<CoinbaseWallet />}
            label="Coinbase Wallet"
            onClick={handleWalletConnect("Coinbase Wallet")}
          />
          <WalletOption
            selected={connector === "WalletConnect"}
            disabled={isDisabled}
            icon={<WalletConnectWallet />}
            label="WalletConnect"
            onClick={handleWalletConnect("WalletConnect")}
          />
        </Stack>
      </Collapse>

      <Group justify="center">
        <Button
          variant="subtle"
          size="xs"
          onClick={toggle}
          style={{ color: "var(--text-muted)" }}>
          {opened ? "Show less" : "More wallets"}
        </Button>
      </Group>
    </Stack>
  );
};
