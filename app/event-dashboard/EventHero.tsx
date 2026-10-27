"use client"

import type React from "react"

import { Calendar, Clock, Ticket, Users, Trash2, Upload, Edit2, ChevronLeft, ChevronRight } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { EventDetailsBanner } from "@/components/event-details-banner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { formatEventSidebarTimeRange } from "@/lib/event-sidebar-time-range"
import {
  EventScheduleEditFields,
  buildScheduleIsoPayload,
  scheduleFormFromEvent,
  type EventScheduleFormState,
} from "@/components/event-schedule/EventScheduleEditFields"
import { formatEventPublicDateRange, isEventPostponed } from "@/lib/event-schedule-display"

interface Event {
  id: string
  title: string
  address?: string
  startDate?: string
  endDate?: string
  timezone?: string
  isPostponed?: boolean
  previousStartDate?: string | null
  previousEndDate?: string | null
  postponedReason?: string
  images: string[]
  bannerImage?: string | null
  videos?: string[]
  description: string
  shortDescription: string
  leads: string[]
  ticketTypes: any[]
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
}

type SchedulePatch = {
  startDate: string
  endDate: string
  isPostponed?: boolean
  previousStartDate?: string | null
  previousEndDate?: string | null
}

interface EventHeroProps {
  event: Event
  onImagesUpdate?: (images: string[]) => void
  onBannerImageUpdate?: (bannerImage: string | null) => void
  onScheduleUpdate?: (patch: SchedulePatch) => void
}

