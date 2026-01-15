import { ActionIcon, Box, Burger, Flex, Group, Text } from "@mantine/core";
import type { Client } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppMenu } from "@/components/App/AppMenu";
import { NetworkSwitcher } from "@/components/App/NetworkSwitcher";
import type { ContentTypes } from "@/contexts/XMTPContext";
import { shortAddress } from "@/helpers/strings";
import { useSettings } from "@/hooks/useSettings";

export type AppHeaderProps = {
  client: Client<ContentTypes>;
  opened?: boolean;
  toggle?: () => void;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  client,
  opened,
  toggle,
}) => {
  const navigate = useNavigate();
  const { environment } = useSettings();
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setAccountIdentifier(
      client.accountIdentifier?.identifier.toLowerCase() ?? null,
    );
  }, [client.accountIdentifier]);

  const handleClick = () => {
    void navigate(`/${environment}/identity`);
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        height: "100%",
        padding: "0 16px",
      }}>
      {/* Left side: burger + account */}
      <Flex align="center" gap="md">
        <Box
          style={{
            display: "none",
            "@media (max-width: 1080px)": { display: "block" },
          }}
          hiddenFrom="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
        </Box>
        <Box
          onClick={handleClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 20,
            background: "var(--bg-primary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-primary)";
          }}>
          {/* Avatar */}
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "linear-gradient(135deg, var(--wechat-green), var(--wechat-green-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
            }}>
            {accountIdentifier ? accountIdentifier.slice(2, 4).toUpperCase() : "?"}
          </Box>
          <Text size="sm" fw={500} style={{ color: "var(--text-primary)" }}>
            {accountIdentifier ? shortAddress(accountIdentifier) : "..."}
          </Text>
        </Box>
      </Flex>

      {/* Right side: network + status + menu */}
      <Group gap="sm" align="center">
        {/* Environment badge */}
        <Group
          gap={6}
          align="center"
          style={{
            padding: "4px 10px",
            borderRadius: 12,
            background: "var(--bg-primary)",
          }}>
          <Box
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--wechat-green)",
              boxShadow: "0 0 0 2px rgba(7, 193, 96, 0.2)",
            }}
          />
          <Text size="xs" fw={600} style={{ color: "var(--text-secondary)" }}>
            {environment}
          </Text>
        </Group>

        {/* Network switcher */}
        <NetworkSwitcher />

        {/* Menu */}
        <AppMenu />
      </Group>
    </Flex>
  );
};
