"use client"

import type React from "react"
import { IndianRupee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { EventFormData, ValidationErrors } from "../types"

export type CreateEventPricingTabProps = {
  formData: EventFormData
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>
  currencies: string[]
  validationErrors: ValidationErrors
  updateSpaceCost: (index: number, field: string, value: unknown) => void
}

export function CreateEventPricingTab({
  formData,
  setFormData,
  currencies,
  validationErrors,
  updateSpaceCost,
}: CreateEventPricingTabProps) {
  return (
    <>
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
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
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
                id="generalPrice"
                type="number"
                placeholder="0"
                value={formData.generalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    generalPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="studentPrice">Student Price</Label>
              <Input
                id="studentPrice"
                type="number"
                placeholder="0"
                value={formData.studentPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="vipPrice">VIP Price</Label>
              <Input
                id="vipPrice"
                type="number"
                placeholder="0"
                value={formData.vipPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vipPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="exhibitor-space-costs-section">
        <CardHeader>
          <CardTitle>Exhibitor Space Costs *</CardTitle>
          <p className="text-sm text-gray-600">
            Configure pricing for different types of exhibition spaces and services. This section is required before
            you can submit the event for approval.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {validationErrors.spaceCosts && (
            <p className="text-sm text-red-600" role="alert">
              {validationErrors.spaceCosts}
            </p>
          )}
          <div className="grid gap-6">
            {formData.spaceCosts.map((cost, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-semibold text-lg">{cost.type}</h4>
                  {cost.type.includes("Shell") ? (
                    <Badge variant="secondary" className="text-xs">
                      Standard
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Hall name</Label>
                    <Input
                      className="mt-1"
                      value={cost.hallName ?? ""}
                      onChange={(e) => updateSpaceCost(index, "hallName", e.target.value)}
                      placeholder="e.g. Tripura Vasini, Hall A"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      className="mt-1"
                      value={cost.description}
                      onChange={(e) => updateSpaceCost(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Price per sq.m</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{formData.currency}</span>
                        <Input
                          type="number"
                          value={cost.pricePerSqm || 0}
                          onChange={(e) => updateSpaceCost(index, "pricePerSqm", Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Minimum Area (sq.m)</Label>
                      <Input
                        className="mt-1"
                        type="number"
                        value={cost.minArea || 0}
                        onChange={(e) => updateSpaceCost(index, "minArea", Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm pb-2">
                        <span className="text-gray-600">Total from: </span>
                        <span className="font-semibold text-lg">
                          {formData.currency}
                          {((cost.pricePerSqm || 0) * (cost.minArea || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
