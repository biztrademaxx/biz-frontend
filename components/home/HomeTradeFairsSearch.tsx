"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Globe, MapPin, Search } from "lucide-react"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,



  
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_COUNTRIES = "__all__"
const ALL_CITIES = "__all__"

function citiesForCountry(countryCode: string, max = 200): string[] {
  if (!countryCode) return []
  const names = new Set<string>()
  for (const state of getStateOptions(countryCode)) {
    for (const city of getCityOptions(countryCode, state.code)) {
      names.add(city.name)
      if (names.size >= max) break
    }
    if (names.size >= max) break
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b))
}

export default function HomeTradeFairsSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [countryCode, setCountryCode] = useState(ALL_COUNTRIES)
  const [city, setCity] = useState(ALL_CITIES)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const countryOptions = useMemo(() => getCountryOptions(), [])
  const cityOptions = useMemo(
    () => (countryCode === ALL_COUNTRIES ? [] : citiesForCountry(countryCode)),
    [countryCode],
  )

  const selectedCountryName =
    countryCode === ALL_COUNTRIES
      ? ""
      : countryOptions.find((c) => c.code === countryCode)?.name ?? ""

  const handleSearch = () => {
    const params = new URLSearchParams()
    const trimmed = query.trim()
    if (trimmed) params.set("search", trimmed)
    if (selectedCountryName) params.set("country", selectedCountryName)
    if (city !== ALL_CITIES && city.trim()) params.set("location", city.trim())
    if (fromDate) params.set("from", fromDate)
    if (toDate) params.set("to", toDate)
    const qs = params.toString()
    router.push(qs ? `/event?${qs}` : "/event")
  }

  return (
    <section
      aria-label="Find trade fairs worldwide"
      className="
    mt-6
    w-full
    min-w-0
    rounded-2xl
    border
    border-white/70
    bg-white/95
    p-5
    transition-all
    duration-300
    shadow-[0_12px_35px_rgba(26,9,63,0.08),0_4px_12px_rgba(0,0,0,0.04)]
    hover:shadow-[0_22px_55px_rgba(26,9,63,0.12),0_8px_20px_rgba(0,0,0,0.06)]
  "
    >
      <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-center sm:justify-between mt-5">
        <h2 className="text-base font-bold text-[#004A96] sm:text-lg md:text-xl">Find Trade Fairs Worldwide</h2>
        <p className="text-xs text-slate-500 sm:text-sm">Every industry. Every city. One search.</p>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search events and summits..."
            className="h-11 rounded-lg border-slate-200 pl-10 pr-3 text-sm shadow-[0_0_12px_rgba(0,0,0,0.1)] focus-visible:ring-[#004A96]/30"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          className="h-11 w-full shrink-0 rounded-lg bg-[#004A96] px-6 text-sm font-semibold text-white hover:bg-[#003d7a] sm:w-auto"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-center">
        <Select
          value={countryCode}
          onValueChange={(value) => {
            setCountryCode(value)
            setCity(ALL_CITIES)
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white text-sm shadow-none">
            <div className="flex min-w-0 items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-slate-400" />
              <SelectValue placeholder="All Countries" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_COUNTRIES}>All Countries</SelectItem>
            {countryOptions.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={city}
          onValueChange={setCity}
          disabled={countryCode === ALL_COUNTRIES}
        >
          <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white text-sm shadow-none disabled:opacity-60">
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <SelectValue
                placeholder={countryCode === ALL_COUNTRIES ? "Select country first" : "All Cities"}
              />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CITIES}>All Cities</SelectItem>
            {cityOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-1">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              From
            </span>
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {/* <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-11 w-full rounded-lg border-slate-200 pl-12 pr-10 text-sm shadow-none [&::-webkit-calendar-picker-indicator]:opacity-0"
            /> */}
            <Input
  type="date"
  value={fromDate}
  min="2000-01-01"
  max="2099-12-31"
  onChange={(e) => {
    const val = e.target.value
    if (!val || val.split("-")[0]?.length <= 4) setFromDate(val)
  }}
  className="h-11 w-full rounded-lg border-slate-200 pl-12 pr-10 text-sm shadow-none [&::-webkit-calendar-picker-indicator]:opacity-0"
/>
          </div>
          <span className="hidden shrink-0 text-slate-400 sm:inline">–</span>
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              To
            </span>
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {/* <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="h-11 w-full rounded-lg border-slate-200 pl-10 pr-10 text-sm shadow-none [&::-webkit-calendar-picker-indicator]:opacity-0"
            /> */}
            <Input
  type="date"
  value={toDate}
  min={fromDate || "2000-01-01"}
  max="2099-12-31"
  onChange={(e) => {
    const val = e.target.value
    if (!val || val.split("-")[0]?.length <= 4) setToDate(val)
  }}
  className="h-11 w-full rounded-lg border-slate-200 pl-10 pr-10 text-sm shadow-none [&::-webkit-calendar-picker-indicator]:opacity-0"
/>
          </div>
        </div>
      </div>
    </section>
  )
}
