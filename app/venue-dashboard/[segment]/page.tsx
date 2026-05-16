// Auth is enforced client-side (JWT in localStorage). No server session.
import VenueDashboardPage from "../venue-layout"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef1fb] to-sky-50/40">
        <Navbar />
        <VenueDashboardPage routeSegment={segment} />
      </div>
    </DashboardProvider>
  )
}
