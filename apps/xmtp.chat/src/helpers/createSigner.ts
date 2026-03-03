import type { Signer } from "@xmtp/browser-sdk";
import { toBytes, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Create an XMTP Signer for an INJ Pass wallet.
 *
 * The INJ Pass wallet uses a secp256k1 key pair. The same key controls both
 * the Injective bech32 address (inj1...) and the Ethereum hex address (0x...).
 *
 * @param ethAddress  - Ethereum-compatible 0x... address (from wallet.ethAddress)
 * @param signMessage - INJ Pass signMessage — returns a 65-byte EIP-191
 *                      personal_sign signature (r || s || v)
 */
export const createInjPassSigner = (
  ethAddress: string,
  signMessage: (message: string) => Promise<Uint8Array>,
): Signer => {
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: ethAddress.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      // INJ Pass already produces a valid 65-byte Ethereum personal_sign sig
      return await signMessage(message);
    },
  };
};

export const createEphemeralSigner = (privateKey: Hex): Signer => {
  const account = privateKeyToAccount(privateKey);
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: account.address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await account.signMessage({
        message,
      });
      return toBytes(signature);
    },
  };
};

export const createEOASigner = (
  address: `0x${string}`,
  signMessage: (message: string) => Promise<string> | string,
): Signer => {
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message);
      return toBytes(signature);
    },
  };
};

export const createSCWSigner = (
  address: `0x${string}`,
  signMessage: (message: string) => Promise<string> | string,
  chainId: number = 1,
): Signer => {
  console.log("Creating SCW signer with chain ID:", chainId);
  return {
    type: "SCW",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message);
      const signatureBytes = toBytes(signature);
      return signatureBytes;
    },
    getChainId: () => BigInt(chainId),
  };
};
