// Auth is enforced client-side (JWT in localStorage). No server session.
import { ExhibitorLayout } from "../exhibitor-layout"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DashboardProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc]">
        <Navbar />
        <ExhibitorLayout routeSegment={id} />
      </div>
    </DashboardProvider>
  )
}