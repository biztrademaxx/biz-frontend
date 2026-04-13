"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface ContractorSecurityFormProps {
  organizerId: string
  eventId?: string
  onFormSubmit?: () => void
}

interface Event {
  id: string
  name: string
  startDate: string
  endDate: string
  location: string
}

export function ContractorSecurityForm({ organizerId, eventId, onFormSubmit }: ContractorSecurityFormProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || "")
  const [loadingEvents, setLoadingEvents] = useState(true)

  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: "",
    contactPerson: "",
    designation: "",
    mobile: "",
    email: "",

    // Booth Information
    boothNumber: "",
    exhibitorName: "",
    squareMeters: "",

    // Contractor Details
    contractorCompanyName: "",
    contractorPersonName: "",
    contractorMobile: "",
    contractorEmail: "",
    contractorGST: "",
    contractorPAN: "",

    // Payment Information
    paymentMode: "DD",
    ddNumber: "",
    bankName: "",
    branch: "",
    ddDate: "",
    amount: "",
    amountInWords: "",

    // Company Logo
    companyLogo: null as File | null,
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiFetch<{ events?: Record<string, unknown>[] }>(
          `/api/organizers/${organizerId}/events?page=1&limit=100`,
          { auth: true },
        )
        const mapped: Event[] = (data.events || []).map((e: Record<string, unknown>) => ({
          id: String(e.id),
          name: String(e.title ?? e.name ?? ""),
          startDate: String(e.startDate ?? ""),
          endDate: String(e.endDate ?? ""),
          location: String(
            e.location ?? (e.venue as { venueCity?: string })?.venueCity ?? "",
          ),
        }))
        setEvents(mapped)

        if (!eventId && mapped.length > 0) {
          setSelectedEventId(mapped[0].id)
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        })
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [organizerId, eventId, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, companyLogo: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select an event",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "companyLogo" && value instanceof File) {
          formDataToSend.append(key, value)
        } else if (typeof value === "string") {
          formDataToSend.append(key, value)
        }
      })

      formDataToSend.append("organizerId", organizerId)
      formDataToSend.append("eventId", selectedEventId)

      const response = await fetch("/api/contractor-forms", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to submit form")

      toast({
        title: "Success",
        description: "Contractor security form submitted successfully",
      })

      // Reset form
      setFormData({
        organizationName: "",
        contactPerson: "",
        designation: "",
        mobile: "",
        email: "",
        boothNumber: "",
        exhibitorName: "",
        squareMeters: "",
        contractorCompanyName: "",
        contractorPersonName: "",
        contractorMobile: "",
        contractorEmail: "",
        contractorGST: "",
        contractorPAN: "",
        paymentMode: "DD",
        ddNumber: "",
        bankName: "",
        branch: "",
        ddDate: "",
        amount: "",
        amountInWords: "",
        companyLogo: null,
      })

      onFormSubmit?.()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to submit contractor security form",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select an event before generating PDF",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/contractor-forms/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventId: selectedEventId }),
      })

      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "contractor-security-deposit-form.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">CONTRACTOR SECURITY DEPOSIT FORM</h2>
        <h3 className="text-lg font-semibold">FORM 2 FOR BARE SPACE EXHIBITORS</h3>
        <p className="text-sm text-muted-foreground">(MANDATORY)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Selection</CardTitle>
          <CardDescription>Select the event for this contractor security deposit form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="eventSelect">Select Event *</Label>
            {loadingEvents ? (
              <div className="text-sm text-muted-foreground">Loading events...</div>
            ) : (
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {event.location} • {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>Upload your company logo for the form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <Button type="button" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizationName">Organisation *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booth Information */}
      <Card>
        <CardHeader>
          <CardTitle>Booth Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="boothNumber">Booth No *</Label>
              <Input
                id="boothNumber"
                value={formData.boothNumber}
                onChange={(e) => handleInputChange("boothNumber", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="exhibitorName">Exhibitor's Name *</Label>
              <Input
                id="exhibitorName"
                value={formData.exhibitorName}
                onChange={(e) => handleInputChange("exhibitorName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="squareMeters">Sq. mtr. booked *</Label>
              <Input
                id="squareMeters"
                type="number"
                step="0.1"
                value={formData.squareMeters}
                onChange={(e) => handleInputChange("squareMeters", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contractor Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractorCompanyName">Contractor Company Name *</Label>
              <Input
                id="contractorCompanyName"
                value={formData.contractorCompanyName}
                onChange={(e) => handleInputChange("contractorCompanyName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contractorPersonName">Contractor Person Name *</Label>
              <Input
                id="contractorPersonName"
                value={formData.contractorPersonName}
                onChange={(e) => handleInputChange("contractorPersonName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contractorMobile">Mobile Number *</Label>
              <Input
                id="contractorMobile"
                value={formData.contractorMobile}
                onChange={(e) => handleInputChange("contractorMobile", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contractorEmail">Email ID *</Label>
              <Input
                id="contractorEmail"
                type="email"
                value={formData.contractorEmail}
                onChange={(e) => handleInputChange("contractorEmail", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contractorGST">Contractor GST Number</Label>
              <Input
                id="contractorGST"
                value={formData.contractorGST}
                onChange={(e) => handleInputChange("contractorGST", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contractorPAN">Contractor PAN Number</Label>
              <Input
                id="contractorPAN"
                value={formData.contractorPAN}
                onChange={(e) => handleInputChange("contractorPAN", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ddNumber">DD No.</Label>
              <Input
                id="ddNumber"
                value={formData.ddNumber}
                onChange={(e) => handleInputChange("ddNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ddDate">Dated</Label>
              <Input
                id="ddDate"
                type="date"
                value={formData.ddDate}
                onChange={(e) => handleInputChange("ddDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="amountInWords">Amount in words</Label>
              <Input
                id="amountInWords"
                value={formData.amountInWords}
                onChange={(e) => handleInputChange("amountInWords", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Booth Fabrication Guidelines and Regulations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong>Height Limit:</strong> The maximum allowable height for fabricated booths, including platform
            height, is 4 meters.
          </div>
          <div>
            <strong>Carpet Requirement:</strong> Fabricators must lay a single-use carpet over the entire booth area
            before starting construction. Failure to comply will result in the forfeiture of the refundable security
            deposit.
          </div>
          <div>
            <strong>No Storage Space:</strong> Storing or retaining materials behind the booth is prohibited. Violating
            this rule will result in the forfeiture of the performance bond.
          </div>
          <div>
            <strong>Housekeeping:</strong> The organizers will not provide booth cleaning services during setup or show
            days. Fabricators must arrange for their own housekeeping personnel to ensure final booth cleaning.
          </div>
          <div>
            <strong>Fire Extinguishers:</strong> For safety reasons, each booth must have fire extinguishers. This
            requirement must be incorporated into the booth design for approval.
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={generatePDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button type="submit" disabled={loading || !selectedEventId}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? "Submitting..." : "Submit Form"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>PLEASE MAKE COPY FOR YOUR REFERENCE.</p>
        <p>For Maxx Business Media Pvt. Ltd - Authorised Signatory</p>
      </div>
    </form>
  )
}
