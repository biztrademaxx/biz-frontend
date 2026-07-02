"use client"

import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import { useEffect, useMemo, useRef, useState } from "react"
import EventHero from "@/components/event-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventPageAboutTab } from "@/components/event-page/EventPageAboutTab"
import { EventPageBrochureTab } from "@/components/event-page/EventPageBrochureTab"
import { EventPageLayoutTab } from "@/components/event-page/EventPageLayoutTab"
import { EventPageOrganizerTab } from "@/components/event-page/EventPageOrganizerTab"
import { EventPageSidebar } from "@/components/event-page/EventPageSidebar"
import { EventPageSpaceCostTab } from "@/components/event-page/EventPageSpaceCostTab"
import { EventPageSummaryBar } from "@/components/event-page/EventPageSummaryBar"
import { EventPageVenueMapCard } from "@/components/event-page/EventPageVenueMapCard"
import type { ContentBanner, EventPageContentProps, SpaceCost } from "@/components/event-page/event-page-types"
import { buildListedInDisplay, getCurrencyByCountry } from "@/components/event-page/event-page-utils"
import AddReviewCard from "@/components/AddReviewCard"
import EventFollowers from "@/components/EventFollowers"
import {
  fetchEventLeadsThroughNext,
  interestFlagsFromLeads,
  persistInterestLocalStorage,
  postEventLeadThroughNext,
  readInterestLocalStorage,
  saveEventToInterestedList,
} from "@/lib/event-leads-client"
import { apiFetch, getCurrentUserEmail, getCurrentUserId, isAuthenticated, getCurrentUserRole } from "@/lib/api"
import { brochureFriendlyFilename, downloadUrlAsFile, resolveBrochureUrl } from "@/lib/utils"
import ExhibitorsTab from "./[id]/exhibitors-tab"
import SpeakersTab from "./[id]/speakers-tab"

