"use client"

import { Calendar, Clock, Eye, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EventFormData } from "../types"
import { formatTimeTo12Hour, getDatePart, getEffectiveEventCreationTimezone } from "../utils"

export function CreateEventPreviewTab({ formData }: { formData: EventFormData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Event Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="rounded-lg bg-gray-50 p-4 sm:p-6">
          <div className="min-w-0 space-y-4">
            <div className="min-w-0">
              <h3 className="text-xl font-bold break-words text-blue-900 sm:text-2xl">{formData.title || "Event Title"}</h3>
              <div className="mt-2 flex flex-col gap-2 text-gray-600">
                <div className="flex min-w-0 items-start gap-1">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">
                    {formData.startDate ? getDatePart(formData.startDate) : "Start Date"} -{" "}
                    {formData.endDate ? getDatePart(formData.endDate) : "End Date"}
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-1">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">
                    Daily: {formatTimeTo12Hour(formData.dailyStart)} - {formatTimeTo12Hour(formData.dailyEnd)} (
                    {getEffectiveEventCreationTimezone(formData)})
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-1">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">
                    {formData.venue || "Venue"}, {[formData.city || "City", formData.state, formData.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>

            <p className="break-words text-gray-700">{formData.description || "Event description will appear here..."}</p>

            {formData.highlights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Event Highlights:</h4>
                <div className="space-y-1">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!formData.generalPrice && !formData.studentPrice && !formData.vipPrice ? (
              <div className="bg-white p-4 rounded-lg border mt-6 md:max-w-md">
                <h4 className="font-semibold mb-2">Tickets</h4>
                <p className="text-2xl font-bold text-blue-600">Free</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">General Entry</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formData.currency}
                    {formData.generalPrice || 0}
                  </p>
                </div>

                {formData.studentPrice > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Student Price</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formData.currency}
                      {formData.studentPrice}
                    </p>
                  </div>
                )}

                {formData.vipPrice > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">VIP Price</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {formData.currency}
                      {formData.vipPrice}
                    </p>
                  </div>
                )}
              </div>
            )}

            {formData.spaceCosts.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Exhibition Space Pricing</h4>
                <div className="grid gap-3">
                  {formData.spaceCosts.map((cost, index) => (
                    <div
                      key={index}
                      className="flex min-w-0 flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium break-words">{cost.type}</h5>
                        {cost.hallName ? (
                          <p className="text-sm font-medium break-words text-gray-700">Hall: {cost.hallName}</p>
                        ) : null}
                        <p className="text-sm break-words text-gray-600">{cost.description}</p>
                      </div>
                      <div className="w-full shrink-0 border-t pt-3 text-left sm:w-auto sm:border-t-0 sm:pt-0 sm:text-right">
                        <p className="font-semibold text-blue-600">
                          {formData.currency}
                          {(cost.pricePerSqm || 0).toLocaleString()} / sq.m
                        </p>
                        <p className="text-sm text-gray-500">Min: {cost.minArea || 0} sq.m</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          From: {formData.currency}
                          {((cost.pricePerSqm || 0) * (cost.minArea || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}