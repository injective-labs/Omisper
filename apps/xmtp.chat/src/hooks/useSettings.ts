import { useLocalStorage } from "@mantine/hooks";
import { type ClientOptions, type XmtpEnv } from "@xmtp/browser-sdk";
import type { Hex } from "viem";
import { arbitrum } from "wagmi/chains";
import type { ConnectorString } from "@/hooks/useConnectWallet";

// chain type for network switching
export type ChainType = "arbitrum" | "arbitrumSepolia";

export const useSettings = () => {
  const [environment, setEnvironment] = useLocalStorage<XmtpEnv>({
    key: "XMTP_NETWORK",
    defaultValue: "dev",
    getInitialValueInEffect: false,
  });
  const [ephemeralAccountKey, setEphemeralAccountKey] =
    useLocalStorage<Hex | null>({
      key: "XMTP_EPHEMERAL_ACCOUNT_KEY",
      defaultValue: null,
      getInitialValueInEffect: false,
    });
  const [encryptionKey, setEncryptionKey] = useLocalStorage({
    key: "XMTP_ENCRYPTION_KEY",
    defaultValue: "",
    getInitialValueInEffect: false,
  });
  const [ephemeralAccountEnabled, setEphemeralAccountEnabled] = useLocalStorage(
    {
      key: "XMTP_USE_EPHEMERAL_ACCOUNT",
      defaultValue: false,
      getInitialValueInEffect: false,
    },
  );
  const [loggingLevel, setLoggingLevel] = useLocalStorage<
    ClientOptions["loggingLevel"]
  >({
    key: "XMTP_LOGGING_LEVEL",
    defaultValue: "warn",
    getInitialValueInEffect: false,
  });
  const [forceSCW, setForceSCW] = useLocalStorage<boolean>({
    key: "XMTP_FORCE_SCW",
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  const [useSCW, setUseSCW] = useLocalStorage<boolean>({
    key: "XMTP_USE_SCW",
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  // default to Arbitrum mainnet
  const [blockchain, setBlockchain] = useLocalStorage<number>({
    key: "XMTP_BLOCKCHAIN",
    defaultValue: arbitrum.id,
    getInitialValueInEffect: false,
  });
  // selected chain type for display
  const [selectedChain, setSelectedChain] = useLocalStorage<ChainType>({
    key: "XMTP_SELECTED_CHAIN",
    defaultValue: "arbitrum",
    getInitialValueInEffect: false,
  });
  const [connector, setConnector] = useLocalStorage<ConnectorString>({
    key: "XMTP_CONNECTOR",
    defaultValue: "MetaMask",
    getInitialValueInEffect: false,
  });
  const [autoConnect, setAutoConnect] = useLocalStorage<boolean>({
    key: "XMTP_AUTO_CONNECT",
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  const [showDisclaimer, setShowDisclaimer] = useLocalStorage<boolean>({
    key: "XMTP_SHOW_DISCLAIMER",
    defaultValue: true,
    getInitialValueInEffect: false,
  });

  return {
    autoConnect,
    blockchain,
    connector,
    encryptionKey,
    environment,
    ephemeralAccountEnabled,
    ephemeralAccountKey,
    forceSCW,
    loggingLevel,
    selectedChain,
    useSCW,
    showDisclaimer,
    setAutoConnect,
    setBlockchain,
    setConnector,
    setEncryptionKey,
    setEnvironment,
    setEphemeralAccountEnabled,
    setEphemeralAccountKey,
    setForceSCW,
    setLoggingLevel,
    setSelectedChain,
    setUseSCW,
    setShowDisclaimer,
  };
};
