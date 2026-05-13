import type { Metadata } from "next"
import { redirect } from "next/navigation"
import EventSidebar from "../event-layout"
import Navbar from "../navbar"
import {
  fetchEventByRefForDashboard,
} from "@/lib/server/fetch-event-snapshot"
import { isEventIdUuid } from "@/lib/event-ref"

interface EventDashboardPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EventDashboardPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await fetchEventByRefForDashboard(decodeURIComponent(slug))
  const title = data?.title?.trim()
  return {
    title: title ? `${title} · Event dashboard` : "Event dashboard",
  }
}

export default async function EventDashboardPage({ params }: EventDashboardPageProps) {
  const { slug } = await params
  const ref = decodeURIComponent(slug)
  const data = await fetchEventByRefForDashboard(ref)

  if (data) {
    const canonical = data.slug?.trim()
    if (isEventIdUuid(ref) && canonical) {
      redirect(`/event-dashboard/${encodeURIComponent(canonical)}`)
    }
  }

  const eventTitle = data?.title?.trim() || null

  return (
    <div>
      <Navbar />
      <EventSidebar
        dashboardRef={ref}
        eventId={data?.id ?? null}
        initialEventTitle={eventTitle}
      />
    </div>
  )
}
