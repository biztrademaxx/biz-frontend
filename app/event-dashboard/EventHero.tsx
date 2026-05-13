"use client"

import type React from "react"

import { Calendar, Clock, Ticket, Users, Trash2, Upload, Edit2 } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { formatPublicTicketPriceLine } from "@/lib/ticket-price-display"
import { formatEventSidebarTimeRange } from "@/lib/event-sidebar-time-range"

interface Event {
  id: string
  title: string
  address?: string
  startDate?: string
  endDate?: string
  timezone?: string
  postponedReason?: string
  images: string[]
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

interface EventHeroProps {
  event: Event
  onImagesUpdate?: (images: string[]) => void
}

export default function EventHero({ event, onImagesUpdate }: EventHeroProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(event.title)
  const [images, setImages] = useState<string[]>(event.images || [])
  const [isEditingImages, setIsEditingImages] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { toast } = useToast()
  const [newImageUrl, setNewImageUrl] = useState("")

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  useEffect(() => {
    const slider = instanceRef.current
    if (!slider) return
    const interval = setInterval(() => {
      slider.next()
    }, 5000)
    return () => clearInterval(interval)
  }, [instanceRef])

  useEffect(() => {
    setImages(event.images || [])
  }, [event.images])

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
      const formData = new FormData()
      formData.append("file", file)

      const uploadData = await apiFetch<{ url?: string }>("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
        auth: true,
      })

      const imageUrl = uploadData?.url
      if (!imageUrl) throw new Error("No URL returned from upload")

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
    if (images.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last image",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const updatedImages = images.filter((_, index) => index !== currentSlide)

      await apiFetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: { images: updatedImages },
        auth: true,
      })

      setImages(updatedImages)
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
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Flex container - no gap, full width */}
        <div className="flex flex-col md:flex-row w-full rounded-xl overflow-hidden shadow-lg">

          {/* Left side - Slider (2/3 width) */}
          <div className="w-full md:w-2/3 relative bg-gray-100">
            <div className="relative h-[260px] md:h-[320px] w-full">
              <div ref={sliderRef} className="keen-slider h-full w-full">
                {images.length > 0 ? (
                  <>
                    {images.map((img, index) => (
                      <div key={`image-${index}`} className="keen-slider__slide relative h-full w-full">
                        <Image
                          src={img || "/herosection-images/test.jpeg"}
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
                    <Image src="/herosection-images/test.jpeg" alt="Default Image" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Image editing controls */}
              {isEditingImages && (
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <Button size="sm" variant="destructive" onClick={handleDeleteImage} className="shadow-lg">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-20">
                <Button
                  size="sm"
                  variant={isEditingImages ? "default" : "secondary"}
                  onClick={() => setIsEditingImages(!isEditingImages)}
                  className="shadow-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isEditingImages ? "Done" : "Edit Images"}
                </Button>
              </div>

              {isEditingImages && (
                <div className="absolute bottom-16 right-4 bg-white p-4 rounded-lg shadow-xl border z-20 w-80">
                  <h4 className="font-semibold mb-2 text-sm">Add New Image</h4>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Choose Image</span>
                        </>
                      )}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">Max size: 10MB</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current: {currentSlide + 1} of {images.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Info with WHITE background (1/3 width) */}
          <div className="w-full md:w-1/3 bg-white p-4 flex flex-col justify-center">            {/* Title */}
            <div className="mb-5">
              {isEditing ? (
                <div className="flex w-full gap-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
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

            {/* Event details */}
            <div className="space-y-3">
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Date</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {event.startDate && event.endDate ? (
                      <>
                        {new Date(event.startDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {" - "}
                        {new Date(event.endDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </>
                    ) : (
                      "Date to be announced"
                    )}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Time</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatEventSidebarTimeRange(event)}
                  </p>
                </div>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Ticket Price</p>
                  <p className="text-sm text-gray-900 font-medium">
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
          </div>
        </div>
      </div>
    </div>
  )
}