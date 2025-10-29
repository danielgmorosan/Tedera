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
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setConnecting(false);
    }
  };
  
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };
  
  return (
    <WalletContext.Provider value={{ account, connecting, connect, disconnect, provider }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
