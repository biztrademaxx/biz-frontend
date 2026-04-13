// Auth is enforced client-side via useAuth (JWT in localStorage). No server session.
import { UserNameBanner } from "@/app/dashboard/UserNameBanner"
import OrganizerDashboardPage from "../OrganizerDashboardPage"
import Navbar from "../navbar"
import { DashboardProvider } from "@/contexts/dashboard-context"

interface DashboardPageProps {
  params: Promise<{ id: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { id } = await params
  return (
    <DashboardProvider>
      <Navbar />
      <UserNameBanner userId={id} designation="Organizer" />
      <OrganizerDashboardPage organizerId={id} />
    </DashboardProvider>
  )
}