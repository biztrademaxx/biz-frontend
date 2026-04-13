"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Search, Pin, PinOff, Archive, ArchiveRestore, Users, Eye, EyeOff, Users2 } from "lucide-react"

interface AdminNote {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  visibility: 'PRIVATE' | 'TEAM' | 'PUBLIC'
  userRoles: string[]
  dashboardTypes: string[]
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  collaborators: Array<{
    id: string
    permission: string
    user: {
      firstName: string
      lastName: string
      email: string
      role: string
    }
  }>
}

export default function AdminNotes() {
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"active" | "archived">("active")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCollaboratorsDialogOpen, setIsCollaboratorsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null)
  const [selectedNote, setSelectedNote] = useState<AdminNote | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: [] as string[],
    visibility: "PRIVATE" as "PRIVATE" | "TEAM" | "PUBLIC",
    userRoles: [] as string[],
    dashboardTypes: [] as string[],
    isPinned: false
  })
  const [tagInput, setTagInput] = useState("")

  const categories = ["General", "Technical", "Billing", "Feature Request", "Bug Report", "Documentation", "Training", "Ideas", "Meeting Notes", "Other"]
  const userRoles = ["ORGANIZER", "EXHIBITOR", "SPEAKER", "VENUE_MANAGER", "ATTENDEE", "VISITOR"]
  const dashboardTypes = ["ORGANIZER_DASHBOARD", "EXHIBITOR_DASHBOARD", "SPEAKER_DASHBOARD", "VENUE_DASHBOARD", "ATTENDEE_DASHBOARD", "VISITOR_DASHBOARD"]

  useEffect(() => {
    fetchNotes()
  }, [viewMode])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.append('isArchived', (viewMode === 'archived').toString())
      
      const response = await fetch(`/api/admin-notes?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setNotes(data)
      } else {
        console.error('Expected array but got:', data)
        setNotes([])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setError('Failed to load notes. Please try again.')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

// In your React component, update the API calls:

// In your React component - update the handleSave function:

const handleSave = async () => {
  try {
    const url = editingNote 
      ? `/api/admin-notes/${editingNote.id}`
      : '/api/admin-notes'
    
    const method = editingNote ? 'PUT' : 'POST'

    console.log('Making request to:', url, 'with method:', method); // Debug log

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      // If we get a 404, it's a routing issue
      if (response.status === 404) {
        throw new Error(`API endpoint not found. Please check the server configuration.`)
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Success:', result); // Debug log

    fetchNotes()
    setIsDialogOpen(false)
    setEditingNote(null)
    resetForm()
    
  } catch (error) {
    console.error('Error saving note:', error)
    setError(error instanceof Error ? error.message : 'Failed to save note. Please try again.')
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this note?')) {
    try {
      const response = await fetch(`/api/admin-notes/${id}`, {  // Use dynamic route for delete
        method: 'DELETE' 
      })
      
      if (response.ok) {
        fetchNotes()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete note. Please try again.')
    }
  }
}

const handleArchive = async (note: AdminNote) => {
  try {
    const response = await fetch(`/api/admin-notes/${note.id}`, {  // Use dynamic route for update
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...note,
        isArchived: !note.isArchived
      }),
    })

    if (response.ok) {
      fetchNotes()
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to archive note')
    }
  } catch (error) {
    console.error('Error archiving note:', error)
    setError(error instanceof Error ? error.message : 'Failed to archive note. Please try again.')
  }
}

const handlePin = async (note: AdminNote) => {
  try {
    const response = await fetch(`/api/admin-notes/${note.id}`, {  // Use dynamic route for update
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...note,
        isPinned: !note.isPinned
      }),
    })

    if (response.ok) {
      fetchNotes()
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to pin note')
    }
  } catch (error) {
    console.error('Error pinning note:', error)
    setError(error instanceof Error ? error.message : 'Failed to pin note. Please try again.')
  }
}

  const handleEdit = (note: AdminNote) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags,
      visibility: note.visibility,
      userRoles: note.userRoles,
      dashboardTypes: note.dashboardTypes,
      isPinned: note.isPinned
    })
    setIsDialogOpen(true)
  }

  const handleCreateNew = () => {
    setEditingNote(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "General",
      tags: [],
      visibility: "PRIVATE",
      userRoles: [],
      dashboardTypes: [],
      isPinned: false
    })
    setTagInput("")
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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

  // Update the filtering logic to be safe
  const filteredNotes = Array.isArray(notes) ? notes.filter(note =>
    note && 
    (note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(note.tags) && note.tags.some(tag => 
      tag?.toLowerCase().includes(searchTerm.toLowerCase())
    ))) &&
    (selectedCategory === "all" || note.category === selectedCategory)
  ) : []

  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-destructive text-center">
            <p className="text-lg font-semibold">Error Loading Notes</p>
            <p className="mt-2">{error}</p>
            <Button onClick={fetchNotes} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Notes</h2>
          <p className="text-muted-foreground">
            Create and manage internal notes and documentation
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "active" | "archived")}>
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="space-y-6">
        {pinnedNotes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pin className="h-5 w-5 text-yellow-500" />
              Pinned Notes
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onPin={handlePin}
                  onViewCollaborators={(note) => {
                    setSelectedNote(note)
                    setIsCollaboratorsDialogOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {unpinnedNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="text-lg font-semibold mb-4">All Notes</h3>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onPin={handlePin}
                  onViewCollaborators={(note) => {
                    setSelectedNote(note)
                    setIsCollaboratorsDialogOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-semibold">No notes found</p>
                <p className="mt-2">
                  {viewMode === 'archived' 
                    ? "You don't have any archived notes yet."
                    : searchTerm || selectedCategory !== 'all'
                    ? "No notes match your search criteria."
                    : "Create your first note to get started."
                  }
                </p>
                {viewMode === 'active' && !searchTerm && selectedCategory === 'all' && (
                  <Button onClick={handleCreateNew} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </DialogTitle>
            <DialogDescription>
              {editingNote ? 'Update your note details.' : 'Create a new internal note or documentation.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter note content"
                rows={8}
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
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: "PRIVATE" | "TEAM" | "PUBLIC") => setFormData(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="TEAM">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4" />
                        Team
                      </div>
                    </SelectItem>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {formData.visibility === 'TEAM' && (
              <>
                <div className="space-y-2">
                  <Label>User Roles (Leave empty for all roles)</Label>
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
                  <Label>Dashboard Types (Leave empty for all dashboards)</Label>
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
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
              />
              <Label>Pin this note</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingNote(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingNote ? 'Update' : 'Create'} Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborators Dialog */}
      <Dialog open={isCollaboratorsDialogOpen} onOpenChange={setIsCollaboratorsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note Collaborators</DialogTitle>
            <DialogDescription>
              Manage who can access and edit this note.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNote && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Collaborators</Label>
                {selectedNote.collaborators.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNote.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">
                            {collaborator.user.firstName} {collaborator.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {collaborator.user.email} • {collaborator.user.role}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {collaborator.permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No collaborators added yet.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCollaboratorsDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Collaborators
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Note Card Component
function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onArchive, 
  onPin,
  onViewCollaborators 
}: {
  note: AdminNote
  onEdit: (note: AdminNote) => void
  onDelete: (id: string) => void
  onArchive: (note: AdminNote) => void
  onPin: (note: AdminNote) => void
  onViewCollaborators: (note: AdminNote) => void
}) {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return <EyeOff className="h-3 w-3" />
      case 'TEAM':
        return <Users2 className="h-3 w-3" />
      case 'PUBLIC':
        return <Eye className="h-3 w-3" />
      default:
        return <EyeOff className="h-3 w-3" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return 'bg-gray-100 text-gray-800'
      case 'TEAM':
        return 'bg-blue-100 text-blue-800'
      case 'PUBLIC':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${note.isArchived ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {note.title}
              {note.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline">{note.category}</Badge>
              <Badge 
                variant="outline" 
                className={`flex items-center gap-1 ${getVisibilityColor(note.visibility)}`}
              >
                {getVisibilityIcon(note.visibility)}
                {note.visibility.toLowerCase()}
              </Badge>
              <span>•</span>
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content}
        </p>
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>By {note.createdBy.firstName} {note.createdBy.lastName}</span>
            {note.collaborators.length > 0 && (
              <button
                onClick={() => onViewCollaborators(note)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Users className="h-3 w-3" />
                {note.collaborators.length}
              </button>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPin(note)}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              {note.isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(note)}
              title={note.isArchived ? "Restore note" : "Archive note"}
            >
              {note.isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              title="Edit note"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}