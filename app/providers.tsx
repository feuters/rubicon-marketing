"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { ACTIVE_CHAIN } from "@/lib/chain";

const PrivyConfiguredContext = createContext(false);

const PrivyProvider = dynamic(
  () => import("@privy-io/react-auth").then((module) => module.PrivyProvider),
  { ssr: false },
);

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
  const shouldUsePrivy = pathname?.startsWith("/dashboard") ?? false;

  if (!shouldUsePrivy || !appId) {
    return <PrivyConfiguredContext.Provider value={false}>{children}</PrivyConfiguredContext.Provider>;
  }

  return (
    <PrivyConfiguredContext.Provider value>
      <PrivyProvider
        appId={appId}
        clientId={clientId}
        config={{
          loginMethods: ["twitter", "email", "wallet"],
          appearance: {
            theme: "light",
            accentColor: "#2d91ed",
          },
          // Transactions settle on Arc — Arc Testnet for now.
          defaultChain: ACTIVE_CHAIN,
          supportedChains: [ACTIVE_CHAIN],
          embeddedWallets: {
            // Give every creator a wallet on login, including email/Twitter
            // sign-ins, so the receiving address is one click in Settings.
            ethereum: {
              createOnLogin: "all-users",
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyConfiguredContext.Provider>
  );
}

export function usePrivyConfigured() {
  return useContext(PrivyConfiguredContext);
}
