// Auth is enforced client-side via useAuth (JWT in localStorage). No server session.

import Navbar from "../navbar"
import { UserDashboard } from "../user-dashboard"
import { DashboardProvider } from "@/contexts/dashboard-context"

interface DashboardPageProps {
  params: Promise<{ id: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { id } = await params

  return (
    <DashboardProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
        <Navbar />
        <UserDashboard userId={id} />
      </div>
    </DashboardProvider>
  )
}
