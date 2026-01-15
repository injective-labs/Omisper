import { Group, NativeSelect, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import { useSwitchChain } from "wagmi";
import { injectiveMainnet, injectiveTestnet } from "@/helpers/chains";
import { useSettings } from "@/hooks/useSettings";

// all allowed chains
const ALLOWED_CHAINS: number[] = [
  injectiveMainnet.id,
  injectiveTestnet.id,
];

export const BlockchainSelect: React.FC = () => {
  const { blockchain, setBlockchain, useSCW, ephemeralAccountEnabled } =
    useSettings();
  const { chains, switchChain } = useSwitchChain();
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    switchChain(
      {
        chainId: parseInt(event.currentTarget.value),
      },
      {
        onSuccess(data) {
          setBlockchain(data.id);
        },
        onError(error) {
          console.error("An error occurred while switching chain", error);
        },
        onSettled() {
          setLoading(false);
        },
      },
    );
  };

  const options = useMemo(
    () =>
      chains
        .filter((chain) => ALLOWED_CHAINS.includes(chain.id))
        .map((chain) => ({
          value: chain.id.toString(),
          label: chain.name,
        })),
    [chains],
  );

  return (
    <Group gap="sm" align="center" wrap="nowrap">
      <Text fw={500} size="sm">
        Blockchain
      </Text>
      <Tooltip label="Select the blockchain to use for signing smart contract wallet messages">
        <NativeSelect
          disabled={loading || !useSCW || ephemeralAccountEnabled}
          data={options}
          value={blockchain.toString()}
          onChange={handleChange}
          size="sm"
          radius="md"
          styles={{
            input: {
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
            },
          }}
        />
      </Tooltip>
    </Group>
  );
};