export default function EventPageContent({ event, session: _session, router, toast }: EventPageContentProps) {
  const userId = getCurrentUserId()
  const isLoggedIn = isAuthenticated()

  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [averageRating, setAverageRating] = useState(event.averageRating || 0)
  const [totalReviews, setTotalReviews] = useState(event.reviewCount || 0)
  const [spaceCosts, setSpaceCosts] = useState<SpaceCost[]>([])
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [interestVisit, setInterestVisit] = useState(false)
  const [interestExhibit, setInterestExhibit] = useState(false)
  const [interestSubmitting, setInterestSubmitting] = useState<"visit" | "exhibit" | null>(null)
  const [stallBookRequestSubmitting, setStallBookRequestSubmitting] = useState(false)
  const [brochureDownloading, setBrochureDownloading] = useState(false)
  const [sidebarBanners, setSidebarBanners] = useState<ContentBanner[]>([])
  const [sidebarBannerSlide, setSidebarBannerSlide] = useState(0)
  const sidebarAutoplayRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const [sidebarBannerSliderRef, sidebarBannerSliderInstanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setSidebarBannerSlide(slider.track.details.rel)
    },
  })
  const brochureUrl = event?.brochure ? resolveBrochureUrl(event.brochure) : ""
  const useGoogleViewer = /^https:\/\//i.test(brochureUrl) && !/localhost|127\.0\.0\.1/i.test(brochureUrl)
  const layoutPlanUrl = event?.layoutPlan ? resolveBrochureUrl(event.layoutPlan) : ""
  const hotelCurrency = getCurrencyByCountry(event)
  const layoutPath = layoutPlanUrl.split("?")[0].toLowerCase()
  const isLayoutImage =
    /\.(jpe?g|png|gif|webp|bmp|svg)$/.test(layoutPath) || layoutPlanUrl.includes("/image/upload/")
  const isLayoutPdf =
    /\.pdf(\?|#|$)/i.test(layoutPlanUrl) ||
    (layoutPlanUrl.includes("/raw/upload/") && !isLayoutImage)
  const useGoogleLayoutViewer =
    isLayoutPdf && /^https:\/\//i.test(layoutPlanUrl) && !/localhost|127\.0\.0\.1/i.test(layoutPlanUrl)

  const listedIn = useMemo(
    () => buildListedInDisplay(event),
    [event?.categories, event?.tags, event?.category],
  )

  useEffect(() => {
    setAverageRating(event.averageRating || 0)
    setTotalReviews(event.reviewCount || 0)
    if (event.id) fetchSpaceCosts(event.id)
    if (event?.id && userId) {
      checkIfSaved()
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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch<ContentBanner[]>(`/api/content/banners?page=event-detail&position=sidebar`, {
          auth: false,
        })
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        const banners = list.filter((b) => b?.isActive !== false && b?.imageUrl)
        setSidebarBanners(banners)
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch sidebar banner:", error)
          setSidebarBanners([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (sidebarAutoplayRef.current) {
      clearInterval(sidebarAutoplayRef.current)
      sidebarAutoplayRef.current = undefined
    }
    if (sidebarBanners.length <= 1) return
    sidebarAutoplayRef.current = setInterval(() => {
      sidebarBannerSliderInstanceRef.current?.next()
    }, 7000)
    return () => {
      if (sidebarAutoplayRef.current) clearInterval(sidebarAutoplayRef.current)
    }
  }, [sidebarBanners.length])

  const fetchSpaceCosts = async (eventId: string) => {
    try {
      const data = await apiFetch<{
        success?: boolean
        spaceCosts?: SpaceCost[]
        data?: { spaces?: SpaceCost[] }
      }>(`/api/events/${eventId}/space-costs`, { auth: false })
      const costs = data.spaceCosts ?? data.data?.spaces
      if (data.success !== false && Array.isArray(costs)) {
        setSpaceCosts(costs)
      } else {
        setSpaceCosts([])
      }
    } catch (error) {
      console.error("Error fetching space costs:", error)
      setSpaceCosts([])
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
      await saveEventToInterestedList(event.id)
      persistInterestLocalStorage(event.id, "visit")
      setInterestVisit(true)
      setIsSaved(true)
      toast({
        title: "You’re visiting",
        description: "Added to your interested events. The organizer may follow up with details.",
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

  const handleSendStallBookRequest = async () => {
    if (!isLoggedIn || !userId) {
      toast({
        title: "Sign in required",
        description: "Please log in to send a stall booking request.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setStallBookRequestSubmitting(true)
    try {
      const { ok } = await postEventLeadThroughNext(event.id, {
        type: "stall_book_request",
        userId,
        eventId: event.id,
      })
      if (!ok) throw new Error("Lead request failed")
      toast({
        title: "Request sent",
        description: "Your stall booking request has been sent to the organizer.",
      })
    } catch {
      toast({
        title: "Couldn’t send request",
        description: "Failed to submit your stall booking request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setStallBookRequestSubmitting(false)
    }
  }

  const handleBrochureDownload = async () => {
    if (!brochureUrl) return
    setBrochureDownloading(true)
    try {
      const filename = brochureFriendlyFilename(
        brochureUrl,
        event.title ? `${event.title} brochure` : undefined,
      )
      await downloadUrlAsFile(brochureUrl, filename)
    } catch (error) {
      console.error("Error downloading brochure:", error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not download the brochure.",
        variant: "destructive",
      })
    } finally {
      setBrochureDownloading(false)
    }
  }

  const showActionButtons = !isOrganizer

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-6 md:pb-8">
      <EventHero event={event} />
      <EventPageSummaryBar
        event={event}
        averageRating={averageRating}
        totalReviews={totalReviews}
        isSaved={isSaved}
        saving={saving}
        onSave={handleSaveEvent}
        showActionButtons={showActionButtons}
        interestVisit={interestVisit}
        interestExhibit={interestExhibit}
        interestSubmitting={interestSubmitting}
        onVisitClick={handleVisitClick}
        onExhibitClick={handleExhibitClick}
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <Tabs defaultValue="about" className="w-full">
              <div className="mb-6 overflow-hidden rounded-xl border border-[#E4EAF5] bg-white shadow-[0_4px_16px_rgba(16,42,94,0.06)]">
                <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                  <TabsList className="flex h-auto w-max min-w-full flex-nowrap rounded-none bg-transparent p-0.5 gap-1">
                    {[
                      { value: "about",      label: "About" },
                      { value: "exhibitors", label: "Exhibitors" },
                      { value: "space-cost", label: "Space Cost" },
                      { value: "layout",     label: "Layout Plan" },
                      { value: "brochure",   label: "Brochure" },
                      { value: "venue",      label: "Venue" },
                      { value: "speakers",   label: "Speakers" },
                      { value: "organizer",  label: "Organizer" },
                      { value: "followers",  label: "Followers" },
                      { value: "reviews",    label: "Review" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="
                          whitespace rounded-lg
                          px-2 py-2 
                          text-sm font-medium text-[#0a0a0b]
                          bg-transparent border-0
                          transition-all duration-150
                          hover:bg-[#F3F6FB] hover:text-[#102A5E]
                          data-[state=active]:bg-[#FF131C]
                          data-[state=active]:text-white
                          data-[state=active]:font-semibold
                          data-[state=active]:shadow-sm
                        "
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <TabsContent value="about" className="space-y-6">
                <EventPageAboutTab
                  event={event}
                  listedIn={listedIn}
                  showActionButtons={showActionButtons}
                  isOrganizer={isOrganizer}
                  onVisitClick={handleVisitClick}
                />
              </TabsContent>

              <TabsContent value="exhibitors">
                <ExhibitorsTab eventId={event.id} />
              </TabsContent>

              <TabsContent value="space-cost">
                <EventPageSpaceCostTab event={event} spaceCosts={spaceCosts} />
              </TabsContent>

              <TabsContent value="layout">
                <EventPageLayoutTab
                  layoutPlanUrl={layoutPlanUrl}
                  isLayoutImage={isLayoutImage}
                  isLayoutPdf={isLayoutPdf}
                  useGoogleLayoutViewer={useGoogleLayoutViewer}
                />
              </TabsContent>

              <TabsContent value="brochure">
                <EventPageBrochureTab
                  event={event}
                  brochureUrl={brochureUrl}
                  useGoogleViewer={useGoogleViewer}
                  brochureDownloading={brochureDownloading}
                  onBrochureDownload={handleBrochureDownload}
                />
              </TabsContent>

              <TabsContent value="venue">
                <EventPageVenueMapCard event={event} variant="venue" />
              </TabsContent>

              <TabsContent value="speakers">
                <SpeakersTab eventId={event.id} />
              </TabsContent>

              <TabsContent value="organizer">
                <EventPageOrganizerTab
                  event={event}
                  onSendStallBookRequest={handleSendStallBookRequest}
                  stallBookRequestSubmitting={stallBookRequestSubmitting}
                />
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

          <EventPageSidebar
            event={event}
            hotelCurrency={hotelCurrency}
            sidebarBanners={sidebarBanners}
            sidebarBannerSlide={sidebarBannerSlide}
            sidebarBannerSliderRef={sidebarBannerSliderRef}
            sidebarBannerSliderInstanceRef={sidebarBannerSliderInstanceRef}
          />
        </div>
      </div>
      {showActionButtons && (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <p className="mt-3 text-sm text-gray-500">
            Note: Please verify schedules and participation details with organizers before finalizing travel plans.
          </p>
        </div>
      )}
    </div>
  )
}
