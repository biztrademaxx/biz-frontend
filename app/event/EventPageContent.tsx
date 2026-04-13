"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Mail, MapPin, Clock, IndianRupee, Wifi, Utensils, Car, Tag, Trash2, Calendar, Users, Edit2, Plus, Share2, Bookmark, FileText, ExternalLink } from "lucide-react"
import EventHero from "@/components/event-hero"
import EventImageGallery from "@/components/event-image-gallery"
import { useEffect, useState } from "react"
import ExhibitorsTab from "./[id]/exhibitors-tab"
import SpeakersTab from "./[id]/speakers-tab"
import AddReviewCard from "@/components/AddReviewCard"
import Link from "next/link"
import EventFollowers from "@/components/EventFollowers"
import {
  fetchEventLeadsThroughNext,
  interestFlagsFromLeads,
  persistInterestLocalStorage,
  postEventLeadThroughNext,
  readInterestLocalStorage,
} from "@/lib/event-leads-client"
import { apiFetch, getCurrentUserEmail, getCurrentUserId, isAuthenticated, getCurrentUserRole } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"

interface PlaceToVisit {
  name: string;
  category: string;
  image: string;
}

interface TicketType {
  name: string
  price: number
  currency: string
}

interface SpaceCost {
  type: string
  price: number
  currency: string
  description?: string
  minArea?: number
  unit?: string
  pricePerSqm?: number
}

interface EventPageContentProps {
  event: any
  session: any
  router: any
  toast: any
}

