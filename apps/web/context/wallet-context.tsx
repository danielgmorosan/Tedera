'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.providers.Web3Provider | null;
}

/**
 * Get Hedera account ID from EVM address using Hedera mirror node
 */
async function getHederaAccountIdFromEVMAddress(evmAddress: string): Promise<string | null> {
  try {
    // Query Hedera mirror node to get account ID from EVM address
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.evm_address=${evmAddress.toLowerCase()}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.accounts && data.accounts.length > 0) {
        return data.accounts[0].account;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get Hedera account ID from EVM address:', error);
    return null;
  }
}

/**
 * Automatically authenticate user with wallet address
 */
async function authenticateWithWallet(evmAddress: string): Promise<boolean> {
  try {
    // Try to get Hedera account ID from EVM address
    let hederaAccountId = await getHederaAccountIdFromEVMAddress(evmAddress);
    
    // If we can't get the account ID, use a fallback format
    // The login API expects 0.0.x format
    if (!hederaAccountId) {
      // Use a fallback: create account ID from EVM address hash
      // We'll use a hash of the address to create a deterministic but unique account ID
      // This is a temporary solution - in production you should ensure the account exists
      // We use the first 40 characters of the address (after 0x) and convert to a number
      // To avoid collisions, we use a simple hash approach
      const addressWithoutPrefix = evmAddress.toLowerCase().slice(2); // Remove 0x
      // Convert first 8 hex chars to decimal (max ~2^32, which is reasonable for account IDs)
      // Using modulo to ensure it fits in a reasonable range
      const accountNum = parseInt(addressWithoutPrefix.slice(0, 8), 16) % 1000000000; // Max 1 billion
      hederaAccountId = `0.0.${accountNum}`;
      console.warn('Could not resolve Hedera account ID from mirror node, using fallback:', hederaAccountId);
      console.warn('Note: This is a synthetic account ID. The real Hedera account ID may differ.');
    }
    
    // Call login API to authenticate
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hederaAccountId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Authentication failed:', error);
      return false;
    }
    
    const data = await response.json();
    
    // Store the auth token
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('hedera-auth-token', data.token);
      console.log('✅ Auto-authenticated with wallet address');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auto-authentication error:', error);
    return false;
  }
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  // Restore wallet connection on mount and auto-authenticate
  useEffect(() => {
    const restoreConnection = async () => {
      const wasConnected = localStorage.getItem('wallet-connected');
      if (wasConnected === 'true') {
        try {
          const detectedProvider = await detectEthereumProvider();
          if (detectedProvider) {
            const web3Provider = new ethers.providers.Web3Provider(detectedProvider as any);
            const accounts = await web3Provider.listAccounts();

            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setProvider(web3Provider);
              console.log('Wallet connection restored:', accounts[0]);
              
              // Auto-authenticate if not already authenticated
              const existingToken = localStorage.getItem('hedera-auth-token');
              if (!existingToken) {
                await authenticateWithWallet(accounts[0]);
              }
            } else {
              // Clear stored state if no accounts
              localStorage.removeItem('wallet-connected');
            }
          }
        } catch (error) {
          console.error('Failed to restore wallet connection:', error);
          localStorage.removeItem('wallet-connected');
        }
      }
    };

    restoreConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected
        setAccount(null);
        setProvider(null);
        localStorage.removeItem('wallet-connected');
        localStorage.removeItem('hedera-auth-token');
      } else {
        // User switched accounts
        setAccount(accounts[0]);
        if (provider) {
          // Update provider with new account
          const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
          setProvider(web3Provider);
        }
        // Auto-authenticate with new account
        const existingToken = localStorage.getItem('hedera-auth-token');
        if (!existingToken || accounts[0] !== account) {
          await authenticateWithWallet(accounts[0]);
        }
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if ((window as any).ethereum.removeListener) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider]);

  const connect = async () => {
    setConnecting(true);
    try {
      const detectedProvider = await detectEthereumProvider();
      if (!detectedProvider) {
        alert('Please install MetaMask!');
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(detectedProvider as any);

      // Request account access
      const accounts = await web3Provider.send('eth_requestAccounts', []);

      // Switch to Hedera testnet
      try {
        await web3Provider.send('wallet_switchEthereumChain', [
          { chainId: '0x128' } // Hedera testnet chain ID (296)
        ]);
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await web3Provider.send('wallet_addEthereumChain', [{
            chainId: '0x128',
            chainName: 'Hedera Testnet',
            nativeCurrency: {
              name: 'HBAR',
              symbol: 'HBAR',
              decimals: 18
            },
            rpcUrls: ['https://testnet.hashio.io/api'],
            blockExplorerUrls: ['https://hashscan.io/testnet']
          }]);
        }
      }

      setAccount(accounts[0]);
      setProvider(web3Provider);

      // Persist connection state
      localStorage.setItem('wallet-connected', 'true');
      console.log('Wallet connected:', accounts[0]);
      
      // Auto-authenticate with wallet address
      await authenticateWithWallet(accounts[0]);
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    localStorage.removeItem('wallet-connected');
    // Note: We don't remove the auth token on disconnect
    // as the user might want to stay authenticated even if wallet disconnects
    // The auth token will be removed when user explicitly logs out
    console.log('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ account, connecting, connect, disconnect, provider }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
