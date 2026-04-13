"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Download, Send } from "lucide-react"

interface Pass {
  id: string
  name: string
  designation: string
  organization: string
}

interface ExhibitorPassesFormProps {
  eventId?: string
  organizerId: string
}

export function ExhibitorPassesForm({ eventId, organizerId }: ExhibitorPassesFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
  })

  const [passes, setPasses] = useState<Pass[]>([{ id: "1", name: "", designation: "", organization: "" }])

  const addPass = () => {
    const newPass: Pass = {
      id: Date.now().toString(),
      name: "",
      designation: "",
      organization: "",
    }
    setPasses([...passes, newPass])
  }

  const removePass = (id: string) => {
    if (passes.length > 1) {
      setPasses(passes.filter((pass) => pass.id !== id))
    }
  }

  const updatePass = (id: string, field: keyof Pass, value: string) => {
    setPasses(passes.map((pass) => (pass.id === id ? { ...pass, [field]: value } : pass)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Exhibitor Passes Form:", { ...formData, passes, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Exhibitor Passes Form PDF")
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 6 - EXHIBITOR PASSES</CardTitle>
            <p className="text-red-100 mt-1">(MANDATORY)</p>
          </div>
          <Badge variant="destructive" className="bg-red-800">
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Exhibitor Pass Details</h3>
              <Button type="button" onClick={addPass} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Pass
              </Button>
            </div>

            <div className="space-y-4">
              {passes.map((pass, index) => (
                <div key={pass.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Pass {index + 1}</h4>
                    {passes.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePass(pass.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name of the Person</Label>
                      <Input value={pass.name} onChange={(e) => updatePass(pass.id, "name", e.target.value)} required />
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <Input
                        value={pass.designation}
                        onChange={(e) => updatePass(pass.id, "designation", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Name of the Organisation</Label>
                      <Input
                        value={pass.organization}
                        onChange={(e) => updatePass(pass.id, "organization", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <strong>Note:</strong> Use additional sheet if space is insufficient
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
