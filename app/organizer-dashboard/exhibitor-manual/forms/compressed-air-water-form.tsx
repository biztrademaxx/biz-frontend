"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send } from "lucide-react"

interface CompressedAirWaterFormProps {
  eventId?: string
  organizerId: string
}

export function CompressedAirWaterForm({ eventId, organizerId }: CompressedAirWaterFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    compressedAirCFM: "",
    waterConnections: 0,
  })

  const getCompressedAirCost = (cfm: string) => {
    const cfmNum = Number.parseFloat(cfm) || 0
    if (cfmNum <= 10) return { connectionCost: 15000, powerKW: 3, powerCost: 3500 }
    if (cfmNum <= 20) return { connectionCost: 25000, powerKW: 5, powerCost: 3500 }
    if (cfmNum <= 30) return { connectionCost: 40000, powerKW: 8, powerCost: 3500 }
    if (cfmNum <= 40) return { connectionCost: 50000, powerKW: 11, powerCost: 3500 }
    return { connectionCost: 75000, powerKW: 15, powerCost: 3500 }
  }

  const calculateCompressedAirTotal = () => {
    if (!formData.compressedAirCFM) return { subtotal: 0, gst: 0, total: 0 }

    const costs = getCompressedAirCost(formData.compressedAirCFM)
    const subtotal = costs.connectionCost + costs.powerKW * costs.powerCost
    const gst = subtotal * 0.18
    return { subtotal, gst, total: subtotal + gst }
  }

  const calculateWaterTotal = () => {
    const subtotal = formData.waterConnections * 15000
    const gst = subtotal * 0.18
    return { subtotal, gst, total: subtotal + gst }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Compressed Air & Water Form:", { ...formData, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Compressed Air & Water Form PDF")
  }

  const compressedAirTotal = calculateCompressedAirTotal()
  const waterTotal = calculateWaterTotal()
  const grandTotal = compressedAirTotal.total + waterTotal.total

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 10 - COMPRESSED AIR & WATER</CardTitle>
            <p className="text-blue-100 mt-1">(OPTIONAL)</p>
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
              <h3 className="text-lg font-semibold mb-4">Compressed Air Requirements</h3>
              <div className="mb-4">
                <Label>CFM (Cubic Feet per Minute)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.compressedAirCFM}
                  onChange={(e) => setFormData((prev) => ({ ...prev, compressedAirCFM: e.target.value }))}
                  placeholder="Enter CFM requirement"
                />
              </div>

              {formData.compressedAirCFM && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 mb-4">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">CFM Range</th>
                        <th className="border border-gray-300 p-2 text-right">Connection Cost</th>
                        <th className="border border-gray-300 p-2 text-center">Power (KW)</th>
                        <th className="border border-gray-300 p-2 text-right">Power Cost</th>
                        <th className="border border-gray-300 p-2 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">
                          {Number.parseFloat(formData.compressedAirCFM) <= 10
                            ? "Up to 10 CFM"
                            : Number.parseFloat(formData.compressedAirCFM) <= 20
                              ? "10-20 CFM"
                              : Number.parseFloat(formData.compressedAirCFM) <= 30
                                ? "20-30 CFM"
                                : Number.parseFloat(formData.compressedAirCFM) <= 40
                                  ? "30-40 CFM"
                                  : "Above 40 CFM"}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          ₹{getCompressedAirCost(formData.compressedAirCFM).connectionCost.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {getCompressedAirCost(formData.compressedAirCFM).powerKW}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          ₹{(getCompressedAirCost(formData.compressedAirCFM).powerKW * 3500).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 p-2 text-right font-semibold">
                          ₹{compressedAirTotal.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{compressedAirTotal.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST @ 18%:</span>
                      <span>₹{compressedAirTotal.gst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>₹{compressedAirTotal.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Water Connection</h3>
              <div className="mb-4">
                <Label>Number of Connections</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.waterConnections}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, waterConnections: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              {formData.waterConnections > 0 && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Cost per Connection:</span>
                    <span>₹15,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({formData.waterConnections} × ₹15,000):</span>
                    <span>₹{waterTotal.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST @ 18%:</span>
                    <span>₹{waterTotal.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>₹{waterTotal.total.toLocaleString()}</span>
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
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Power Consumption for Compressed Air will be at extra cost of Rs.3,500/KW.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
