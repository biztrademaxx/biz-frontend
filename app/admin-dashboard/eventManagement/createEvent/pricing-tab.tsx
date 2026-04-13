"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IndianRupee, Plus, X } from "lucide-react"
import type { EventFormData } from "./types"

interface PricingTabProps {
  formData: EventFormData
  currencies: string[]
  onFormChange: (updates: Partial<EventFormData>) => void
  onAddCustomSpaceCost: () => void
  onUpdateSpaceCost: (index: number, field: string, value: any) => void
  onRemoveSpaceCost: (index: number) => void
}

export function PricingTab({
  formData,
  currencies,
  onFormChange,
  onAddCustomSpaceCost,
  onUpdateSpaceCost,
  onRemoveSpaceCost,
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Ticket Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => onFormChange({ currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="generalPrice">General Entry</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.generalPrice === 0 ? "" : formData.generalPrice}
                onChange={(e) =>
                  onFormChange({
                    generalPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="studentPrice">Student Price</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.studentPrice === 0 ? "" : formData.studentPrice}
                onChange={(e) =>
                  onFormChange({
                    studentPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="vipPrice">VIP Price</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.vipPrice === 0 ? "" : formData.vipPrice}
                onChange={(e) =>
                  onFormChange({
                    vipPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exhibitor Space Costs</CardTitle>
          <p className="text-sm text-gray-600">
            Configure pricing for different types of exhibition spaces and services
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {formData.spaceCosts.map((cost, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{cost.type}</h4>
                    {cost.isFixed && (
                      <Badge variant="secondary" className="text-xs">
                        Standard
                      </Badge>
                    )}
                  </div>
                  {!cost.isFixed && (
                    <Button variant="outline" size="sm" onClick={() => onRemoveSpaceCost(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-white rounded border">{cost.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cost.isFixed && cost.type !== "Shell Space (Standard Booth)" ? (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Space Type</Label>
                          <Input
                            value={cost.type}
                            onChange={(e) => onUpdateSpaceCost(index, "type", e.target.value)}
                            placeholder="Enter space type"
                            disabled={cost.isFixed}
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            {cost.unit ? `Price per ${cost.unit}` : "Price per sq.m"}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formData.currency}</span>
                            <Input
                              type="number"
                              value={cost.pricePerSqm || cost.pricePerUnit || 0}
                              onChange={(e) =>
                                onUpdateSpaceCost(
                                  index,
                                  cost.unit ? "pricePerUnit" : "pricePerSqm",
                                  Number(e.target.value),
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                        {!cost.unit && (
                          <div>
                            <Label className="text-sm font-medium">Minimum Area (sq.m)</Label>
                            <Input
                              type="number"
                              value={cost.minArea || 0}
                              onChange={(e) => onUpdateSpaceCost(index, "minArea", Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                        )}
                      </>
                    ) : cost.isFixed ? (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Price per sq.m</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formData.currency}</span>
                            <Input
                              type="number"
                              value={cost.pricePerSqm || 0}
                              onChange={(e) => onUpdateSpaceCost(index, "pricePerSqm", Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Minimum Area (sq.m)</Label>
                          <Input
                            type="number"
                            value={cost.minArea || 0}
                            onChange={(e) => onUpdateSpaceCost(index, "minArea", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-sm">
                            <span className="text-gray-600">Total from: </span>
                            <span className="font-semibold text-lg">
                              {formData.currency}
                              {((cost.pricePerSqm || 0) * (cost.minArea || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Space Type</Label>
                          <Input
                            value={cost.type}
                            onChange={(e) => onUpdateSpaceCost(index, "type", e.target.value)}
                            placeholder="Enter space type"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Price per sq.m</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formData.currency}</span>
                            <Input
                              type="number"
                              value={cost.pricePerSqm === 0 ? "" : cost.pricePerSqm}
                              onChange={(e) => onUpdateSpaceCost(index, "pricePerSqm", Number(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Minimum Area (sq.m)</Label>
                          <Input
                            type="number"
                            value={cost.minArea === 0 ? "" : cost.minArea}
                            onChange={(e) => onUpdateSpaceCost(index, "minArea", Number(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-sm font-medium">Description</Label>
                          <Textarea
                            value={cost.description}
                            onChange={(e) => onUpdateSpaceCost(index, "description", e.target.value)}
                            placeholder="Describe this space type"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {cost.unit && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm text-blue-800">Service pricing per {cost.unit}</span>
                      <span className="font-semibold text-blue-900">
                        {formData.currency}
                        {(cost.pricePerUnit || 0).toLocaleString()} per {cost.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onAddCustomSpaceCost} className="w-full bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Space Type
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}