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

  // Restore wallet connection on mount
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

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected
        setAccount(null);
        setProvider(null);
        localStorage.removeItem('wallet-connected');
      } else {
        // User switched accounts
        setAccount(accounts[0]);
        if (provider) {
          // Update provider with new account
          const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
          setProvider(web3Provider);
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
    console.log('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ account, connecting, connect, disconnect, provider }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
