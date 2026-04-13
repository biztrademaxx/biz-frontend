// components/super-admin/support-contacts.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Edit, Trash2, Plus } from "lucide-react"

interface HelpSupportContent {
  id: string
  userRole: string
  pageTitle: string
  pageDescription: string
  supportEmail: string
  supportPhone: string
  officeAddress: string
  corporateName: string
  liveChatHours: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SupportContacts() {
  const [contacts, setContacts] = useState<HelpSupportContent[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<HelpSupportContent | null>(null)
  const [formData, setFormData] = useState({
    userRole: "ORGANIZER",
    pageTitle: "",
    pageDescription: "",
    supportEmail: "",
    supportPhone: "",
    officeAddress: "",
    corporateName: "",
    liveChatHours: "",
    isActive: true
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/help-support')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = editingContact 
        ? `/api/help-support/${editingContact.id}`
        : '/api/help-support'
      
      const method = editingContact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchContacts()
        setIsDialogOpen(false)
        setEditingContact(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await fetch(`/api/help-support/${id}`, { method: 'DELETE' })
        fetchContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleEdit = (contact: HelpSupportContent) => {
    setEditingContact(contact)
    setFormData({
      userRole: contact.userRole,
      pageTitle: contact.pageTitle,
      pageDescription: contact.pageDescription || "",
      supportEmail: contact.supportEmail,
      supportPhone: contact.supportPhone,
      officeAddress: contact.officeAddress,
      corporateName: contact.corporateName,
      liveChatHours: contact.liveChatHours,
      isActive: contact.isActive
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      userRole: "ORGANIZER",
      pageTitle: "",
      pageDescription: "",
      supportEmail: "",
      supportPhone: "",
      officeAddress: "",
      corporateName: "",
      liveChatHours: "",
      isActive: true
    })
  }

  const handleCreateNew = () => {
    setEditingContact(null)
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading contacts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Contacts</h2>
          <p className="text-muted-foreground">
            Manage contact information for different user roles
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Card key={contact.id} className={!contact.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{contact.pageTitle}</CardTitle>
                  <CardDescription>{contact.userRole} Dashboard</CardDescription>
                </div>
                <Badge variant={contact.isActive ? "default" : "secondary"}>
                  {contact.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-1">{contact.officeAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{contact.liveChatHours}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(contact)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Support Contact' : 'Add Support Contact'}
            </DialogTitle>
            <DialogDescription>
              Configure support contact information for a specific user role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userRole">User Role</Label>
                <Select 
                  value={formData.userRole} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, userRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORGANIZER">Organizer</SelectItem>
                    <SelectItem value="EXHIBITOR">Exhibitor</SelectItem>
                    <SelectItem value="SPEAKER">Speaker</SelectItem>
                    <SelectItem value="VENUE_MANAGER">Venue Manager</SelectItem>
                    <SelectItem value="ATTENDEE">Attendee</SelectItem>
                    <SelectItem value="VISITOR">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select 
                  value={formData.isActive.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={formData.pageTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, pageTitle: e.target.value }))}
                placeholder="Help & Support"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageDescription">Page Description</Label>
              <Textarea
                id="pageDescription"
                value={formData.pageDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, pageDescription: e.target.value }))}
                placeholder="Get help and support for your dashboard"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                  placeholder="support@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeAddress">Office Address</Label>
              <Input
                id="officeAddress"
                value={formData.officeAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, officeAddress: e.target.value }))}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corporateName">Corporate Name</Label>
              <Input
                id="corporateName"
                value={formData.corporateName}
                onChange={(e) => setFormData(prev => ({ ...prev, corporateName: e.target.value }))}
                placeholder="Company Name Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveChatHours">Live Chat Hours</Label>
              <Input
                id="liveChatHours"
                value={formData.liveChatHours}
                onChange={(e) => setFormData(prev => ({ ...prev, liveChatHours: e.target.value }))}
                placeholder="Mon-Fri 9AM-6PM EST"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingContact(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingContact ? 'Update' : 'Create'} Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}