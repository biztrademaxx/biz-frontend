"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SecurityFormProps {
  eventId?: string
  organizerId: string
}

export function SecurityForm({ eventId, organizerId }: SecurityFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    numberOfDays: 1,
  })

  const securityCostPerShift = 2500 // INR per 10-hour shift

  const calculateTotal = () => {
    const subtotal = formData.numberOfDays * securityCostPerShift
    const gst = subtotal * 0.18
    return { subtotal, gst, total: subtotal + gst }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Security Form:", { ...formData, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Security Form PDF")
  }

  const totals = calculateTotal()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 11 - SECURITY FOR YOUR STALL</CardTitle>
            <p className="text-blue-100 mt-1">(OPTIONAL)</p>
          </div>
          <Badge variant="secondary" className="bg-blue-800">
            Deadline: 7 November 2025
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The Organisers will be providing General Security in the exhibition hall from 20-22 November 2025 only.
            However, security at individual stall can be arranged from 18th to 19th November 2025. These facilities will
            be recruited from the approved Agency for the Exhibition.
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

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Security Guard Requirements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Category</Label>
                <Input value="Security Guard" disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Charges per Shift (10 Hours)</Label>
                <Input value="₹2,500" disabled className="bg-gray-50" />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="numberOfDays">Number of Days</Label>
              <Input
                id="numberOfDays"
                type="number"
                min="1"
                max="5"
                value={formData.numberOfDays}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numberOfDays: Number.parseInt(e.target.value) || 1 }))
                }
                required
              />
              <p className="text-sm text-gray-500 mt-1">Available for 18th-19th November 2025 (setup days)</p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-sm">
                <span>
                  Subtotal ({formData.numberOfDays} days × ₹{securityCostPerShift}):
                </span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST @ 18%:</span>
                <span>₹{totals.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Grand Total:</span>
                <span>₹{totals.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
          <p className="text-sm text-gray-600">
            <strong>Important:</strong> Security services are only available during setup days (18th-19th November
            2025). General security will be provided by organizers during exhibition days (20th-22nd November 2025).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
