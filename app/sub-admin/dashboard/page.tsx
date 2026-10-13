"use client"

import AdminDashboard from "@/app/admin-dashboard/sidebar"
import { useAuth } from "@/hooks/use-auth"

export default function SubAdminDashboard() {
  const { role, permissions, loading } = useAuth({
    requireAuth: true,
    allowedRoles: ["SUB_ADMIN", "SUPER_ADMIN"],
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (role !== "SUB_ADMIN" && role !== "SUPER_ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard
        userRole={role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "SUB_ADMIN"}
        userPermissions={Array.isArray(permissions) ? permissions : []}
      />
    </div>
  )
}