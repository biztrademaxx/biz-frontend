"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Award,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"
import { cn } from "@/lib/utils"

interface Organizer {
  id: string
  publicSlug?: string
  name: string
  image?: string
  company: string
  rating: number
  reviewCount: number
  location: string
  country: string
  category: string
  eventsOrganized: number
  headquarters: string
  yearsOfExperience: number
  specialties: string[]
  description: string
  phone: string
  email: string
  website: string
  verified: boolean
  featured: boolean
  totalAttendees: string
  successRate: number
  nextAvailable: string
  avgRating: number
  totalReviews: number
}

function norm(s: string | undefined | null) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
}

const PLACEHOLDER_LOCATION = /^(not specified|unknown|n\/a|—|-)$/i

function firstSegment(address: string) {
  const t = address.split(",")[0]?.trim() ?? ""
  if (t.length < 2 || t.length > 79 || PLACEHOLDER_LOCATION.test(t)) return ""
  return t
}

/** Build filter chips from real organizer rows (static lists never matched API data). */
function useOrganizerFilterOptions(organizers: Organizer[]) {
  return useMemo(() => {
    const cities = new Set<string>()
    const countries = new Set<string>()
    const categories = new Set<string>()

    for (const o of organizers) {
      if (o.country?.trim()) countries.add(o.country.trim())
      const fsHq = firstSegment(o.headquarters || "")
      if (fsHq) cities.add(fsHq)
      const fsLoc = firstSegment(o.location || "")
      if (fsLoc) cities.add(fsLoc)

      if (o.category?.trim()) categories.add(o.category.trim())
      for (const s of o.specialties || []) {
        if (s?.trim()) categories.add(s.trim())
      }
    }

    return {
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b)).slice(0, 40),
      countries: Array.from(countries).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categories).sort((a, b) => a.localeCompare(b)).slice(0, 48),
    }
  }, [organizers])
}

