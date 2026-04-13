"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VisitorBadge } from "./visitor-badge"

interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  company?: string
  event: {
    id: string
    title: string
    images?: string[]
  }
}

interface BulkBadgeSenderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendees: Attendee[]
  eventId: string
  organizer: {
    avatar?: string
    organizationName?: string
  }
}

export function BulkBadgeSenderDialog({
  open,
  onOpenChange,
  attendees,
  eventId,
  organizer,
}: BulkBadgeSenderDialogProps) {
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [badgeDataUrls, setBadgeDataUrls] = useState<Record<string, string>>({})
  const [generatingBadges, setGeneratingBadges] = useState(false)
  const [results, setResults] = useState<{
    success: string[]
    failed: { id: string; email: string; error: string }[]
  }>({ success: [], failed: [] })
  const { toast } = useToast()

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setProgress(0)
      setCurrentIndex(0)
      setBadgeDataUrls({})
      setResults({ success: [], failed: [] })
      setSending(false)
      setGeneratingBadges(true)
    }
  }, [open])

  // Handle badge generation callback
  const handleBadgeGenerated = (attendeeId: string, dataUrl: string) => {
    setBadgeDataUrls((prev) => {
      const updated = { ...prev, [attendeeId]: dataUrl }
      console.log("[v0] Badge generated for attendee:", attendeeId, "Total:", Object.keys(updated).length)
      return updated
    })
  }

  // Check if all badges are generated
  useEffect(() => {
    if (generatingBadges && Object.keys(badgeDataUrls).length === attendees.length && attendees.length > 0) {
      console.log("[v0] All badges generated, ready to send")
      setGeneratingBadges(false)
    }
  }, [badgeDataUrls, attendees.length, generatingBadges])

  const handleSendAll = async () => {
    try {
      setSending(true)
      setProgress(0)
      setCurrentIndex(0)

      console.log("[v0] Starting bulk badge send for", attendees.length, "attendees")

      const attendeeIds = attendees.map((a) => a.id)

      const response = await fetch(`/api/events/${eventId}/attendees/badges/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendeeIds,
          badgeDataUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send badges")
      }

      console.log("[v0] Bulk send complete:", data)

      setResults(data.data)
      setProgress(100)

      toast({
        title: "Badges Sent",
        description: `Successfully sent ${data.data.success.length} badges. ${data.data.failed.length} failed.`,
      })

      if (data.data.failed.length === 0) {
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Error sending badges:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send badges. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const totalAttendees = attendees.length
  const successCount = results.success.length
  const failedCount = results.failed.length

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Badges to All Attendees</DialogTitle>
            <DialogDescription>
              {generatingBadges
                ? `Generating badges for ${totalAttendees} attendees...`
                : sending
                  ? `Sending badges to ${totalAttendees} attendees...`
                  : `Ready to send badges to ${totalAttendees} attendees`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress */}
            {(generatingBadges || sending) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {generatingBadges
                      ? `Generating badges: ${Object.keys(badgeDataUrls).length} / ${totalAttendees}`
                      : `Sending: ${successCount + failedCount} / ${totalAttendees}`}
                  </span>
                  <span>{Math.round((Object.keys(badgeDataUrls).length / totalAttendees) * 100)}%</span>
                </div>
                <Progress
                  value={
                    generatingBadges
                      ? (Object.keys(badgeDataUrls).length / totalAttendees) * 100
                      : ((successCount + failedCount) / totalAttendees) * 100
                  }
                />
              </div>
            )}

            {/* Results Summary */}
            {!sending && !generatingBadges && (successCount > 0 || failedCount > 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{successCount} badges sent successfully</span>
                </div>
                {failedCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">{failedCount} badges failed to send</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto bg-red-50 p-3 rounded-md space-y-1">
                      {results.failed.map((fail) => (
                        <div key={fail.id} className="text-sm text-red-800">
                          {fail.email}: {fail.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending || generatingBadges}>
                {successCount > 0 || failedCount > 0 ? "Close" : "Cancel"}
              </Button>
              <Button
                onClick={handleSendAll}
                disabled={sending || generatingBadges || Object.keys(badgeDataUrls).length !== totalAttendees}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : generatingBadges ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Badges...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send All Badges
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden badge generators for all attendees */}
      {open && (
        <div className="hidden">
          {attendees.map((attendee) => (
            <VisitorBadge
              key={attendee.id}
              attendee={attendee}
              event={attendee.event}
              organizer={organizer}
              onGenerated={(dataUrl) => handleBadgeGenerated(attendee.id, dataUrl)}
            />
          ))}
        </div>
      )}
    </>
  )
}
