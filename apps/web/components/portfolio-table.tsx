"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Leaf, Sun, Home, DollarSign } from "lucide-react"

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

interface PortfolioTableProps {
  holdings: PortfolioHolding[]
  onSellShares: (holding: PortfolioHolding) => void
}

const typeIcons = {
  forest: Leaf,
  solar: Sun,
  "real-estate": Home,
}

const typeColors = {
  forest: "text-green-600",
  solar: "text-yellow-600",
  "real-estate": "text-blue-600",
}

export function PortfolioTable({ holdings, onSellShares }: PortfolioTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateGainLoss = (current: number, purchase: number) => {
    const diff = current - purchase
    const percentage = (diff / purchase) * 100
    return { amount: diff, percentage }
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="border border-slate-200 bg-white rounded-2xl overflow-hidden border-none shadow-none mt-[-32px] ml-[-19px]">
          <CardHeader className="px-8 py-6 bg-slate-50/50 border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Your Property Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/30">
                    <TableHead className="text-slate-700 font-bold py-5 px-8 text-left">Property</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Shares Owned</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Purchase Price</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Current Value</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Gain/Loss</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Yield</TableHead>
                    <TableHead className="text-slate-700 font-bold py-5 px-4 text-left">Action</TableHead>
                    
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => {
                    const Icon = typeIcons[holding.propertyType]
                    const iconColor = typeColors[holding.propertyType]
                    const ownershipPercentage = (holding.sharesOwned / holding.totalShares) * 100
                    const gainLoss = calculateGainLoss(holding.currentValue, holding.purchasePrice)

                    return (
                      <TableRow
                        key={holding.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="py-6 px-8 mr-[0] pr-[71px]">
                          <div className="flex items-center gap-4">
                            <img
                              src={holding.propertyImage || "/placeholder.svg"}
                              alt={holding.propertyTitle}
                              className="w-16 h-16 rounded-xl object-cover shadow-sm"
                            />
                            <div>
                              <div className="font-bold text-slate-900 leading-tight text-sm">
                                {holding.propertyTitle}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                                {holding.propertyType === "real-estate"
                                  ? "Real Estate"
                                  : holding.propertyType.charAt(0).toUpperCase() + holding.propertyType.slice(1)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {holding.sharesOwned.toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-600">{ownershipPercentage.toFixed(2)}% ownership</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            ${holding.purchasePrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">{formatDate(holding.purchaseDate)}</div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            ${holding.currentValue.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-[24]">
                          <div
                            className={`flex items-center gap-2 ${gainLoss.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {gainLoss.amount >= 0 ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5" />
                            )}
                            <div>
                              <div className="font-bold text-xs">
                                {gainLoss.amount >= 0 ? "+" : ""}${gainLoss.amount.toLocaleString()}
                              </div>
                              <div className="text-sm font-semibold">
                                {gainLoss.percentage >= 0 ? "+" : ""}
                                {gainLoss.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                            <span className="font-bold text-xs">{holding.expectedYield}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-center">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => onSellShares(holding)}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:text-red-800 font-bold px-6 py-3 h-auto rounded-xl shadow-sm transition-all duration-200 text-xs"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Sell Shares
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {holdings.map((holding) => {
          const Icon = typeIcons[holding.propertyType]
          const iconColor = typeColors[holding.propertyType]
          const ownershipPercentage = (holding.sharesOwned / holding.totalShares) * 100
          const gainLoss = calculateGainLoss(holding.currentValue, holding.purchasePrice)

          return (
            <Card key={holding.id} className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={holding.propertyImage || "/placeholder.svg"}
                    alt={holding.propertyTitle}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{holding.propertyTitle}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                      {holding.propertyType === "real-estate"
                        ? "Real Estate"
                        : holding.propertyType.charAt(0).toUpperCase() + holding.propertyType.slice(1)}
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {ownershipPercentage.toFixed(2)}% ownership
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Shares Owned</div>
                    <div className="font-bold text-slate-900 text-lg">{holding.sharesOwned.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Expected Yield</div>
                    <div className="font-bold text-emerald-600 text-lg">{holding.expectedYield}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Purchase Price</div>
                    <div className="font-bold text-slate-900 text-lg">${holding.purchasePrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Current Value</div>
                    <div className="font-bold text-slate-900 text-lg">${holding.currentValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div
                    className={`flex items-center gap-2 ${gainLoss.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {gainLoss.amount >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="font-bold">
                      {gainLoss.amount >= 0 ? "+" : ""}${gainLoss.amount.toLocaleString()} (
                      {gainLoss.percentage >= 0 ? "+" : ""}
                      {gainLoss.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => onSellShares(holding)}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:text-red-800 font-bold rounded-xl"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