function FilterChipGroup({
  title,
  items,
  selected,
  onToggle,
  emptyHint,
}: {
  title: string
  items: string[]
  selected: string[]
  onToggle: (value: string) => void
  emptyHint?: string
}) {
  if (items.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyHint ?? "No values in current results."}</p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const on = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left text-sm transition-colors",
                on
                  ? "border-[#004A96] bg-[#004A96]/10 text-[#003a75] font-medium"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function OrganizersPage() {
  const router = useRouter()
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("rating")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filterOptions = useOrganizerFilterOptions(organizers)

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const data = await apiFetch<{ organizers: Organizer[] }>("/api/organizers", {
          auth: false,
        })
        setOrganizers(data.organizers || [])
      } catch (error) {
        console.error("Error fetching organizers:", error)
        setOrganizers([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [])

  const handleCardClick = (organizer: Organizer) => {
    router.push(
      getPublicProfilePath("organizer", {
        id: organizer.id,
        publicSlug: organizer.publicSlug,
        organizationName: organizer.company || organizer.name,
        company: organizer.company,
      }),
    )
  }

  const filteredOrganizers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    const filtered = organizers.filter((organizer) => {
      const matchesSearch =
        !q ||
        norm(organizer.name).includes(q) ||
        norm(organizer.company).includes(q) ||
        norm(organizer.description).includes(q) ||
        norm(organizer.website).includes(q) ||
        (organizer.specialties || []).some((s) => norm(s).includes(q))

      const blobCity = norm(`${organizer.headquarters} ${organizer.location}`)
      const matchesCity =
        selectedCities.length === 0 ||
        selectedCities.some((city) => blobCity.includes(norm(city)))

      const blobCountry = norm(`${organizer.country} ${organizer.headquarters} ${organizer.location}`)
      const matchesCountry =
        selectedCountries.length === 0 ||
        selectedCountries.some((country) => {
          const c = norm(country)
          return norm(organizer.country) === c || blobCountry.includes(c)
        })

      const cat = norm(organizer.category)
      const specs = (organizer.specialties || []).map((s) => norm(s))
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((sel) => {
          const s = norm(sel)
          return cat === s || specs.some((sp) => sp === s)
        })

      return matchesSearch && matchesCity && matchesCountry && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.avgRating || 0) - (a.avgRating || 0)
        case "experience":
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
        case "events":
          return (b.eventsOrganized || 0) - (a.eventsOrganized || 0)
        case "name":
          return (a.name || "").localeCompare(b.name || "")
        default:
          return 0
      }
    })

    return filtered
  }, [organizers, searchTerm, selectedCities, selectedCountries, selectedCategories, sortBy])

  const toggleFilter = useCallback((value: string, selectedArray: string[], setSelectedArray: (arr: string[]) => void) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter((item) => item !== value))
    } else {
      setSelectedArray([...selectedArray, value])
    }
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedCities([])
    setSelectedCountries([])
    setSelectedCategories([])
    setSearchTerm("")
  }, [])

  const activeFilterCount =
    selectedCities.length + selectedCountries.length + selectedCategories.length + (searchTerm.trim() ? 1 : 0)

  const filterBody = (
    <>
      <FilterChipGroup
        title="Location (city / area)"
        items={filterOptions.cities}
        selected={selectedCities}
        onToggle={(v) => toggleFilter(v, selectedCities, setSelectedCities)}
        emptyHint="Load organizers to see location filters."
      />
      <FilterChipGroup
        title="Country / region"
        items={filterOptions.countries}
        selected={selectedCountries}
        onToggle={(v) => toggleFilter(v, selectedCountries, setSelectedCountries)}
        emptyHint="No country field on listings yet."
      />
      <FilterChipGroup
        title="Categories & specialties"
        items={filterOptions.categories}
        selected={selectedCategories}
        onToggle={(v) => toggleFilter(v, selectedCategories, setSelectedCategories)}
        emptyHint="No categories on current organizers."
      />
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
          Clear all filters
        </Button>
      )}
    </>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f7fb] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#004A96] border-t-transparent" />
          <h1 className="text-xl font-semibold text-gray-900">Loading organizers</h1>
          <p className="mt-2 text-sm text-muted-foreground">Fetching professional event organizers…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f7fb]">
      {/* Mobile filter bar */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-[#004A96]/30 text-[#004A96]">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 ? (
                <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(100vw-1rem,22rem)] flex-col gap-0 p-0 sm:max-w-sm">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle className="text-lg">Discover organizers</SheetTitle>
              <p className="text-sm font-normal text-muted-foreground">Narrow by location, country, or specialty.</p>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1 px-4 py-4">{filterBody}</ScrollArea>
            <SheetFooter className="border-t bg-muted/30 p-4 sm:flex-col sm:gap-2">
              <Button className="w-full bg-[#004A96] hover:bg-[#003a75]" onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredOrganizers.length} result{filteredOrganizers.length !== 1 ? "s" : ""}
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={clearAllFilters}>
                Reset all
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-white lg:block xl:w-80">
          <div className="sticky top-0 max-h-[100dvh]">
            <div className="border-b border-gray-100 px-5 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Discover organizers</h2>
              <p className="mt-1 text-xs text-muted-foreground">Filters use your current directory data.</p>
            </div>
            <ScrollArea className="h-[calc(100dvh-5.5rem)] px-5 py-4">{filterBody}</ScrollArea>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Find expert organizers</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Connect with verified teams for trade shows, conferences, and corporate events.
            </p>

            <div className="mt-6 hidden flex-col gap-3 sm:flex-row sm:items-center lg:flex">
              <div className="relative max-w-xl flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, specialty, or description…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 shrink-0 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:min-w-[200px]"
                aria-label="Sort organizers"
              >
                <option value="rating">Sort by rating</option>
                <option value="experience">Sort by experience</option>
                <option value="events">Sort by events hosted</option>
                <option value="name">Sort by name</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Active:</span>
                {searchTerm.trim() && (
                  <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                    “{searchTerm.trim().slice(0, 32)}
                    {searchTerm.trim().length > 32 ? "…" : ""}”
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label="Clear search"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCities.map((city) => (
                  <Badge key={city} variant="secondary" className="gap-1 pr-1 font-normal">
                    {city}
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label={`Remove ${city}`}
                      onClick={() => toggleFilter(city, selectedCities, setSelectedCities)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedCountries.map((country) => (
                  <Badge key={country} variant="secondary" className="gap-1 pr-1 font-normal">
                    {country}
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label={`Remove ${country}`}
                      onClick={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1 pr-1 font-normal">
                    {category}
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      aria-label={`Remove ${category}`}
                      onClick={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="px-4 py-6 sm:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredOrganizers.length}</span> of{" "}
                <span className="font-semibold text-foreground">{organizers.length}</span> organizers
              </p>
              <div className="flex items-center gap-2 lg:hidden">
                <span className="text-xs text-muted-foreground">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm sm:max-w-xs"
                  aria-label="Sort organizers"
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="events">Events</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {filteredOrganizers.length === 0 ? (
              <Card className="border-dashed bg-white/80">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <Users className="mb-4 h-14 w-14 text-muted-foreground/40" />
                  <h3 className="text-lg font-semibold text-gray-900">No organizers match</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Try clearing filters or searching with a shorter keyword.
                  </p>
                  <Button className="mt-6 bg-[#004A96] hover:bg-[#003a75]" onClick={clearAllFilters}>
                    Reset filters & search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredOrganizers.map((organizer) => (
                  <Card
                    key={organizer.id}
                    className="group cursor-pointer overflow-hidden border-gray-200/80 bg-white p-0 shadow-sm transition-shadow hover:shadow-md"
                    onClick={() => handleCardClick(organizer)}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <img
                        src={organizer.image || "/city/c4.jpg"}
                        alt={organizer.company || organizer.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      {organizer.featured && (
                        <Badge className="absolute left-3 top-3 bg-orange-500 text-white hover:bg-orange-600">
                          Featured
                        </Badge>
                      )}
                      {organizer.verified && (
                        <Badge className="absolute right-3 top-3 bg-emerald-600 text-white hover:bg-emerald-700">
                          <Award className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 font-semibold text-gray-900">{organizer.company}</h3>
                        <div className="flex shrink-0 items-center gap-0.5 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium tabular-nums">
                            {Number(organizer.avgRating || 0).toFixed(1)}
                          </span>
                          <span className="text-muted-foreground">({organizer.totalReviews ?? 0})</span>
                        </div>
                      </div>

                      <div className="mb-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="line-clamp-2">{organizer.headquarters || "Location not specified"}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-4 w-4 shrink-0" />
                          {organizer.yearsOfExperience} yrs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 shrink-0" />
                          {organizer.eventsOrganized} events
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
