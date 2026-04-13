"use client"

import Image from "next/image"
import { Star, Wifi, UtensilsCrossed, Car, Heart, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export type FeaturedHotel = {
  id: string
  name: string
  imageUrl: string
  rating: number
  reviews: number
  locationNote?: string
  amenities?: string[] // ["wifi","food","parking"]
  price?: number
  priceNote?: string
  dealTag?: string
  discountBadge?: string
}

export default function FeaturedHotelCard({ hotel }: { hotel: FeaturedHotel }) {
  const {
    name,
    imageUrl,
    rating,
    reviews,
    locationNote = "Excellent Location",
    amenities = ["wifi", "food", "parking"],
    price = 48,
    priceNote = "28% less than usual",
    dealTag = "Deal",
    discountBadge = "20% OFF",
  } = hotel

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image Section - Fixed width */}
        <div className="md:w-1/3 relative h-48 md:h-32">
          <Image
            src={imageUrl || "/city/c2.jpg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {discountBadge && (
            <span className="absolute bottom-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
              {discountBadge}
            </span>
          )}
        </div>

        {/* Content Section - Flexible width with proper constraints */}
        <div className="md:w-2/3 p-3 md:p-4">
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                  {name}
                </h3>
                
                {/* Rating and Location */}
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span>({reviews.toLocaleString()})</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{locationNote}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  aria-label="Add to favorites"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 p-1 hover:bg-gray-50"
                >
                  <Heart className="h-3 w-3 text-gray-600" />
                </button>
                <button
                  aria-label="Save"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 p-1 hover:bg-gray-50"
                >
                  <Bookmark className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1 mb-3">
              {amenities.includes("wifi") && (
                <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                  <Wifi className="h-3 w-3" />
                  WiFi
                </span>
              )}
              {amenities.includes("food") && (
                <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                  <UtensilsCrossed className="h-3 w-3" />
                  Food
                </span>
              )}
              {amenities.includes("parking") && (
                <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                  <Car className="h-3 w-3" />
                  Parking
                </span>
              )}
            </div>

            {/* Price and Booking */}
            <div className="flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {dealTag}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">${price}</span>
                  <span className="text-xs text-gray-500 hidden sm:inline">{priceNote}</span>
                </div>
              </div>
              
              <Button 
                className="rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 text-xs font-medium whitespace-nowrap flex-shrink-0"
                size="sm"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}