"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ElectricalRequirementFormProps {
  eventId?: string
  organizerId: string
}

export function ElectricalRequirementForm({ eventId, organizerId }: ElectricalRequirementFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    temporaryPhase: "single",
    temporaryLoad: "",
    exhibitionPhase: "single",
    exhibitionLoad: "",
  })

  const calculateCost = (load: string, costPerKW = 3500) => {
    const loadNum = Number.parseFloat(load) || 0
    return loadNum * costPerKW
  }

  const calculateGST = (amount: number) => {
    return amount * 0.18
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Electrical Requirement Form:", { ...formData, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Electrical Requirement Form PDF")
  }

  const temporaryCost = calculateCost(formData.temporaryLoad)
  const temporaryGST = calculateGST(temporaryCost)
  const exhibitionCost = calculateCost(formData.exhibitionLoad)
  const exhibitionGST = calculateGST(exhibitionCost)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 7 - ELECTRICAL REQUIREMENT</CardTitle>
            <p className="text-red-100 mt-1">FOR BARE SPACE EXHIBITORS (MANDATORY)</p>
          </div>
          <Badge variant="destructive" className="bg-red-800">
            Deadline: 7 November 2025
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This form must be completed and returned by every exhibitor under Bare Space / Shell Space. Electrical
            requirements can be serviced only if order is placed on or before 7th November 2025.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="boothNo">Booth No</Label>
              <Input
                id="boothNo"
                value={formData.boothNo}
                onChange={(e) => setFormData((prev) => ({ ...prev, boothNo: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="exhibitorName">Exhibitor's Name</Label>
              <Input
                id="exhibitorName"
                value={formData.exhibitorName}
                onChange={(e) => setFormData((prev) => ({ ...prev, exhibitorName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="sqMtrBooked">Sq. mtr. booked</Label>
              <Input
                id="sqMtrBooked"
                value={formData.sqMtrBooked}
                onChange={(e) => setFormData((prev) => ({ ...prev, sqMtrBooked: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Temporary Electrical Load (18th - 19th November 2025)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phase Type</Label>
                  <Select
                    value={formData.temporaryPhase}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, temporaryPhase: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Phase</SelectItem>
                      <SelectItem value="three">Three Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Electrical Load Requirements (KW)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temporaryLoad}
                    onChange={(e) => setFormData((prev) => ({ ...prev, temporaryLoad: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between text-sm">
                  <span>Cost (INR 3,500 per KW):</span>
                  <span>₹{temporaryCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST @ 18%:</span>
                  <span>₹{temporaryGST.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>₹{(temporaryCost + temporaryGST).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Electrical Load During Exhibition (20th - 22nd November 2025)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phase Type</Label>
                  <Select
                    value={formData.exhibitionPhase}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, exhibitionPhase: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Phase</SelectItem>
                      <SelectItem value="three">Three Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Electrical Load Requirements (KW)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.exhibitionLoad}
                    onChange={(e) => setFormData((prev) => ({ ...prev, exhibitionLoad: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between text-sm">
                  <span>Cost (INR 3,500 per KW):</span>
                  <span>₹{exhibitionCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST @ 18%:</span>
                  <span>₹{exhibitionGST.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>₹{(exhibitionCost + exhibitionGST).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Send className="w-4 h-4 mr-2" />
              Submit Form
            </Button>
            <Button type="button" variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Rules for Electrical Work:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• All exhibitors must hire a licensed electrical contractor</li>
            <li>• Only ISI-marked new materials must be used</li>
            <li>• LED lights must be used</li>
            <li>• Payment must be made 20 days before the show</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
