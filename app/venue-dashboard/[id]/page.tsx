// Auth is enforced client-side (JWT in localStorage). No server session.
import VenueDashboardPage from "../venue-layout"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardProvider>
      <div>
        <Navbar />
        <VenueDashboardPage userId={id} />
      </div>
    </DashboardProvider>
  )
}