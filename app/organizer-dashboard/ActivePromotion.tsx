"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MousePointer, TrendingUp } from "lucide-react"

interface Promotion {
  id: string
  eventId: string
  event: {
    id: string
    title: string
    date: string
    location: string
    status: string
  } | null
  packageType: string
  targetCategories: string[]
  status: string
  amount: number
  duration: number
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  conversions: number
  createdAt: string
}

export default function ActivePromotions({ organizerId }: { organizerId: string }) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch(`/api/organizers/${organizerId}/promotions`)
        if (!res.ok) throw new Error("Failed to fetch promotions")
        const data = await res.json()
        setPromotions(data.promotions || [])
      } catch (error) {
        console.error("Error fetching promotions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [organizerId])

  if (loading) return <p>Loading promotions...</p>
  if (promotions.length === 0) return <p>No active promotions</p>

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
                <span className="text-sm text-gray-500">{promotion.packageType}</span>
              </div>
              <h3 className="font-semibold mb-2">{promotion.event?.title || "Event"}</h3>
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
