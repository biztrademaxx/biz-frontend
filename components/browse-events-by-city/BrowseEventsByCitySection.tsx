import { fetchBrowseByCityServerPayload } from "@/lib/browse-by-city/fetch-browse-by-city-data-server"
import BrowseEventsByCityGridClient from "./BrowseEventsByCityGridClient"

export default async function BrowseEventsByCitySection() {
  const { displayCities, cityEventCounts } = await fetchBrowseByCityServerPayload()

  return (
    <section className="home-tt-section w-full py-16">
      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-start">
          <h2 className="home-tt-h2 mb-3">
            Browse Events By City
            <br />
            <span className="home-tt-sub">Find events in your favorite cities</span>
          </h2>
        </div>

        <BrowseEventsByCityGridClient
          displayCities={displayCities}
          cityEventCounts={cityEventCounts}
        />
      </div>
    </section>
  )
}
