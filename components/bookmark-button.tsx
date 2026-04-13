"use client"

import { useState, useEffect, ReactNode } from "react"
import { Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch, getCurrentUserId, isAuthenticated } from "@/lib/api"

interface BookmarkButtonProps {
  eventId: string
  className?: string
  children?: ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function BookmarkButton({ 
  eventId, 
  className = "", 
  children,
  onClick 
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const userId = getCurrentUserId()

  useEffect(() => {
    if (userId) {
      checkSavedStatus()
    }
  }, [eventId, userId])

  const checkSavedStatus = async () => {
    try {
      const data = await apiFetch<{ isSaved: boolean }>(`/api/events/${eventId}/save`, { auth: true })
      setIsSaved(data.isSaved)
    } catch (error) {
      console.error("Error checking saved status:", error)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default behavior
    e.stopPropagation() // Stop event from bubbling up to parent

    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e)
    }

    if (!isAuthenticated() || !userId) {
      alert("Please log in to Follow this event")
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      if (isSaved) {
        await apiFetch(`/api/events/${eventId}/save`, { method: "DELETE", auth: true })
        setIsSaved(false)
      } else {
        await apiFetch(`/api/events/${eventId}/save`, { method: "POST", auth: true })
        setIsSaved(true)
      }
    } catch (error) {
      console.error("Error updating bookmark:", error)
      alert("Failed to save event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`transition-colors duration-200 ${
        isSaved ? "text-blue-600 hover:text-blue-700" : "text-gray-700 hover:text-gray-900"
      } ${className}`}
      title={isSaved ? "Remove from saved" : "Save event"}
    >
      {children || <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />}
    </button>
  )
}