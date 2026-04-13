"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Send } from "lucide-react"

interface FurnitureItem {
  code: string
  description: string
  size: string
  cost: number
  quantity: number
}

const furnitureItems: FurnitureItem[] = [
  { code: "PI-01", description: "Executive Chair Black/red", size: "", cost: 2000, quantity: 0 },
  { code: "PI-02", description: "VIP Sofa (1 Seater) Black", size: "", cost: 2000, quantity: 0 },
  { code: "PI-03", description: "VIP Sofa (2 Seater) Black", size: "", cost: 3500, quantity: 0 },
  { code: "PI-04", description: "Visitor Chair Black", size: "", cost: 800, quantity: 0 },
  { code: "PI-05", description: "Fibre Chair Black", size: "", cost: 400, quantity: 0 },
  { code: "PI-07", description: "Round Table (Wooden Top)", size: "70CM (dia) x 75CM (H)", cost: 1500, quantity: 0 },
  {
    code: "PI-08",
    description: "Round Table Cross Leg (Glass Top)",
    size: "90CM (dia) x 75CM (H)",
    cost: 2000,
    quantity: 0,
  },
  {
    code: "PI-09",
    description: "Bar Stool (Adjustable Chrome leg with Cup)",
    size: "50CM (H)",
    cost: 2000,
    quantity: 0,
  },
  {
    code: "PI-10",
    description: "Glass Showcase (Big with 2 downlights)",
    size: "1M x 50CM x 2M (H)",
    cost: 5000,
    quantity: 0,
  },
  { code: "PI-11", description: "Glass Showcase (Small)", size: "50CM X 50CM X 2M (H)", cost: 4000, quantity: 0 },
  { code: "PI-12", description: "Glass Counter", size: "1M X 50CM X 1M (H)", cost: 3500, quantity: 0 },
  {
    code: "PI-13",
    description: "Centre Table (Black Glass Top)",
    size: "1.20M (L) x 45CM (W)",
    cost: 1500,
    quantity: 0,
  },
  { code: "PI-14", description: "Standing Discussion Table", size: "1.0M (H) x 70CM (Dia)", cost: 1500, quantity: 0 },
  { code: "PI-15", description: "System Counter (Table)", size: "1.05M X 60CM X 75CM", cost: 1500, quantity: 0 },
  { code: "PI-16", description: "Side Rack (Lockable)", size: "40CM X 1M X 60CM (H)", cost: 3600, quantity: 0 },
  { code: "PI-17", description: "System Podium", size: "50CM X 50CM X 1 M (H)", cost: 1000, quantity: 0 },
  { code: "PI-18", description: "System Podium", size: "50CM X 50CM X 70CM (H)", cost: 1000, quantity: 0 },
  { code: "PI-19", description: "System Podium", size: "50CM x 50CM x 50CM (H)", cost: 1500, quantity: 0 },
  { code: "PI-20", description: "Brochure Rack", size: "", cost: 1500, quantity: 0 },
  { code: "PI-21", description: "Round Table (White Top)", size: "80CM (dia) x 75CM (H)", cost: 1500, quantity: 0 },
  { code: "PI-22", description: "Square Table", size: "1.2M X 45CM", cost: 1200, quantity: 0 },
  { code: "PI-23", description: "Lockable Door", size: "", cost: 4000, quantity: 0 },
  { code: "PI-24", description: "System Panel", size: "1M x 2.5M (H) - White", cost: 1500, quantity: 0 },
  { code: "PI-25", description: "Glass Shelf (each)", size: "30CM x 1M", cost: 1000, quantity: 0 },
  { code: "PI-26", description: "Wooden Shelf Flat / Adjustable (each)", size: "30CM x 1M", cost: 750, quantity: 0 },
  { code: "PI-27", description: "Long Arm Halogen Light 150W", size: "", cost: 1000, quantity: 0 },
  { code: "PI-28", description: "Spot Lights 75W", size: "", cost: 750, quantity: 0 },
  { code: "PI-29", description: "Metal Halide 150W", size: "", cost: 2000, quantity: 0 },
  { code: "PI-30", description: "5A/13A Power Socket", size: "", cost: 500, quantity: 0 },
  { code: "PI-31", description: "Photo Clip / T-Bolt", size: "", cost: 100, quantity: 0 },
  { code: "PI-32", description: "Waste Basket", size: "", cost: 150, quantity: 0 },
]

interface AdditionalFurnitureFormProps {
  eventId?: string
  organizerId: string
}

export function AdditionalFurnitureForm({ eventId, organizerId }: AdditionalFurnitureFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
  })

  const [selectedItems, setSelectedItems] = useState<FurnitureItem[]>(furnitureItems)

  const updateQuantity = (code: string, quantity: number) => {
    setSelectedItems((items) =>
      items.map((item) => (item.code === code ? { ...item, quantity: Math.max(0, quantity) } : item)),
    )
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.cost * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    const orderedItems = selectedItems.filter((item) => item.quantity > 0)
    console.log("Submitting Additional Furniture Form:", { ...formData, items: orderedItems, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Additional Furniture Form PDF")
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 8 - ADDITIONAL FURNITURE</CardTitle>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Furniture & System Accessories/Electrical Equipment</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Code</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-left">Size/Specification</th>
                    <th className="border border-gray-300 p-2 text-right">Cost (3 Days) INR</th>
                    <th className="border border-gray-300 p-2 text-center">Qty</th>
                    <th className="border border-gray-300 p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.code}>
                      <td className="border border-gray-300 p-2 font-mono text-sm">{item.code}</td>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-sm">{item.size}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{item.cost.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.code, Number.parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        ₹{(item.cost * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={5} className="border border-gray-300 p-2 text-right">
                      Total Amount:
                    </td>
                    <td className="border border-gray-300 p-2 text-right">₹{calculateTotal().toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
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
