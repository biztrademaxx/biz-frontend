// Auth is enforced client-side (JWT in localStorage). No server session.
import { SpeakerDashboard } from "../speaker-dashboard"
import { UserNameBanner } from "@/app/dashboard/UserNameBanner"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardProvider>
      <div>
        <Navbar />
        <UserNameBanner userId={id} designation="Speaker" />
        <SpeakerDashboard userId={id} />
      </div>
    </DashboardProvider>
  )
}