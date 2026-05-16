"use client"

import { useAuth } from "@/hooks/use-auth"
import AdminDashboard from "./sidebar"
import Navbar from "./navbar"
import { NameBanner } from "./NameBanner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { role, permissions, loading, logout } = useAuth({
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN", "SUB_ADMIN"],
  })

  useEffect(() => {
    if (!loading && role === "SUB_ADMIN") {
      router.replace("/sub-admin/dashboard")
    }
  }, [loading, role, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const userRole: "SUPER_ADMIN" | "SUB_ADMIN" =
    role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "SUB_ADMIN"
  const userPermissions = Array.isArray(permissions) ? permissions : []
  const isSuperAdmin = userRole === "SUPER_ADMIN"

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar onLogout={logout} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminDashboard userRole={userRole} userPermissions={userPermissions} />
      </div>
    </div>
  )
}
