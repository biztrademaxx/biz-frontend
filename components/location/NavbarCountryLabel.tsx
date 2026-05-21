"use client"

import { MapPin } from "lucide-react"
import { useHomeLocation } from "@/contexts/home-location-context"

/** Navbar: detected country from IP/VPN (read-only, beside Explore). */
export default function NavbarCountryLabel({ className = "" }: { className?: string }) {
  const { countryName, isLoading } = useHomeLocation()

  if (!isLoading && !countryName) return null

  return (
    <span
      className={`inline-flex max-w-[min(42vw,200px)] shrink-0 items-center gap-1 px-1 py-1 text-sm text-[#002C71] lg:max-w-[220px] ${className}`}
      aria-label={countryName ? `Showing content for ${countryName}` : "Detecting location"}
    >
      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate font-medium">
        {isLoading ? "Location…" : countryName ?? ""}
      </span>
    </span>
  )
}
