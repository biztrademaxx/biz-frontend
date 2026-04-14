import { fetchBrowseByCountryServerPayload } from "@/lib/browse-by-country/fetch-browse-by-country-data-server"
import BrowseByCountryGridClient from "./BrowseByCountryGridClient"

export default async function BrowseByCountrySection() {
  const { displayCountries } = await fetchBrowseByCountryServerPayload()

  return (
    <section className="home-tt-section w-full py-16">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-12 text-start">
          <h2 className="home-tt-h2 mb-3">
            Browse Events By Country
            <br />
            <span className="home-tt-sub">Find events in your favorite countries</span>
          </h2>
        </div>

        <BrowseByCountryGridClient displayCountries={displayCountries} />
      </div>
    </section>
  )
}
