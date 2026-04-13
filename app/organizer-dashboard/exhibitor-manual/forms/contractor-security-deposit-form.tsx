"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Save, AlertTriangle } from "lucide-react"

interface ContractorSecurityDepositFormProps {
  eventId: string
  organizerId: string
}

export function ContractorSecurityDepositForm({ eventId, organizerId }: ContractorSecurityDepositFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
    contractorCompanyName: "",
    contractorPersonName: "",
    mobileNumber: "",
    emailId: "",
    contractorGSTNumber: "",
    contractorPANNumber: "",
    ddNumber: "",
    bankName: "",
    branch: "",
    dated: "",
    amountInWords: "",
    amount: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-calculate amount based on booth size
    if (name === "sqMtrBooked") {
      const sqMtr = Number.parseInt(value) || 0
      let amount = ""
      if (sqMtr <= 36) {
        amount = "INR 25,000 / USD 313"
      } else if (sqMtr <= 100) {
        amount = "INR 50,000 / USD 625"
      } else {
        amount = "INR 75,000 / USD 938"
      }
      setFormData((prev) => ({ ...prev, amount }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/events/${eventId}/forms/contractor-security-deposit`, {
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
      const response = await fetch(`/api/forms/contractor-security-deposit/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "contractor-security-deposit-form.pdf"
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
        <h3 className="font-semibold text-red-800 mb-2">FORM 2 - CONTRACTOR SECURITY DEPOSIT FORM</h3>
        <p className="text-red-700 text-sm">FOR BARE SPACE EXHIBITORS (MANDATORY)</p>
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
          <CardTitle className="text-lg">Security Deposit Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">No.</th>
                  <th className="text-left p-2">Booth Sq.</th>
                  <th className="text-left p-2">Amount in INR/USD</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">1</td>
                  <td className="p-2">0 - 36</td>
                  <td className="p-2">INR 25,000 / USD 313</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">2</td>
                  <td className="p-2">37 - 100</td>
                  <td className="p-2">INR 50,000 / USD 625</td>
                </tr>
                <tr>
                  <td className="p-2">3</td>
                  <td className="p-2">101 and above</td>
                  <td className="p-2">INR 75,000 / USD 938</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <Label htmlFor="amount">Amount (Auto-calculated based on booth size)</Label>
            <Input id="amount" name="amount" value={formData.amount} readOnly className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contractor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contractorCompanyName">Contractor Company Name</Label>
            <Input
              id="contractorCompanyName"
              name="contractorCompanyName"
              value={formData.contractorCompanyName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="contractorPersonName">Contractor Person Name</Label>
            <Input
              id="contractorPersonName"
              name="contractorPersonName"
              value={formData.contractorPersonName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="emailId">Email ID</Label>
              <Input
                id="emailId"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractorGSTNumber">Contractor GST Number</Label>
              <Input
                id="contractorGSTNumber"
                name="contractorGSTNumber"
                value={formData.contractorGSTNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="contractorPANNumber">Contractor PAN Number</Label>
              <Input
                id="contractorPANNumber"
                name="contractorPANNumber"
                value={formData.contractorPANNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Payment Mode: DD Only</span>
            </div>
            <p className="text-yellow-700 text-sm">
              The Security deposit should be submitted only by Demand Draft. No other mode of payment will be accepted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ddNumber">By DD No.</Label>
              <Input id="ddNumber" name="ddNumber" value={formData.ddNumber} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" name="branch" value={formData.branch} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="dated">Dated</Label>
              <Input id="dated" name="dated" type="date" value={formData.dated} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="amountInWords">Amount in words</Label>
            <Input
              id="amountInWords"
              name="amountInWords"
              value={formData.amountInWords}
              onChange={handleInputChange}
              required
            />
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
          <strong>Important Notes:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Refundable Security deposit must be paid by demand draft in the name of "Maxx Business Media Pvt. Ltd."
            payable.
          </li>
          <li>
            If the contractor fails to submit the security deposit by demand draft the booth possession will not be
            given.
          </li>
          <li>Please note that the security deposit has to be paid by the booth contractor and NOT the exhibitor.</li>
          <li>
            Kindly bring 2 copies of this form at the time of possession with the authorized signature and company
            stamp.
          </li>
        </ul>
      </div>
    </form>
  )
}