export default function EventHero({ event, onImagesUpdate, onBannerImageUpdate, onScheduleUpdate }: EventHeroProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(event.title)
  const [images, setImages] = useState<string[]>(event.images || [])
  const [bannerImage, setBannerImage] = useState(event.bannerImage ?? null)
  const [bannerSaving, setBannerSaving] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [isEditingImages, setIsEditingImages] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { toast } = useToast()
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleForm, setScheduleForm] = useState<EventScheduleFormState>(() =>
    scheduleFormFromEvent(event),
  )

  useEffect(() => {
    if (!isEditingSchedule) {
      setScheduleForm(scheduleFormFromEvent(event))
    }
  }, [event.startDate, event.endDate, isEditingSchedule])

  const galleryBusy = isUploading || isDeletingImage
  const videoCount = images.length > 0 ? (event.videos?.length ?? 0) : 0
  const galleryMediaCount = images.length + videoCount
  const selectableSlideCount = isEditingImages ? images.length : galleryMediaCount

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: !isEditingImages,
    drag: !isEditingImages && !galleryBusy,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  useEffect(() => {
    const slider = instanceRef.current
    if (!slider || isEditingImages || galleryBusy || galleryMediaCount < 2) return
    const interval = setInterval(() => {
      slider.next()
    }, 5000)
    return () => clearInterval(interval)
  }, [instanceRef, isEditingImages, galleryBusy, galleryMediaCount])

  useEffect(() => {
    const slider = instanceRef.current
    if (!slider) return
    const index = Math.min(slider.track.details?.rel ?? 0, Math.max(galleryMediaCount - 1, 0))
    slider.update(undefined, index)
    setCurrentSlide(index)
  }, [images, videoCount, instanceRef])

  useEffect(() => {
    setImages(event.images || [])
  }, [event.images])

  useEffect(() => {
    setBannerImage(event.bannerImage ?? null)
  }, [event.id, event.bannerImage])

  const selectSlide = (index: number) => {
    if (galleryBusy) return
    setCurrentSlide(index)
    instanceRef.current?.moveToIdx(index, true, isEditingImages ? { duration: 0 } : undefined)
  }

  const toggleImageEditing = () => {
    if (galleryBusy) return
    const slider = instanceRef.current
    slider?.animator.stop()
    if (!isEditingImages) {
      const index = Math.min(currentSlide, Math.max(images.length - 1, 0))
      setCurrentSlide(index)
      slider?.moveToIdx(index, true, { duration: 0 })
    }
    setIsEditingImages(!isEditingImages)
  }

  const saveBannerImage = async (nextBannerImage: string | null) => {
    const updated = await apiFetch<{ bannerImage: string | null }>(`/api/events/${event.id}`, {
      method: "PATCH",
      auth: true,
      body: { bannerImage: nextBannerImage },
    })
    setBannerImage(updated.bannerImage)
    onBannerImageUpdate?.(updated.bannerImage)
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]
    input.value = ""
    if (!file || bannerSaving) return

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast({
        title: "Invalid banner image",
        description: "Choose an image no larger than 10MB.",
        variant: "destructive",
      })
      return
    }

    setBannerSaving(true)
    try {
      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const imageUrl = await uploadFileViaProxy(file, "image")
      await saveBannerImage(imageUrl)
      toast({ title: "Banner updated", description: "Your banner is now visible on the public event page." })
    } catch (error) {
      toast({
        title: "Banner upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setBannerSaving(false)
    }
  }

  const handleRemoveBanner = async () => {
    if (bannerSaving) return
    setBannerSaving(true)
    try {
      await saveBannerImage(null)
      toast({ title: "Banner removed" })
    } catch (error) {
      toast({
        title: "Could not remove banner",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setBannerSaving(false)
    }
  }

  const handleSaveSchedule = async () => {
    const tz = event.timezone?.trim() || "Asia/Kolkata"
    const payload = buildScheduleIsoPayload(scheduleForm, tz)
    if (!payload) {
      toast({
        title: "Invalid schedule",
        description: "Check dates and times. End must be after start.",
        variant: "destructive",
      })
      return
    }

    try {
      setScheduleSaving(true)
      const updated = await apiFetch<SchedulePatch & { id: string }>(`/api/events/${event.id}`, {
        method: "PATCH",
        auth: true,
        body: payload,
      })

      onScheduleUpdate?.({
        startDate: updated.startDate ?? payload.startDate,
        endDate: updated.endDate ?? payload.endDate,
        isPostponed: updated.isPostponed,
        previousStartDate: updated.previousStartDate ?? null,
        previousEndDate: updated.previousEndDate ?? null,
      })

      setIsEditingSchedule(false)
      toast({
        title: "Schedule updated",
        description: "Visitors will see the new date on the event page.",
      })
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast({
        title: "Error",
        description: "Failed to update date and time",
        variant: "destructive",
      })
    } finally {
      setScheduleSaving(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedImages = [...images, newImageUrl]

      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { images: updatedImages },
        auth: true,
      })

      setImages(updatedImages)
      setNewImageUrl("")
      onImagesUpdate?.(updatedImages)
      toast({
        title: "Success",
        description: "Image added successfully",
      })
    } catch (error) {
      console.error("Error adding image:", error)
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (galleryBusy) return
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const { uploadFileViaProxy } = await import("@/components/organizer-create-event/upload-backend")
      const imageUrl = await uploadFileViaProxy(file, "image")

      const updatedImages = [...images, imageUrl]

      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { images: updatedImages },
        auth: true,
      })

      setImages(updatedImages)
      onImagesUpdate?.(updatedImages)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDeleteImage = async () => {
    if (galleryBusy || currentSlide < 0 || currentSlide >= images.length) return
    const imageIndex = currentSlide
    if (images.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last image",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Delete image ${imageIndex + 1}?`)) return

    setIsDeletingImage(true)
    try {
      const updatedImages = images.filter((_, index) => index !== imageIndex)

      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { images: updatedImages },
        auth: true,
      })

      setImages(updatedImages)
      setCurrentSlide(Math.min(imageIndex, updatedImages.length - 1))
      onImagesUpdate?.(updatedImages)
      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setIsDeletingImage(false)
    }
  }

  return (
    <div className="w-full">
        <div className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-lg md:flex-row md:items-start">

          {/* Gallery and image editor */}
          <div className="flex w-full min-w-0 shrink-0 flex-col bg-gray-100 md:w-2/3">
            <div className="relative h-[220px] w-full shrink-0 sm:h-[260px] md:h-[280px]">
            <div className="absolute inset-0">
              <div ref={sliderRef} className="keen-slider h-full w-full [&_.keen-slider__slide]:!h-full">
                {images.length > 0 ? (
                  <>
                    {images.map((img, index) => (
                      <div
                        key={`image-${index}`}
                        className="keen-slider__slide relative !h-full min-h-full w-full"
                      >
                        <Image
                          src={img || "/herosection-images/test.jpeg"}
                          alt={`${event.title} Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 66vw"
                          priority={index === 0}
                        />
                      </div>
                    ))}

                    {event.videos?.map((vid: string, index: number) => (
                      <div
                        key={`video-${index}`}
                        className="keen-slider__slide relative !h-full min-h-full w-full"
                      >
                        <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
                          <source src={vid} type="video/mp4" />
                        </video>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="keen-slider__slide relative !h-full min-h-full w-full">
                    <Image
                      src="/herosection-images/test.jpeg"
                      alt="Default Image"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  </div>
                )}
              </div>

              <div
                role="status"
                aria-label="Gallery image count"
                className="absolute left-3 top-3 z-20 rounded-md bg-black/65 px-2.5 py-1 text-xs font-medium tabular-nums text-white"
              >
                {images.length === 0
                  ? "0 images"
                  : currentSlide < images.length
                    ? `Image ${currentSlide + 1} / ${images.length}`
                    : `Video ${currentSlide - images.length + 1} / ${videoCount} · ${images.length} images`}
              </div>

              {selectableSlideCount > 1 && (
                <div className="pointer-events-none absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 justify-between">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="pointer-events-auto h-9 w-9 rounded-full shadow-md"
                    aria-label="Previous slide"
                    disabled={galleryBusy}
                    onClick={() => selectSlide((currentSlide - 1 + selectableSlideCount) % selectableSlideCount)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="pointer-events-auto h-9 w-9 rounded-full shadow-md"
                    aria-label="Next slide"
                    disabled={galleryBusy}
                    onClick={() => selectSlide((currentSlide + 1) % selectableSlideCount)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {isEditingImages && images.length > 0 && (
                <div className="absolute right-3 top-3 z-20">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteImage}
                    disabled={galleryBusy || images.length <= 1 || currentSlide >= images.length}
                    aria-label="Delete selected image"
                    className="shadow-lg"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeletingImage ? "Deleting..." : `Delete image ${currentSlide + 1}`}
                  </Button>
                </div>
              )}

              <div className="absolute bottom-3 right-3 z-20">
                <Button
                  size="sm"
                  variant={isEditingImages ? "default" : "secondary"}
                  onClick={toggleImageEditing}
                  disabled={galleryBusy}
                  className="shadow-lg"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditingImages ? "Done" : "Edit Images"}
                </Button>
              </div>
            </div>
            </div>

            {isEditingImages && (
              <div className="space-y-3 border-t border-gray-200 bg-white p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">Slideshow paused. Select an image to delete.</p>
                {images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto p-1" aria-label="Event images">
                    {images.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        aria-label={`Select image ${index + 1}`}
                        aria-pressed={currentSlide === index}
                        disabled={galleryBusy}
                        onClick={() => selectSlide(index)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 ${
                          currentSlide === index ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image src={img || "/herosection-images/test.jpeg"} alt="" fill sizes="80px" className="object-cover" />
                        <span className="absolute bottom-0.5 left-0.5 rounded bg-black/65 px-1 text-[10px] text-white">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground ${
                      galleryBusy ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/90"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={galleryBusy}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">Max size: 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Event details */}
          <div className="flex w-full flex-col justify-center bg-white p-4 sm:p-5 md:w-1/3 md:min-h-[320px]">
            {/* Title */}
            <div className="mb-5">
              {isEditing ? (
                <div className="flex w-full gap-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between group gap-2 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight break-words min-w-0 flex-1">
                    {title}
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Details + Banner on right */}
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              {/* Event details list */}
              <div className="space-y-3 min-w-0 flex-1">
                {isEditingSchedule ? (
                  <EventScheduleEditFields
                    form={scheduleForm}
                    onChange={setScheduleForm}
                    onSave={handleSaveSchedule}
                    onCancel={() => {
                      setIsEditingSchedule(false)
                      setScheduleForm(scheduleFormFromEvent(event))
                    }}
                    saving={scheduleSaving}
                  />
                ) : (
                  <>
                    {/* Date */}
                    <div className="group flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-xs uppercase text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {formatEventPublicDateRange(event.startDate, event.endDate)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setIsEditingSchedule(true)}
                        aria-label="Edit date and time"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-xs uppercase text-gray-500">Time</p>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {formatEventSidebarTimeRange(event)}
                        </p>
                      </div>
                    </div>

                    {isEventPostponed(event) && (
                      <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                        Postponed — new dates shown above. Public event page will display a postponement notice.
                      </p>
                    )}
                  </>
                )}

                {/* Ticket Price */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase mb-0.5">Ticket Price</p>
                    <p className="text-sm font-medium text-gray-900 break-words leading-snug">
                      {formatPublicTicketPriceLine(event.ticketTypes)}
                    </p>
                  </div>
                </div>

                {/* Leads */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-0.5">Leads</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {event.leads?.length || 0} {event.leads?.length === 1 ? 'Lead' : 'Leads'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner on the right side */}
              <div className="flex flex-col items-center shrink-0 space-y-2 pt-0.5" aria-busy={bannerSaving}>
                {bannerImage ? (
                  <EventDetailsBanner
                    imageUrl={bannerImage}
                    title={event.title}
                    aspectRatio="square"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg"
                  />
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => bannerInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        bannerInputRef.current?.click()
                      }
                    }}
                    className="flex aspect-square w-24 h-24 sm:w-28 sm:h-28 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-center text-xs text-slate-500 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <Upload className="h-4 w-4 mb-1 text-slate-400" />
                    <span>Add banner</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={bannerSaving}
                  >
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    {bannerSaving ? "Saving banner..." : bannerImage ? "Replace banner" : "Upload banner"}
                  </Button>
                  {bannerImage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Remove banner image"
                      className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                      onClick={handleRemoveBanner}
                      disabled={bannerSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload event banner image"
                  onChange={handleBannerUpload}
                  disabled={bannerSaving}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400 text-center leading-tight">Square · Max 10MB</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
