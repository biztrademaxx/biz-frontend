"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { EventImage } from "@/lib/data/events"

interface EventImageGalleryProps {
  images: EventImage[]
}

export default function EventImageGallery({ images }: EventImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const mainImage = images.find((img) => img.type === "main")
  const galleryImages = images.filter((img) => img.type === "gallery")
  const allImages = [mainImage, ...galleryImages].filter(Boolean)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (allImages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        {/* Main Image Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {allImages.slice(currentImageIndex, currentImageIndex + 3).map((image, index) => (
            <div key={image?.id || index} className="relative group overflow-hidden rounded-lg">
              <Image
                src={image?.url || "/placeholder.svg?height=200&width=300&text=Event+Image"}
                alt={image?.alt || "Event image"}
                width={300}
                height={200}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 3 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {allImages.length > 3 && (
          <div className="flex justify-center space-x-2 pb-4">
            {Array.from({ length: Math.ceil(allImages.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index * 3)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentImageIndex / 3) === index ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
