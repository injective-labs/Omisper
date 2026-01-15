import { defineChain } from "viem";

// Injective EVM Mainnet configuration
export const injectiveMainnet = defineChain({
  id: 2525,
  name: "Injective",
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evm.injective.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective Explorer",
      url: "https://explorer.injective.network",
    },
  },
  contracts: {},
});

// Injective EVM Testnet configuration
export const injectiveTestnet = defineChain({
  id: 2536,
  name: "Injective Testnet",
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.injective.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective Testnet Explorer",
      url: "https://testnet.explorer.injective.network",
    },
  },
  testnet: true,
  contracts: {},
});

// supported chains list
export const SUPPORTED_CHAINS = {
  injective: injectiveMainnet,
  injectiveTestnet: injectiveTestnet,
} as const;

export type SupportedChainKey = keyof typeof SUPPORTED_CHAINS;
