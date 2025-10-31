"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, TrendingUp, Leaf, Sun, Home, Heart, HelpCircle } from "lucide-react"

interface Property {
  id: string
  title: string
  location: string
  type: "forest" | "solar" | "real-estate"
  image: string
  availableSupply?: number // Deprecated - use totalShares and availableShares instead
  expectedYield: number
  totalValue?: number // Can be calculated from totalShares * pricePerShare
  tags: string[]
  description: string
  status: "open" | "closed"
  revenueGenerated: number | null
  // Real property data
  totalShares?: number
  availableShares?: number
  pricePerShare?: number
}

interface PropertyCardProps {
  property: Property
  onViewDetail?: (property: Property) => void
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

// Helper function to format HBAR amounts
const formatHBAR = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100; // Round to 2 decimals
  if (rounded % 1 === 0) {
    return `${Math.round(rounded)} HBAR`;
  }
  // Format to 2 decimal places and remove trailing zeros
  return `${rounded.toFixed(2).replace(/\.?0+$/, '')} HBAR`;
};

// Helper function to format large HBAR amounts
const formatLargeHBAR = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M HBAR`.replace(/\.?0+$/, '');
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K HBAR`.replace(/\.?0+$/, '');
  }
  return formatHBAR(amount);
};

export function PropertyCard({ property, onViewDetail }: PropertyCardProps) {
  const Icon = typeIcons[property.type]
  const iconColor = typeColors[property.type]
  
  // Calculate real values from property data
  const totalShares = property.totalShares || 1000; // Default fallback
  const availableShares = property.availableShares ?? property.totalShares ?? 1000;
  const pricePerShare = property.pricePerShare || 0;
  
  // Calculate total value in HBAR
  const totalValue = property.totalValue ?? (totalShares * pricePerShare);
  
  // Calculate real available and owned percentages
  const availablePercentage = totalShares > 0 ? (availableShares / totalShares) * 100 : 100;
  const ownedPercentage = totalShares > 0 ? ((totalShares - availableShares) / totalShares) * 100 : 0;

  return (
    <TooltipProvider>
      <Card
        className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border border-slate-200/60 shadow-sm hover:shadow-slate-900/10 overflow-hidden bg-white rounded-2xl hover:-translate-y-1 pt-px pb-0 h-[520px] flex flex-col"
        onClick={() => onViewDetail?.(property)}
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-t-2xl">
          <img
            src={property.image || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            style={{ minHeight: "200px", maxHeight: "200px" }}
          />
          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl">
            <Heart className="h-4 w-4 text-slate-600 hover:text-rose-500 transition-colors duration-200" />
          </button>
          <div className="absolute top-4 left-4">
            <Badge
              variant={property.status === "open" ? "default" : "secondary"}
              className={`backdrop-blur-md border-0 font-semibold px-3 py-1.5 text-xs rounded-full shadow-lg ${
                property.status === "open" ? "bg-emerald-500/95 text-white" : "bg-slate-800/80 text-white"
              }`}
            >
              {property.status === "open" ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 pt-0.5 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center text-sm text-slate-500 mb-2">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-medium">{property.location}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 mb-1">{property.title}</h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">{property.description}</p>

          <div className="min-h-[80px] flex items-center">
            {property.revenueGenerated && property.status === "closed" && (
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-xl p-4 border border-emerald-100 w-full">
                <div className="flex items-center text-emerald-700">
                  <span className="font-bold text-base">{formatLargeHBAR(property.revenueGenerated)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">
                    Revenue Generated
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-2.5 w-2.5 text-emerald-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Total revenue generated from this property since it was fully funded. This includes rental
                        income, energy sales, carbon credits, and other revenue streams distributed to token holders.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-end space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
                <span className="text-sm text-slate-700 capitalize font-medium">
                  {property.type === "real-estate" ? "Real Estate" : property.type}
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">{property.expectedYield}% APY</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {formatLargeHBAR(totalValue)}
                </span>
                <span className="text-sm text-slate-500 ml-2 font-medium">total value</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{availablePercentage.toFixed(0)}% available</div>
                <div className="text-xs text-slate-500 font-medium">{ownedPercentage.toFixed(0)}% owned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
