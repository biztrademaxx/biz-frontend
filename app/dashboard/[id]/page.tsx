// Auth is enforced client-side via useAuth (JWT in localStorage). No server session.

import Navbar from "../navbar"
import { UserDashboard } from "../user-dashboard"
import { DashboardProvider } from "@/contexts/dashboard-context"

interface DashboardPageProps {
  params: Promise<{ id: string }>
}

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { id } = await params

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#f5f7fb]">
        {/* Navbar */}
        <Navbar />

        {/* Main Dashboard Container */}
        <main className="w-full px-3 py-3 md:px-5 md:py-5">
          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border border-slate-200/70
              bg-white
              shadow-[0_10px_45px_rgba(15,23,42,0.08)]
            "
          >
            {/* Optional Background Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-transparent" />

            {/* Dashboard Content */}
            <div className="relative z-10">
              <UserDashboard userId={id} />
            </div>
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}