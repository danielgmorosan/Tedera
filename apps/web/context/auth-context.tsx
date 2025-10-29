"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Simple User + Wallet types (can be extended later)
export interface AuthUser {
  id: string; // e.g. Hedera account id 0.0.x or internal uuid
  username: string;
  avatarUrl?: string;
  email?: string;
  isKYCVerified: boolean;
}

export interface WalletInfo {
  address: string; // Hedera account id
  balance: number; // HBAR balance (mocked)
  network: string; // e.g. Hedera Testnet
  walletType: string; // e.g. HashPack, Blade, etc.
}

interface AuthContextValue {
  user: AuthUser | null;
  wallet: WalletInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (opts: {
    username?: string;
    password?: string;
    hederaAccountId?: string;
  }) => Promise<void>;
  logout: () => void;
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "hedera-auth-state";
const TOKEN_KEY = "hedera-auth-token";

function loadPersistedState(): {
  user: AuthUser | null;
  wallet: WalletInfo | null;
} {
  if (typeof window === "undefined") return { user: null, wallet: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, wallet: null };
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse auth state", e);
    return { user: null, wallet: null };
  }
}

function persistState(state: {
  user: AuthUser | null;
  wallet: WalletInfo | null;
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to persist auth state", e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ user, wallet }, setState] = useState<{
    user: AuthUser | null;
    wallet: WalletInfo | null;
  }>(() => loadPersistedState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist changes
  useEffect(() => {
    persistState({ user, wallet });
    if (typeof window !== "undefined") {
      if (!user) localStorage.removeItem(TOKEN_KEY);
    }
  }, [user, wallet]);

  const login = useCallback(
    async (opts: {
      username?: string;
      password?: string;
      hederaAccountId?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const isWallet = !!opts.hederaAccountId && !opts.username;
        const endpoint = isWallet
          ? "/api/auth/login"
          : opts.username && opts.password
            ? "/api/auth/login"
            : "/api/auth/signup";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opts),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Auth failed");
        const { token, user: apiUser } = data;
        if (token && typeof window !== "undefined")
          localStorage.setItem(TOKEN_KEY, token);
        const enriched: AuthUser = {
          id: apiUser.id,
          username: apiUser.username,
          isKYCVerified: apiUser.isKYCVerified,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.username}`,
        };
        setState((s) => ({ ...s, user: enriched }));
      } catch (e: any) {
        setError(e.message || "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setState({ user: null, wallet: null });
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  }, []);

  const connectWallet = useCallback(
    async (walletId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // simulate obtaining hedera account id then login via hederaAccountId pathway
        const hederaAccountId = `0.0.${Math.floor(Math.random() * 900000) + 100000}`;
        await login({ hederaAccountId });
        setState((s) => ({
          ...s,
          wallet: {
            address: hederaAccountId,
            balance: Math.floor(Math.random() * 10000) + 1000,
            network: "Hedera Testnet",
            walletType: walletId,
          },
        }));
      } catch (e: any) {
        setError(e.message || "Wallet connection failed");
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const disconnectWallet = useCallback(() => {
    setState((s) => ({ ...s, wallet: null }));
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setState((s) => ({ ...s, user: s.user ? { ...s.user, ...data } : s.user }));
  }, []);

  const value: AuthContextValue = {
    user,
    wallet,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
