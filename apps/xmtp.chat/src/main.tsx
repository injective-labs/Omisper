import "@mantine/core/styles.css";
import "@/styles/wechat-style.css";
import { createTheme, MantineProvider } from "@mantine/core";
import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import pkg from "@xmtp/browser-sdk/package.json";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  metaMask,
  walletConnect,
} from "wagmi/connectors";
import { App } from "@/components/App/App";
import { XMTPProvider } from "@/contexts/XMTPContext";
import { queryClient } from "@/helpers/queries";

Sentry.init({
  dsn: "https://ba2f58ad2e3d5fd09cd8aa36038b950f@o4504757119680512.ingest.us.sentry.io/4510308912005120",
  // ensure no data collection except errors
  enableLogs: false,
  profilesSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false,
  tracesSampleRate: 0,
});

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "Arbisper",
    }),
    metaMask(),
    walletConnect({ projectId: import.meta.env.VITE_PROJECT_ID }),
  ],
  chains: [
    arbitrum, // Arbitrum as primary chain
    arbitrumSepolia,
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

// WeChat-style modern theme
const theme = createTheme({
  primaryColor: "wechat",
  colors: {
    wechat: [
      "#e8f5e9",
      "#c8e6c9",
      "#a5d6a7",
      "#81c784",
      "#66bb6a",
      "#07C160", // WeChat green - primary
      "#06ad56",
      "#059a4c",
      "#048742",
      "#037438",
    ],
    // subtle gray for backgrounds
    gray: [
      "#fafafa",
      "#f5f5f5",
      "#eeeeee",
      "#e0e0e0",
      "#bdbdbd",
      "#9e9e9e",
      "#757575",
      "#616161",
      "#424242",
      "#212121",
    ],
  },
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
  fontSizes: {
    xxs: "calc(0.6875rem * var(--mantine-scale))",
    xs: "calc(0.75rem * var(--mantine-scale))",
    sm: "calc(0.875rem * var(--mantine-scale))",
    md: "calc(1rem * var(--mantine-scale))",
    lg: "calc(1.125rem * var(--mantine-scale))",
    xl: "calc(1.25rem * var(--mantine-scale))",
  },
  lineHeights: {
    xxs: "1.2",
    xs: "1.4",
    sm: "1.5",
    md: "1.55",
    lg: "1.6",
    xl: "1.65",
  },
  spacing: {
    xxs: "calc(0.5rem * var(--mantine-scale))",
    xxxs: "calc(0.25rem * var(--mantine-scale))",
    xs: "calc(0.625rem * var(--mantine-scale))",
    sm: "calc(0.75rem * var(--mantine-scale))",
    md: "calc(1rem * var(--mantine-scale))",
    lg: "calc(1.25rem * var(--mantine-scale))",
    xl: "calc(1.5rem * var(--mantine-scale))",
  },
  defaultRadius: "lg",
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
    md: "0 2px 8px rgba(0, 0, 0, 0.08)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.1)",
    xl: "0 8px 32px rgba(0, 0, 0, 0.12)",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: "all 0.2s ease",
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          border: "none",
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
      styles: {
        root: {
          border: "none",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "xl",
      },
      styles: {
        input: {
          border: "1px solid #e0e0e0",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          "&:focus": {
            borderColor: "#07C160",
            boxShadow: "0 0 0 2px rgba(7, 193, 96, 0.1)",
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        input: {
          border: "1px solid #e0e0e0",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          "&:focus": {
            borderColor: "#07C160",
            boxShadow: "0 0 0 2px rgba(7, 193, 96, 0.1)",
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: "lg",
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: "xl",
      },
      styles: {
        root: {
          transition: "all 0.2s ease",
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "xl",
      },
    },
    Menu: {
      styles: {
        dropdown: {
          border: "none",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
        },
        item: {
          transition: "background-color 0.15s ease",
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        content: {
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    Notification: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <XMTPProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </XMTPProvider>
      </MantineProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);

console.log("[xmtp.chat] XMTP Browser SDK version:", pkg.version);
