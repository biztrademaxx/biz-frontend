"use client"

import type React from "react"
import { Calendar, Clock, Ticket, Users } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"

interface Event {
  id: string
  title: string
  subtitle?: string
  subTitle?: string
  address?: string
  startDate?: string
  endDate?: string
  postponedReason?: string
  images: string[]
  videos?: string[]
  description: string
  shortDescription?: string
  leads: string[]
  ticketTypes: Array<{
    name: string
    price: number
    currency?: string
  }>
  location: {
    city: string
    venue: string
    address: string
    country?: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  followers?: number
  currentAttendees?: number
  maxAttendees?: number
}

interface Banner {
  id: string
  title: string
  imageUrl: string
  publicId: string
  page: string
  position: string
  isActive: boolean
  link?: string
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

interface EventHeroProps {
  event: Event
}

export default function EventHero({ event }: EventHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [images, setImages] = useState<string[]>(event.images || [])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [heroBannersLoading, setHeroBannersLoading] = useState(false)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  const [bannerSliderRef, bannerInstanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentBannerIndex(slider.track.details.rel)
    },
  })

  // Fetch hero banners from backend (no Next.js app/api)
  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    async function fetchHeroBanners() {
      try {
        setHeroBannersLoading(true)
        const data = await apiFetch<Banner[]>(`/api/content/banners?page=event-detail&position=hero`, { auth: false })
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        const activeHeroBanners = list.filter((banner: Banner) => banner.isActive !== false)
        setHeroBanners(activeHeroBanners)
        if (activeHeroBanners.length > 1) {
          intervalId = setInterval(() => {
            bannerInstanceRef.current?.next()
          }, 8000)
        }
      } catch (error) {
        if (!cancelled) console.error("Error fetching hero banners:", error)
      } finally {
        if (!cancelled) setHeroBannersLoading(false)
      }
    }

