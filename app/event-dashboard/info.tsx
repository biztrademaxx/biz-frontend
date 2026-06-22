"use client"
import { AppImage } from "@/components/app-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Edit2, Trash2, Save, X, Plus, FileText, ExternalLink, Download } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUserId, isAuthenticated } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ExhibitorsTab from "./exhibitors-tab"
import EventHero from "./EventHero"
import { apiFetch } from "@/lib/api"
import { getPublicProfilePath } from "@/lib/profile-path"
import { formatOrganizerCityCountryLine } from "@/lib/organizer-location-display"
import { getVenuePublicPath } from "@/lib/venue-dashboard-path"
import {
  brochureFriendlyFilename,
  downloadUrlAsFile,
  getGoogleDocsViewerUrl,
  getBrochurePreviewUrl,
  resolveBrochureUrl,
} from "@/lib/utils"
import { exhibitionSpaceTypeLabel, formatEventMoney } from "@/lib/format-event-money"
import { cn } from "@/lib/utils"

const EVENT_INFO_TABS = [
  { value: "about", label: "About", shortLabel: "About" },
  { value: "exhibitors", label: "Exhibitors", shortLabel: "Exhibitors" },
  { value: "space-cost", label: "Space Cost", shortLabel: "Space" },
  { value: "layout", label: "Layout Plan", shortLabel: "Layout" },
  { value: "brochure", label: "Brochure", shortLabel: "Brochure" },
  { value: "venue", label: "Venue", shortLabel: "Venue" },
  { value: "speakers", label: "Speakers", shortLabel: "Speakers" },
  { value: "organizer", label: "Organizer", shortLabel: "Organizer" },
] as const

interface EventPageProps {
  params: { id: string }
}

/**
 * Preview routing. Cloudinary `raw/upload` PDFs often have **no `.pdf` in the URL** (public id only),
 * so we must not rely only on `endsWith(".pdf")`.
 */
