// Auth is enforced client-side (JWT in localStorage). No server session.
import { SpeakerDashboard } from "../speaker-dashboard"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardProvider>
      <div>
        <Navbar />
        <SpeakerDashboard userId={id} />
      </div>
    </DashboardProvider>
  )
}