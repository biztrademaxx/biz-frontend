"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormsListProps {
  organizerId: string
  manuals: any[]
  onRefresh: () => void
}

export function FormsList({ organizerId, manuals, onRefresh }: FormsListProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDownloadPDF = async (formId: string, formType: "contractor" | "custom") => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${formType}-forms/${formId}/pdf`)

      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${formType}-form-${formId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteForm = async (formId: string, formType: "contractor" | "custom") => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/${formType}-forms/${formId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete form")

      toast({
        title: "Success",
        description: "Form deleted successfully",
      })

      onRefresh()
    } catch (error) {
      console.error("Error deleting form:", error)
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">All Forms</h2>
        <p className="text-muted-foreground">View and manage all contractor and custom forms</p>
      </div>

      {manuals.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No forms created yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first contractor security form or custom form to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {manuals.map((manual) => (
            <Card key={manual.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{manual.title}</CardTitle>
                    <CardDescription>{manual.description}</CardDescription>
                  </div>
                  <Badge variant={manual.isActive ? "default" : "secondary"}>
                    {manual.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Contractor Forms */}
                  {manual.contractorForms?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Contractor Security Forms</h4>
                      <div className="space-y-2">
                        {manual.contractorForms.map((form: any) => (
                          <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{form.contractorCompanyName}</p>
                              <p className="text-sm text-muted-foreground">
                                Booth: {form.boothNumber} | Status: {form.status}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadPDF(form.id, "contractor")}
                                disabled={loading}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteForm(form.id, "contractor")}
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Forms */}
                  {manual.customForms?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Custom Forms</h4>
                      <div className="space-y-2">
                        {manual.customForms.map((form: any) => (
                          <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{form.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {form.submissions?.length || 0} submissions
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadPDF(form.id, "custom")}
                                disabled={loading}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteForm(form.id, "custom")}
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
