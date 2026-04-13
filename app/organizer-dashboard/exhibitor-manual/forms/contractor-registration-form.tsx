"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Save } from "lucide-react"

interface ContractorRegistrationFormProps {
  eventId: string
  organizerId: string
}

export function ContractorRegistrationForm({ eventId, organizerId }: ContractorRegistrationFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    organisation: "",
    contactPerson: "",
    designation: "",
    mobile: "",
    email: "",
    contractorBands: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/events/${eventId}/forms/contractor-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, organizerId }),
      })

      if (response.ok) {
        alert("Form submitted successfully!")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/forms/contractor-registration/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "contractor-registration-form.pdf"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">FORM 1 - REGISTRATION OF CONTRACTOR</h3>
        <p className="text-red-700 text-sm">FOR BARE SPACE EXHIBITORS (MANDATORY)</p>
        <p className="text-red-600 text-sm mt-2">
          Please fill in this form if you plan to engage your own contractor instead of the Official Contractor for any
          booth design, decoration or construction work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="boothNo">Booth No</Label>
          <Input id="boothNo" name="boothNo" value={formData.boothNo} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="exhibitorName">Exhibitor's Name</Label>
          <Input
            id="exhibitorName"
            name="exhibitorName"
            value={formData.exhibitorName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="sqMtrBooked">Sq. mtr. booked</Label>
          <Input
            id="sqMtrBooked"
            name="sqMtrBooked"
            type="number"
            value={formData.sqMtrBooked}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contractor's Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="organisation">Organisation</Label>
            <Input
              id="organisation"
              name="organisation"
              value={formData.organisation}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contractorBands">Please apply CONTRACTOR BANDS : No. required</Label>
            <Input
              id="contractorBands"
              name="contractorBands"
              type="number"
              value={formData.contractorBands}
              onChange={handleInputChange}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-orange-800">Important Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Height Limit:</strong> Maximum allowable height for fabricated booths, including platform height,
              is 4 meters.
            </div>
            <div>
              <strong>Carpet Requirement:</strong> Fabricators must lay a single-use carpet over the entire booth area
              before starting construction.
            </div>
            <div>
              <strong>Fire Extinguishers:</strong> Each booth must have fire extinguishers for safety reasons.
            </div>
            <div>
              <strong>Damage & Performance Bond:</strong> Booth contractors must pay a Damage & Performance Bond via
              demand draft.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Submit Form
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={generatePDF}
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p>
          <strong>Deadline for Submission:</strong> 07 November 2025
        </p>
        <p>
          <strong>Submit to:</strong> MAXX BUSINESS MEDIA PVT. LTD.
        </p>
        <p>T9, 3rd Floor, Subedar Chatram Road, Seshadripuram, Bengaluru 560 020</p>
        <p>Tel: +91 914831993 | E-mail: info@maxxmedia.in</p>
      </div>
    </form>
  )
}
