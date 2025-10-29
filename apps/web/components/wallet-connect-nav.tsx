'use client';

import { useWallet } from '@/context/wallet-context';
import { Button } from './ui/button';

export function WalletConnectNav() {
  const { account, connecting, connect, disconnect } = useWallet();
  
  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }
  
  return (
    <Button onClick={connect} disabled={connecting}>
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
