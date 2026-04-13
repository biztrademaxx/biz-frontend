import { fetchExploreVenuesForHomeServer } from "@/lib/venues/fetch-explore-venues-home-server"
import ExploreVenuesGridClient from "./ExploreVenuesGridClient"

export default async function ExploreVenuesSection() {
  const venues = await fetchExploreVenuesForHomeServer()
  return <ExploreVenuesGridClient venues={venues} />
}
