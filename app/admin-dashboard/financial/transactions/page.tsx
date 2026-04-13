"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { format } from "date-fns"
import { apiFetch } from "@/lib/api"

interface Transaction {
  id: string
  transactionId: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  status: string
  gateway: string
  gatewayTransactionId: string | null
  description: string | null
  type: string
  createdAt: string
  refundAmount?: number
  refundReason?: string
  refundedAt?: string
}

export default function FinancialTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [gatewayFilter, setGatewayFilter] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [searchQuery, statusFilter, gatewayFilter, transactions])

  const fetchTransactions = async () => {
    try {
      const data = await apiFetch<{ success?: boolean; data?: Transaction[] }>("/api/admin/financial/transactions", {
        auth: true,
      })
      const list = data.data ?? []
      setTransactions(list)
      setFilteredTransactions(list)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.gatewayTransactionId?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    if (gatewayFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.gateway.toLowerCase() === gatewayFilter.toLowerCase(),
      )
    }

    setFilteredTransactions(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      REFUNDED: "bg-purple-100 text-purple-800",
      PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const calculateStats = () => {
    const total = transactions.length
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const completed = transactions.filter((t) => t.status === "COMPLETED").length
    const completedAmount = transactions.filter((t) => t.status === "COMPLETED").reduce((sum, t) => sum + t.amount, 0)
    const pending = transactions.filter((t) => t.status === "PENDING").length
    const failed = transactions.filter((t) => t.status === "FAILED").length
    const refunded = transactions.filter((t) => t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED").length
    const refundedAmount = transactions
      .filter((t) => t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED")
      .reduce((sum, t) => sum + (t.refundAmount || 0), 0)

    return {
      total,
      totalAmount,
      completed,
      completedAmount,
      pending,
      failed,
      refunded,
      refundedAmount,
    }
  }

  const stats = calculateStats()

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailsOpen(true)
  }

  const handleExport = () => {
    const csv = [
      ["Transaction ID", "User", "Amount", "Status", "Gateway", "Type", "Date"].join(","),
      ...filteredTransactions.map((t) =>
        [
          t.transactionId,
          t.userName,
          `${t.currency} ${t.amount.toFixed(2)}`,
          t.status,
          t.gateway,
          t.type,
          format(new Date(t.createdAt), "MMM dd, yyyy HH:mm"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-500 mt-1">Monitor and manage all financial transactions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} total volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.completedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending / Failed</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-yellow-600">{stats.pending}</span>
              {" / "}
              <span className="text-red-600">{stats.failed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Processing and failed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.refunded}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.refundedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} refunded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user, email, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.userName}</div>
                          <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {transaction.currency} {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{transaction.gateway}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>{format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                  <p className="text-sm font-mono mt-1">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge className={`${getStatusColor(selectedTransaction.status)} mt-1`}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="text-sm font-semibold mt-1">
                    {selectedTransaction.currency} {selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Gateway</h3>
                  <p className="text-sm capitalize mt-1">{selectedTransaction.gateway}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gateway Transaction ID</h3>
                  <p className="text-sm font-mono mt-1">{selectedTransaction.gatewayTransactionId || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction Type</h3>
                  <p className="text-sm capitalize mt-1">{selectedTransaction.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedTransaction.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Currency</h3>
                  <p className="text-sm mt-1">{selectedTransaction.currency}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">User Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{selectedTransaction.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedTransaction.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">User ID:</span>
                    <span className="text-sm font-mono">{selectedTransaction.userId}</span>
                  </div>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{selectedTransaction.description}</p>
                </div>
              )}

              {(selectedTransaction.status === "REFUNDED" || selectedTransaction.status === "PARTIALLY_REFUNDED") && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Refund Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Refund Amount:</span>
                      <span className="text-sm font-medium text-purple-600">
                        {selectedTransaction.currency} {selectedTransaction.refundAmount?.toFixed(2)}
                      </span>
                    </div>
                    {selectedTransaction.refundReason && (
                      <div>
                        <span className="text-sm text-gray-600">Reason:</span>
                        <p className="text-sm text-gray-700 mt-1">{selectedTransaction.refundReason}</p>
                      </div>
                    )}
                    {selectedTransaction.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refunded At:</span>
                        <span className="text-sm">
                          {format(new Date(selectedTransaction.refundedAt), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
