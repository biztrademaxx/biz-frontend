"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import FeaturedHotelCard, { type FeaturedHotel } from "./featured-hotel-card"

type ApiHotel = {
  id: string
  name: string
  imageUrl?: string
  rating?: number
  reviews?: number
  locationNote?: string
  amenities?: string[]
  price?: number
  priceNote?: string
  dealTag?: string
  discountBadge?: string
}

export default function FeaturedHotels({ eventId }: { eventId?: string }) {
  const [hotels, setHotels] = useState<FeaturedHotel[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        const qs = eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""
        const raw = await apiFetch<unknown>(`/api/featured-hotels${qs}`, { auth: false })
        const apiRows: ApiHotel[] = Array.isArray(raw)
          ? (raw as ApiHotel[])
          : raw && typeof raw === "object" && Array.isArray((raw as { hotels?: ApiHotel[] }).hotels)
            ? (raw as { hotels: ApiHotel[] }).hotels
            : []

        const mapped: FeaturedHotel[] = apiRows.map((h, i) => ({
          id: h.id || `api-${i}`,
          name: h.name ?? "Hotel",
          imageUrl: h.imageUrl || "/city/c2.jpg",
          rating: typeof h.rating === "number" ? h.rating : 4.8,
          reviews: typeof h.reviews === "number" ? h.reviews : 1257,
          locationNote: h.locationNote || "Excellent Location",
          amenities: h.amenities?.length ? h.amenities : ["wifi", "food", "parking"],
          price: typeof h.price === "number" ? h.price : 48,
          priceNote: h.priceNote || "28% less than usual",
          dealTag: h.dealTag || "Deal",
          discountBadge: h.discountBadge || "20% OFF",
        }))

        if (!cancelled) {
          setHotels(mapped.length ? mapped : null)
        }
      } catch {
        if (!cancelled) setHotels(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [eventId])

  // Demo fallback when no backend data
  const demo: FeaturedHotel[] = [
    {
      id: "demo-1",
      name: "Kanazawa Grand Inn Hotel",
      imageUrl: "/city/c2.jpg",
      rating: 4.8,
      reviews: 1257,
      locationNote: "Excellent Location",
      amenities: ["wifi", "food", "parking"],
      price: 48,
      priceNote: "28% less than usual",
      dealTag: "Deal",
      discountBadge: "20% OFF",
    },
  ]

  const list = hotels && hotels.length > 0 ? hotels : demo

  if (loading && !hotels) {
    return (
      <div className="space-y-3">
        <div className="w-full bg-white border border-gray-200 rounded-lg p-3 animate-pulse">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="md:w-1/3 h-32 bg-gray-200 rounded"></div>
            <div className="md:w-2/3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-1">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {list.map((h) => (
        <FeaturedHotelCard key={h.id} hotel={h} />
      ))}
    </div>
  )
}