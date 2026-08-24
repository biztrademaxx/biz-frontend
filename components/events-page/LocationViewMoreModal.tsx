"use client"

import { useEffect, useMemo, useState } from "react"
import { Crosshair, Search, X } from "lucide-react"
import type { NameCount } from "./listing-types"

type LocationTab = "cities" | "countries"

const LETTER_COLORS = [
  "#E85D4C",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
]

function letterColor(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0)
  if (code < 65 || code > 90) return "#64748B"
  return LETTER_COLORS[(code - 65) % LETTER_COLORS.length]
}

function groupByLetter(items: NameCount[]): Array<{ letter: string; items: NameCount[] }> {
  const map = new Map<string, NameCount[]>()
  for (const item of items) {
    const letter = (item.name.trim()[0] || "#").toUpperCase()
    const key = /[A-Z]/.test(letter) ? letter : "#"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, group]) => ({
      letter,
      items: group.sort((x, y) => x.name.localeCompare(y.name)),
    }))
}

export type LocationViewMoreModalProps = {
  open: boolean
  onClose: () => void
  cities: NameCount[]
  countries: NameCount[]
  selectedLocation: string
  selectedCountry: string
  onSelectCity: (name: string) => void
  onSelectCountry: (name: string) => void
  onNearYou?: () => void
  nearYouLoading?: boolean
}

function LocationChip({
  item,
  checked,
  onToggle,
}: {
  item: NameCount
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
        checked ? "bg-[#E8F1FF] ring-1 ring-[#3B82F6]/30" : "bg-[#F5F7FA] hover:bg-[#EEF2F7]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="h-4 w-4 shrink-0 accent-[#2563EB] pointer-events-none"
        tabIndex={-1}
        aria-hidden
      />
      <span className="min-w-0 truncate text-sm font-medium text-[#1E3A5F]">
        {item.name}
        <span className="font-normal text-[#5B7A9D]"> ({item.count.toLocaleString()})</span>
      </span>
    </button>
  )
}

export function LocationViewMoreModal({
  open,
  onClose,
  cities,
  countries,
  selectedLocation,
  selectedCountry,
  onSelectCity,
  onSelectCountry,
  onNearYou,
  nearYouLoading = false,
}: LocationViewMoreModalProps) {
  const [tab, setTab] = useState<LocationTab>("countries")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) return
    setTab("countries")
    setQuery("")
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const source = tab === "cities" ? cities : countries
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return source
    return source.filter((item) => item.name.toLowerCase().includes(q))
  }, [source, q])

  const topItems = useMemo(() => filtered.slice(0, 12), [filtered])
  const azGroups = useMemo(() => groupByLetter(filtered), [filtered])

  if (!open) return null

  const listHeading = tab === "cities" ? "List of Cities A - Z" : "List of Countries A - Z"
  const topHeading = tab === "cities" ? "Top Cities" : "Top Countries"

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/45 p-3 sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Browse locations"
        className="relative my-4 w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-3 pt-4 sm:px-6">
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B7A9D]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Place / City / Country"
                className="h-11 w-full rounded-full border border-gray-200 bg-[#F8FAFC] pl-10 pr-[7.5rem] text-sm text-[#1E3A5F] outline-none ring-[#3B82F6]/30 placeholder:text-[#8AA0B8] focus:border-[#93C5FD] focus:bg-white focus:ring-2"
                autoFocus
              />
              <button
                type="button"
                disabled={nearYouLoading || !onNearYou}
                onClick={() => onNearYou?.()}
                className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#2563EB] hover:bg-blue-50 disabled:opacity-50"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {nearYouLoading ? "…" : "Near You"}
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-b border-transparent px-1">
            {(
              [
                { id: "cities" as const, label: "Top Cities" },
                { id: "countries" as const, label: "Top Countries" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative pb-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? "text-[#1E3A5F]" : "text-[#8AA0B8] hover:text-[#5B7A9D]"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#2563EB]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[min(72vh,640px)] overflow-y-auto px-4 py-4 sm:px-6">
          <p className="mb-3 text-sm font-semibold text-[#1E3A5F]">{topHeading}</p>
          {topItems.length === 0 ? (
            <p className="mb-6 text-sm text-gray-500">No matches found.</p>
          ) : (
            <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {topItems.map((item) => {
                const checked =
                  tab === "cities"
                    ? selectedLocation.toLowerCase() === item.name.toLowerCase()
                    : selectedCountry.toLowerCase() === item.name.toLowerCase()
                return (
                  <LocationChip
                    key={`${tab}-top-${item.name}`}
                    item={item}
                    checked={checked}
                    onToggle={() => {
                      if (tab === "cities") {
                        onSelectCity(
                          selectedLocation.toLowerCase() === item.name.toLowerCase() ? "" : item.name
                        )
                      } else {
                        onSelectCountry(
                          selectedCountry.toLowerCase() === item.name.toLowerCase() ? "" : item.name
                        )
                      }
                    }}
                  />
                )
              })}
            </div>
          )}

          <p className="mb-3 text-sm font-semibold text-[#1E3A5F]">{listHeading}</p>
          <div className="space-y-5">
            {azGroups.map((group) => (
              <div key={group.letter}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="text-base font-bold leading-none"
                    style={{ color: letterColor(group.letter) }}
                  >
                    {group.letter}
                  </span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const checked =
                      tab === "cities"
                        ? selectedLocation.toLowerCase() === item.name.toLowerCase()
                        : selectedCountry.toLowerCase() === item.name.toLowerCase()
                    return (
                      <LocationChip
                        key={`${tab}-az-${item.name}`}
                        item={item}
                        checked={checked}
                        onToggle={() => {
                          if (tab === "cities") {
                            onSelectCity(
                              selectedLocation.toLowerCase() === item.name.toLowerCase()
                                ? ""
                                : item.name
                            )
                          } else {
                            onSelectCountry(
                              selectedCountry.toLowerCase() === item.name.toLowerCase()
                                ? ""
                                : item.name
                            )
                          }
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
