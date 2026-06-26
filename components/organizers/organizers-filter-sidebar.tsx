"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { formatFacetCount } from "@/lib/organizers/format-facet-count"
import { cn } from "@/lib/utils"

export type FacetCountItem = { value: string; label: string; count: number }
export type FacetBucketItem = { id: string; label: string; count: number }

export type OrganizerFacets = {
  cities: FacetCountItem[]
  countries: FacetCountItem[]
  eventBuckets: FacetBucketItem[]
  followerBuckets: FacetBucketItem[]
}

const PREVIEW_LIMIT = 4

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold text-[#0f2744]">{title}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open ? children : null}
    </section>
  )
}

function CheckboxFilterRow({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  count?: number
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 pr-1 transition-colors hover:bg-gray-50/80"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="border-gray-300" />
      <span className="min-w-0 flex-1 text-sm text-gray-700">{label}</span>
      {count !== undefined ? (
        <span className="shrink-0 text-sm font-medium tabular-nums text-[#004A96]">
          {formatFacetCount(count)}
        </span>
      ) : null}
    </label>
  )
}

function FacetListWithMore({
  items,
  selected,
  onToggle,
  idPrefix,
}: {
  items: FacetCountItem[]
  selected: string[]
  onToggle: (value: string) => void
  idPrefix: string
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, PREVIEW_LIMIT)
  const hasMore = items.length > PREVIEW_LIMIT

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No options in directory yet.</p>
  }

  return (
    <>
      <div className="space-y-0.5">
        {visible.map((item) => (
          <CheckboxFilterRow
            key={item.value}
            id={`${idPrefix}-${item.value}`}
            label={item.label}
            count={item.count}
            checked={selected.includes(item.value)}
            onCheckedChange={() => onToggle(item.value)}
          />
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          {expanded ? "Show less" : "View More"}
        </button>
      ) : null}
    </>
  )
}

export interface OrganizersFilterSidebarProps {
  facets: OrganizerFacets
  selectedCities: string[]
  selectedCountries: string[]
  selectedEventBuckets: string[]
  selectedFollowerBuckets: string[]
  onToggleCity: (value: string) => void
  onToggleCountry: (value: string) => void
  onToggleEventBucket: (id: string) => void
  onToggleFollowerBucket: (id: string) => void
  /** Pin visitor country at top of country list (e.g. India). */
  preferredCountryLabel?: string | null
  className?: string
}

export function OrganizersFilterSidebar({
  facets,
  selectedCities,
  selectedCountries,
  selectedEventBuckets,
  selectedFollowerBuckets,
  onToggleCity,
  onToggleCountry,
  onToggleEventBucket,
  onToggleFollowerBucket,
  preferredCountryLabel,
  className,
}: OrganizersFilterSidebarProps) {
  const [locationQuery, setLocationQuery] = useState("")

  const filteredCities = useMemo(() => {
    const q = locationQuery.trim().toLowerCase()
    if (!q) return facets.cities
    return facets.cities.filter(
      (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q),
    )
  }, [facets.cities, locationQuery])

  const filteredCountries = useMemo(() => {
    const q = locationQuery.trim().toLowerCase()
    let list = facets.countries
    if (q) {
      list = list.filter(
        (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q),
      )
    }
    const preferred = preferredCountryLabel?.trim().toLowerCase()
    if (!preferred) return list
    const pin = list.filter(
      (c) =>
        c.label.toLowerCase() === preferred ||
        c.value.toLowerCase() === preferred ||
        c.label.toLowerCase().includes(preferred),
    )
    const rest = list.filter((c) => !pin.includes(c))
    return [...pin, ...rest]
  }, [facets.countries, locationQuery, preferredCountryLabel])

  return (
    <div className={cn("text-left", className)}>
      <FilterSection title="Location">
        <FacetListWithMore
          items={filteredCities}
          selected={selectedCities}
          onToggle={onToggleCity}
          idPrefix="org-city"
        />
        <div className="relative my-4">
          <Input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Choose a location"
            className="h-9 pr-9 text-sm"
          />
          <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <FacetListWithMore
          items={filteredCountries}
          selected={selectedCountries}
          onToggle={onToggleCountry}
          idPrefix="org-country"
        />
      </FilterSection>

      <FilterSection title="Events" defaultOpen>
        <div className="space-y-0.5">
          {facets.eventBuckets.map((bucket) => (
            <CheckboxFilterRow
              key={bucket.id}
              id={`org-events-${bucket.id}`}
              label={bucket.label}
              count={bucket.count}
              checked={selectedEventBuckets.includes(bucket.id)}
              onCheckedChange={() => onToggleEventBucket(bucket.id)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Followers" defaultOpen>
        <div className="space-y-0.5">
          {facets.followerBuckets.map((bucket) => (
            <CheckboxFilterRow
              key={bucket.id}
              id={`org-followers-${bucket.id}`}
              label={bucket.label}
              count={bucket.count}
              checked={selectedFollowerBuckets.includes(bucket.id)}
              onCheckedChange={() => onToggleFollowerBucket(bucket.id)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
