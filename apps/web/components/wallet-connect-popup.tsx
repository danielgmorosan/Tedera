"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Shield, Zap } from "lucide-react"

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  isPopular?: boolean
  isRecommended?: boolean
}

const walletOptions: WalletOption[] = [
  {
    id: "hashpack",
    name: "HashPack",
    icon: "🔷",
    description: "The most popular Hedera wallet with full DeFi support",
    isPopular: true,
    isRecommended: true,
  },
  {
    id: "blade",
    name: "Blade Wallet",
    icon: "⚔️",
    description: "Secure multi-chain wallet with Hedera integration",
    isPopular: true,
  },
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect via Hedera JSON-RPC relay",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect with 300+ wallets via WalletConnect",
  },
]

interface WalletConnectPopupProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletId: string) => void
  isConnecting: boolean
  connectingWallet: string | null
}

export function WalletConnectPopup({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  connectingWallet,
}: WalletConnectPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose your preferred wallet to connect to Hedera Terra</p>

          <div className="space-y-2">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover:bg-accent/50 transition-colors bg-transparent"
                onClick={() => onConnect(wallet.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{wallet.name}</span>
                      {wallet.isRecommended && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      {wallet.isPopular && !wallet.isRecommended && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{wallet.description}</p>
                  </div>
                  {isConnecting && connectingWallet === wallet.id && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  {!isConnecting && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                </div>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              By connecting a wallet, you agree to our{" "}
              <button className="text-primary hover:underline">Terms of Service</button> and{" "}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
