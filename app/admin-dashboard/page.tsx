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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen flex flex-col">
      <Navbar onLogout={logout} />
      {/* <NameBanner
        name="Admin"
        designation={isSuperAdmin ? "Super Administrator" : "Sub Administrator"}
        bannerImage="/admin-banner.jpg"
      /> */}
      <AdminDashboard userRole={userRole} userPermissions={userPermissions} />
    </div>
  )
}
