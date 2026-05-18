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
      <div className="admin-dashboard-root flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-sky-600 border-t-transparent dark:border-[#17F0F6]" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const userRole: "SUPER_ADMIN" | "SUB_ADMIN" =
    role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "SUB_ADMIN"
  const userPermissions = Array.isArray(permissions) ? permissions : []
  const isSuperAdmin = userRole === "SUPER_ADMIN"

  return (
      <div className="admin-dashboard-root flex min-h-screen flex-col bg-background">
        <Navbar onLogout={logout} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminDashboard userRole={userRole} userPermissions={userPermissions} />
        </div>
      </div>
  )
}
