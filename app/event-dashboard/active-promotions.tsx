"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MousePointer, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface Promotion {
  id: string
  packageType: string
  packageName: string
  status: string
  impressions: number
  clicks: number
  conversions: number
}

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
        auth: false,
      })

      setPromotions(data.promotions || [])
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={promotion.status === "ACTIVE" ? "default" : "secondary"}>
                  {promotion.status}
                </Badge>
                <span className="text-sm text-gray-500 capitalize">
                  {promotion.packageName}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Impressions:</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{promotion.impressions.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Clicks:</span>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    <span>{promotion.clicks.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversions:</span>
                  <span className="font-medium text-green-600">{promotion.conversions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}