// Helper function to get company initials
const getCompanyInitials = (companyName?: string): string => {
  if (!companyName || companyName.trim() === "") return "EV";
  
  // Remove common suffixes and split by spaces
  const cleanedName = companyName
    .replace(/\b(Inc|LLC|Ltd|GmbH|Corp|Co)\b\.?/gi, '')
    .trim();
  
  // Get first two letters from first two words
  const words = cleanedName.split(/\s+/);
  
  if (words.length === 1) {
    // If only one word, take first two characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Take first character from first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

export default function EventPageContent({ event, session: _session, router, toast }: EventPageContentProps) {
  // JWT auth: use token-based auth so "express interest" / save work when logged in with JWT
  const userId = getCurrentUserId()
  const isLoggedIn = isAuthenticated()

  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [averageRating, setAverageRating] = useState(event.averageRating || 0)
  const [totalReviews, setTotalReviews] = useState(event.reviewCount || 0)
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [spaceCosts, setSpaceCosts] = useState<SpaceCost[]>([])
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [interestVisit, setInterestVisit] = useState(false)
  const [interestExhibit, setInterestExhibit] = useState(false)
  const [interestSubmitting, setInterestSubmitting] = useState<"visit" | "exhibit" | null>(null)

  useEffect(() => {
    setAverageRating(event.averageRating || 0)
    setTotalReviews(event.reviewCount || 0)
    if (event.id) fetchSpaceCosts(event.id)
    loadFeaturedHotels()
    if (event?.id && userId) {
      checkIfSaved()
      checkUserRole()
      checkIfOrganizer()
    }
  }, [event.id, userId])

  useEffect(() => {
    if (!event?.id || !userId) {
      setInterestVisit(false)
      setInterestExhibit(false)
      return
    }
    let cancelled = false
    const email = getCurrentUserEmail()
    ;(async () => {
      const { ok, data } = await fetchEventLeadsThroughNext(event.id)
      if (cancelled) return
      let visiting = false
      let exhibiting = false
      if (ok && data != null) {
        const flags = interestFlagsFromLeads(data, userId, email)
        visiting = flags.visiting
        exhibiting = flags.exhibiting
      }
      const ls = readInterestLocalStorage(event.id)
      setInterestVisit(visiting || ls.visiting)
      setInterestExhibit(exhibiting || ls.exhibiting)
    })()
    return () => {
      cancelled = true
    }
  }, [event?.id, userId])

  const getPlacesToVisit = (city: string): PlaceToVisit[] => {
    const placesByCity: Record<string, PlaceToVisit[]> = {
      "Paris": [
        { name: "Eiffel Tower", category: "Historical places", image: "/places/ifal.jpeg" },
        { name: "Louvre Museum", category: "Museum", image: "/places/ifal.jpeg" },
        { name: "Notre-Dame Cathedral", category: "Historical places", image: "/places/ifal.jpeg" }
      ],
      "Delhi": [
        { name: "Taj Mahal", category: "Historical places", image: "/places/ifal.jpeg" },
        { name: "Red Fort", category: "Historical places", image: "/places/ifal.jpeg" },
        { name: "Qutub Minar", category: "Historical places", image: "/places/ifal.jpeg" }
      ],
      "Sydney": [
        { name: "Sydney Opera House", category: "Beach", image: "/places/ifal.jpeg" },
        { name: "Bondi Beach", category: "Beach", image: "/places/ifal.jpeg" },
        { name: "Harbour Bridge", category: "Landmark", image: "/places/ifal.jpeg" }
      ],
      "New York": [
        { name: "Statue of Liberty", category: "Historical places", image: "/places/ifal.jpeg" },
        { name: "Central Park", category: "Park", image: "/places/ifal.jpeg" },
        { name: "Times Square", category: "Entertainment", image: "/places/ifal.jpeg" }
      ],
      "Tokyo": [
        { name: "Tokyo Tower", category: "Landmark", image: "/places/ifal.jpeg" },
        { name: "Senso-ji Temple", category: "Temple", image: "/places/ifal.jpeg" },
        { name: "Shibuya Crossing", category: "Landmark", image: "/places/ifal.jpeg" }
      ],
      "London": [
        { name: "Big Ben", category: "Historical places", image: "/places/ifal.jpeg" },
        { name: "London Eye", category: "Entertainment", image: "/places/ifal.jpeg" },
        { name: "Tower Bridge", category: "Historical places", image: "/places/ifal.jpeg" }
      ]
    };

    return placesByCity[city] || [
      { name: "Eiffel Tower", category: "Historical places", image: "/places/ifal.jpeg" },
      { name: "Taj Mahal", category: "Historical places", image: "/places/OIP.jpeg" },
      { name: "Sydney Opera House", category: "Beach", image: "/places/th.jpeg" }
    ];
  };

  const fetchSpaceCosts = async (eventId: string) => {
    try {
      const data = await apiFetch<{ success?: boolean; spaceCosts?: SpaceCost[]; data?: { spaces?: SpaceCost[] } }>(`/api/events/${eventId}/space-costs`, { auth: false })
      const costs = data.spaceCosts ?? data.data?.spaces
      if (data.success !== false && Array.isArray(costs)) {
        setSpaceCosts(costs)
      } else {
        // Set default space costs if none available
        setSpaceCosts([
          { type: "Standard Booth", price: 5000, currency: "₹", description: "3x3 meter space" },
          { type: "Premium Booth", price: 8000, currency: "₹", description: "3x3 meter space with premium location" },
          { type: "VIP Booth", price: 12000, currency: "₹", description: "3x3 meter space with prime location" }
        ])
      }
    } catch (error) {
      console.error("Error fetching space costs:", error)
      // Set default space costs on error
      setSpaceCosts([
        { type: "Standard Booth", price: 5000, currency: "₹", description: "3x3 meter space" },
        { type: "Premium Booth", price: 8000, currency: "₹", description: "3x3 meter space with premium location" },
        { type: "VIP Booth", price: 12000, currency: "₹", description: "3x3 meter space with prime location" }
      ])
    }
  }

  const loadFeaturedHotels = async () => {
    if (!event?.id) return
    setHotelsLoading(true)
    const demo: any[] = [
      {
        id: "demo-1",
        name: "Kanazawa Grand Inn Hotel",
        rating: 4.8,
        reviews: 1257,
        locationNote: "Excellent Location",
        price: 48,
        priceNote: "28%",
        dealLabel: "Deal",
        badgeText: "20% OFF",
        image: "/city/c2.jpg",
        amenities: ["Free Wifi", "Food", "Parking"],
      },
    ]
    try {
      const raw = await apiFetch<unknown>(
        `/api/featured-hotels?eventId=${encodeURIComponent(event.id)}`,
        { auth: false },
      )
      const data = Array.isArray(raw) ? raw : []
      if (data.length > 0) {
        setFeaturedHotels(data)
      } else {
        setFeaturedHotels(demo)
      }
    } catch (err) {
      console.log("[v0] featured hotels fetch failed, using demo:", (err as Error).message)
      setFeaturedHotels(demo)
    } finally {
      setHotelsLoading(false)
    }
  }

  const checkIfSaved = async () => {
    if (!userId) return
    try {
      const data = await apiFetch<{ isSaved?: boolean }>(`/api/events/${event.id}/save`, { auth: true })
      setIsSaved(!!data?.isSaved)
    } catch (error) {
      console.error("Error checking saved status:", error)
    }
  }

  const checkUserRole = () => {
    const role = getCurrentUserRole()
    setUserRole(role || null)
  }

  const checkIfOrganizer = () => {
    if (userId && event?.organizer) {
      const organizerId = event.organizer.id || event.organizer._id
      setIsOrganizer(userId === organizerId)
    } else {
      setIsOrganizer(false)
    }
  }

  const handleSaveEvent = async () => {
    if (!isLoggedIn || !userId) {
      alert("Please log in to save events")
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      const method = isSaved ? "DELETE" : "POST"
      await apiFetch(`/api/events/${event.id}/save`, {
        method,
        auth: true,
      })
      setIsSaved(!isSaved)
      toast({
        title: isSaved ? "Event removed" : "Event saved",
        description: isSaved ? "Event removed from your saved list" : "Event added to your saved events",
      })
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const refreshInterestFromServer = async (): Promise<{
    visiting: boolean
    exhibiting: boolean
  } | null> => {
    if (!event?.id || !userId) return null
    const email = getCurrentUserEmail()
    try {
      const { ok, data } = await fetchEventLeadsThroughNext(event.id)
      let visiting = false
      let exhibiting = false
      if (ok && data != null) {
        const flags = interestFlagsFromLeads(data, userId, email)
        visiting = flags.visiting
        exhibiting = flags.exhibiting
      }
      const ls = readInterestLocalStorage(event.id)
      const v = visiting || ls.visiting
      const e = exhibiting || ls.exhibiting
      setInterestVisit(v)
      setInterestExhibit(e)
      return { visiting: v, exhibiting: e }
    } catch {
      return null
    }
  }

  const handleVisitClick = async () => {
    if (!isLoggedIn || !userId) {
      toast({
        title: "Sign in required",
        description: "Please log in to express interest in this event.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (interestVisit) {
      toast({
        title: "Already visiting",
        description: "You’ve already marked yourself as visiting this event.",
      })
      return
    }

    setInterestSubmitting("visit")
    try {
      const { ok } = await postEventLeadThroughNext(event.id, {
        type: "attendee",
        userId,
        eventId: event.id,
      })
      if (!ok) throw new Error("Lead request failed")
      persistInterestLocalStorage(event.id, "visit")
      setInterestVisit(true)
      toast({
        title: "You’re visiting",
        description: "Your interest has been recorded. The organizer may follow up with details.",
      })
    } catch {
      const flags = await refreshInterestFromServer()
      if (flags?.visiting) {
        toast({
          title: "You’re visiting",
          description: "Your visit interest was already on file.",
        })
      } else {
        toast({
          title: "Couldn’t save",
          description: "Failed to record your interest. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setInterestSubmitting(null)
    }
  }

  const handleExhibitClick = async () => {
    if (!isLoggedIn || !userId) {
      toast({
        title: "Sign in required",
        description: "Please log in to express interest in exhibiting.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (interestExhibit) {
      toast({
        title: "Already exhibiting",
        description: "You’ve already marked interest in exhibiting at this event.",
      })
      return
    }

    setInterestSubmitting("exhibit")
    try {
      const { ok } = await postEventLeadThroughNext(event.id, {
        type: "exhibitor",
        userId,
        eventId: event.id,
      })
      if (!ok) throw new Error("Lead request failed")
      persistInterestLocalStorage(event.id, "exhibit")
      setInterestExhibit(true)
      toast({
        title: "You’re exhibiting",
        description: "Your exhibition interest has been recorded. The organizer may follow up.",
      })
    } catch {
      const flags = await refreshInterestFromServer()
      if (flags?.exhibiting) {
        toast({
          title: "You’re exhibiting",
          description: "Your exhibitor interest was already on file.",
        })
      } else {
        toast({
          title: "Couldn’t save",
          description: "Failed to record your interest. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setInterestSubmitting(null)
    }
  }

  /** Human-readable address from selected venue + event fallbacks (API uses flat `venue` fields from User). */
  const getDisplayAddress = (): string => {
    const v = event?.venue
    if (v) {
      const joined =
        typeof v.location === "string" && v.location.trim().length > 0 ? v.location.trim() : ""
      if (joined) return joined

      const street = v.venueAddress || v.address || v.streetAddress || ""
      const cityPart = [v.venueCity, v.venueState].filter(Boolean).join(", ")
      const tail = [v.venueZipCode, v.venueCountry].filter(Boolean).join(" ")
      const parts = [street, cityPart, tail].filter((p) => p && String(p).trim() !== "")
      if (parts.length > 0) return parts.join(", ")
    }

    const loc = event?.location
    if (loc && typeof loc === "object") {
      const o = loc as Record<string, string | undefined>
      const line = [o.address, o.venueAddress, o.streetAddress, o.city, o.area, o.country]
        .filter((x) => x && String(x).trim() !== "")
        .join(", ")
      if (line) return line
    }

    const direct = event?.address || event?.venueAddress || event?.streetAddress
    if (direct) return String(direct)

    if (event?.isVirtual) {
      return event?.virtualLink ? "Online event (link in event details)" : "Online event"
    }

    return "Location TBA"
  }

  /** Query fragment for Google Maps (`q=` / destination=); prefers coordinates, then encoded address. */
  const getMapAddress = (): string => {
    const v = event?.venue
    const latRaw = v?.latitude ?? v?.location?.coordinates?.lat
    const lngRaw = v?.longitude ?? v?.location?.coordinates?.lng
    if (latRaw != null && lngRaw != null) {
      const lat = Number(latRaw)
      const lng = Number(lngRaw)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return `${lat},${lng}`
      }
    }

    let address = ""
    let city = ""
    let country = ""
    if (v) {
      address = v.venueAddress || v.address || v.streetAddress || ""
      city = v.venueCity || v.city || v.area || ""
      country = v.venueCountry || v.country || ""
      if (!address && typeof v.location === "string" && v.location.trim()) {
        return encodeURIComponent(v.location.trim())
      }
    }

    const loc = event?.location
    if (loc && typeof loc === "object") {
      const o = loc as Record<string, string | undefined>
      address = address || o.address || o.streetAddress || o.venueAddress || ""
      city = city || o.city || o.area || ""
      country = country || o.country || ""
    }

    if (!address && !city && !country) {
      address = event?.address || event?.venueAddress || event?.streetAddress || ""
      city = event?.city || event?.eventCity || ""
      country = event?.country || event?.eventCountry || ""
    }

    const parts = [address, city, country].filter((p) => p && String(p).trim() !== "")
    if (parts.length > 0) return encodeURIComponent(parts.join(", "))

    const display = getDisplayAddress()
    if (display && display !== "Location TBA") return encodeURIComponent(display)

    return encodeURIComponent(event?.title ? `${event.title} — Location TBA` : "Location TBA")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDateTimeRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const isSameDay = start.toDateString() === end.toDateString()

    if (isSameDay) {
      return `${formatDate(startDate)}, ${formatTime(startDate)} - ${formatTime(endDate)}`
    } else {
      return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`
    }
  }

  // Get ticket price display
  const getTicketPriceDisplay = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return "Free Entry"
    }

    const ticketTypes = event.ticketTypes as TicketType[]
    return ticketTypes.map(ticket =>
      `${ticket.name}: ${ticket.currency || '₹'}${ticket.price}`
    ).join(" | ")
  }

  // Don't show Visit and Exhibit buttons if the user is the organizer
  const showActionButtons = !isOrganizer

  return (
    <div className="min-h-screen bg-[#f1f7fb]">
      {/* Removed py-8 to eliminate gap after navbar */}
      <EventHero event={event} />

      <div className="max-w-7xl mx-auto py-4">
        <div className="bg-white rounded-sm p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            {/* LEFT SECTION */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#004A96] mb-3">
                {event.title || "Event Title"}
              </h1>

              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{getDisplayAddress()}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-[#004A96] hover:text-[#003a75]"
                  onClick={() => {
                    const address = getMapAddress()
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${address}`,
                      "_blank",
                    )
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Get Directions
                </Button>

                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">
                    {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
                  </span>
                  {totalReviews > 0 && (
                    <span className="ml-1 text-gray-500">
                      ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEvent}
                  disabled={saving}
                  className={`flex items-center gap-2 ${isSaved ? "text-[#FF131C]" : ""}`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: event.title,
                          text: "Check out this event!",
                          url: window.location.href,
                        })
                        .catch((err) => console.error("Error sharing:", err))
                    } else {
                      alert("Sharing is not supported in this browser.")
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* RIGHT SECTION - slightly shifted left */}
            {showActionButtons && (
              <div className="flex flex-col gap-4 lg:-ml-8">
                <p className="text-center lg:text-left text-gray-700 font-medium text-base sm:text-lg">
                  Interested in this Event?
                </p>

                <div className="flex gap-3 flex-col sm:flex-row sm:justify-start">
                  <Button
                    variant="outline"
                    className={
                      interestVisit
                        ? "sm:w-[180px] w-full cursor-default border-[#004A96] bg-[#004A96]/8 font-semibold text-[#004A96] hover:bg-[#004A96]/10"
                        : "sm:w-[180px] w-full border-gray-300 bg-transparent hover:bg-gray-50"
                    }
                    onClick={handleVisitClick}
                    disabled={interestVisit || interestSubmitting === "visit"}
                  >
                    {interestSubmitting === "visit" ? "Saving…" : interestVisit ? "Visiting" : "Visit"}
                  </Button>

                  <Button
                    variant="outline"
                    className={
                      interestExhibit
                        ? "sm:w-[180px] w-full cursor-default border-[#FF131C] bg-red-50 font-semibold text-[#FF131C] hover:bg-red-50 hover:text-[#FF131C]"
                        : "sm:w-[180px] w-full border-[#FF131C] bg-transparent text-[#FF131C] hover:text-[#FF131C] hover:bg-red-50"
                    }
                    onClick={handleExhibitClick}
                    disabled={interestExhibit || interestSubmitting === "exhibit"}
                  >
                    {interestSubmitting === "exhibit" ? "Saving…" : interestExhibit ? "Exhibiting" : "Exhibit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Left Side */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="about" className="w-full">
              <div className="bg-white rounded-lg mb-6 shadow-sm border border-gray-200 overflow-hidden">
                <TabsList className="grid w-full grid-cols-10 h-auto p-0 bg-transparent rounded-none">
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate first:rounded-l-lg last:rounded-r-lg"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger
                    value="exhibitors"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Exhibitors
                  </TabsTrigger>
                  <TabsTrigger
                    value="space-cost"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Space Cost
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Layout Plan
                  </TabsTrigger>
                  <TabsTrigger
                    value="brochure"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Brochure
                  </TabsTrigger>
                  <TabsTrigger
                    value="venue"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Venue
                  </TabsTrigger>
                  <TabsTrigger
                    value="speakers"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Speakers
                  </TabsTrigger>
                  <TabsTrigger
                    value="organizer"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Organizer
                  </TabsTrigger>
                  <TabsTrigger
                    value="followers"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate"
                  >
                    Followers
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#FF131C] data-[state=active]:text-white rounded-none py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate last:rounded-r-lg"
                  >
                    Review
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="about" className="space-y-6">
                <Card className="shadow-md border border-gray-200 rounded-lg overflow-hidden">
                  <CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {event.title || "Event Title"}
                    </CardTitle>
                    <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                      {event.description || event.shortDescription || "Event description not available."}
                    </p>
                  </CardHeader>

                  <CardContent className="px-6 py-4">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        {event.highlights?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        )) || (
                          <>
                            <li>Showcase and sample your favorite products.</li>
                            <li>Be visible to thousands of music lovers.</li>
                            <li>Enjoy trying high-end gadgets and accessories.</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Listed In Section */}
                    <div>
                      <h3 className="font-semibold text-[#004A96] mb-2">Listed In</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#004A96] bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors duration-200"
                          >
                            #{tag}
                          </span>
                        )) || (
                          <>
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#004A96] bg-red-50 border border-red-200 rounded-full">
                              #{event.category || "Event"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* UPDATED TIMING AND DETAILS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  {/* Timings / Schedule Section */}
                  <div>
                    {event.registrationStart && event.registrationEnd && (
                      <div>
                        <p className="font-medium text-gray-900">Category:</p>
                        <p className="text-gray-700">{event.category}</p>
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-gray-900">Timezone:</p>
                      <p className="text-[#004A96] font-medium">{event.timezone || "Asia/Kolkata"}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800 mb-1">Editions</h3>
                      <p className="text-gray-700">
                        {event.edition || "2nd"} Edition
                        <span className="text-[#004A96] ml-2">({event.edition || "2nd"} time organized)</span>
                      </p>
                    </div>
                  </div>

                  {/* Event Type / Official Links Section */}
                  <div>
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Entry Fees
                      </h3>
                      <p className="text-gray-700 text-sm ml-5">
                        {getTicketPriceDisplay()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-1">Event Type</h3>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600 font-semibold">✓</span>
                        {event.eventType?.map((type: string, index: number) => (
                          <Badge key={index} variant="secondary" className="ml-2">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-1">Official Links</h3>
                      <div className="flex gap-2">
                        {event.website && (
                          <a
                            href={event.website}
                            className="px-3 py-1 border border-[#004A96] bg-red-50 text-[#FF131C] rounded-md text-xs font-medium hover:bg-red-100"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </a>
                        )}
                        <a
                          href="#contact"
                          className="px-3 py-1 border border-[#004A96] bg-red-50 text-[#004A96] rounded-md text-xs font-medium hover:bg-red-100"
                        >
                          Contact
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPDATED ORGANIZER CARD - Show company initials */}
                <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <Link
                    href={getPublicProfilePath("organizer", {
                      id: event.organizer?.id,
                      publicSlug: event.organizer?.publicSlug,
                      organizationName: event.organizer?.company,
                    })}
                  >
                    <CardHeader className="border-b border-gray-100 pb-2">
                      <CardTitle className="text-gray-800 text-base font-semibold">Organizer</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
                      {/* Left Section: Organizer Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center border border-gray-100 rounded-full overflow-hidden bg-blue-50">
                          {event.organizer?.avatar || event.organizer?.companyLogo ? (
                            <Image
                              src={event.organizer.avatar || event.organizer.companyLogo}
                              alt={event.organizer?.company || "Organizer"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-[#004A96]">
                              {getCompanyInitials(event.organizer?.company)}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {event.organizer?.company || "Event Organizer"}
                            </h3>
                            <span className="bg-[#004A96] text-white text-[11px] font-medium px-2 py-[2px] rounded">
                              Top Rated
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            {event.organizer?.upcomingEvents
                              ? `${event.organizer.upcomingEvents} Upcoming Events`
                              : "1 Upcoming Event"}{" "}
                          </p>
                        </div>
                      </div>

                      {/* Right Section: Button */}
                      {showActionButtons && (
                        <div className="flex flex-col items-center text-center">
                          <button
                            className="bg-[#FF131C] hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVisitClick();
                            }}
                          >
                            Send Stall Book Request  
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>

                {/* MAP SECTION */}
                <Card className="border border-gray-200 rounded-lg shadow-sm">
                  <CardHeader className="border-b border-gray-100 py-4">
                    <CardTitle className="text-gray-800 text-lg font-semibold">Venue Map & Directions</CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Map Section */}
                      <div className="w-full md:w-2/3 h-80 bg-gray-200 rounded-md overflow-hidden">
                        <iframe
                          src={`https://www.google.com/maps?q=${getMapAddress()}&z=15&output=embed`}
                          width="100%"
                          height="100%"
                          className="border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>

                      {/* Venue Details and Buttons */}
                      <div className="w-full md:w-1/3 flex flex-col justify-between space-y-4">
                        {/* Venue Info */}
                        <div>
                          <Link href={`/venue/${event?.venue?.id}`}>
                            <h3 className="font-semibold text-[#004A96] text-base hover:underline cursor-pointer">
                              {event?.venue?.venueName || event?.venue?.organizationName || "Venue"}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{getDisplayAddress()}</p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                            onClick={() => {
                              const address = getMapAddress()
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${address}`,
                                "_blank",
                              )
                            }}
                          >
                            Get Directions
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const address = getMapAddress()
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${address}`,
                                "_blank",
                              )
                            }}
                          >
                            View in Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* EVENT FOLLOWERS SECTION - ADDED HERE */}
                <EventFollowers eventId={event.id} />

                {/* ADD REVIEW CARD */}
                <AddReviewCard eventId={event.id} isOrganizer={isOrganizer} />
              </TabsContent>

              <TabsContent value="exhibitors">
                <ExhibitorsTab eventId={event.id} />
              </TabsContent>

              {/* UPDATED SPACE COST TAB */}
              <TabsContent value="space-cost">
                <Card>
                  <CardHeader>
                    <CardTitle>Exhibition Space Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {spaceCosts.length > 0 ? (
                      spaceCosts.map((space, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{space.type}</span>
                              <p className="text-sm text-gray-600">{space.description}</p>
                              <p className="text-xs text-gray-500">
                                Minimum area: {space.minArea || "Not specified"} {space.unit || "sqm"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-lg text-[#004A96]">
                                {space.currency ?? "USD"} {(Number(space.price) || 0).toLocaleString()}
                              </span>
                              {space.pricePerSqm != null && Number(space.pricePerSqm) > 0 && (
                                <p className="text-sm text-gray-600">
                                  + {space.currency ?? "USD"} {Number(space.pricePerSqm)}/{space.unit || "sqm"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No exhibition space information available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Layout Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center overflow-hidden">
                      {event?.layoutPlan ? (
                        <Image
                          src={event.layoutPlan.startsWith("http")
                            ? event.layoutPlan
                            : `/uploads/${event.layoutPlan}`}
                          alt="Event Layout Plan"
                          width={800}
                          height={600}
                          className="object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500 mb-4">Floor plan will be displayed here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brochure">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Brochure</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event?.brochure ? (
                        <>
                          <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[280px] flex flex-col items-center justify-center p-8">
                            <div className="flex flex-col items-center gap-4 max-w-sm text-center">
                              <div className="rounded-full bg-[#FF131C]/10 p-4">
                                <FileText className="h-12 w-12 text-[#FF131C]" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Event Brochure</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  View or download the PDF.
                                </p>
                              </div>
                              <a
                                href={event.brochure}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FF131C] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View / Download PDF
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-100 h-96 rounded-lg flex flex-col items-center justify-center">
                          <p className="text-gray-600 mb-4">No brochure available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="venue">
                <Card className="border border-gray-200 rounded-lg shadow-sm">
                  <CardHeader className="border-b border-gray-100 py-4">
                    <CardTitle className="text-gray-800 text-lg font-semibold">Venue Details</CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Map Section */}
                      <div className="w-full md:w-2/3 h-80 bg-gray-200 rounded-md overflow-hidden">
                        <iframe
                          src={`https://www.google.com/maps?q=${getMapAddress()}&z=15&output=embed`}
                          width="100%"
                          height="100%"
                          className="border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>

                      {/* Venue Details and Buttons */}
                      <div className="w-full md:w-1/3 flex flex-col justify-between space-y-4">
                        {/* Venue Info */}
                        <div>
                          <Link href={`/venue/${event?.venue?.id}`}>
                            <h3 className="font-semibold text-[#FF131C] text-base hover:underline cursor-pointer">
                              {event?.venue?.venueName || event?.venue?.organizationName || "Venue"}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{getDisplayAddress()}</p>

                          {/* Additional venue details if available */}
                          {event?.venue?.capacity && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Capacity:</span> {event.venue.capacity.total || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Halls:</span> {event.venue.capacity.halls || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
                            onClick={() => {
                              const address = getMapAddress()
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${address}`,
                                "_blank",
                              )
                            }}
                          >
                            Get Directions
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const address = getMapAddress()
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${address}`,
                                "_blank",
                              )
                            }}
                          >
                            View in Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speakers">
                <SpeakersTab eventId={event.id} />
              </TabsContent>

              {/* UPDATED ORGANIZER TAB WITH COMPANY INITIALS */}
              <TabsContent value="organizer">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Organizer</CardTitle>
                  </CardHeader>
                  <Link
                    href={getPublicProfilePath("organizer", {
                      id: event.organizer?.id || event.organizer?._id,
                      publicSlug: event.organizer?.publicSlug,
                      organizationName: event.organizer?.company,
                    })}
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={event.organizer?.avatar || event.organizer?.companyLogo}
                            alt={event.organizer?.company || "Organizer"}
                          />
                          <AvatarFallback className="bg-red-50 text-[#FF131C] text-lg font-semibold">
                            {getCompanyInitials(event.organizer?.company)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {event.organizer?.company || "Event Organizer"}
                          </h4>
                          <p className="text-gray-600 mb-3">
                            Professional event organizer
                          </p>

                          {/* Organizer Stats */}
                          <div className="mt-3 flex gap-4 text-sm text-gray-500">
                            <span>{event.organizer?.totalEvents || 7} Total Events</span>
                            <span>{event.organizer?.averageRating || 4.5} ★ Rating</span>
                            <span>{event.organizer?.totalReviews || 2} Reviews</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </TabsContent>

              <TabsContent value="followers">
                <EventFollowers eventId={event.id} />
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddReviewCard eventId={event.id} isOrganizer={isOrganizer} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Right Side */}
          <div className="w-full lg:w-80 xl:w-96 space-y-6 flex-shrink-0">
            <Card className="hover:shadow-md transition-shadow border border-gray-200 rounded-lg h-60">
              <CardHeader className="pb-3"></CardHeader>
              <CardContent className="space-y-4"></CardContent>
            </Card>

            {/* Featured Hotels Card */}
            {/* <div className="hover:shadow-md transition-shadow border border-gray-200 rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Featured Hotels</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {hotelsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-sm">Loading featured hotels…</p>
                  </div>
                ) : featuredHotels.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-sm">No featured hotels available.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {featuredHotels.map((h: any) => (
                      <div
                        key={h.id}
                        className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Image Section */}
                          {/* <div className="sm:w-1/3 relative h-40 sm:h-32">
                            <Image
                              src={h.image || "/api/placeholder/200/128?text=Hotel"}
                              alt={h.name || "Featured Hotel"}
                              fill
                              className="object-cover m-2"
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                            {h.badgeText && (
                              <span className="absolute bottom-2 left-2 rounded-full bg-[#004A96] px-2 py-1 text-xs font-semibold text-white">
                                {h.badgeText}
                              </span>
                            )}
                          </div> */}

                          {/* Content Section */}
                          {/* <div className="sm:w-2/3 p-3">
                            <div className="flex flex-col h-full">
                              {/* Header */}
                              {/* <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                    {h.name}
                                  </h3> */} 

                                  {/* Rating and Location */}
                                  {/* <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{(h.rating ?? 0).toFixed(1)}</span>
                                    <span>({(h.reviews || 0).toLocaleString()})</span>
                                    <span className="mx-1">•</span>
                                    <span className="truncate">{h.locationNote || "Excellent Location"}</span>
                                  </div>
                                </div>
                              </div> */}

                              {/* Amenities */}
                              {/* <div className="flex flex-wrap gap-1 mb-3">
                                {h.amenities?.includes("Free Wifi") || h.amenities?.includes("wifi") ? (
                                  <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                    <Wifi className="h-3 w-3" />
                                    WiFi
                                  </span>
                                ) : null}
                                {h.amenities?.includes("Food") || h.amenities?.includes("food") ? (
                                  <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                    <Utensils className="h-3 w-3" />
                                    Food
                                  </span>
                                ) : null}
                                {h.amenities?.includes("Parking") || h.amenities?.includes("parking") ? (
                                  <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                    <Car className="h-3 w-3" />
                                    Parking
                                  </span>
                                ) : null}
                              </div> */}

                              {/* Price and Booking */}
                              {/* <div className="flex items-center justify-between gap-2 mt-auto">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-[#004A96] px-2 py-1 text-xs font-semibold text-white">
                                    {h.dealLabel || "Deal"}
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {h.currency || "$"}
                                      {h.price}
                                    </span>
                                    <span className="text-xs text-gray-500 hidden sm:inline">
                                      {h.priceNote || "28% less than usual"}
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  className="rounded-full bg-[#004A96] px-3 py-1 text-white hover:bg-[#003a75] text-xs font-medium whitespace-nowrap flex-shrink-0"
                                  size="sm"
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent> */}
            {/* </div>  */}



            {/* Places to Visit */}
            <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Places to Visit in {event.city || "the area"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {getPlacesToVisit(event.city).map((place, index) => (
                  <div key={index} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    {/* Image with overlayed title and gradient */}
                    <div className="relative w-full h-48">
                      <Image
                        src={place.image}
                        alt={place.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 600px"
                        className="object-cover"
                      />

                      {/* Gradient overlay for better text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                      {/* Title overlay */}
                      <div className="absolute left-4 bottom-4 pr-4">
                        <h3 className="text-white text-lg font-semibold drop-shadow-md">
                          {place.name}
                        </h3>
                      </div>
                    </div>

                    {/* White area under image: category on left, button on right */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <p className="text-gray-600 text-sm">{place.category}</p>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#004A96] hover:text-[#003a75] hover:bg-[#f0f0f0]"
                        aria-label={`More details about ${place.name}`}
                      >
                        More details →
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}