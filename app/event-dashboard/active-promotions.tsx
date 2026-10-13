"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  MousePointer,
  TrendingUp,
  Loader2,
  Users,
  Store,
  Mic,
  Globe,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { resolvePromotionPackageLabel } from "@/lib/promotion-package-constants"
import { PromotionMarketingReportsPanel } from "@/components/promotion-plans/promotion-marketing-reports-panel"

interface Promotion {
  id: string
  packageType: string
  packageName: string
  status: string
  impressions?: number
  clicks?: number
  conversions?: number
  conversionVisitors?: number
  conversionExhibitors?: number
  conversionSpeakers?: number
  eventListingClicks?: number
}

const ACTIVE_STATUSES = new Set(["ACTIVE", "APPROVED"])

export default function ActivePromotions({ eventId }: { eventId: string }) {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    fetchPromotions()
  }, [eventId])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ promotions: Promotion[] }>(`/api/events/${eventId}/promotions`, {
        auth: true,
      })

      const active = (data.promotions || []).filter((p) => ACTIVE_STATUSES.has(p.status))
      setPromotions(active)
    } catch (error) {
      console.error("Error fetching promotions:", error)
      toast({
        title: "Error",
        description: "Failed to load promotions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        No active promotions
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Active Promotions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {promotions.map((promotion) => {
            const label =
              promotion.packageName && !promotion.packageName.startsWith("pkg_")
                ? promotion.packageName
                : resolvePromotionPackageLabel(promotion.packageType)

            return (
              <div key={promotion.id} className="rounded-xl border p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant={promotion.status === "ACTIVE" ? "default" : "secondary"}>
                    {promotion.status}
                  </Badge>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>

                {/* Website metrics — automatic */}
                <div className="mb-4 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Globe className="h-3.5 w-3.5" />
                    Website metrics
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{(promotion.impressions ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Clicks:</span>
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        <span>
                          {(promotion.clicks ?? promotion.eventListingClicks ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Conversions:</span>
                      <span className="font-medium text-green-600">{promotion.conversions ?? 0}</span>
                    </div>
                    <div className="space-y-1 border-t pt-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Visitors
                        </span>
                        <span>{promotion.conversionVisitors ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          Exhibitors
                        </span>
                        <span>{promotion.conversionExhibitors ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          Speakers
                        </span>
                        <span>{promotion.conversionSpeakers ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social media lead reports — manual uploads */}
                <PromotionMarketingReportsPanel
                  promotionId={promotion.id}
                  apiBase="organizer"
                  readOnly
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
