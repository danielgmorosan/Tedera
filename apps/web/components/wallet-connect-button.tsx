"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Wallet,
  CheckCircle,
  Copy,
  ExternalLink,
  LogOut,
  AlertCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Using our new wallet context
import { useWallet } from "@/context/wallet-context";

interface WalletConnectButtonProps {
  isExpanded?: boolean;
}

export function WalletConnectButton({ isExpanded = false }: WalletConnectButtonProps) {
  const walletContext = useWallet();
  const [connectionError, setConnectionError] = useState("");
  
  // Safe destructuring with fallbacks
  const account = walletContext?.account || null;
  const connecting = walletContext?.connecting || false;
  const connect = walletContext?.connect || (async () => {});
  const disconnect = walletContext?.disconnect || (() => {});
  const provider = walletContext?.provider || null;

  const handleConnect = async () => {
    setConnectionError("");
    try {
      await connect();
    } catch (e: any) {
      setConnectionError(
        e?.message || "Failed to connect wallet. Please try again."
      );
    }
  };

  const copyAddress = () => {
    if (account) navigator.clipboard.writeText(account);
  };

  const openExplorer = () => {
    if (!account) return;
    window.open(
      `https://hashscan.io/testnet/account/${account}`,
      "_blank"
    );
  };

  const isConnected = !!account;

  if (!isConnected) {
    return (
      <div className={cn(
        "flex flex-col gap-1 w-full",
        isExpanded ? "items-start" : "items-center"
      )}>
        <Button
          onClick={handleConnect}
          disabled={connecting}
          className="h-10 w-10 p-0 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          title={connecting ? 'Connecting...' : 'Connect Wallet'}
        >
          <Wallet className="h-5 w-5" />
        </Button>
        {connectionError && (
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg max-w-full">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{connectionError}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 transition-colors duration-200 relative"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
              {account ? account.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          {/* Connection status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 bg-white border-slate-200 rounded-2xl shadow-xl p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header with user info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                {account ? account.slice(0, 2).toUpperCase() : <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Anonymous User"}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs rounded-full bg-emerald-50 border-emerald-200 text-emerald-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="text-xs text-slate-500">
                MetaMask Wallet
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Network</span>
              <Badge
                variant="outline"
                className="text-xs bg-slate-50 text-slate-600 rounded-full"
              >
                Hedera Testnet
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Address</span>
              <span className="font-mono text-xs text-slate-600 max-w-32 truncate">
                {account}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2 space-y-1">
          <button
            onClick={copyAddress}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-left"
          >
            <Copy className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700 text-sm">Copy Address</span>
          </button>

          <button
            onClick={openExplorer}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-left"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700 text-sm">View on Explorer</span>
          </button>

          <button
            onClick={disconnect}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 cursor-pointer transition-colors text-left text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Disconnect</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
