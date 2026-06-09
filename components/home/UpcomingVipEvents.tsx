import { fetchUpcomingVipEventsServer } from "@/lib/hero/fetch-upcoming-vip-events-server"
import UpcomingVipEventsClient from "./UpcomingVipEventsClient"

export default async function UpcomingVipEvents() {
  const events = await fetchUpcomingVipEventsServer()
  if (events.length === 0) return null

  return (
    <div className="mt-5 min-w-0 sm:mt-8">
      <UpcomingVipEventsClient events={events} />
    </div>
  )
}
