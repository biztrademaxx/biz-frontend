"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Sparkles,
  ArrowLeft
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { VisitorSuggestionsAdmin } from "./visitors/VisitorSuggestions"

interface Visitor {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  company?: string
  jobTitle?: string
  location?: string
  bio?: string
  website?: string
  social: {
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  isVerified: boolean
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  stats: {
    totalRegistrations: number
    confirmedRegistrations: number
    totalConnections: number
    acceptedConnections: number
    totalAppointments: number
    completedAppointments: number
    savedEvents: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface VisitorDetails extends Visitor {
  registrations: Array<{
    id: string
    event: {
      id: string
      title: string
      startDate: string
      endDate: string
    }
    status: string
    registeredAt: string
  }>
  connections: Array<{
    id: string
    type: 'sent' | 'received'
    user: {
      id: string
      name: string
      email: string
      company?: string
    }
    status: string
    createdAt: string
  }>
  appointments: Array<{
    id: string
    title: string
    exhibitor: {
      id: string
      name: string
      company?: string
    }
    event?: {
      id: string
      title: string
    }
    status: string
    requestedDate: string
  }>
  savedEvents: Array<{
    id: string
    event: {
      id: string
      title: string
      startDate: string
    }
  }>
}

export default function VisitorManagement() {
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)
  const [suggestionsVisitor, setSuggestionsVisitor] = useState<{ id: string; name: string } | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchVisitors = async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter })
      })

      const result = await adminApi<{ success?: boolean; data?: { visitors: Visitor[]; pagination: PaginationInfo }; error?: string }>(`/visitors?${params}`)

      if (result.success && result.data) {
        const validatedVisitors = (result.data.visitors ?? []).map((visitor: any) => ({
          ...visitor,
          stats: {
            totalRegistrations: visitor.stats?.totalRegistrations ?? 0,
            confirmedRegistrations: visitor.stats?.confirmedRegistrations ?? 0,
            totalConnections: visitor.stats?.totalConnections ?? 0,
            acceptedConnections: visitor.stats?.acceptedConnections ?? 0,
            totalAppointments: visitor.stats?.totalAppointments ?? 0,
            completedAppointments: visitor.stats?.completedAppointments ?? 0,
            savedEvents: visitor.stats?.savedEvents ?? 0
          }
        }))
        setVisitors(validatedVisitors)
        setPagination(result.data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 })
      } else {
        setError((result as any).error ?? "Failed to fetch visitors")
      }
    } catch (err) {
      setError("Failed to fetch visitors")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVisitorDetails = async (visitorId: string) => {
    try {
      setError("")
      const result = await adminApi<{ success?: boolean; data?: VisitorDetails; error?: string }>(`/visitors/${visitorId}`)

      if (result.success && result.data) {
        setSelectedVisitor(result.data)
        setShowDetailsModal(true)
      } else {
        setError((result as any).error ?? "Failed to fetch visitor details")
      }
    } catch (err) {
      setError("Failed to fetch visitor details")
      console.error(err)
    }
  }

  const exportToExcel = async () => {
    try {
      setExportLoading(true)
      setError("")
      
      // Fetch all visitors without pagination for export
      const params = new URLSearchParams({
        limit: "10000",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter })
      })

      const result = await adminApi<{ success?: boolean; data?: { visitors: any[] }; error?: string }>(`/visitors?${params}`)

      if (result.success && result.data) {
        const visitorsData = result.data.visitors ?? []
        
        // Create CSV content with safe data access
        const headers = [
          'Name',
          'Email',
          'Phone',
          'Company',
          'Job Title',
          'Location',
          'Status',
          'Verified',
          'Total Events',
          'Confirmed Events',
          'Total Connections',
          'Accepted Connections',
          'Total Appointments',
          'Completed Appointments',
          'Saved Events',
          'Last Login',
          'Registered Date'
        ]

        const csvContent = [
          headers.join(','),
          ...visitorsData.map((visitor: any) => [
            `"${(visitor.name || '').replace(/"/g, '""')}"`,
            `"${visitor.email || ''}"`,
            `"${visitor.phone || 'N/A'}"`,
            `"${visitor.company || 'N/A'}"`,
            `"${visitor.jobTitle || 'N/A'}"`,
            `"${visitor.location || 'N/A'}"`,
            `"${visitor.isActive ? 'Active' : 'Inactive'}"`,
            `"${visitor.isVerified ? 'Yes' : 'No'}"`,
            visitor.stats?.totalRegistrations || 0,
            visitor.stats?.confirmedRegistrations || 0,
            visitor.stats?.totalConnections || 0,
            visitor.stats?.acceptedConnections || 0,
            visitor.stats?.totalAppointments || 0,
            visitor.stats?.completedAppointments || 0,
            visitor.stats?.savedEvents || 0,
            `"${visitor.lastLogin ? new Date(visitor.lastLogin).toLocaleDateString() : 'Never'}"`,
            `"${new Date(visitor.createdAt).toLocaleDateString()}"`
          ].join(','))
        ].join('\n')

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `visitors_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError("Failed to export visitors")
      }
    } catch (err) {
      setError("Failed to export visitors")
      console.error(err)
    } finally {
      setExportLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitors()
  }, [pagination.page, statusFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchVisitors()
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusToggle = async (visitorId: string, currentStatus: boolean) => {
    try {
      await adminApi(`/visitors/${visitorId}`, {
        method: "PATCH",
        body: { isActive: !currentStatus }
      })
      setVisitors(prev =>
        prev.map(visitor =>
          visitor.id === visitorId
            ? { ...visitor, isActive: !currentStatus }
            : visitor
        )
      )
      setShowActionsMenu(null)
    } catch (error) {
      console.error("Error updating visitor status:", error)
      setError("Failed to update visitor status")
    }
  }

  const handleViewDetails = (visitorId: string) => {
    fetchVisitorDetails(visitorId)
    setShowActionsMenu(null)
  }

  const handleViewSuggestions = (visitorId: string, visitorName: string) => {
    setSuggestionsVisitor({ id: visitorId, name: visitorName })
    setShowSuggestionsModal(true)
    setShowActionsMenu(null)
  }

  const handleEditVisitor = (visitorId: string) => {
    console.log("Edit visitor:", visitorId)
    setShowActionsMenu(null)
  }

  const handleDeleteVisitor = async (visitorId: string) => {
    if (confirm("Are you sure you want to delete this visitor? This action cannot be undone.")) {
      try {
        await adminApi(`/visitors/${visitorId}`, { method: "DELETE" })
        setVisitors(prev => prev.filter(visitor => visitor.id !== visitorId))
      } catch (error) {
        console.error("Error deleting visitor:", error)
        setError("Failed to delete visitor")
      }
    }
    setShowActionsMenu(null)
  }

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsMenu) {
        setShowActionsMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showActionsMenu])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
          <p className="text-gray-600">Manage and view all registered visitors</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exportLoading ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search visitors by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Visitors Grid */}
      <div className="grid gap-6">
        {visitors.map((visitor) => (
          <div
            key={visitor.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {visitor.avatar ? (
                    <img
                      src={visitor.avatar}
                      alt={visitor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {visitor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Visitor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {visitor.name}
                    </h3>
                    {visitor.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {visitor.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{visitor.email}</span>
                    </div>
                    {visitor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{visitor.phone}</span>
                      </div>
                    )}
                    {visitor.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{visitor.company}</span>
                        {visitor.jobTitle && (
                          <span className="text-gray-500">• {visitor.jobTitle}</span>
                        )}
                      </div>
                    )}
                    {visitor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{visitor.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats with safe access */}
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{(visitor.stats?.confirmedRegistrations || 0)} events</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{(visitor.stats?.acceptedConnections || 0)} connections</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      <span>{(visitor.stats?.completedAppointments || 0)} meetings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => handleViewSuggestions(visitor.id, visitor.name)}
                  className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                  title="View Exhibitor Suggestions"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStatusToggle(visitor.id, visitor.isActive)}
                  className={`p-2 rounded-lg ${
                    visitor.isActive
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  } transition-colors`}
                  title={visitor.isActive ? "Deactivate" : "Activate"}
                >
                  {visitor.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleViewDetails(visitor.id)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActionsMenu(showActionsMenu === visitor.id ? null : visitor.id)
                    }}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="More Actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showActionsMenu === visitor.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={() => handleViewDetails(visitor.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewSuggestions(visitor.id, visitor.name)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        Exhibitor Suggestions
                      </button>
                      {/* <button
                        onClick={() => handleEditVisitor(visitor.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDeleteVisitor(visitor.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Login */}
            {visitor.lastLogin && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Last login: {new Date(visitor.lastLogin).toLocaleDateString()} at{' '}
                  {new Date(visitor.lastLogin).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {visitors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No visitors found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No visitors have registered yet"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Visitor Details Modal */}
      {showDetailsModal && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Visitor Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Visitor Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    {selectedVisitor.avatar ? (
                      <img
                        src={selectedVisitor.avatar}
                        alt={selectedVisitor.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-2xl">
                          {selectedVisitor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedVisitor.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {selectedVisitor.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                      {selectedVisitor.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleViewSuggestions(selectedVisitor.id, selectedVisitor.name)
                      }}
                      className="w-full mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Exhibitor Suggestions
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedVisitor.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedVisitor.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <p className="text-gray-900">{selectedVisitor.company || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Job Title</label>
                      <p className="text-gray-900">{selectedVisitor.jobTitle || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{selectedVisitor.location || 'N/A'}</p>
                    </div>
                    {selectedVisitor.bio && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Bio</label>
                        <p className="text-gray-900">{selectedVisitor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Overview with safe access */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{selectedVisitor.stats?.confirmedRegistrations || 0}</p>
                  <p className="text-sm text-blue-600">Events</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{selectedVisitor.stats?.acceptedConnections || 0}</p>
                  <p className="text-sm text-green-600">Connections</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{selectedVisitor.stats?.completedAppointments || 0}</p>
                  <p className="text-sm text-purple-600">Meetings</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{selectedVisitor.stats?.savedEvents || 0}</p>
                  <p className="text-sm text-orange-600">Saved Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Suggestions Modal */}
      {showSuggestionsModal && suggestionsVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 inline-block">
                  Exhibitor Suggestions for {suggestionsVisitor.name}
                </h2>
              </div>
              <button
                onClick={() => setShowSuggestionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <VisitorSuggestionsAdmin 
                visitorId={suggestionsVisitor.id}
                visitorName={suggestionsVisitor.name}
                onClose={() => setShowSuggestionsModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}