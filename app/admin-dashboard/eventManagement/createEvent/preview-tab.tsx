"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Eye, Users, Building } from "lucide-react"
import type { EventFormData } from "./types"

interface PreviewTabProps {
  formData: EventFormData
}

export function PreviewTab({ formData }: PreviewTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Event Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">{formData.title || "Event Title"}</h3>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Start Date"} - {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : "End Date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {formData.venue || "Venue"}, {formData.city || "City"}
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

              <p className="text-gray-700">{formData.description || "Event description will appear here..."}</p>

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

              {/* Space Costs Preview */}
              {formData.spaceCosts.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Exhibition Space Pricing</h4>
                  <div className="grid gap-3">
                    {formData.spaceCosts.map((cost, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{cost.type}</h5>
                          <p className="text-sm text-gray-600">{cost.description}</p>
                        </div>
                        <div className="text-right">
                          {cost.unit ? (
                            <p className="font-semibold text-blue-600">
                              {formData.currency}
                              {(cost.pricePerUnit || 0).toLocaleString()} per {cost.unit}
                            </p>
                          ) : (
                            <>
                              <p className="font-semibold text-blue-600">
                                {formData.currency}
                                {(cost.pricePerSqm || 0).toLocaleString()} per sq.m
                              </p>
                              <p className="text-sm text-gray-500">Min: {cost.minArea || 0} sq.m</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Features */}
              <div className="flex gap-4 mt-6">
                {formData.featured && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Featured
                  </Badge>
                )}
                {formData.vip && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    VIP Event
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}