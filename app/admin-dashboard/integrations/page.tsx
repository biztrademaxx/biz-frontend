"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CreditCard,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  DollarSign,
  TrendingUp,
  Loader2,
  Shield,
  Globe,
  Zap,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface PaymentGateway {
  id: string
  name: string
  provider: string
  logo: string
  isActive: boolean
  isTestMode: boolean
  supportedCurrencies: string[]
  supportedCountries: string[]
  transactionFee: string
  monthlyFee: number
  credentials: {
    publicKey?: string
    secretKey?: string
    webhookSecret?: string
    merchantId?: string
  }
  lastSyncedAt: string | null
  totalTransactions: number
  totalVolume: number
  successRate: number
  createdAt: string
  updatedAt: string
}

interface TransactionLog {
  id: string
  gatewayId: string
  gatewayName: string
  transactionId: string
  amount: number
  currency: string
  status: "SUCCESS" | "FAILED" | "PENDING"
  type: "PAYMENT" | "REFUND" | "PAYOUT"
  customerEmail: string
  createdAt: string
}

export default function PaymentIntegrationsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [isConfigureOpen, setIsConfigureOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    merchantId: "",
    isTestMode: true,
  })

  useEffect(() => {
    void fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{
        success?: boolean
        data?: { gateways?: PaymentGateway[]; logs?: TransactionLog[] }
      }>("/api/admin/integrations/payments", { auth: true })
      const d = res.data
      if (d?.gateways) setGateways(d.gateways)
      if (d?.logs) setTransactionLogs(d.logs as TransactionLog[])
    } catch (error) {
      console.error("Error fetching gateways:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigure = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
    setFormData({
      publicKey: gateway.credentials.publicKey || "",
      secretKey: gateway.credentials.secretKey || "",
      webhookSecret: gateway.credentials.webhookSecret || "",
      merchantId: gateway.credentials.merchantId || "",
      isTestMode: gateway.isTestMode,
    })
    setIsConfigureOpen(true)
  }

  const handleSaveConfiguration = async () => {
    if (!selectedGateway) return

    try {
      await apiFetch(`/api/admin/integrations/payments/gateways/${selectedGateway.id}`, {
        method: "PATCH",
        body: {
          credentials: {
            publicKey: formData.publicKey,
            secretKey: formData.secretKey,
            webhookSecret: formData.webhookSecret,
            merchantId: formData.merchantId,
          },
          isTestMode: formData.isTestMode,
        },
        auth: true,
      })
      await fetchGateways()
      setIsConfigureOpen(false)
    } catch (error) {
      console.error("Error saving configuration:", error)
    }
  }

  const handleToggleActive = async (gateway: PaymentGateway) => {
    try {
      await apiFetch(`/api/admin/integrations/payments/gateways/${gateway.id}`, {
        method: "PATCH",
        body: { isActive: !gateway.isActive },
        auth: true,
      })
      await fetchGateways()
    } catch (error) {
      console.error("Error toggling gateway:", error)
    }
  }

  const handleTestConnection = async () => {
    if (!selectedGateway) return

    setIsTestingConnection(true)
    try {
      const data = await apiFetch<{ success: boolean; message?: string }>(
        `/api/admin/integrations/payments/gateways/${selectedGateway.id}/test`,
        { method: "POST", auth: true },
      )
      alert(data.success ? "Connection successful!" : "Connection failed: " + (data.message ?? ""))
    } catch (error) {
      console.error("Error testing connection:", error)
      alert("Failed to test connection")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const maskSecret = (value: string) => {
    if (!value) return ""
    return value.substring(0, 8) + "•".repeat(Math.max(0, value.length - 12)) + value.substring(value.length - 4)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const activeGateways = gateways.filter((g) => g.isActive).length
  const totalVolume = gateways.reduce((sum, g) => sum + g.totalVolume, 0)
  const totalTransactions = gateways.reduce((sum, g) => sum + g.totalTransactions, 0)
  const avgSuccessRate = gateways.length > 0 ? gateways.reduce((sum, g) => sum + g.successRate, 0) / gateways.length : 0

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
          <p className="text-muted-foreground">Configure and manage payment gateway integrations</p>
        </div>
        <Button onClick={() => fetchGateways()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGateways}</div>
            <p className="text-xs text-muted-foreground">of {gateways.length} configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all gateways</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across gateways</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="logs">Transaction Logs</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className={gateway.isActive ? "border-green-200" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <CardDescription>{gateway.provider}</CardDescription>
                      </div>
                    </div>
                    <Switch checked={gateway.isActive} onCheckedChange={() => handleToggleActive(gateway)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {gateway.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                    {gateway.isTestMode && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Test Mode
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Transactions</p>
                      <p className="font-medium">{gateway.totalTransactions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-medium">${gateway.totalVolume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{gateway.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fee</p>
                      <p className="font-medium">{gateway.transactionFee}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleConfigure(gateway)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transaction Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transaction Logs</CardTitle>
              <CardDescription>Monitor payment gateway transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.transactionId.substring(0, 12)}...</TableCell>
                      <TableCell>{log.gatewayName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.currency} {log.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{log.customerEmail}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {transactionLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No transaction logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Payment Settings</CardTitle>
              <CardDescription>Configure global payment processing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Gateway</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gateways
                        .filter((g) => g.isActive)
                        .map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Enable Fraud Detection</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and block suspicious transactions
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Multi-Currency Support</p>
                      <p className="text-sm text-muted-foreground">Accept payments in multiple currencies</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Automatic Retry</p>
                      <p className="text-sm text-muted-foreground">Automatically retry failed payments</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configure Gateway Dialog */}
      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedGateway?.name}</DialogTitle>
            <DialogDescription>Enter your API credentials to enable this payment gateway</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Test Mode</p>
                <p className="text-sm text-muted-foreground">Use sandbox credentials for testing</p>
              </div>
              <Switch
                checked={formData.isTestMode}
                onCheckedChange={(checked) => setFormData({ ...formData, isTestMode: checked })}
              />
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Public Key / API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.publicKey ? "text" : "password"}
                    value={formData.publicKey}
                    onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                    placeholder="pk_test_..."
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleSecretVisibility("publicKey")}>
                    {showSecrets.publicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.secretKey ? "text" : "password"}
                    value={formData.secretKey}
                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                    placeholder="sk_test_..."
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleSecretVisibility("secretKey")}>
                    {showSecrets.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.webhookSecret ? "text" : "password"}
                    value={formData.webhookSecret}
                    onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                    placeholder="whsec_..."
                  />
                  <Button variant="outline" size="icon" onClick={() => toggleSecretVisibility("webhookSecret")}>
                    {showSecrets.webhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Merchant ID (Optional)</Label>
                <Input
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  placeholder="merchant_..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleTestConnection} disabled={isTestingConnection}>
              {isTestingConnection ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
            <Button onClick={handleSaveConfiguration}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