    fetchHeroBanners()
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [bannerInstanceRef])

  useEffect(() => {
    const slider = instanceRef.current
    if (!slider) return
    const interval = setInterval(() => {
      slider.next()
    }, 10000) // Increased from 3000ms to 6000ms (6 seconds)
    return () => clearInterval(interval)
  }, [instanceRef])

  useEffect(() => {
    setImages(event.images || [])
  }, [event.images])

  // Get ticket price display
  const getTicketPriceDisplay = () => formatPublicTicketPriceLine(event.ticketTypes)

  // Get followers count - REMOVED the fallback to 0
  const getFollowersCount = () => {
    // Priority: 1. event.followers, 2. event.leads.length, 3. event.currentAttendees
    if (event.followers && event.followers > 0) {
      return event.followers
    }
    if (event.leads && event.leads.length > 0) {
      return event.leads.length
    }
    if (event.currentAttendees && event.currentAttendees > 0) {
      return event.currentAttendees
    }
    return null // Return null instead of 0
  }

  // Format date range
  const formatDateRange = () => {
    if (!event.startDate || !event.endDate) {
      return "Date to be announced"
    }

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    const isSameDay = startDate.toDateString() === endDate.toDateString()
    
    if (isSameDay) {
      return startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } else {
      return `${startDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })} - ${endDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`
    }
  }

  // Format time range
  const formatTimeRange = () => {
    if (!event.startDate || !event.endDate) {
      return "Time to be announced"
    }

    const startTime = new Date(event.startDate).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Force Indian time zone
    })

    const endTime = new Date(event.endDate).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Force Indian time zone
    })

    return `${startTime} – ${endTime}`
  }

  const followersCount = getFollowersCount()
  const eventSubtitle = (event.subTitle || event.subtitle || "").trim() || event.title

  // Handle banner click tracking
  const handleBannerClick = async (bannerId: string) => {
    try {
      await apiFetch(`/api/analytics/banner-click`, {
        method: "POST",
        auth: false,
        body: {
          bannerId,
          eventId: event.id,
          timestamp: new Date().toISOString(),
          path: typeof window !== "undefined" ? window.location.pathname : "",
        },
      })
    } catch {
      /* Backend may not implement this route yet */
    }
  }

  return (
    <div>
      {/* SIMPLIFIED Dynamic Hero Banner Section - Only image */}
      <div className="relative h-[200px] md:h-[300px] lg:h-[200px] overflow-hidden">
        {heroBannersLoading ? (
          <div className="hero-card-shimmer h-full w-full" aria-busy="true" aria-label="Loading banner" />
        ) : heroBanners.length > 0 ? (
          <>
            {/* Banner Slider - Only images without title */}
            <div ref={bannerSliderRef} className="keen-slider h-full w-full">
              {heroBanners.map((banner, index) => (
                <div key={banner.id} className="keen-slider__slide relative h-full w-full">
                  <Link 
                    href={banner.link || "#"}
                    onClick={() => handleBannerClick(banner.id)}
                    target={banner.link?.startsWith('http') ? '_blank' : '_self'}
                    className="block w-full h-full"
                  >
                    <Image
                      src={banner.imageUrl || "/city/c4.jpg"}
                      alt={banner.title}
                      fill
                      className="h-full w-full object-cover"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* REMOVED title overlay */}
                  </Link>
                </div>
              ))}
            </div>

            {/* Banner indicators if multiple banners */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentBannerIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => bannerInstanceRef.current?.moveToIdx(idx)}
                  />
                ))}
              </div>
            )}
            
            {/* REMOVED Sponsored badge */}
          </>
        ) : (
          // Fallback to default banner if no banners found
          <div className="relative w-full h-full">
            <Image
            src={
              event.images?.filter(
                (img) =>
                  typeof img === "string" &&
                  img.trim() !== "" &&
                  img !== "null" &&
                  img !== "undefined"
              )[0] || "/city/c4.jpg"
            }
            alt={event.title}
            fill
            className="h-full w-full object-cover"
            priority
          />
          
           {/* 🔥 Blur Layer */}
           <div className="absolute inset-0 backdrop-blur-[6px]" />
          
          {/* 🔥 Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          
        )}
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-7xl mx-auto bg-white overflow-hidden shadow-md flex flex-col md:flex-row items-stretch mt-[-150px] md:mt-[-120px] z-10 left-1/2 lg:left-160 -translate-x-1/2 rounded-sm">
        {/* Slider Section */}
        <div className="md:w-2/3 w-full min-h-[280px] md:min-h-[320px] relative">
          <div ref={sliderRef} className="keen-slider h-full w-full">
            {images.length > 0 ? (
              <>
                {images.map((img, index) => (
                  <div key={`image-${index}`} className="keen-slider__slide relative h-full w-full">
                    <Image
                      src={img || "/city/c4.jpg"}
                      alt={`${event.title} Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}

                {event.videos?.map((vid: string, index: number) => (
                  <div key={`video-${index}`} className="keen-slider__slide relative h-full w-full">
                    <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                      <source src={vid} type="video/mp4" />
                    </video>
                  </div>
                ))}
              </>
            ) : (
              <div className="keen-slider__slide relative h-full w-full">
                <Image 
                  src="/herosection-images/test.jpeg" 
                  alt="Default Image" 
                  fill 
                  className="object-cover" 
                  priority
                />
              </div>
            )}
          </div>

          {/* Slide Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="md:w-1/3 w-full bg-white p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black leading-snug line-clamp-2">
            {eventSubtitle}
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-gray-800 py-2">
            {/* Date */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
              <p className="leading-tight">{formatDateRange()}</p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
              <span className="leading-tight">{formatTimeRange()}</span>
            </div>

            {/* Ticket Price */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
              <span className="leading-tight font-medium">
                {getTicketPriceDisplay()}
              </span>
            </div>

            {/* Followers - ONLY SHOW IF WE HAVE FOLLOWERS */}
            {followersCount !== null && followersCount > 0 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <span className="leading-tight">
                  {followersCount.toLocaleString()} {followersCount === 1 ? 'Follower' : 'Followers'}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge if postponed */}
          {event.postponedReason && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Postponed: {event.postponedReason}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}