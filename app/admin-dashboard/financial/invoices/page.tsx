"use client"

import { devLog } from "@/lib/dev-log"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, FileText, Download, Eye, Search, Calendar, CreditCard, Mail, Phone, MapPin, Building2, Receipt, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { formatMoney, formatMoneyTotals, sumByCurrency } from "@/lib/format-currency"
import { downloadInvoicePdf } from "@/lib/generate-invoice-pdf"
import Image from "next/image"

interface Invoice {
  id: string
  invoiceNumber: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  status: string
  invoiceDate: string
  dueDate: string
  paidDate?: string
  paymentMethod: string
  description: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
}

export default function FinancialInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [searchQuery, statusFilter, invoices])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ success?: boolean; data?: Invoice[] }>(
        "/api/admin/financial/invoices?limit=500",
        {
          auth: true,
        })
      setInvoices(data.data ?? [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.userName.toLowerCase().includes(query) ||
          invoice.userEmail.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      cancelled: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsOpen(true)
  }

  const handleDownloadClick = async (invoice: Invoice) => {
    handleDownloadInvoice(invoice)
  }

  // Direct PDF download — builds the PDF file bytes manually (no packages,
  // no print dialog) and triggers an immediate browser download.
  const handleDownloadInvoice = async (invoice?: Invoice) => {
    const currentInvoice = invoice || selectedInvoice

    if (!currentInvoice) {
      console.error("No invoice selected")
      return
    }

    try {
      setDownloadLoading(true)
      await downloadInvoicePdf(currentInvoice)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      alert("Failed to download invoice. Please try again.")
    } finally {
      setDownloadLoading(false)
    }
  }

  const stats = {
    totalInvoices: invoices.length,
    totalRevenue: sumByCurrency(
      invoices.filter((inv) => inv.status === "paid"),
      "total",
    ),
    pendingAmount: sumByCurrency(
      invoices.filter((inv) => inv.status === "pending"),
      "total",
    ),
    overdueAmount: sumByCurrency(
      invoices.filter((inv) => inv.status === "overdue"),
      "total",
    ),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invoices & Receipts</h2>
        <p className="text-muted-foreground">View and manage all financial invoices and receipts</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All time invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoneyTotals(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoneyTotals(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatMoneyTotals(stats.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.userName}</div>
                        <div className="text-sm text-muted-foreground">{invoice.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatMoney(invoice.total, invoice.currency)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadClick(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog - Clean & Professional */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <>
              <div id={`invoice-${selectedInvoice.id}`} className="p-8">
                {/* Header with Logo and Invoice Info */}
                <div className="flex justify-between items-start border-b pb-6">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://res.cloudinary.com/deo4vpw8f/image/upload/v1782713887/biztradefairs_new2_tjo8lq.png"
                      alt="Biz Trade Fairs"
                      width={150}
                      height={50}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">INVOICE</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</div>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                </div>

                {/* Invoice Dates */}
                <div className="flex justify-between mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Invoice Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* From & To */}
                <div className="grid grid-cols-2 gap-8 mt-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-gray-900">Biz Trade Fairs.</p>
                      <p className="text-gray-600">T9, Swastik Manandi Arcade,</p>
                      <p className="text-gray-600">Subedar Chatram Rd, VV Giri Colony,</p>
                      <p className="text-gray-600">Seshadripuram, Bengaluru, Karnataka, 560020</p>
                      <p className="text-gray-600">noreply@biztradefairs.com</p>
                      <p className="text-gray-600">+91 91483 19993</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-gray-900">{selectedInvoice.userName}</p>
                      <p className="text-gray-600">{selectedInvoice.userEmail}</p>
                      <p className="text-gray-600">Payment: <span className="capitalize">{selectedInvoice.paymentMethod}</span></p>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="mt-8">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Invoice Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="text-xs font-semibold text-gray-600">Description</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 text-right">Quantity</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 text-right">Unit Price</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-600 text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatMoney(item.unitPrice, selectedInvoice.currency)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatMoney(item.total, selectedInvoice.currency)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t">
                          <TableCell colSpan={3} className="text-right font-medium">Subtotal:</TableCell>
                          <TableCell className="text-right">{formatMoney(selectedInvoice.subtotal, selectedInvoice.currency)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Tax ({selectedInvoice.tax > 0 ? '10%' : '0%'}):</TableCell>
                          <TableCell className="text-right">{formatMoney(selectedInvoice.tax, selectedInvoice.currency)}</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2 border-gray-300">
                          <TableCell colSpan={3} className="text-right font-bold text-lg">Total:</TableCell>
                          <TableCell className="text-right font-bold text-lg text-blue-600">{formatMoney(selectedInvoice.total, selectedInvoice.currency)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {selectedInvoice.paidDate && (
                    <div className="mt-4 flex items-center justify-end gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Paid on {new Date(selectedInvoice.paidDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://res.cloudinary.com/deo4vpw8f/image/upload/v1782713562/maxx_karjly.png"
                        alt="Maxx Business Media"
                        width={100}
                        height={30}
                        className="object-contain"
                        unoptimized
                      />
                      <span className="text-sm font-medium text-gray-700">Maxx Business Media Pvt Ltd</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Thank you for your business!</p>
                      <p className="text-xs text-gray-400">This is a computer-generated invoice.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end p-6 bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadInvoice(selectedInvoice ?? undefined)}
                  disabled={downloadLoading}
                  className="gap-2"
                >
                  {downloadLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}