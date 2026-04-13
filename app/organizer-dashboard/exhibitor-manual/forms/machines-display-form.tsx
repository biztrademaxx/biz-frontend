"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Download, Send } from "lucide-react"

interface Machine {
  id: string
  name: string
  width: string
  length: string
  height: string
  weight: string
}

interface MachinesDisplayFormProps {
  eventId?: string
  organizerId: string
}

export function MachinesDisplayForm({ eventId, organizerId }: MachinesDisplayFormProps) {
  const [formData, setFormData] = useState({
    boothNo: "",
    exhibitorName: "",
    sqMtrBooked: "",
  })

  const [machines, setMachines] = useState<Machine[]>([
    { id: "1", name: "", width: "", length: "", height: "", weight: "" },
  ])

  const addMachine = () => {
    const newMachine: Machine = {
      id: Date.now().toString(),
      name: "",
      width: "",
      length: "",
      height: "",
      weight: "",
    }
    setMachines([...machines, newMachine])
  }

  const removeMachine = (id: string) => {
    if (machines.length > 1) {
      setMachines(machines.filter((machine) => machine.id !== id))
    }
  }

  const updateMachine = (id: string, field: keyof Machine, value: string) => {
    setMachines(machines.map((machine) => (machine.id === id ? { ...machine, [field]: value } : machine)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      alert("Please select an event first")
      return
    }

    console.log("Submitting Machines Display Form:", { ...formData, machines, eventId })
  }

  const handleDownloadPDF = () => {
    console.log("Downloading Machines Display Form PDF")
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">FORM 4 - MACHINES / PRODUCTS TO BE DISPLAYED</CardTitle>
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
              <h3 className="text-lg font-semibold">Machines/Products Details</h3>
              <Button type="button" onClick={addMachine} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Machine
              </Button>
            </div>

            <div className="space-y-4">
              {machines.map((machine, index) => (
                <div key={machine.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Machine {index + 1}</h4>
                    {machines.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMachine(machine.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Machine/Product Name</Label>
                      <Input
                        value={machine.name}
                        onChange={(e) => updateMachine(machine.id, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Width (m)</Label>
                      <Input
                        value={machine.width}
                        onChange={(e) => updateMachine(machine.id, "width", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Length (m)</Label>
                      <Input
                        value={machine.length}
                        onChange={(e) => updateMachine(machine.id, "length", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Height (m)</Label>
                      <Input
                        value={machine.height}
                        onChange={(e) => updateMachine(machine.id, "height", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Weight (Tons)</Label>
                      <Input
                        value={machine.weight}
                        onChange={(e) => updateMachine(machine.id, "weight", e.target.value)}
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
      </CardContent>
    </Card>
  )
}
