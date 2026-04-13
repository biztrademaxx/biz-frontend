// app/components/HorizontalScroller.tsx
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface HorizontalScrollerProps {
  children: React.ReactNode
}

export default function HorizontalScroller({ children }: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = direction === "left" ? -320 : 320
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-8 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  )
}
