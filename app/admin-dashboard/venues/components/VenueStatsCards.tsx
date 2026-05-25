"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, CheckCircle, Clock } from "lucide-react"

type VenueStatsCardsProps = {
  totalVenues: number
  activeVenues: number
  pendingVenuesCount: number
  verifiedVenues: number
}

export function VenueStatsCards({
  totalVenues,
  activeVenues,
  pendingVenuesCount,
  verifiedVenues,
}: VenueStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Venues</p>
              <p className="text-2xl font-bold text-blue-900 md:text-3xl">{totalVenues}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Venues</p>
              <p className="text-2xl font-bold text-green-900 md:text-3xl">{activeVenues}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-900 md:text-3xl">{pendingVenuesCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Verified Venues</p>
              <p className="text-2xl font-bold text-purple-900 md:text-3xl">{verifiedVenues}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
