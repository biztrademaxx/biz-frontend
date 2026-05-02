"use client"

import type React from "react"

import { Calendar, Clock, Ticket, Users, Trash2, Upload } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

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
  ticketTypes: string[]
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
  const normalizeTimezone = (tz?: string, countryHint?: string) => {
    const country = String(countryHint || "").trim().toLowerCase()
    if (country.includes("india")) return "Asia/Kolkata"
    if (!tz) return "Asia/Kolkata"
    if (tz === "Indian/Chagos" && country.includes("india")) return "Asia/Kolkata"
    return tz
  }
  const displayTimezone = normalizeTimezone(
    event.timezone,
    (event as any)?.country || event.location?.country || (event as any)?.venue?.venueCountry,
  )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Backend image limit 10MB
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

      // Backend `POST /api/upload/cloudinary` (Bearer JWT) — not Next.js :3000 route (NextAuth session)
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
      // Reset file input
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
    <div>
      {/* Background Image */}
      <div className="relative h-[200px] md:h-[300px] lg:h-[400px]">
        <img src={"/banners/banner1.jpg"} alt={event.title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto  rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row mt-[-100px] sm:mt-[-120px] md:mt-[-150px] z-10 left-1/2 -translate-x-1/2">
        {/* Slider */}
        <div className="md:w-2/3 w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[400px] relative">
          <div ref={sliderRef} className="keen-slider h-full w-full">
            {images.length > 0 ? (
              <>
                {images.map((img, index) => (
                  <div key={`image-${index}`} className="keen-slider__slide relative h-full w-full">
                    <Image
                      src={img || "/city/c4.jpg"}
                      alt={`${event.title} Image ${index + 1}`}
                      fill
                      className=""
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

          {/* Image editing controls overlay */}
          {isEditingImages && (
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <Button size="sm" variant="destructive" onClick={handleDeleteImage} className="shadow-lg">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Current
              </Button>
            </div>
          )}

          {/* Toggle edit mode button */}
          <div className="absolute bottom-4 right-4 z-20 pl-2">
            <Button
              size="sm"
              variant={isEditingImages ? "default" : "secondary"}
              onClick={() => setIsEditingImages(!isEditingImages)}
              className="shadow-lg mx-4"
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
                <p className="text-xs text-muted-foreground">Max size: 5MB</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current: {currentSlide + 1} of {images.length}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:w-1/3 w-full bg-blue-50 p-4 sm:p-6  flex flex-col justify-center space-y-3">
          {/* Title with edit option */}
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex w-full gap-2">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
              </div>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black leading-snug">{title}</h2>
              </>
            )}
          </div>

          {/* Date info */}
          <div className="space-y-3 text-xs sm:text-sm text-gray-800 py-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <p>
                {new Date(event.startDate || "").toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(event.endDate || "").toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span>
                {new Date(event.startDate || "9:00 am").toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: displayTimezone,
                })}{" "}
                –{" "}
                {new Date(event.endDate || "6:00 pm").toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: displayTimezone,
                })}
              </span>

            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span>{event.ticketTypes?.map((ticket: any) => `${ticket.name}: ₹${ticket.price}`).join(" | ")}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span>{event.leads?.length || 0} Leads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
