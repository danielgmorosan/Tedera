"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';

interface HederaWalletContextType {
  isConnected: boolean;
  account: string | null;
  accountId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToHederaTestnet: () => Promise<void>;
  error: string | null;
}

const HederaWalletContext = createContext<HederaWalletContextType | null>(null);

export function HederaWalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hedera Testnet configuration
  const HEDERA_TESTNET_CONFIG = {
    chainId: '0x128', // 296 in decimal
    chainName: 'Hedera Testnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    rpcUrls: ['https://testnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/testnet'],
  };

  const switchToHederaTestnet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      // Try to switch to Hedera testnet
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HEDERA_TESTNET_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Hedera testnet to MetaMask');
        }
      } else {
        throw switchError;
      }
    }
  };

  const connect = async () => {
    try {
      setError(null);

      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }

      // Switch to Hedera testnet first
      await switchToHederaTestnet();

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Get the Hedera account ID from the address
      // For now, we'll use a placeholder - in production you'd query the mirror node
      const hederaAccountId = await getHederaAccountId(address);

      setAccount(address);
      setAccountId(hederaAccountId);
      setIsConnected(true);

      // Store connection state
      localStorage.setItem('hedera-wallet-connected', 'true');
      localStorage.setItem('hedera-wallet-account', address);
      localStorage.setItem('hedera-wallet-account-id', hederaAccountId);

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setAccountId(null);
    setError(null);

    // Clear stored state
    localStorage.removeItem('hedera-wallet-connected');
    localStorage.removeItem('hedera-wallet-account');
    localStorage.removeItem('hedera-wallet-account-id');
  };

  // Get Hedera account ID from EVM address
  const getHederaAccountId = async (evmAddress: string): Promise<string> => {
    try {
      // Query Hedera mirror node to get account ID from EVM address
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.evm_address=${evmAddress}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.accounts && data.accounts.length > 0) {
          return data.accounts[0].account;
        }
      }
      
      // Fallback: generate a mock account ID for testing
      // In production, you should ensure the account exists on Hedera
      return `0.0.${Math.floor(Math.random() * 1000000)}`;
    } catch (error) {
      console.warn('Failed to get Hedera account ID, using fallback');
      return `0.0.${Math.floor(Math.random() * 1000000)}`;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) return;

      const wasConnected = localStorage.getItem('hedera-wallet-connected') === 'true';
      const storedAccount = localStorage.getItem('hedera-wallet-account');
      const storedAccountId = localStorage.getItem('hedera-wallet-account-id');

      if (wasConnected && storedAccount && storedAccountId) {
        try {
          // Verify the account is still connected
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.includes(storedAccount)) {
            setAccount(storedAccount);
            setAccountId(storedAccountId);
            setIsConnected(true);
          } else {
            // Account no longer connected, clear state
            disconnect();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          disconnect();
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        // Account changed, reconnect
        connect();
      }
    };

    const handleChainChanged = () => {
      // Chain changed, check if it's still Hedera testnet
      (window as any).ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
        if (chainId !== HEDERA_TESTNET_CONFIG.chainId) {
          setError('Please switch to Hedera Testnet');
        }
      });
    };

    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  return (
    <HederaWalletContext.Provider
      value={{
        isConnected,
        account,
        accountId,
        connect,
        disconnect,
        switchToHederaTestnet,
        error,
      }}
    >
      {children}
    </HederaWalletContext.Provider>
  );
}

export function useHederaWallet() {
  const context = useContext(HederaWalletContext);
  if (!context) {
    throw new Error('useHederaWallet must be used within a HederaWalletProvider');
  }
  return context;
}
