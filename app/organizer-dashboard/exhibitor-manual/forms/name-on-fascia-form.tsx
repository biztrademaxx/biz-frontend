"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Download, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NameOnFasciaFormProps {
  eventId?: string
  organizerId: string
}

export function NameOnFasciaForm({ eventId, organizerId }: NameOnFasciaFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    fasciaName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Name on Fascia Form:", { ...formData, eventId })
    // API call would go here
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Name on Fascia Form PDF")
    // PDF generation would go here
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 3 - NAME ON FASCIA</CardTitle>
            <p className="text-red-100 mt-1">(MANDATORY)</p>
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
            The name of the Exhibitor will be displayed on the Fascia of approximately one feet height made from 6mm
            plywood duly painted in approved colour with white letters. Use Block Letters only - One alphabet in each
            block (max. 24 letters).
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

          <div>
            <Label htmlFor="fasciaName">Name to be displayed on Fascia (Max 24 letters)</Label>
            <Input
              id="fasciaName"
              value={formData.fasciaName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fasciaName: e.target.value.slice(0, 24) }))}
              placeholder="Enter name in BLOCK LETTERS"
              maxLength={24}
              className="uppercase"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.fasciaName.length}/24 characters</p>
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
          <p className="text-sm text-gray-600">
            <strong>Important Notes:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Use Block Letters only</li>
            <li>• One alphabet in each block (max. 24 letters)</li>
            <li>• Neither logo nor product details will be put on the Fascia</li>
            <li>• Uniform height and standard style will be used</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
