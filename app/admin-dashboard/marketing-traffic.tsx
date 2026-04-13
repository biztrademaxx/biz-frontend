"use client"

import { useEffect, useState } from "react"
import { BarChart3, Bell, Mail, MousePointerClick, RefreshCw, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

type TrafficSummary = {
  totals: {
    emailCampaigns: number
    pushNotifications: number
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
  rates: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
  channels: {
    email: { sent: number; delivered: number; opened: number; clicked: number }
    push: { sent: number; delivered: number; opened: number; clicked: number }
  }
}

export default function MarketingTrafficPanel() {
  const [data, setData] = useState<TrafficSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<{ success?: boolean; data?: TrafficSummary }>("/api/admin/marketing/traffic-summary", {
        auth: true,
      })
      if (!res.success || !res.data) {
        setError("Unable to load traffic summary.")
        setData(null)
      } else {
        setData(res.data)
      }
    } catch (e: any) {
      setError(e?.message || "Unable to load traffic summary.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic Analytics</h1>
          <p className="mt-1 text-gray-600">Email and push campaign funnel performance</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2 bg-transparent">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard title="Sent" value={data?.totals.sent ?? 0} icon={<Send className="h-5 w-5 text-blue-600" />} />
        <MetricCard
          title="Delivered"
          value={data?.totals.delivered ?? 0}
          icon={<BarChart3 className="h-5 w-5 text-green-600" />}
        />
        <MetricCard title="Opened" value={data?.totals.opened ?? 0} icon={<Mail className="h-5 w-5 text-purple-600" />} />
        <MetricCard
          title="Clicked"
          value={data?.totals.clicked ?? 0}
          icon={<MousePointerClick className="h-5 w-5 text-orange-600" />}
        />
        <MetricCard
          title="Email Campaigns"
          value={data?.totals.emailCampaigns ?? 0}
          icon={<Mail className="h-5 w-5 text-indigo-600" />}
        />
        <MetricCard
          title="Push Notifications"
          value={data?.totals.pushNotifications ?? 0}
          icon={<Bell className="h-5 w-5 text-pink-600" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Rates</CardTitle>
            <CardDescription>Combined performance across channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RateRow label="Delivery rate" value={data?.rates.deliveryRate ?? 0} />
            <RateRow label="Open rate" value={data?.rates.openRate ?? 0} />
            <RateRow label="Click rate" value={data?.rates.clickRate ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Split</CardTitle>
            <CardDescription>Compare email and push engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChannelRow
              label="Email"
              sent={data?.channels.email.sent ?? 0}
              delivered={data?.channels.email.delivered ?? 0}
              opened={data?.channels.email.opened ?? 0}
              clicked={data?.channels.email.clicked ?? 0}
            />
            <ChannelRow
              label="Push"
              sent={data?.channels.push.sent ?? 0}
              delivered={data?.channels.push.delivered ?? 0}
              opened={data?.channels.push.opened ?? 0}
              clicked={data?.channels.push.clicked ?? 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  )
}

function RateRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm last:border-b-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value.toFixed(2)}%</span>
    </div>
  )
}

function ChannelRow({
  label,
  sent,
  delivered,
  opened,
  clicked,
}: {
  label: string
  sent: number
  delivered: number
  opened: number
  clicked: number
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-2 font-semibold text-gray-900">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <span>Sent: {sent.toLocaleString()}</span>
        <span>Delivered: {delivered.toLocaleString()}</span>
        <span>Opened: {opened.toLocaleString()}</span>
        <span>Clicked: {clicked.toLocaleString()}</span>
      </div>
    </div>
  )
}
