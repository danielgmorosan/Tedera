"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Send, CheckCircle, Leaf, Sun, Home } from "lucide-react"
import { useDividendDistribution } from "@/hooks/use-dividend-distribution"

interface Property {
  _id: string
  name: string
  type: "forest" | "solar" | "real-estate"
  totalShares: number
  dividendContractAddress?: string
  image?: string
}

const typeIcons = {
  forest: Leaf,
  solar: Sun,
  "real-estate": Home,
}

export function ProfitDistributionPanel() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState("")
  const [distributionAmount, setDistributionAmount] = useState("")
  const [isDistributing, setIsDistributing] = useState(false)
  const [distributionStatus, setDistributionStatus] = useState<"idle" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState("")

  const { createDistribution } = useDividendDistribution()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('hedera-auth-token')
      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    }
  }

  const selectedPropertyData = properties.find((p) => p._id === selectedProperty)

  const handleDistribute = async () => {
    if (!selectedProperty || !distributionAmount) return

    const property = properties.find(p => p._id === selectedProperty)
    if (!property?.dividendContractAddress) {
      alert('Dividend contract not found for this property')
      return
    }

    setIsDistributing(true)
    setDistributionStatus("idle")

    try {
      // Call real blockchain contract
      const txHash = await createDistribution(
        property.dividendContractAddress,
        parseFloat(distributionAmount)
      )

      setTransactionHash(txHash)

      // Save to database
      const token = localStorage.getItem('hedera-auth-token')
      await fetch('/api/distributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          totalAmount: parseFloat(distributionAmount),
          transactionHash: txHash,
          description: `Dividend distribution of ${distributionAmount} HBAR`
        }),
      })

      setDistributionStatus("success")

      // Reset form after success
      setTimeout(() => {
        setDistributionStatus("idle")
        setSelectedProperty("")
        setDistributionAmount("")
        setTransactionHash("")
      }, 5000)
    } catch (error) {
      console.error('Distribution error:', error)
      setDistributionStatus("error")
    } finally {
      setIsDistributing(false)
    }
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
            {distributionAmount} HBAR has been distributed on-chain for {selectedPropertyData?.name}
          </p>
          <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
            Transaction: {transactionHash.slice(0, 20)}...
          </Badge>
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
                  {properties.map((property) => {
                    const Icon = typeIcons[property.type] || Home
                    return (
                      <SelectItem key={property._id} value={property._id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {property.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Total Distribution Amount (HBAR)</Label>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Property</div>
                  <div className="font-semibold">{selectedPropertyData.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Per Share</div>
                  <div className="font-semibold">{calculatePerShareDistribution().toFixed(6)} HBAR</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Amount</div>
                  <div className="font-semibold text-primary">
                    {distributionAmount} HBAR
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
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const Icon = typeIcons[property.type] || Home
                  return (
                    <TableRow key={property._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-semibold">{property.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {property.type === "real-estate" ? "Real Estate" : property.type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{property.totalShares.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {property.dividendContractAddress ?
                          `${property.dividendContractAddress.slice(0, 10)}...` :
                          'Not deployed'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={property.dividendContractAddress ?
                          "bg-green-100 border-green-300 text-green-700" :
                          "bg-gray-100 border-gray-300 text-gray-700"}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {property.dividendContractAddress ? 'Active' : 'Pending'}
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
            {properties.map((property) => {
              const Icon = typeIcons[property.type] || Home
              return (
                <Card key={property._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="h-5 w-5 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground">{property.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {property.type === "real-estate" ? "Real Estate" : property.type}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Shares</div>
                        <div className="font-semibold">{property.totalShares.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Contract Address</div>
                        <div className="font-mono text-xs">
                          {property.dividendContractAddress ?
                            `${property.dividendContractAddress.slice(0, 10)}...` :
                            'Not deployed'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant="outline" className={property.dividendContractAddress ?
                        "bg-green-100 border-green-300 text-green-700" :
                        "bg-gray-100 border-gray-300 text-gray-700"}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {property.dividendContractAddress ? 'Active' : 'Pending'}
                      </Badge>
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
