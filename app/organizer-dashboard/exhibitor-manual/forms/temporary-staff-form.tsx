"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send } from "lucide-react"

interface TemporaryStaffFormProps {
  eventId?: string
  organizerId: string
}

export function TemporaryStaffForm({ eventId, organizerId }: TemporaryStaffFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    categoryAQty: 0,
    categoryADays: 1,
    categoryBQty: 0,
    categoryBDays: 1,
  })

  const categoryACost = 5000 // INR per day
  const categoryBCost = 4000 // INR per day

  const calculateCategoryATotal = () => {
    const subtotal = formData.categoryAQty * formData.categoryADays * categoryACost
    const gst = subtotal * 0.18
    return { subtotal, gst, total: subtotal + gst }
  }

  const calculateCategoryBTotal = () => {
    const subtotal = formData.categoryBQty * formData.categoryBDays * categoryBCost
    const gst = subtotal * 0.18
    return { subtotal, gst, total: subtotal + gst }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Temporary Staff Form:", { ...formData, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Temporary Staff Form PDF")
  }

  const categoryATotal = calculateCategoryATotal()
  const categoryBTotal = calculateCategoryBTotal()
  const grandTotal = categoryATotal.total + categoryBTotal.total

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 9 - TEMPORARY STAFF</CardTitle>
            <p className="text-blue-100 mt-1">(OPTIONAL FORM)</p>
          </div>
          <Badge variant="secondary" className="bg-blue-800">
            Deadline: 7 November 2025
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
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
              <h3 className="text-lg font-semibold mb-4">Category A Hostess - Per Day (INR 5000 / USD 64)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.categoryAQty}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryAQty: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label>Number of Days</Label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    value={formData.categoryADays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryADays: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
              {formData.categoryAQty > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({formData.categoryAQty} × {formData.categoryADays} × ₹{categoryACost}):
                    </span>
                    <span>₹{categoryATotal.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST @ 18%:</span>
                    <span>₹{categoryATotal.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>₹{categoryATotal.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Category B Hostess - Per Day (INR 4000 / USD 54)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.categoryBQty}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryBQty: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label>Number of Days</Label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    value={formData.categoryBDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryBDays: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
              {formData.categoryBQty > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({formData.categoryBQty} × {formData.categoryBDays} × ₹{categoryBCost}):
                    </span>
                    <span>₹{categoryBTotal.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST @ 18%:</span>
                    <span>₹{categoryBTotal.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>₹{categoryBTotal.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {grandTotal > 0 && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between text-lg font-bold text-blue-800">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            )}
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
          <p className="text-sm font-semibold text-gray-700 mb-2">Important Notes:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Working hours: 8 hrs/person/day (10:00 - 18:00 hrs)</li>
            <li>• Temporary staff must not be entrusted with handling cash or valuables</li>
            <li>• Exhibitors will be responsible for temporary staff during the show</li>
            <li>• No refund for any cancellation once the order is placed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
