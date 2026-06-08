import { fetchUpcomingVipEventsServer } from "@/lib/hero/fetch-upcoming-vip-events-server"
import UpcomingVipEventsClient from "./UpcomingVipEventsClient"

export default async function UpcomingVipEvents() {
  const events = await fetchUpcomingVipEventsServer()
  if (events.length === 0) return null

  return (
    <div className="mx-auto mt-6 max-w-[1300px] sm:mt-8">
      <UpcomingVipEventsClient events={events} />
    </div>
  )
}