function inferBrochureDisplayKind(url: string): "pdf" | "office" | "image" | "embed" {
  const clean = url.split("?")[0].split("#")[0].toLowerCase()
  const hasOfficeExt = /\.(doc|docx|ppt|pptx|xls|xlsx|odt|ods|odp)$/.test(clean)
  const hasImageExt = /\.(jpe?g|png|gif|webp|bmp|svg)$/.test(clean)

  if (/\.pdf(\?|#|$)/i.test(clean) || clean.includes(".pdf/")) return "pdf"
  if (hasOfficeExt) return "office"
  if (hasImageExt || url.includes("/image/upload/")) return "image"

  // Cloudinary raw documents (typical brochure upload) — usually PDF; iframe + Content-Type works
  if (url.includes("/raw/upload/") && !hasOfficeExt && !hasImageExt) {
    return "pdf"
  }

  // Other HTTPS URLs: let the browser try inline (often PDF without extension in path)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return "embed"
  }

  return "embed"
}

function EventBrochurePreview({ url }: { url: string }) {
  const kind = useMemo(() => inferBrochureDisplayKind(url), [url])
  /** Cloudinary raw: original URL for iframe (attachment transforms are not needed for preview). */
  const iframeSrc = useMemo(() => {
    const u = url.trim()
    if (u.includes("res.cloudinary.com") && u.includes("/raw/upload/")) {
      return getBrochurePreviewUrl(u)
    }
    return u
  }, [url])
  const officeSrc =
    kind === "office"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
      : null

  const iframeClass = "h-[min(70vh,560px)] w-full border-0 bg-white"
  const useGoogleViewer =
    /^https:\/\//i.test(iframeSrc) && !/localhost|127\.0\.0\.1/i.test(iframeSrc)

  if (kind === "image") {
    return (
      <div className="relative flex min-h-[280px] items-center justify-center bg-slate-50 p-3">
        <AppImage
          src={url}
          alt="Event brochure"
          width={800}
          height={560}
          className="max-h-[min(70vh,560px)] h-auto w-auto max-w-full object-contain"
          loading="lazy"
        />
      </div>
    )
  }

  if (kind === "office" && officeSrc) {
    return (
      <iframe
        title="Brochure document preview"
        src={officeSrc}
        className={iframeClass}
      />
    )
  }

  // PDF / embed: match public event page behavior for consistent preview reliability.
  return (
    <iframe
      title="Brochure preview"
      src={useGoogleViewer ? getGoogleDocsViewerUrl(iframeSrc) : iframeSrc}
      className={iframeClass}
      loading="lazy"
    />
  )
}

export default function EventPage({ params }: EventPageProps) {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const [eventTab, setEventTab] = useState(tabFromUrl || "about")

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [aboutText, setAboutText] = useState("")
  const [editingTags, setEditingTags] = useState(false)
  const [tagsText, setTagsText] = useState("")

  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [editingSpaceData, setEditingSpaceData] = useState<any>({})
  const [updatingBrochure, setUpdatingBrochure] = useState(false)
  const [downloadingBrochure, setDownloadingBrochure] = useState(false)
  const brochureUrl = event?.brochure ? resolveBrochureUrl(event.brochure) : ""
  const layoutPlanUrl = event?.layoutPlan ? resolveBrochureUrl(event.layoutPlan) : ""
  const layoutPath = layoutPlanUrl.split("?")[0].toLowerCase()
  const isLayoutImage =
    /\.(jpe?g|png|gif|webp|bmp|svg)$/.test(layoutPath) || layoutPlanUrl.includes("/image/upload/")
  const isLayoutPdf =
    /\.pdf(\?|#|$)/i.test(layoutPlanUrl) ||
    (layoutPlanUrl.includes("/raw/upload/") && !isLayoutImage)
  const useGoogleLayoutViewer =
    isLayoutPdf && /^https:\/\//i.test(layoutPlanUrl) && !/localhost|127\.0\.0\.1/i.test(layoutPlanUrl)
  const [addingSpace, setAddingSpace] = useState(false)
  const [newSpaceForm, setNewSpaceForm] = useState({
    name: "",
    spaceType: "SHELL_SPACE" as "SHELL_SPACE" | "RAW_SPACE",
    description: "",
    pricePerSqm: 0,
    minArea: 9,
    unit: "sqm",
  })

  const userId = getCurrentUserId()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (tabFromUrl) setEventTab(tabFromUrl)
  }, [tabFromUrl])

  useEffect(() => {
    if (event) {
      if (event.description) {
        setAboutText(event.description)
      }
      if (event.tags) {
        setTagsText(event.tags.join(", "))
      }
    }
  }, [event])

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true)
        setError(null)

        const eventId = params.id
        const data = await apiFetch<any>(`/api/events/${eventId}`, { auth: true })

        setEvent({
          ...data,

          isRegistrationOpen: data.isAvailable,
          spotsRemaining: data.availableTickets,
          images: data.images || [data.bannerImage].filter(Boolean),
          category: data.category || "General",
          tags: data.tags || [],
          venue: data.venue || {},
          currency: data.currency ?? "₹",
        })

        setAverageRating(data.averageRating || 0)
        setTotalReviews(data.reviewCount || 0)
      } catch (err: any) {
        console.error("Error fetching event:", err)
        if (err?.status === 404) setError("Event not found")
        else setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  useEffect(() => {
    if (event?.id && userId) {
      checkIfSaved()
    }
  }, [event?.id, userId])

  const checkIfSaved = async () => {
    try {
      const data = await apiFetch<{ isSaved: boolean }>(`/api/events/${event.id}/save`)
      setIsSaved(data.isSaved)
    } catch (error) {
      console.error("Error checking saved status:", error)
    }
  }
  // const handleDownloadBrochure = async (eventId: string) => {
  //   try {
  //     // Get the download URL from the API
  //     const response = await fetch(`/api/events/${eventId}/brochure?action=download`);

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     if (data.success && data.brochure) {
  //       // Create a temporary anchor element to trigger download
  //       const link = document.createElement('a');
  //       link.href = data.brochure;

  //       // Set the download attribute with a proper filename
  //       const filename = `brochure-${data.eventTitle || eventId}.pdf`;
  //       link.download = filename;

  //       // Append to body, click, and remove
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);

  //       toast({
  //         title: "Download Started",
  //         description: "Brochure download has started",
  //       });
  //     } else {
  //       throw new Error(data.error || 'Failed to get download URL');
  //     }
  //   } catch (error) {
  //     console.error('Error downloading brochure:', error);
  //     toast({
  //       title: "Download Failed",
  //       description: error instanceof Error ? error.message : "Failed to download brochure. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  const handleDeleteBrochure = async () => {
    if (!confirm("Are you sure you want to delete the brochure?")) return

    try {
      const response = await fetch(`/api/events/${event.id}/brochure`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update the event state to remove brochure
        setEvent((prev: any) => ({
          ...prev,
          brochure: null
        }))

        toast({
          title: "Success",
          description: "Brochure removed successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting brochure:", error)
      toast({
        title: "Error",
        description: "Failed to delete brochure",
        variant: "destructive",
      })
    }
  }

  const handleBrochureDownload = async () => {
    if (!brochureUrl) return
    setDownloadingBrochure(true)
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
      setDownloadingBrochure(false)
    }
  }

  const handleBrochureUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 15MB max (matches backend document limit)
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 15MB.",
        variant: "destructive",
      })
      return
    }

    setUpdatingBrochure(true)

    try {
      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const brochureUrl = await uploadFileViaProxy(file, "brochure")

      await apiFetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        body: { brochure: brochureUrl },
        auth: true,
      })

      setEvent((prev: any) => ({
        ...prev,
        brochure: brochureUrl,
      }))

      toast({
        title: 'Success',
        description: 'Brochure updated successfully',
      })

      e.target.value = ''
    } catch (error) {
      console.error('Error updating brochure:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update brochure',
        variant: 'destructive',
      })
    } finally {
      setUpdatingBrochure(false)
    }
  }
  const handleSaveEvent = async () => {
    if (!isAuthenticated()) {
      alert("Please log in to save events")
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      const method = isSaved ? "DELETE" : "POST"
      await apiFetch(`/api/events/${event.id}/save`, {
        method,
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
  const handleLayoutUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    const isImage = file.type.startsWith("image/")

    if (!isPdf && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPEG, PNG, GIF, WebP) or a PDF file",
        variant: "destructive",
      })
      return
    }

    if (isPdf && file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 15MB",
        variant: "destructive",
      })
      return
    }
    if (isImage && file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    try {
      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const layoutUrl = await uploadFileViaProxy(file, isPdf ? "brochure" : "image")

      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { layoutPlan: layoutUrl },
        auth: true,
      })

      setEvent((prev: any) => ({
        ...prev,
        layoutPlan: layoutUrl,
      }))

      toast({
        title: "Success",
        description: "Layout plan updated successfully",
      })
      e.target.value = ""
    } catch (error) {
      console.error("Error updating layout plan:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update layout plan",
        variant: "destructive",
      })
    }
  }
  const handleDeleteExhibitor = async (exhibitorId: string) => {
    if (!confirm("Are you sure you want to remove this exhibitor?")) return

    try {
      const response = await fetch(`/api/events/${event.id}/exhibitors/${exhibitorId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEvent((prev: any) => ({
          ...prev,
          exhibitorBooths: prev.exhibitorBooths.filter((booth: any) => booth.id !== exhibitorId),
        }))
        toast({
          title: "Success",
          description: "Exhibitor removed successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting exhibitor:", error)
      toast({
        title: "Error",
        description: "Failed to remove exhibitor",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSpaceCost = async (spaceId: string) => {
    try {
      const updatedSpace = await apiFetch<any>(`/api/events/${event.id}/exhibition-spaces/${spaceId}`, {
        method: "PUT",
        body: {
          ...editingSpaceData,
          currency: event?.currency,
        },
      })
      setEvent((prev: any) => ({
        ...prev,
        exhibitionSpaces: prev.exhibitionSpaces.map((space: any) => (space.id === spaceId ? updatedSpace : space)),
      }))
      setEditingSpaceId(null)
      setEditingSpaceData({})
      toast({
        title: "Success",
        description: "Space cost updated successfully",
      })
    } catch (error) {
      console.error("Error updating space cost:", error)
      toast({
        title: "Error",
        description: "Failed to update space cost",
        variant: "destructive",
      })
    }
  }

  const handleAddExhibitionSpace = async () => {
    if (!newSpaceForm.name.trim()) {
      toast({ title: "Validation", description: "Space name is required", variant: "destructive" })
      return
    }
    try {
      const created = await apiFetch<any>(`/api/events/${event.id}/exhibition-spaces`, {
        method: "POST",
        body: {
          name: newSpaceForm.name.trim(),
          spaceType: newSpaceForm.spaceType,
          description: newSpaceForm.description || newSpaceForm.name.trim(),
          area: Number(newSpaceForm.minArea) || 9,
          basePrice: Number(newSpaceForm.pricePerSqm || 0) * Number(newSpaceForm.minArea || 0),
          minArea: Number(newSpaceForm.minArea) || undefined,
          unit: newSpaceForm.unit || "sqm",
          pricePerSqm: Number(newSpaceForm.pricePerSqm) || 0,
          currency: event?.currency,
        },
      })
      setEvent((prev: any) => ({
        ...prev,
        exhibitionSpaces: [...(prev.exhibitionSpaces || []), created],
      }))
      setAddingSpace(false)
      setNewSpaceForm({
        name: "",
        spaceType: "SHELL_SPACE",
        description: "",
        pricePerSqm: 0,
        minArea: 9,
        unit: "sqm",
      })
      toast({ title: "Success", description: "Exhibition space created. You can now assign it when adding exhibitors." })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create exhibition space",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!confirm("Are you sure you want to remove this speaker?")) return

    try {
      await apiFetch(`/api/events/${event.id}/speakers/${speakerId}`, {
        method: "DELETE",
        auth: true,
      })
      setEvent((prev: any) => ({
        ...prev,
        speakerSessions: prev.speakerSessions.filter((session: any) => session.id !== speakerId),
      }))
      toast({
        title: "Success",
        description: "Speaker removed successfully",
      })
    } catch (error) {
      console.error("Error deleting speaker:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove speaker",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLayout = async () => {
    if (!confirm("Are you sure you want to delete the layout plan?")) return

    try {
      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { layoutPlan: null },
        auth: true,
      })
      setEvent((prev: any) => ({ ...prev, layoutPlan: null }))
      toast({
        title: "Success",
        description: "Layout plan removed successfully",
      })
    } catch (error) {
      console.error("Error deleting layout:", error)
      toast({
        title: "Error",
        description: "Failed to delete layout plan",
        variant: "destructive",
      })
    }
  }

  const shellRawSpaces = useMemo(() => {
    const list = event?.exhibitionSpaces
    if (!Array.isArray(list)) return []
    return list.filter((s: any) => s.spaceType === "SHELL_SPACE" || s.spaceType === "RAW_SPACE")
  }, [event?.exhibitionSpaces])

  const hasShellSpace = shellRawSpaces.some((s: any) => s.spaceType === "SHELL_SPACE")
  const hasRawSpace = shellRawSpaces.some((s: any) => s.spaceType === "RAW_SPACE")
  const canAddShellOrRaw = !hasShellSpace || !hasRawSpace

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading event: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Event not found</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="w-full min-w-0 max-w-full bg-[#F5F4F0]">
      <div className="w-full min-w-0 max-w-full mx-auto">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-10">
          <EventHero
            event={event}
            onScheduleUpdate={(patch) =>
              setEvent((prev: Record<string, unknown> | null) => (prev ? { ...prev, ...patch } : prev))
            }
          />
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <div className="flex-1 min-w-0 w-full">
            <Tabs value={eventTab} onValueChange={setEventTab} className="w-full min-w-0">
              <div className="bg-white rounded-lg mb-4 sm:mb-6 shadow-sm border border-gray-200 min-w-0 overflow-hidden">
                <div className="overflow-x-auto overscroll-x-contain pb-0 [-webkit-overflow-scrolling:touch]">
                  <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap gap-0 rounded-none bg-transparent p-0 lg:grid lg:w-full lg:grid-cols-8">
                    {EVENT_INFO_TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          "shrink-0 min-w-[4.75rem] rounded-none px-3 py-3 text-xs font-medium sm:min-w-0 sm:px-4 sm:text-sm lg:flex-1",
                          "data-[state=active]:bg-red-600 data-[state=active]:text-white",
                        )}
                      >
                        <span className="lg:hidden">{tab.shortLabel}</span>
                        <span className="hidden lg:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <TabsContent value="about" className="space-y-4 sm:space-y-6">
                <Card className="gap-0 py-0 min-w-0 overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>About the Event</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(editingSection === "about" ? null : "about")}
                        >
                          {editingSection === "about" ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </Button>
                        {editingSection === "about" && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiFetch(`/api/events/${event.id}`, {
                                  method: "PATCH",
                                  body: { description: aboutText },
                                  auth: true,
                                })
                                setEvent((prev: any) => ({ ...prev, description: aboutText }))
                                toast({ title: "Saved", description: "About section updated" })
                                setEditingSection(null)
                              } catch (err) {
                                console.error(err)
                                toast({ title: "Error", description: "Failed to save changes", variant: "destructive" })
                              }
                            }}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    {editingSection === "about" ? (
                      <Textarea
                        className="w-full p-2 border rounded"
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        rows={5}
                      />
                    ) : (
                      <p className="text-gray-700 mb-4 leading-relaxed break-words text-sm sm:text-base">{aboutText}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="gap-0 py-0 min-w-0 overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-blue-700">Listed In</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTags(!editingTags)}>
                          {editingTags ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </Button>
                        {editingTags && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const newTags = tagsText
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean)

                                await apiFetch(`/api/events/${event.id}`, {
                                  method: "PATCH",
                                  body: { tags: newTags },
                                  auth: true,
                                })
                                setEvent((prev: any) => ({ ...prev, tags: newTags }))
                                setEditingTags(false)
                                toast({ title: "Saved", description: "Tags updated successfully" })
                              } catch (err) {
                                console.error(err)
                                toast({ title: "Error", description: "Failed to save tags", variant: "destructive" })
                              }
                            }}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    {editingTags ? (
                      <Textarea
                        className="w-full p-2 border rounded"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="Enter tags separated by commas"
                        rows={2}
                      />
                    ) : event.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No tags available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="exhibitors">
                {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading exhibitors...</p>
                    </div>
                  </div>
                ) : event ? (
                  <ExhibitorsTab eventId={event.id} />
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <p>Event not found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="space-cost">
                <Card className="gap-0 py-0 min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-col gap-4 px-4 sm:px-6 sm:flex-row sm:items-start sm:justify-between space-y-0">
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg">Exhibitor Space Costs</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                        Shell space and raw space only. Pricing uses the event currency from{" "}
                        <strong>Pricing</strong> ({event.currency}). Minimum booth total = price per sq.m × minimum
                        area.
                      </p>
                    </div>
                    <Button
                      variant={addingSpace ? "outline" : "default"}
                      size="sm"
                      className="w-full sm:w-auto shrink-0"
                      disabled={!canAddShellOrRaw && !addingSpace}
                      onClick={() => {
                        setAddingSpace((prev) => {
                          const next = !prev
                          if (next) {
                            setNewSpaceForm((p) => ({
                              ...p,
                              spaceType: !hasShellSpace ? "SHELL_SPACE" : "RAW_SPACE",
                              minArea: !hasShellSpace ? 9 : 20,
                              name: "",
                              description: "",
                              pricePerSqm: 0,
                            }))
                          }
                          return next
                        })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {addingSpace ? "Cancel" : !hasShellSpace ? "Add shell space" : !hasRawSpace ? "Add raw space" : "Add space"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    {addingSpace && canAddShellOrRaw && (
                      <div className="p-4 rounded-lg border border-dashed border-gray-300 space-y-4 bg-gray-50">
                        <h4 className="font-medium">New {newSpaceForm.spaceType === "SHELL_SPACE" ? "shell" : "raw"} space</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Hall name *</label>
                            <Input
                              placeholder="e.g. Tripura Vasini, Hall A"
                              value={newSpaceForm.name}
                              onChange={(e) => setNewSpaceForm((p) => ({ ...p, name: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Space type</label>
                            <select
                              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                              value={newSpaceForm.spaceType}
                              onChange={(e) =>
                                setNewSpaceForm((p) => ({
                                  ...p,
                                  spaceType: e.target.value as "SHELL_SPACE" | "RAW_SPACE",
                                  minArea: e.target.value === "SHELL_SPACE" ? 9 : 20,
                                }))
                              }
                            >
                              {!hasShellSpace ? <option value="SHELL_SPACE">Shell space (standard booth)</option> : null}
                              {!hasRawSpace ? <option value="RAW_SPACE">Raw space</option> : null}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Price per sq.m ({event.currency})</label>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={newSpaceForm.pricePerSqm || ""}
                              onChange={(e) =>
                                setNewSpaceForm((p) => ({ ...p, pricePerSqm: Number(e.target.value) || 0 }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Minimum area (sq.m)</label>
                            <Input
                              type="number"
                              min={1}
                              value={newSpaceForm.minArea || ""}
                              onChange={(e) =>
                                setNewSpaceForm((p) => ({ ...p, minArea: Number(e.target.value) || 0 }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              placeholder="Short description for exhibitors"
                              value={newSpaceForm.description}
                              onChange={(e) => setNewSpaceForm((p) => ({ ...p, description: e.target.value }))}
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div className="md:col-span-2 text-sm text-gray-700">
                            <span className="font-medium">Total from: </span>
                            {formatEventMoney(
                              (Number(newSpaceForm.pricePerSqm) || 0) * (Number(newSpaceForm.minArea) || 0),
                              event.currency,
                            )}
                          </div>
                        </div>
                        <Button onClick={handleAddExhibitionSpace}>Create space</Button>
                      </div>
                    )}

                    {shellRawSpaces.length > 0 ? (
                      shellRawSpaces.map((space: any) => {
                        const pps = Number(space.pricePerSqm ?? 0)
                        const minA = Number(space.minArea ?? 0)
                        const total =
                          pps > 0 && minA > 0 ? pps * minA : Number(space.basePrice ?? 0)
                        const cur = space.currency || event.currency
                        return (
                          <div key={space.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {exhibitionSpaceTypeLabel(space.spaceType)}
                                </p>
                                <h4 className="font-semibold text-lg">{space.name}</h4>
                              </div>
                              {space.spaceType === "SHELL_SPACE" ? (
                                <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">Standard</span>
                              ) : null}
                            </div>
                            {editingSpaceId === space.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Hall name</label>
                                  <Input
                                    value={editingSpaceData.name ?? space.name}
                                    onChange={(e) =>
                                      setEditingSpaceData({ ...editingSpaceData, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea
                                    value={editingSpaceData.description ?? space.description ?? ""}
                                    onChange={(e) =>
                                      setEditingSpaceData({ ...editingSpaceData, description: e.target.value })
                                    }
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm font-medium">Price per sq.m ({cur})</label>
                                    <Input
                                      type="number"
                                      value={editingSpaceData.pricePerSqm ?? space.pricePerSqm ?? ""}
                                      onChange={(e) =>
                                        setEditingSpaceData({
                                          ...editingSpaceData,
                                          pricePerSqm: Number.parseFloat(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Minimum area (sq.m)</label>
                                    <Input
                                      type="number"
                                      value={editingSpaceData.minArea ?? space.minArea ?? ""}
                                      onChange={(e) =>
                                        setEditingSpaceData({
                                          ...editingSpaceData,
                                          minArea: Number.parseFloat(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                  Total from:{" "}
                                  <span className="font-semibold">
                                    {formatEventMoney(
                                      (Number(editingSpaceData.pricePerSqm ?? space.pricePerSqm) || 0) *
                                        (Number(editingSpaceData.minArea ?? space.minArea) || 0),
                                      cur,
                                    )}
                                  </span>
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleUpdateSpaceCost(space.id)}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingSpaceId(null)
                                      setEditingSpaceData({})
                                    }}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                                <div>
                                  <p className="text-sm text-gray-600">{space.description}</p>
                                  <p className="text-sm text-gray-700 mt-2">
                                    {formatEventMoney(pps, cur)} / sq.m · Min {minA || "—"} sq.m
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Total from</p>
                                    <p className="font-bold text-lg text-blue-600">{formatEventMoney(total, cur)}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingSpaceId(space.id)
                                      setEditingSpaceData({
                                        name: space.name,
                                        description: space.description,
                                        basePrice: space.basePrice,
                                        pricePerSqm: space.pricePerSqm,
                                        minArea: space.minArea,
                                      })
                                    }}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-gray-600">
                        No shell or raw exhibition space yet. Use <strong>Add shell space</strong> or{" "}
                        <strong>Add raw space</strong> to match your event pricing. Other space types are hidden here.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Layout Plan</span>
                      <div className="flex gap-2">
                        {/* Update Layout Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('layout-upload')?.click()}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                        {/* Hidden file input */}
                        <input
                          id="layout-upload"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleLayoutUpdate}
                        />
                        {/* Delete Layout Button */}
                        <Button variant="destructive" size="sm" onClick={handleDeleteLayout}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-100 h-96 rounded-lg flex items-center justify-center overflow-hidden">
                      {layoutPlanUrl ? (
                        isLayoutImage ? (
                          <AppImage
                            src={layoutPlanUrl}
                            alt="Event Layout Plan"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain rounded-lg"
                            loading="lazy"
                          />
                        ) : isLayoutPdf ? (
                          <iframe
                            title="Event Layout Plan"
                            src={useGoogleLayoutViewer ? getGoogleDocsViewerUrl(layoutPlanUrl) : layoutPlanUrl}
                            className="h-full w-full border-0 bg-white"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-500 mb-2">Layout plan available</p>
                            <Button asChild>
                              <a href={layoutPlanUrl} target="_blank" rel="noopener noreferrer">
                                View Layout Plan
                              </a>
                            </Button>
                          </div>
                        )
                      ) : (
                        <p className="text-gray-500">No layout plan available</p>
                      )}
                    </div>

                    {/* Debug information - you can remove this in production */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brochure">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Brochure</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('brochure-upload')?.click()}
                          disabled={updatingBrochure}
                        >
                          {updatingBrochure ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                          ) : (
                            <Edit2 className="w-4 h-4 mr-2" />
                          )}
                          {updatingBrochure ? "Updating..." : "Update"}
                        </Button>
                        <input
                          id="brochure-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.odt,.ods,.odp,.png,.jpg,.jpeg,.webp,.gif,application/*,image/*"
                          className="hidden"
                          onChange={handleBrochureUpdate}
                        />
                        {event?.brochure && (
                          <Button variant="destructive" size="sm" onClick={handleDeleteBrochure}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event?.brochure ? (
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 bg-slate-50 px-4 py-2">
                              <p className="text-sm font-semibold text-gray-900">Event Brochure</p>
                              <p className="text-xs text-gray-500">
                                Preview below (PDF, Word, Excel, PowerPoint, or images). Other types: download to open.
                              </p>
                            </div>
                            <EventBrochurePreview url={brochureUrl} />
                          </div>
                          <aside className="flex w-full shrink-0 flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 lg:w-52">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Download</p>
                              <p
                                className="mt-1 truncate text-xs text-gray-500"
                                title={brochureFriendlyFilename(
                                  brochureUrl,
                                  event.title ? `${event.title} brochure` : undefined,
                                )}
                              >
                                {brochureFriendlyFilename(
                                  brochureUrl,
                                  event.title ? `${event.title} brochure` : undefined,
                                )}
                              </p>
                            </div>
                            <Button
                              type="button"
                              className="w-full gap-2"
                              disabled={downloadingBrochure}
                              onClick={handleBrochureDownload}
                            >
                              <Download className="h-4 w-4 shrink-0" />
                              {downloadingBrochure ? "Downloading…" : "Download"}
                            </Button>
                            <Button variant="outline" asChild className="w-full gap-2">
                              <a href={brochureUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 shrink-0" />
                                Open in new tab
                              </a>
                            </Button>
                          </aside>
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-96 rounded-lg flex flex-col items-center justify-center">
                          <p className="text-gray-600 mb-4">No brochure available</p>
                          <Button
                            onClick={() => document.getElementById('brochure-upload')?.click()}
                            disabled={updatingBrochure}
                          >
                            {updatingBrochure ? "Uploading..." : "Upload Brochure"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="venue">
  <div className="py-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Venue
      </h2>
      <p className="text-sm text-gray-500">
        Current Event Venue
      </p>
    </div>

    {event.venue ? (
      <div
        className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-shadow cursor-pointer max-w-sm"
        onClick={() => {
          const id = event.venue?.id
          if (!id) return

          router.push(
            getVenuePublicPath(
              id,
              event.venue?.venueName ?? event.venue?.company ?? null
            )
          )
        }}
      >
        {/* Banner */}
        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
          {event.venue?.venueImages?.[0] ? (
            <img
              src={event.venue.venueImages[0]}
              alt={event.venue?.venueName || "Venue"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#004A96] via-[#003d7a] to-[#002f5e] flex items-center justify-center">
              <span className="text-5xl font-bold text-white opacity-30">
                {event.venue?.venueName?.charAt(0) || "V"}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Title */}
          <div className="absolute bottom-3 left-4 right-4">
            <h4 className="text-white font-bold text-xl leading-tight">
              {event.venue?.venueName ||
                event.venue?.company ||
                "Venue"}
            </h4>

            {event.venue?.location && (
              <p className="text-white/80 text-xs mt-0.5">
                {event.venue.location}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-4 pb-4">

          {/* Description */}
          {event.venue?.venueDescription && (
            <div className="mb-3">
              {event.venue.venueDescription.length > 120 ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.venue.venueDescription
                    .slice(0, 120)
                    .trimEnd()}
                  ...{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()

                      const id = event.venue?.id
                      if (!id) return

                      router.push(
                        getVenuePublicPath(
                          id,
                          event.venue?.venueName ??
                            event.venue?.company ??
                            null
                        )
                      )
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    more
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.venue.venueDescription}
                </p>
              )}
            </div>
          )}

          {/* Website */}
          {event.venue?.venueWebsite && (
            <a
              href={event.venue.venueWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline block mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {event.venue.venueWebsite}
            </a>
          )}

          {/* Amenities */}
          {event.venue?.amenities?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-bold text-gray-800 mb-2">
                Amenities
              </p>

              <div className="flex flex-wrap gap-2">
                {event.venue.amenities.map(
                  (amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100"
                    >
                      {amenity}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          <hr className="border-gray-200 mb-3 mt-2" />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()

                const id = event.venue?.id
                if (!id) return

                router.push(
                  getVenuePublicPath(
                    id,
                    event.venue?.venueName ??
                      event.venue?.company ??
                      null
                  )
                )
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
            >
              View Venue
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="py-12 text-center text-gray-500">
        <p>No venue assigned to this event yet.</p>
      </div>
    )}
  </div>
</TabsContent>
              
              <TabsContent value="speakers">
  <div className="py-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Speakers</h2>
      <p className="text-sm text-gray-500">
        {event.speakerSessions?.length || 0} Speakers of Current Edition
      </p>
    </div>

    {event.speakerSessions?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {event.speakerSessions.map((session: any) => (
          <div
            key={session.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
            onClick={() =>
              router.push(
                getPublicProfilePath("speaker", {
                  id: session.speaker?.id,
                  publicSlug: session.speaker?.publicSlug,
                  firstName: session.speaker?.firstName,
                  lastName: session.speaker?.lastName,
                }),
              )
            }
          >
            <div className="p-4 flex flex-col flex-1">
              {/* Top row: avatar + name + session title */}
              <div className="flex items-center gap-3 mb-3">
                {/* Circular avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {session.speaker?.avatar ? (
                    <img
                      src={session.speaker.avatar}
                      alt={`${session.speaker?.firstName} ${session.speaker?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#004A96] to-[#2d6a9f] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {session.speaker?.firstName?.charAt(0) || "S"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + session title */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base leading-tight">
                    {[session.speaker?.firstName, session.speaker?.lastName]
                      .filter(Boolean)
                      .join(" ") || "Speaker"}
                  </h4>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5 leading-tight">
                    {session.title || ""}
                  </p>
                  {(session.speaker?.company || session.speaker?.organizationName) && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {session.speaker?.company || session.speaker?.organizationName}
                    </p>
                  )}
                </div>
              </div>

              {/* Description with truncation + More link */}
              {session.description && (
                <div className="flex-1 mb-3">
                  {session.description.length > 100 ? (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {session.description.slice(0, 100).trimEnd()}...{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(
                            getPublicProfilePath("speaker", {
                              id: session.speaker?.id,
                              publicSlug: session.speaker?.publicSlug,
                              firstName: session.speaker?.firstName,
                              lastName: session.speaker?.lastName,
                            }),
                          )
                        }}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        more
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                </div>
              )}

              {/* Spacer to push divider + button to bottom */}
              <div className="flex-1" />

              {/* Divider + Delete button */}
              <hr className="border-gray-200 mb-3" />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSpeaker(session.id)
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-12 text-center text-gray-500">
        <p>No speakers scheduled yet.</p>
      </div>
    )}
  </div>
</TabsContent>


              <TabsContent value="organizer">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      onClick={() =>
                        router.push(
                          getPublicProfilePath("organizer", {
                            id: event.organizer?.id,
                            publicSlug: event.organizer?.publicSlug,
                            organizationName: event.organizer?.company || event.organizer?.firstName,
                          }),
                        )
                      }
                    >
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={event.organizer?.avatar } />
                        <AvatarFallback className="text-lg">
                          {event.organizer?.company}
                          {/* {event.organizer?.firstName?.charAt(0) || "O"} */}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                          {event.organizer?.company || event.organizer?.firstName}
                        </h4>
                        {(() => {
                          const line = formatOrganizerCityCountryLine(event.organizer)
                          return line ? (
                            <p className="text-gray-600 mb-3 text-sm">{line}</p>
                          ) : null
                        })()}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-green-600" />
                            <span>{event.organizer?.email || "Contact via platform"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
