"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Send, CheckCircle, Leaf, Sun, Home } from "lucide-react"

interface Property {
  id: string
  title: string
  type: "forest" | "solar" | "real-estate"
  totalShares: number
  activeInvestors: number
  lastDistribution: string
  totalDistributed: number
}

const mockProperties: Property[] = [
  {
    id: "1",
    title: "Amazon Rainforest Conservation",
    type: "forest",
    totalShares: 10000,
    activeInvestors: 45,
    lastDistribution: "2024-01-15",
    totalDistributed: 125000,
  },
  {
    id: "2",
    title: "Solar Farm Texas",
    type: "solar",
    totalShares: 10000,
    activeInvestors: 32,
    lastDistribution: "2024-01-15",
    totalDistributed: 87500,
  },
  {
    id: "3",
    title: "Sustainable Office Complex",
    type: "real-estate",
    totalShares: 10000,
    activeInvestors: 28,
    lastDistribution: "2024-01-15",
    totalDistributed: 65000,
  },
]

const typeIcons = {
  forest: Leaf,
  solar: Sun,
  "real-estate": Home,
}

export function ProfitDistributionPanel() {
  const [selectedProperty, setSelectedProperty] = useState("")
  const [distributionAmount, setDistributionAmount] = useState("")
  const [isDistributing, setIsDistributing] = useState(false)
  const [distributionStatus, setDistributionStatus] = useState<"idle" | "success" | "error">("idle")

  const selectedPropertyData = mockProperties.find((p) => p.id === selectedProperty)

  const handleDistribute = async () => {
    if (!selectedProperty || !distributionAmount) return

    setIsDistributing(true)
    setDistributionStatus("idle")

    // Simulate profit distribution
    setTimeout(() => {
      setDistributionStatus("success")
      setIsDistributing(false)
      // Reset form after success
      setTimeout(() => {
        setDistributionStatus("idle")
        setSelectedProperty("")
        setDistributionAmount("")
      }, 3000)
    }, 2500)
  }

  const calculatePerShareDistribution = () => {
    if (!selectedPropertyData || !distributionAmount) return 0
    return Number.parseFloat(distributionAmount) / selectedPropertyData.totalShares
  }

  if (distributionStatus === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Distribution Successful!</h3>
          <p className="text-green-700 mb-4">
            ${Number.parseInt(distributionAmount).toLocaleString()} has been distributed to{" "}
            {selectedPropertyData?.activeInvestors} investors of {selectedPropertyData?.title}
          </p>
          <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
            Transaction ID: DIST-{Date.now()}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Distribution Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Distribute Profits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-select">Select Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {mockProperties.map((property) => {
                    const Icon = typeIcons[property.type]
                    return (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {property.title}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Total Distribution Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={distributionAmount}
                onChange={(e) => setDistributionAmount(e.target.value)}
                placeholder="125000"
                min="0"
              />
            </div>
          </div>

          {selectedPropertyData && distributionAmount && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <h4 className="font-semibold text-foreground">Distribution Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Property</div>
                  <div className="font-semibold">{selectedPropertyData.title}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Active Investors</div>
                  <div className="font-semibold">{selectedPropertyData.activeInvestors}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Per Share</div>
                  <div className="font-semibold">${calculatePerShareDistribution().toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Amount</div>
                  <div className="font-semibold text-primary">
                    ${Number.parseInt(distributionAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleDistribute}
              disabled={!selectedProperty || !distributionAmount || isDistributing}
              className="min-w-[200px]"
            >
              {isDistributing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                  Distributing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Distribute Profits
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Properties Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Total Shares</TableHead>
                  <TableHead>Active Investors</TableHead>
                  <TableHead>Last Distribution</TableHead>
                  <TableHead>Total Distributed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProperties.map((property) => {
                  const Icon = typeIcons[property.type]
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-semibold">{property.title}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {property.type === "real-estate" ? "Real Estate" : property.type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{property.totalShares.toLocaleString()}</TableCell>
                      <TableCell>{property.activeInvestors}</TableCell>
                      <TableCell>
                        {new Date(property.lastDistribution).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${property.totalDistributed.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {mockProperties.map((property) => {
              const Icon = typeIcons[property.type]
              return (
                <Card key={property.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="h-5 w-5 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground">{property.title}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {property.type === "real-estate" ? "Real Estate" : property.type}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Investors</div>
                        <div className="font-semibold">{property.activeInvestors}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Distributed</div>
                        <div className="font-semibold text-green-600">
                          ${property.totalDistributed.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
