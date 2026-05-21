"use client"

/**
 * Legacy manual city picker (dropdown). Kept for reference — not mounted in the navbar.
 * Home location is IP/VPN auto-detect only; see `NavbarCountryLabel.tsx`.
 */

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Loader2, MapPin, Navigation, X } from "lucide-react"
import { useHomeLocation } from "@/contexts/home-location-context"

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Dubai",
  "Singapore",
  "London",
  "New York",
]

export default function LocationPicker({ className = "" }: { className?: string }) {
  const { city, isLoading, isDetecting, setCity, clearCity, detectFromBrowser } = useHomeLocation()
  const [open, setOpen] = useState(false)
  const [customCity, setCustomCity] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const label = city || "Your location"

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-[min(42vw,200px)] items-center gap-1 rounded-md px-1 py-1 text-sm text-[#002C71] hover:bg-gray-100 lg:max-w-[220px]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Choose your city for local events"
      >
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate font-medium">{isLoading ? "Location…" : label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-[120] mt-2 w-[min(92vw,320px)] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
          role="dialog"
          aria-label="Location picker"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your city</p>
              <p className="text-sm text-gray-600">Show events, venues, and more near you on the home page.</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={isDetecting}
            onClick={() => {
              void detectFromBrowser().then(() => setOpen(false))
            }}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#002C71]/20 bg-[#002C71]/5 px-3 py-2 text-sm font-medium text-[#002C71] hover:bg-[#002C71]/10 disabled:opacity-60"
          >
            {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {isDetecting ? "Detecting…" : "Use my current location"}
          </button>

          <form
            className="mb-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const c = customCity.trim()
              if (!c) return
              void setCity(c).then(() => {
                setCustomCity("")
                setOpen(false)
              })
            }}
          >
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Enter city name"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#002C71] focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-[#002C71] px-3 py-2 text-sm font-medium text-white hover:bg-[#001a48]"
            >
              Set
            </button>
          </form>

          <p className="mb-1.5 text-xs font-semibold text-gray-500">Popular cities</p>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  void setCity(c).then(() => setOpen(false))
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  city === c
                    ? "border-[#002C71] bg-[#002C71] text-white"
                    : "border-gray-200 text-gray-700 hover:border-[#002C71]/40 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {city ? (
            <button
              type="button"
              className="mt-3 w-full text-center text-xs text-gray-500 underline hover:text-gray-800"
              onClick={() => {
                void clearCity().then(() => setOpen(false))
              }}
            >
              Clear location (show all cities)
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
