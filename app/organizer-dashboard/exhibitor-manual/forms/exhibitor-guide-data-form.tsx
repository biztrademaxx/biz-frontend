"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Download, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExhibitorGuideDataFormProps {
  eventId?: string
  organizerId: string
}

export function ExhibitorGuideDataForm({ eventId, organizerId }: ExhibitorGuideDataFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    company: "",
    address: "",
    tel: "",
    mobile: "",
    email: "",
    website: "",
    contactPerson: "",
    designation: "",
    products: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Exhibitor Guide Data Form:", { ...formData, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Exhibitor Guide Data Form PDF")
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 5 - DATA FOR EXHIBITOR'S GUIDE</CardTitle>
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
            Maxx Business Media Pvt. Ltd. will be publishing Exhibitor's Guide for visitors of the Exhibition. This
            Guide will contain information about the Exhibitors, their products & services, etc. These Guides will be
            made available to the visitors for their reference.
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
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tel">Tel</Label>
              <Input
                id="tel"
                value={formData.tel}
                onChange={(e) => setFormData((prev) => ({ ...prev, tel: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="products">Products / Services</Label>
            <Textarea
              id="products"
              value={formData.products}
              onChange={(e) => setFormData((prev) => ({ ...prev, products: e.target.value }))}
              rows={4}
              placeholder="Describe your products and services in detail"
              required
            />
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
      </CardContent>
    </Card>
  )
}
