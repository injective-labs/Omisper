import { ActionIcon, Box, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import { useSwitchChain } from "wagmi";
import { injectiveMainnet, injectiveTestnet } from "@/helpers/chains";
import { type ChainType, useSettings } from "@/hooks/useSettings";

type NetworkInfo = {
  id: number;
  key: ChainType;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  icon: string;
  testnet?: boolean;
};

const NETWORKS: NetworkInfo[] = [
  {
    id: injectiveMainnet.id,
    key: "injective",
    name: "Injective",
    shortName: "INJ",
    color: "#00F2EA",
    gradient: "linear-gradient(135deg, #00f2ea, #00d4ff)",
    icon: "◆",
  },
  {
    id: injectiveTestnet.id,
    key: "injectiveTestnet",
    name: "Injective Testnet",
    shortName: "INJ-T",
    color: "#00b8b0",
    gradient: "linear-gradient(135deg, #00b8b0, #009999)",
    icon: "◇",
    testnet: true,
  },
];

type NetworkIconProps = {
  network: NetworkInfo;
  size?: number;
};

const NetworkIcon: React.FC<NetworkIconProps> = ({ network, size = 24 }) => (
  <Box
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: network.gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: size * 0.5,
      fontWeight: 700,
      flexShrink: 0,
    }}>
    {network.icon}
  </Box>
);

export const NetworkSwitcher: React.FC = () => {
  const { selectedChain, setSelectedChain, setBlockchain, ephemeralAccountEnabled } =
    useSettings();
  const { switchChain, isPending } = useSwitchChain();
  const [menuOpened, setMenuOpened] = useState(false);

  const currentNetwork = useMemo(
    () => NETWORKS.find((n) => n.key === selectedChain) || NETWORKS[0],
    [selectedChain],
  );

  const handleNetworkChange = (network: NetworkInfo) => {
    if (network.key === selectedChain) {
      setMenuOpened(false);
      return;
    }

    // for ephemeral accounts, just update local state
    if (ephemeralAccountEnabled) {
      setSelectedChain(network.key);
      setBlockchain(network.id);
      setMenuOpened(false);
      return;
    }

    // switch chain via wagmi
    switchChain(
      { chainId: network.id },
      {
        onSuccess() {
          setSelectedChain(network.key);
          setBlockchain(network.id);
          setMenuOpened(false);
        },
        onError(error) {
          console.error("Failed to switch network:", error);
        },
      },
    );
  };

  return (
    <Menu
      opened={menuOpened}
      onChange={setMenuOpened}
      position="bottom-end"
      offset={8}
      shadow="lg"
      radius="lg"
      withinPortal>
      <Menu.Target>
        <Tooltip label="Switch network" position="bottom">
          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            loading={isPending}
            style={{
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              padding: "0 12px",
              width: "auto",
              minWidth: 44,
            }}>
            <Group gap={6} wrap="nowrap">
              <NetworkIcon network={currentNetwork} size={20} />
              <Text
                size="xs"
                fw={600}
                style={{
                  color: "var(--text-primary)",
                  display: "none",
                  "@media (min-width: 480px)": { display: "block" },
                }}
                visibleFrom="xs">
                {currentNetwork.shortName}
              </Text>
            </Group>
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown style={{ minWidth: 220 }}>
        <Menu.Label>Select Network</Menu.Label>
        {NETWORKS.filter((n) => !n.testnet).map((network) => (
          <Menu.Item
            key={network.key}
            onClick={() => handleNetworkChange(network)}
            leftSection={<NetworkIcon network={network} size={24} />}
            rightSection={
              selectedChain === network.key ? (
                <Text c="wechat" fw={700}>
                  ✓
                </Text>
              ) : null
            }
            style={{
              background:
                selectedChain === network.key
                  ? "var(--bg-active)"
                  : "transparent",
            }}>
            <Text size="sm" fw={500}>
              {network.name}
            </Text>
          </Menu.Item>
        ))}

        <Menu.Divider />
        <Menu.Label>Testnets</Menu.Label>
        {NETWORKS.filter((n) => n.testnet).map((network) => (
          <Menu.Item
            key={network.key}
            onClick={() => handleNetworkChange(network)}
            leftSection={<NetworkIcon network={network} size={24} />}
            rightSection={
              selectedChain === network.key ? (
                <Text c="wechat" fw={700}>
                  ✓
                </Text>
              ) : null
            }
            style={{
              background:
                selectedChain === network.key
                  ? "var(--bg-active)"
                  : "transparent",
            }}>
            <Text size="sm" fw={500}>
              {network.name}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
