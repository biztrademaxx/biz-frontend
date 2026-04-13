"use client"

import { useState, useEffect } from "react"
import { isAuthenticated } from "@/lib/api"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, ArrowLeft } from "lucide-react"
import SubAdminAddPage from "./subadmin-management"
import SubAdminEditPage from "./sub-admin-edit-page"
import SubAdminViewPage from "./sub-admin-view-page"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SubAdmin {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  roleDisplayName?: string
  permissions: string[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

type ApiSubAdminRow = {
  id: string
  name: string
  email: string
  phone?: string | null
  role?: string
  roleDisplayName?: string | null
  permissions?: string[]
  isActive: boolean
  lastLogin?: string | null
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

function mapApiSubAdminToUi(row: ApiSubAdminRow): SubAdmin {
  const role = row.role ?? "SUB_ADMIN"
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    role,
    roleDisplayName: row.roleDisplayName ?? undefined,
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    isActive: row.isActive,
    lastLogin: row.lastLogin ?? undefined,
    createdAt: row.createdAt,
    createdBy: row.createdBy ?? { id: "", name: "—", email: "" },
  }
}

type ViewMode = "list" | "add" | "edit" | "view"

export default function SuperAdminManagement() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null)
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const fetchSubAdmins = async () => {
    try {
      setLoading(true)
      const res = await adminApi<{ success?: boolean; data?: ApiSubAdminRow[] }>("/sub-admins?limit=100")
      const rows = res.success !== false && Array.isArray(res.data) ? res.data : []
      setSubAdmins(rows.map(mapApiSubAdminToUi))
    } catch (error) {
      console.error("Error fetching sub-admins:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load sub-admins")
      setSubAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSubAdmins()
    }
  }, [])

  const handleDeleteSubAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-admin?')) return

    try {
      await adminApi(`/sub-admins/${id}`, { method: "DELETE" })
      toast.success("Sub-admin deleted successfully")
      fetchSubAdmins()
    } catch (error) {
      console.error('Error deleting sub-admin:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete sub-admin')
    }
  }

  const handleEditSubAdmin = (subAdmin: SubAdmin) => {
    setSelectedSubAdmin(subAdmin)
    setViewMode("edit")
  }

  const handleViewSubAdmin = (subAdmin: SubAdmin) => {
    setSelectedSubAdmin(subAdmin)
    setViewMode("view")
  }

  const handleAddSuccess = () => {
    setViewMode("list")
    fetchSubAdmins()
  }

  const handleEditSuccess = () => {
    setViewMode("list")
    setSelectedSubAdmin(null)
    fetchSubAdmins()
  }

  const handleCancel = () => {
    setViewMode("list")
    setSelectedSubAdmin(null)
  }

  const getRoleDisplay = (sub: SubAdmin) =>
    sub.roleDisplayName?.trim() ||
    ({
      SUB_ADMIN: "Sub Admin",
      MODERATOR: "Moderator",
      SUPPORT: "Support Staff",
    }[sub.role] ?? sub.role.replace(/_/g, " "))

  if (!isAuthenticated()) {
    return null
  }

  if (viewMode !== "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === "add" && "Add New Sub Admin"}
              {viewMode === "edit" && "Edit Sub Admin"}
              {viewMode === "view" && "Sub Admin Details"}
            </h1>
            <Button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
          </div>
          
          {viewMode === "add" && (
            <SubAdminAddPage onSuccess={handleAddSuccess} onCancel={handleCancel} />
          )}
          
          {viewMode === "edit" && selectedSubAdmin && (
            <SubAdminEditPage 
              subAdmin={selectedSubAdmin} 
              onSuccess={handleEditSuccess} 
              onCancel={handleCancel} 
            />
          )}
          
          {viewMode === "view" && selectedSubAdmin && (
            <SubAdminViewPage 
              subAdmin={selectedSubAdmin} 
              onCancel={handleCancel} 
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative flex items-center justify-center w-full">
          <div className="w-full h-[4px] rounded-full bg-gradient-to-r from-green-300 to-blue-500" />
          <div className="absolute bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
            SUB ADMINS
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SUB ADMINS</h1>
            <p className="text-gray-600">Manage all sub-administrator accounts</p>
          </div>

          <Button
            onClick={() => setViewMode("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Sub Admin
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">All Sub Admins</CardTitle>
            <CardDescription>View and manage all sub-administrator accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-900 py-3">No</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">User</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Role</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Phone</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Permissions</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : subAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No sub-admins found. Click "Add New Sub Admin" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  subAdmins.map((subAdmin, index) => (
                    <TableRow key={subAdmin.id} className="border-b hover:bg-gray-50">
                      <TableCell className="py-4 font-medium">{index + 1}</TableCell>
                      <TableCell className="py-4 font-medium">{subAdmin.name}</TableCell>
                      <TableCell className="py-4">{subAdmin.email}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={
                            subAdmin.role === "SUB_ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : subAdmin.role === "MODERATOR"
                                ? "bg-blue-100 text-blue-800"
                                : subAdmin.role === "SUPPORT"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-slate-100 text-slate-800"
                          }
                        >
                          {getRoleDisplay(subAdmin)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">{subAdmin.phone || 'N/A'}</TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs truncate" title={subAdmin.permissions.join(', ')}>
                          {subAdmin.permissions.length} permissions
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className={
                          subAdmin.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }>
                          {subAdmin.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            onClick={() => handleViewSubAdmin(subAdmin)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleEditSubAdmin(subAdmin)}
                            title="Edit Sub Admin"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteSubAdmin(subAdmin.id)}
                            title="Delete Sub Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}