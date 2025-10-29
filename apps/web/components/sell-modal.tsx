"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, DollarSign, TrendingDown, X } from "lucide-react"

interface PortfolioHolding {
  id: string
  propertyId: string
  propertyTitle: string
  propertyType: "forest" | "solar" | "real-estate"
  propertyImage: string
  sharesOwned: number
  totalShares: number
  purchasePrice: number
  currentValue: number
  expectedYield: number
  lastDistribution: number
  totalDistributions: number
  purchaseDate: string
}

interface SellModalProps {
  holding: PortfolioHolding
  onClose: () => void
}

export function SellModal({ holding, onClose }: SellModalProps) {
  const [quantity, setQuantity] = useState("")
  const [pricePerShare, setPricePerShare] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")

  const quantityNum = Number.parseInt(quantity) || 0
  const priceNum = Number.parseFloat(pricePerShare) || 0
  const totalValue = quantityNum * priceNum
  const currentPricePerShare = holding.currentValue / holding.sharesOwned
  const suggestedPrice = Math.round(currentPricePerShare * 0.98) // 2% below current value

  const isValidQuantity = quantityNum > 0 && quantityNum <= holding.sharesOwned
  const isValidPrice = priceNum > 0

  const handleSell = async () => {
    if (!isValidQuantity || !isValidPrice) return

    setIsProcessing(true)
    setTransactionStatus("pending")

    // Simulate blockchain transaction
    setTimeout(() => {
      setTransactionStatus("success")
      setIsProcessing(false)
      // Close modal after success
      setTimeout(() => {
        onClose()
      }, 3000)
    }, 2500)
  }

  if (transactionStatus === "success") {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Listing Created!</h3>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Your {quantityNum} shares of {holding.propertyTitle} are now listed for sale at ${priceNum}/share
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <Badge variant="outline" className="bg-emerald-100 border-emerald-300 text-emerald-800 text-sm px-4 py-2">
                Listing ID: LST-{Date.now()}
              </Badge>
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl text-base font-medium"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-6 border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 p-0 hover:bg-gray-100 rounded-full"
          >
            
          </Button>
          <DialogTitle className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200">
              <TrendingDown className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Sell Your Shares</h2>
              <p className="text-gray-600">List your shares on the marketplace</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="space-y-4">
            {/* Property Overview - Compact Version */}
            <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={holding.propertyImage || "/placeholder.svg"}
                    alt={holding.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{holding.propertyTitle}</h3>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {holding.propertyType === "real-estate" ? "Real Estate" : holding.propertyType}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Shares Owned</span>
                    <div className="font-bold text-gray-900">{holding.sharesOwned.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Value</span>
                    <div className="font-bold text-gray-900">${holding.currentValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Price per Share</span>
                    <div className="font-bold text-gray-900">${currentPricePerShare.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Yield</span>
                    <div className="font-bold text-emerald-600">{holding.expectedYield}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Form - Compact */}
            <div className="space-y-4">
              <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardContent className="p-4">
                  <Label htmlFor="sell-quantity" className="text-gray-900 font-semibold mb-2 block">
                    Number of Shares
                  </Label>
                  <Input
                    id="sell-quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    max={holding.sharesOwned}
                    className="border border-gray-300 focus:border-gray-900 focus:ring-0 rounded-lg h-12 text-base px-4"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">Available: {holding.sharesOwned.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-900 hover:bg-gray-100 font-medium text-sm px-3 py-1"
                      onClick={() => setQuantity(holding.sharesOwned.toString())}
                    >
                      Sell All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardContent className="p-4">
                  <Label htmlFor="sell-price" className="text-gray-900 font-semibold mb-2 block">
                    Price per Share
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-base">
                      $
                    </span>
                    <Input
                      id="sell-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={pricePerShare}
                      onChange={(e) => setPricePerShare(e.target.value)}
                      min="0.01"
                      className="border border-gray-300 focus:border-gray-900 focus:ring-0 rounded-lg h-12 pl-10 text-base"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">Suggested: ${suggestedPrice}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-900 hover:bg-gray-100 font-medium text-sm px-3 py-1"
                      onClick={() => setPricePerShare(suggestedPrice.toString())}
                    >
                      Use Suggested
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {quantityNum > 0 && priceNum > 0 && (
                <Card className="border border-emerald-200 shadow-sm rounded-xl bg-emerald-50">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Shares to sell</span>
                        <span className="font-semibold text-gray-900">{quantityNum.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Price per share</span>
                        <span className="font-semibold text-gray-900">${priceNum.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-emerald-200 pt-2 mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-gray-900">Total Value</span>
                          <span className="font-bold text-gray-900">${totalValue.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 text-xs">
                          Platform fee (2.5%): ${(totalValue * 0.025).toFixed(2)}
                        </div>
                        <div className="font-semibold text-emerald-700">
                          You'll receive: ${(totalValue * 0.975).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {((!isValidQuantity && quantityNum > 0) || (!isValidPrice && priceNum > 0)) && (
                <Card className="border border-red-200 shadow-sm rounded-xl bg-red-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 text-sm font-medium">
                        {!isValidQuantity && quantityNum > 0
                          ? `Maximum ${holding.sharesOwned} shares available`
                          : "Please enter a valid price"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-900 hover:bg-gray-50 h-12 rounded-lg bg-transparent font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSell}
                  disabled={!isValidQuantity || !isValidPrice || isProcessing}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-lg font-medium shadow-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      {transactionStatus === "pending" ? "Creating listing..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      List for Sale
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-3 border-t border-gray-200">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your shares will be listed on the secondary market for other investors to purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
