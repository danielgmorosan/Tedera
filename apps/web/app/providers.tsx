"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { WalletProvider } from "@/context/wallet-context";
import { HederaWalletProvider } from "@/context/hedera-wallet-context";

// Central place to compose global client-side providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <WalletProvider>
        <HederaWalletProvider>
          <AuthProvider>{children}</AuthProvider>
        </HederaWalletProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
