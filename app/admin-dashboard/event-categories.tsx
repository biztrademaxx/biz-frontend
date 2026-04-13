"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  Image
} from "lucide-react"
import CloudinaryUpload from "@/components/cloudinary-upload"
import { apiFetch } from "@/lib/api"
import adminApi from "@/lib/admin-api"

interface EventCategory {
  id: string
  name: string
  icon?: string  // Cloudinary URL
  color?: string
  isActive: boolean
  eventCount?: number
  createdAt?: string
  updatedAt?: string
}

export default function EventCategories() {
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
   
    icon: "",  // Cloudinary URL
    color: "#3B82F6",
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<EventCategory[] | { data?: EventCategory[] }>("/api/admin/event-categories", { auth: true })
      const list = Array.isArray(data) ? data : (data as any)?.data ?? []
      setCategories(list)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/event-categories/${editingCategory.id}`
        : "/event-categories"
      
      const method = editingCategory ? "PUT" : "POST"

      await adminApi(url, {
        method,
        auth: true,
        body: formData,
      })

      setShowForm(false)
      setEditingCategory(null)
      setFormData({
        name: "",
     
        icon: "",
        color: "#3B82F6",
        isActive: true
      })
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Failed to save category")
    }
  }

  const handleEdit = (category: EventCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      
      icon: category.icon || "",
      color: category.color || "#3B82F6",
      isActive: category.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      await adminApi(`/event-categories/${categoryId}`, {
        method: "DELETE",
        auth: true,
      })
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
    }
  }

  const handleIconUpload = (iconUrl: string) => {
    setFormData(prev => ({
      ...prev,
      icon: iconUrl
    }))
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) 
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Categories</h1>
          <p className="text-gray-600">Manage event categories and their properties</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({
              name: "",
              // description: "",
              icon: "",
              color: "#3B82F6",
              isActive: true
            })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {category.icon ? (
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    <Image className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.eventCount} events</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

        

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {category.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${category.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first category"}
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
         
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Icon
                  </label>
                  <CloudinaryUpload
                    onUploadComplete={handleIconUpload}
                    currentImage={formData.icon}
                    folder="event-categories/icons"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a custom icon image for this category
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active Category
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCategory(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}