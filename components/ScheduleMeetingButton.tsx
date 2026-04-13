"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserId, isAuthenticated, apiFetch } from "@/lib/api"

interface Exhibitor {
  id: string
  companyName?: string
  firstName?: string
  isSample?: boolean
  userId?: string
}

export default function ScheduleMeetingButton({
  exhibitor,
  eventId,
}: {
  exhibitor: Exhibitor
  eventId: string
}) {
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const handleScheduleMeeting = async () => {
    try {
      setCreating(true)

      if (exhibitor.isSample) {
        toast({
          title: "Demo Mode",
          description: "This is a sample exhibitor. Please add real exhibitors to schedule actual meetings.",
          variant: "destructive",
        })
        return
      }

      if (!isAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please log in to schedule meetings.",
          variant: "destructive",
        })
        return
      }

      const requesterId = getCurrentUserId()
      if (!requesterId) {
        toast({
          title: "Authentication Required",
          description: "Please log in to schedule meetings.",
          variant: "destructive",
        })
        return
      }

      const exhibitorUserId = exhibitor.userId || exhibitor.id
      const body = {
        eventId,
        exhibitorId: exhibitorUserId,
        requesterId,
        title: `Meeting with ${exhibitor.companyName}`,
        description: `Meeting request with ${exhibitor.firstName} from ${exhibitor.companyName}`,
        requestedDate: new Date().toISOString().split("T")[0],
        requestedTime: "09:00",
        duration: 30,
        purpose: "Networking",
      }

      await apiFetch("/api/appointments", {
        method: "POST",
        body,
        auth: true,
      })

      toast({
        title: "Success",
        description: `Meeting request sent to ${exhibitor.companyName}!`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to schedule meeting",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <button
      onClick={handleScheduleMeeting}
      disabled={creating || exhibitor.isSample}
      className={`w-full mt-4 px-2 border-2 text-sm py-2 rounded-full font-semibold transition flex items-center justify-center ${
        exhibitor.isSample
          ? "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed"
          : "border-red-600 text-white bg-red-600 hover:bg-red-700"
      }`}
    >
      {creating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...
        </>
      ) : (
        <>{exhibitor.isSample ? "Sample Data" : "Schedule Meeting"}</>
      )}
    </button>
  )
}
