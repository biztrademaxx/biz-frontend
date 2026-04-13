"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send } from "lucide-react"

interface AVItem {
  id: number
  description: string
  cost: number
  quantity: number
}

const avItems: AVItem[] = [
  { id: 1, description: "LCD Projector (XGA 3000 ASNI Lumens)", cost: 20000, quantity: 0 },
  { id: 2, description: "Laptop with Accessories", cost: 4000, quantity: 0 },
  { id: 3, description: "Laser Jet B & W Printer / Scanner (Without Cartridges)", cost: 10000, quantity: 0 },
  { id: 4, description: "PA Systems (150w Speaker 2 nos., 400w Amplifier 1 no)", cost: 10000, quantity: 0 },
  { id: 5, description: "Cordless Hand Mike", cost: 2000, quantity: 0 },
  { id: 6, description: 'LCD / LED TV 42"', cost: 12000, quantity: 0 },
  { id: 7, description: 'LCD / LED TV 50"', cost: 16000, quantity: 0 },
  { id: 8, description: 'LCD / LED TV 55"', cost: 25000, quantity: 0 },
]

interface AudioVisualFormProps {
  eventId?: string
  organizerId: string
}

export function AudioVisualForm({ eventId, organizerId }: AudioVisualFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
  })

  const [selectedItems, setSelectedItems] = useState<AVItem[]>(avItems)

  const updateQuantity = (id: number, quantity: number) => {
    setSelectedItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item)),
    )
  }

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => total + item.cost * item.quantity, 0)
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

    const orderedItems = selectedItems.filter((item) => item.quantity > 0)
    console.log("Submitting Audio Visual Form:", { ...formData, items: orderedItems, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Audio Visual Form PDF")
  }

  const subtotal = calculateSubtotal()
  const gst = calculateGST(subtotal)
  const grandTotal = subtotal + gst

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 12 - AUDIO VISUAL EQUIPMENT</CardTitle>
            <p className="text-blue-100 mt-1">(OPTIONAL)</p>
          </div>
          <Badge variant="secondary" className="bg-blue-800">
            Deadline: 7 November 2025
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            To facilitate an impressive display and good presentation at your booth, you may like to rent out Audio
            visual equipment detailed below for <strong>20th – 22nd November 2025</strong>.
          </p>
        </div>

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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Audio Visual Equipment</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Description of Item</th>
                    <th className="border border-gray-300 p-2 text-right">Cost for 3 Days (₹)</th>
                    <th className="border border-gray-300 p-2 text-center">Quantity</th>
                    <th className="border border-gray-300 p-2 text-right">Total Cost (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{item.cost.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                          className="w-20 text-center mx-auto"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        ₹{(item.cost * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST @ 18%:</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-800 border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
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
      </CardContent>
    </Card>
  )
}
