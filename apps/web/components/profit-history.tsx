"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, DollarSign, Clock, CheckCircle, ExternalLink } from "lucide-react"

interface ProfitDistribution {
  id: string
  propertyId: string
  propertyTitle: string
  amount: number
  date: string
  status: "completed" | "pending"
}

interface ProfitHistoryProps {
  distributions: ProfitDistribution[]
}

export function ProfitHistory({ distributions }: ProfitHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalCompleted = distributions
    .filter((dist) => dist.status === "completed")
    .reduce((sum, dist) => sum + dist.amount, 0)

  const totalPending = distributions
    .filter((dist) => dist.status === "pending")
    .reduce((sum, dist) => sum + dist.amount, 0)

  const completedDistributions = distributions.filter((dist) => dist.status === "completed")
  const pendingDistributions = distributions.filter((dist) => dist.status === "pending")

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-xl font-bold text-green-600">${totalCompleted.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Distributions</p>
                <p className="text-xl font-bold text-orange-600">${totalPending.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distributions</p>
                <p className="text-xl font-bold text-primary">{distributions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Distributions */}
      {pendingDistributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDistributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
                >
                  <div>
                    <h4 className="font-semibold text-foreground">{distribution.propertyTitle}</h4>
                    <p className="text-sm text-muted-foreground">Expected: {formatDate(distribution.date)}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">${distribution.amount.toLocaleString()}</div>
                    <Badge variant="outline" className="bg-orange-100 border-orange-300 text-orange-700">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Distributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Distribution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedDistributions.map((distribution) => (
                  <TableRow key={distribution.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{distribution.propertyTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-600">${distribution.amount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground">{formatDate(distribution.date)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {completedDistributions.map((distribution) => (
              <div key={distribution.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{distribution.propertyTitle}</h4>
                  <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-green-600">${distribution.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(distribution.date)}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
