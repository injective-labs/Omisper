import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { hexToUint8Array } from "uint8array-extras";
import { useAccount, useSignMessage } from "wagmi";
import { useXMTP } from "@/contexts/XMTPContext";
import { createEOASigner, createInjPassSigner, createSCWSigner } from "@/helpers/createSigner";
import { useEphemeralSigner } from "@/hooks/useEphemeralSigner";
import { useInjPassWallet } from "@/hooks/useInjPassWallet";
import { useSettings } from "@/hooks/useSettings";

export const useConnectXmtp = () => {
  const navigate = useNavigate();
  const { signer: ephemeralSigner } = useEphemeralSigner();
  const { initializing, client, initialize } = useXMTP();
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();
  const injPass = useInjPassWallet();
  const {
    blockchain,
    encryptionKey,
    environment,
    ephemeralAccountEnabled,
    ephemeralAccountKey,
    setEphemeralAccountKey,
    loggingLevel,
    useSCW,
    autoConnect,
    setAutoConnect,
  } = useSettings();

  const connect = useCallback(() => {
    console.log('🔍 useConnectXmtp.connect() called');
    console.log('   client:', !!client);
    console.log('   ephemeralAccountEnabled:', ephemeralAccountEnabled);
    console.log('   injPass.isConnected:', injPass.isConnected);
    console.log('   injPass.address:', injPass.address);
    console.log('   account.address:', account.address);
    console.log('   encryptionKey:', encryptionKey ? 'set' : 'empty');
    console.log('   env:', environment);

    // if client is already connected, return
    if (client) {
      console.log('❌ Client already connected, returning');
      return;
    }

    // connect ephemeral account if enabled
    if (ephemeralAccountEnabled) {
      console.log('✅ Using ephemeral account');
      void initialize({
        dbEncryptionKey: encryptionKey
          ? hexToUint8Array(encryptionKey)
          : undefined,
        env: environment,
        loggingLevel,
        signer: ephemeralSigner,
      });
      setAutoConnect(true);
      return;
    }

    // connect via INJ Pass (Passkey-based wallet)
    if (injPass.isConnected && injPass.address) {
      console.log('✅ Using INJ Pass wallet with address:', injPass.address);
      void initialize({
        dbEncryptionKey: encryptionKey
          ? hexToUint8Array(encryptionKey)
          : undefined,
        env: environment,
        loggingLevel,
        signer: createInjPassSigner(
          injPass.address,
          (message: string) => injPass.signMessage(message),
        ),
      });
      setAutoConnect(true);
      return;
    }

    // if wallet is not connected or SCW is enabled but chain is not set, return
    if (!account.address || (useSCW && blockchain <= 0)) {
      console.log('❌ No wallet connected or invalid SCW setup');
      return;
    }

    console.log('✅ Using wagmi wallet:', account.address, 'useSCW:', useSCW);
    void initialize({
      dbEncryptionKey: encryptionKey
        ? hexToUint8Array(encryptionKey)
        : undefined,
      env: environment,
      loggingLevel,
      signer: useSCW
        ? createSCWSigner(
            account.address,
            (message: string) => signMessageAsync({ message }),
            blockchain,
          )
        : createEOASigner(account.address, (message: string) =>
            signMessageAsync({ message }),
          ),
    });
    setAutoConnect(true);
  }, [
    client,
    initialize,
    setEphemeralAccountKey,
    ephemeralAccountEnabled,
    ephemeralAccountKey,
    encryptionKey,
    environment,
    loggingLevel,
    useSCW,
    account.address,
    account.chainId,
    signMessageAsync,
    setAutoConnect,
    injPass.isConnected,
    injPass.address,
    injPass.signMessage,
  ]);

  useEffect(() => {
    if (client) {
      void navigate(`/${environment}`);
    } else if (autoConnect) {
      connect();
    }
  }, [client, navigate, autoConnect, connect, environment]);

  return {
    client,
    loading: initializing,
    connect,
  };
};
