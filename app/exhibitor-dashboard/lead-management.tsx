"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Users, Download, Search, Phone, Mail, MessageSquare, Calendar, Eye, Edit } from "lucide-react"

interface LeadManagementProps {
  exhibitorId: string
}

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  query: string
  source: string
  timestamp: string
  status: string
  priority: string
  notes?: string
  followUpDate?: string
  leadScore?: number
  tags?: string[]
}

export default function LeadManagement({ exhibitorId }: LeadManagementProps) {
  const { toast } = useToast()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (exhibitorId && exhibitorId !== "undefined") {
      fetchLeads()
    }
  }, [exhibitorId])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/exhibitors/${exhibitorId}/leads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch leads")
      }

      const data = await response.json()
      setLeads(data.leads || [])
    } catch (err) {
      console.error("Error fetching leads:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/exhibitors/${exhibitorId}/leads`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          ...updates,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update lead")
      }

      const data = await response.json()
      setLeads(leads.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead)))

      toast({
        title: "Success",
        description: "Lead updated successfully!",
      })
    } catch (err) {
      console.error("Error updating lead:", err)
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filterStatus === "all" || lead.status.toLowerCase().replace(" ", "-") === filterStatus
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500"
      case "CONTACTED":
        return "bg-yellow-500"
      case "QUALIFIED":
        return "bg-green-500"
      case "NOT_INTERESTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50"
      case "LOW":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{lead.name}</h3>
              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
              <Badge variant="outline" className={getPriorityColor(lead.priority)}>
                {lead.priority}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {lead.email}
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(lead.timestamp).toLocaleDateString()} • {lead.source}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Lead Details - {lead.name}</DialogTitle>
                </DialogHeader>
                {selectedLead && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Company</label>
                        <p className="text-gray-600">{selectedLead.company || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Source</label>
                        <p className="text-gray-600">{selectedLead.source}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Query</label>
                      <p className="text-gray-600 mt-1">{selectedLead.query}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Internal Notes</label>
                      <Textarea
                        value={selectedLead.notes || ""}
                        placeholder="Add your notes here..."
                        className="mt-1"
                        onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={selectedLead.status}
                          onValueChange={(value) => setSelectedLead({ ...selectedLead, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="QUALIFIED">Qualified</SelectItem>
                            <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Follow-up Date</label>
                        <Input
                          type="date"
                          value={selectedLead.followUpDate || ""}
                          onChange={(e) => setSelectedLead({ ...selectedLead, followUpDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={() => {
                          if (selectedLead) {
                            updateLead(selectedLead.id, {
                              status: selectedLead.status,
                              notes: selectedLead.notes,
                              followUpDate: selectedLead.followUpDate,
                            })
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">{lead.company || "No Company"}</p>
          <p className="text-sm text-gray-600">{lead.query}</p>
        </div>

        {lead.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{lead.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lead.followUpDate && (
              <Badge variant="outline" className="text-blue-600">
                Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchLeads}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
            <div className="text-gray-600">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {leads.filter((l) => l.status === "QUALIFIED").length}
            </div>
            <div className="text-gray-600">Qualified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {leads.filter((l) => l.status === "CONTACTED").length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {leads.length > 0
                ? Math.round((leads.filter((l) => l.status === "QUALIFIED").length / leads.length) * 100)
                : 0}
              %
            </div>
            <div className="text-gray-600">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search leads by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="not-interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No leads found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
