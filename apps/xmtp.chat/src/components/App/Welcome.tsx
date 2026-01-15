import { Box, Image, Stack, Text, Title } from "@mantine/core";
import { Connect } from "@/components/App/Connect";
import { NetworkSwitcher } from "@/components/App/NetworkSwitcher";
import logo from "@/assets/arilogo.png";

export const Welcome = () => {
  return (
    <Box className="welcome-container">
      {/* Network switcher in top right */}
      <Box
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 100,
        }}>
        <NetworkSwitcher />
      </Box>

      {/* Logo */}
      <Image
        src={logo}
        alt="Arbisper"
        w={80}
        h={80}
        fit="contain"
        className="welcome-logo"
        style={{
          filter: "drop-shadow(0 4px 12px rgba(7, 193, 96, 0.2))",
        }}
      />

      {/* Title and subtitle */}
      <Title order={1} className="welcome-title">
        Arbisper
      </Title>
      <Text className="welcome-subtitle">
        Decentralized P2P Messaging
        <br />
        <Text span size="sm" c="dimmed">
          Powered by XMTP • Secured on Arbitrum
        </Text>
      </Text>

      {/* Connect card */}
      <Stack gap="md" className="welcome-card">
        <Connect />
      </Stack>

      {/* Footer */}
      <Text
        size="xs"
        c="dimmed"
        ta="center"
        mt="xl"
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
        }}>
        End-to-end encrypted • Your keys, your messages
      </Text>
    </Box>
  );
};
