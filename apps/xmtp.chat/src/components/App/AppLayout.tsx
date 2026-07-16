import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { AppHeader } from "@/components/App/AppHeader";
import { Disclaimer } from "@/components/App/Disclaimer";
import { getMissingClientRedirect } from "@/components/App/appLayoutRedirect";
import { ConversationsNavbar } from "@/components/Conversations/ConversationsNavbar";
import { LoadingMessage } from "@/components/LoadingMessage";
import { useXMTP } from "@/contexts/XMTPContext";
import { isValidEnvironment } from "@/helpers/strings";
import { useInjPassWallet } from "@/hooks/useInjPassWallet";
import { useRedirect } from "@/hooks/useRedirect";
import { useSettings } from "@/hooks/useSettings";
import { CenteredLayout } from "@/layouts/CenteredLayout";
import {
  MainLayout,
  MainLayoutContent,
  MainLayoutHeader,
  MainLayoutNav,
} from "@/layouts/MainLayout";

const REDIRECT_TIMEOUT = 2000;

// Hook to detect mobile viewport
const useIsMobile = (breakpoint = 1080) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { client, disconnect } = useXMTP();
  const { setRedirectUrl } = useRedirect();
  const [opened, { toggle, close, open }] = useDisclosure();
  const [message, setMessage] = useState("Connecting...");
  const { environment: envParam } = useParams();
  const { setEnvironment, environment } = useSettings();
  const [validEnvironment, setValidEnvironment] = useState(false);
  const { isConnected: injPassConnected } = useInjPassWallet();
  const isMobile = useIsMobile();
  // Track whether injpass was connected when this layout first mounted
  const injPassWasConnected = useRef(injPassConnected);

  // On mobile, close sidebar when viewing a conversation, open when no conversation
  useEffect(() => {
    if (isMobile) {
      if (conversationId) {
        close();
      } else {
        open();
      }
    }
  }, [isMobile, conversationId, close, open]);

  useEffect(() => {
    if (client) return;

    const redirect = getMissingClientRedirect(
      location.pathname,
      location.search,
    );
    if (!redirect) return;

    // Preserve the active conversation, then return to the connection screen.
    // This effect must react to a client disappearing after mount (for example
    // while switching the INJ Pass host wallet), not only on first render.
    setRedirectUrl(redirect);
    void navigate("/");
  }, [client, location.pathname, location.search, navigate, setRedirectUrl]);

  // When injpass disconnects remotely (e.g. user disconnects inside the iframe),
  // also clear the XMTP client so the existing logic above redirects to "/"
  useEffect(() => {
    if (injPassWasConnected.current && !injPassConnected && client) {
      disconnect();
    }
    injPassWasConnected.current = injPassConnected;
  }, [injPassConnected, client, disconnect]);

  useEffect(() => {
    if (!client) {
      return;
    }

    let timeout: NodeJS.Timeout;

    // check for invalid environment
    if (envParam) {
      if (!isValidEnvironment(envParam)) {
        setMessage("Invalid environment, redirecting...");
        timeout = setTimeout(() => {
          void navigate(`/${environment}`);
        }, REDIRECT_TIMEOUT);
      } else if (envParam !== environment) {
        setMessage("Environment mismatch, switching and redirecting...");
        timeout = setTimeout(() => {
          setEnvironment(envParam);
          disconnect();
          void navigate("/");
        }, REDIRECT_TIMEOUT);
      } else {
        setValidEnvironment(true);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [client, environment, envParam, disconnect, navigate]);

  return !client || !validEnvironment ? (
    <CenteredLayout fullScreen>
      <LoadingMessage message={message} />
    </CenteredLayout>
  ) : (
    <>
      <MainLayout>
        <MainLayoutHeader>
          <AppHeader client={client} opened={opened} toggle={toggle} />
        </MainLayoutHeader>
        <MainLayoutNav opened={opened} toggle={toggle}>
          <ConversationsNavbar />
        </MainLayoutNav>
        <MainLayoutContent>
          <Outlet />
        </MainLayoutContent>
      </MainLayout>
      <Disclaimer />
    </>
  );
};
