// components/super-admin/faq-management.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  userRoles: string[]
  dashboardTypes: string[]
  order: number
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    userRoles: ["ORGANIZER"],
    dashboardTypes: ["ORGANIZER_DASHBOARD"],
    order: 0,
    isActive: true
  })

  const categories = ["General", "Technical", "Billing", "Feature Request", "Bug Report", "Documentation", "Training", "Other"]
  const userRoles = ["ORGANIZER", "EXHIBITOR", "SPEAKER", "VENUE_MANAGER", "ATTENDEE", "VISITOR"]
  const dashboardTypes = ["ORGANIZER_DASHBOARD", "EXHIBITOR_DASHBOARD", "SPEAKER_DASHBOARD", "VENUE_DASHBOARD", "ATTENDEE_DASHBOARD", "VISITOR_DASHBOARD"]

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faqs')
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = editingFaq 
        ? `/api/faqs/${editingFaq.id}`
        : '/api/faqs'
      
      const method = editingFaq ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchFAQs()
        setIsDialogOpen(false)
        setEditingFaq(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        // Note: You'll need to add DELETE endpoint for FAQs
        await fetch(`/api/faqs/${id}`, { method: 'DELETE' })
        fetchFAQs()
      } catch (error) {
        console.error('Error deleting FAQ:', error)
      }
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      userRoles: faq.userRoles,
      dashboardTypes: faq.dashboardTypes,
      order: faq.order,
      isActive: faq.isActive
    })
    setIsDialogOpen(true)
  }

  const handleCreateNew = () => {
    setEditingFaq(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "General",
      userRoles: ["ORGANIZER"],
      dashboardTypes: ["ORGANIZER_DASHBOARD"],
      order: 0,
      isActive: true
    })
  }

  const toggleUserRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      userRoles: prev.userRoles.includes(role)
        ? prev.userRoles.filter(r => r !== role)
        : [...prev.userRoles, role]
    }))
  }

  const toggleDashboardType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      dashboardTypes: prev.dashboardTypes.includes(type)
        ? prev.dashboardTypes.filter(t => t !== type)
        : [...prev.dashboardTypes, type]
    }))
  }

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex justify-center py-8">Loading FAQs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-muted-foreground">
            Manage frequently asked questions for different user roles
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            {filteredFAQs.length} FAQs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>User Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFAQs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell>
                    <div className="max-w-md">
                      <div className="font-medium line-clamp-2">{faq.question}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {faq.answer}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{faq.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {faq.userRoles.slice(0, 2).map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {faq.userRoles.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{faq.userRoles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faq.isActive ? "default" : "secondary"}>
                      {faq.isActive ? 
                        <Eye className="h-3 w-3 mr-1" /> : 
                        <EyeOff className="h-3 w-3 mr-1" />
                      }
                      {faq.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>{new Date(faq.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
            </DialogTitle>
            <DialogDescription>
              Create or update a frequently asked question.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter the question"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter the answer"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>User Roles</Label>
              <div className="flex flex-wrap gap-2">
                {userRoles.map(role => (
                  <Badge
                    key={role}
                    variant={formData.userRoles.includes(role) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleUserRole(role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dashboard Types</Label>
              <div className="flex flex-wrap gap-2">
                {dashboardTypes.map(type => (
                  <Badge
                    key={type}
                    variant={formData.dashboardTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleDashboardType(type)}
                  >
                    {type.replace('_DASHBOARD', '')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingFaq(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingFaq ? 'Update' : 'Create'} FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}