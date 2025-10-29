"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Coins, ShoppingCart, TrendingUp, Users, Calendar } from "lucide-react"

interface TimelineEvent {
  id: string
  type: "mint" | "buy" | "sell" | "distribution" | "update"
  title: string
  description: string
  amount?: string
  user?: string
  timestamp: string
  transactionId?: string
}

interface ActivityTimelineProps {
  propertyId: string
}

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "distribution",
    title: "Profit Distribution",
    description: "Quarterly profit distribution to all shareholders",
    amount: "$125,000",
    timestamp: "2024-01-15T10:30:00Z",
    transactionId: "0.0.123456-789",
  },
  {
    id: "2",
    type: "buy",
    title: "Share Purchase",
    description: "Investor purchased shares",
    amount: "500 shares",
    user: "0.0.987654",
    timestamp: "2024-01-10T14:22:00Z",
    transactionId: "0.0.123456-788",
  },
  {
    id: "3",
    type: "sell",
    title: "Share Sale",
    description: "Investor sold shares on secondary market",
    amount: "200 shares",
    user: "0.0.456789",
    timestamp: "2024-01-08T09:15:00Z",
    transactionId: "0.0.123456-787",
  },
  {
    id: "4",
    type: "update",
    title: "Sustainability Report",
    description: "Annual sustainability impact report published",
    timestamp: "2024-01-05T16:00:00Z",
  },
  {
    id: "5",
    type: "buy",
    title: "Share Purchase",
    description: "New investor joined the property",
    amount: "1,000 shares",
    user: "0.0.111222",
    timestamp: "2024-01-03T11:45:00Z",
    transactionId: "0.0.123456-786",
  },
  {
    id: "6",
    type: "mint",
    title: "Initial Token Mint",
    description: "Property tokens initially minted and made available",
    amount: "10,000 shares",
    timestamp: "2023-12-01T12:00:00Z",
    transactionId: "0.0.123456-785",
  },
]

const eventIcons = {
  mint: Coins,
  buy: ShoppingCart,
  sell: TrendingUp,
  distribution: Users,
  update: Calendar,
}

const eventColors = {
  mint: "text-blue-600",
  buy: "text-green-600",
  sell: "text-orange-600",
  distribution: "text-purple-600",
  update: "text-gray-600",
}

export function ActivityTimeline({ propertyId }: ActivityTimelineProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTransactionId = (txId: string) => {
    return `${txId.slice(0, 8)}...${txId.slice(-6)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event, index) => {
            const Icon = eventIcons[event.type]
            const iconColor = eventColors[event.type]

            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < mockEvents.length - 1 && <div className="w-px h-12 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</div>
                      {event.amount && (
                        <Badge variant="outline" className="mt-1">
                          {event.amount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {event.user && <span>User: {event.user}</span>}
                    {event.transactionId && (
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {formatTransactionId(event.transactionId)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
