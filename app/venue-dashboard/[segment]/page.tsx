// Auth is enforced client-side (JWT in localStorage). No server session.
import VenueDashboardPage from "../venue-layout"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params
  return (
    <DashboardProvider>
      <div>
        <Navbar />
        <VenueDashboardPage routeSegment={segment} />
      </div>
    </DashboardProvider>
  )
}
