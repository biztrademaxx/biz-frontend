"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MousePointer, TrendingUp, Loader2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Promotion {
  id: string
  eventId: string
  eventName: string
  packageType: string
  status: string
  impressions: number
  clicks: number
  conversions: number
  startDate: string
  endDate: string
  amount: number
  duration: number
  targetCategories: string[]
}

interface ActivePromotionsProps {
  exhibitorId: string
  refetchTrigger?: number
}

export default function ActivePromotions({ exhibitorId, refetchTrigger }: ActivePromotionsProps) {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!exhibitorId) return
    fetchPromotions()
  }, [exhibitorId, refetchTrigger])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exhibitors/promotions?exhibitorId=${exhibitorId}`)
      if (!response.ok) throw new Error("Failed to fetch promotions")
      const data = await response.json()
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

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0
    return (clicks / impressions) * 100
  }

  const calculateConversionRate = (conversions: number, clicks: number) => {
    if (clicks === 0) return 0
    return (conversions / clicks) * 100
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "COMPLETED":
        return "secondary"
      case "PENDING":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading promotions...</span>
      </div>
    )
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500 space-y-2">
        <TrendingUp className="w-8 h-8 text-gray-300" />
        <p>No active promotions found</p>
        <p className="text-sm text-gray-400">Create your first promotion to get started</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Active Promotions ({promotions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <Card 
              key={promotion.id} 
              className="p-4 border-2 border-blue-100 bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant={getStatusVariant(promotion.status)}>
                  {promotion.status}
                </Badge>
                <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                  {promotion.packageType}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
                {promotion.eventName}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3 text-sm border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Impressions
                  </span>
                  <span className="font-medium">{promotion.impressions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <MousePointer className="w-4 h-4" />
                    Clicks
                  </span>
                  <span className="font-medium">{promotion.clicks.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">CTR</span>
                  <span className="font-medium text-blue-600">
                    {calculateCTR(promotion.clicks, promotion.impressions).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversions</span>
                  <span className="font-medium text-green-600">{promotion.conversions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-medium text-green-600">
                    {calculateConversionRate(promotion.conversions, promotion.clicks).toFixed(2)}%
                  </span>
                </div>
                
                {promotion.targetCategories && promotion.targetCategories.length > 0 && (
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600 text-xs">Target Categories:</span>
                      <span className="text-xs font-medium">{promotion.targetCategories.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {promotion.targetCategories.slice(0, 3).map((category, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-white px-1.5 py-0.5 rounded border"
                        >
                          {category}
                        </span>
                      ))}
                      {promotion.targetCategories.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{promotion.targetCategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {promotion.amount > 0 && (
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Investment</span>
                    <span className="font-bold text-purple-600">
                      ${promotion.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}