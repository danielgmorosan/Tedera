"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Wallet, AlertCircle, CheckCircle } from "lucide-react"
import { usePropertyPurchase } from "@/hooks/use-property-purchase"
import { useWallet } from "@/context/wallet-context"

interface Property {
  id: string
  title: string
  availableSupply: number
  totalValue: number
  pricePerShare?: number
  totalShares?: number
  saleContractAddress?: string
}

interface BuyPanelProps {
  property: Property
}

export function BuyPanel({ property }: BuyPanelProps) {
  const [quantity, setQuantity] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState<string>("")
  
  const { account } = useWallet()
  const { purchaseShares } = usePropertyPurchase()

  const pricePerShare = property.pricePerShare || 250
  const totalShares = property.totalShares || 10000
  const availableShares = Math.floor((property.availableSupply / 100) * totalShares)
  const quantityNum = Number.parseInt(quantity) || 0
  const totalCost = quantityNum * pricePerShare
  const percentageOfProperty = totalShares > 0 ? (quantityNum / totalShares) * 100 : 0

  const handlePurchase = async () => {
    if (quantityNum <= 0 || quantityNum > availableShares) return
    if (!account) {
      alert('Please connect wallet')
      return
    }
    if (!property.saleContractAddress) {
      alert('Property sale contract not available')
      return
    }

    setIsProcessing(true)
    setTransactionStatus("pending")

    try {
      const txHash = await purchaseShares(
        property.saleContractAddress,
        quantityNum,
        pricePerShare
      )
      
      setTransactionHash(txHash)
      
      // Record investment in database
      await fetch('/api/investments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hedera-auth-token')}`
        },
        body: JSON.stringify({
          propertyId: property.id,
          shares: quantityNum,
          transactionHash: txHash,
        }),
      })
      
      setTransactionStatus("success")
    } catch (error) {
      console.error('Purchase error:', error)
      setTransactionStatus("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const isValidQuantity = quantityNum > 0 && quantityNum <= availableShares

  if (transactionStatus === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Purchase Successful!</h3>
          <p className="text-green-700 mb-4">
            You've successfully purchased {quantityNum} shares of {property.title}
          </p>
          <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
            Transaction ID: {transactionHash.slice(0, 20)}...
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden mt-[13px] mb-[23]">
      <CardHeader className="pb-6 border-b border-emerald-100/50 pt-0 mx-0 bg-[rgba(235,252,244,0)]">
        <CardTitle className="flex items-center text-slate-900 font-semibold text-lg">
          <ShoppingCart className="h-5 w-5 mr-3 text-emerald-600" />
          Purchase Shares
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6 pt-0">
        <div className="space-y-3">
          <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
            Number of Shares
          </Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            max={availableShares}
            className="h-12 text-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
          />
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
              Available: {availableShares.toLocaleString()}
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
              {pricePerShare} HBAR/share
            </span>
          </div>
        </div>

        {quantityNum > 0 && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Shares:</span>
              <span className="font-semibold text-slate-900">{quantityNum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Property Ownership:</span>
              <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-medium">
                {percentageOfProperty.toFixed(3)}%
              </Badge>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-slate-900">Total Cost:</span>
              <span className="font-bold text-emerald-600 text-xl">{totalCost.toLocaleString()} HBAR</span>
            </div>
          </div>
        )}

        {!isValidQuantity && quantityNum > 0 && (
          <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {quantityNum > availableShares
                ? `Maximum ${availableShares} shares available`
                : "Please enter a valid quantity"}
            </span>
          </div>
        )}

        <Button
          className="w-full h-12 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
          onClick={handlePurchase}
          disabled={!isValidQuantity || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              {transactionStatus === "pending" ? "Processing Transaction..." : "Confirming..."}
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Purchase {totalCost.toLocaleString()} HBAR
            </>
          )}
        </Button>

        <div className="text-xs text-slate-500 text-center bg-slate-50 p-3 rounded-lg">
          Transactions are processed on the Hedera network. Gas fees may apply.
        </div>
      </CardContent>
    </Card>
  )
}
