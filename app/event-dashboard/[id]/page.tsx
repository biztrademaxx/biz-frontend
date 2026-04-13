import { NameBanner } from "@/app/dashboard/NameBanner"
import EventSidebar from "../event-layout"
import Navbar from "../navbar"

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  return (
    <div>
    <Navbar />
    
  <EventSidebar eventId={id} />
  </div>
  )
}