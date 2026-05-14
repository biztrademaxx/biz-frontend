"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { exhibitionSpaceTypeLabel, formatEventMoney } from "@/lib/format-event-money"
import type { SpaceCost } from "./event-page-types"

type Props = {
  event: any
  spaceCosts: SpaceCost[]
}

export function EventPageSpaceCostTab({ event, spaceCosts }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exhibition Space Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {spaceCosts.length > 0 ? (
          spaceCosts.map((space, index) => {
            const pps = Number(space.pricePerSqm ?? 0)
            const minA = Number(space.minArea ?? 0)
            const total =
              space.totalMinAmount != null
                ? Number(space.totalMinAmount)
                : pps > 0 && minA > 0
                  ? pps * minA
                  : Number(space.price ?? 0)
            const cur = space.currency || event.currency || "USD"
            const label =
              space.hallName ||
              (typeof space.type === "string" && space.type !== space.spaceType ? space.type : null)
            return (
              <div key={space.id || index} className="p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {space.spaceType ? exhibitionSpaceTypeLabel(String(space.spaceType)) : "Space"}
                    </p>
                    {label ? <h4 className="font-semibold text-gray-900">{label}</h4> : null}
                    {space.description ? <p className="text-sm text-gray-600 mt-1">{space.description}</p> : null}
                    <p className="text-sm text-gray-700 mt-2">
                      {formatEventMoney(pps, cur)} / sq.m
                      {minA > 0 ? ` · Minimum ${minA} sq.m` : null}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs text-gray-500">Total from</p>
                    <p className="font-bold text-lg text-[#004A96]">{formatEventMoney(total, cur)}</p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-gray-600">No exhibition space pricing published yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
