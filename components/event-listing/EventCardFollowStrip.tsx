"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, UserPlus, UserCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch, getCurrentUserId, isAuthenticated } from "@/lib/api"
import { readInterestLocalStorage } from "@/lib/event-leads-client"
import { useToast } from "@/hooks/use-toast"
import { avatarUrlFromRecord } from "@/lib/user-avatar-url"

export type ListingFollowerFace = {
  avatar?: string | null
  image?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  displayName?: string | null
}

function faceUrl(f: ListingFollowerFace): string | undefined {
  const url = avatarUrlFromRecord(f as unknown as Record<string, unknown>)
  if (url) return url
  const legacy = f.avatar || f.image
  return typeof legacy === "string" && legacy.trim() ? legacy.trim() : undefined
}

function faceInitials(f: ListingFollowerFace): string {
  const dn = f.displayName || f.name
  if (typeof dn === "string" && dn.trim()) return dn.trim().slice(0, 2).toUpperCase()
  const a = typeof f.firstName === "string" ? f.firstName.trim().charAt(0) : ""
  const b = typeof f.lastName === "string" ? f.lastName.trim().charAt(0) : ""
  const s = `${a}${b}`.toUpperCase()
  return s || "?"
}

interface EventCardFollowStripProps {
  eventId: string
  eventPath: string
  eventTitle: string
  followerPreview: ListingFollowerFace[]
  followersCount: number
}

export function EventCardFollowStrip({
  eventId,
  eventPath,
  eventTitle,
  followerPreview,
  followersCount: initialCount,
}: EventCardFollowStripProps) {
  const router = useRouter()
  const { toast } = useToast()
  const userId = getCurrentUserId()

  const [isSaved, setIsSaved] = useState(false)
  const [visiting, setVisiting] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    setVisiting(readInterestLocalStorage(eventId).visiting)
  }, [eventId])

  useEffect(() => {
    if (!userId || !eventId) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch<{ isSaved?: boolean }>(`/api/events/${eventId}/save`, { auth: true })
        if (!cancelled) setIsSaved(!!data?.isSaved)
      } catch {
        if (!cancelled) setIsSaved(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, userId])

  const label = isSaved ? "Following" : visiting ? "Visiting" : "Follow"

  const runBackgroundFollow = useCallback(async () => {
    if (!userId) return
    try {
      await apiFetch(`/api/events/${eventId}/save`, { method: "POST", auth: true })
      setIsSaved(true)
    } catch (e) {
      console.error("[EventCardFollowStrip] save failed", e)
      setCount((c) => Math.max(0, c - 1))
      setIsSaved(false)
      toast({
        title: "Could not follow",
        description: "Open the event page and try again.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }, [eventId, toast, userId])

  const onFollowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    router.push(eventPath)

    if (!isAuthenticated() || !userId) {
      return
    }

    if (isSaved || visiting) {
      return
    }

    setBusy(true)
    setCount((c) => c + 1)
    setIsSaved(true)
    void runBackgroundFollow()
  }

  const faces = followerPreview.slice(0, 3)
  const padSlots = Math.max(0, 3 - faces.length)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Users className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
        <div className="flex items-center -space-x-2">
          {faces.map((f, i) => {
            const src = faceUrl(f)
            return (
              <div
                key={i}
                className="relative h-8 w-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shrink-0 shadow-sm ring-1 ring-black/[0.06]"
                style={{ zIndex: i + 2 }}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-bold text-slate-600">
                    {faceInitials(f)}
                  </div>
                )}
              </div>
            )
          })}
          {Array.from({ length: padSlots }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm ring-1 ring-slate-200/80"
              style={{ zIndex: faces.length + i + 2 }}
              aria-hidden
            >
              <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />
            </div>
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
          {count.toLocaleString()} {count === 1 ? "follower" : "followers"}
        </span>
      </div>

      <Button
        type="button"
        variant={isSaved || visiting ? "outline" : "default"}
        size="sm"
        disabled={busy}
        className={`h-9 px-4 text-xs font-semibold shrink-0 ${
          isSaved || visiting ? "border-gray-300 text-gray-800" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={onFollowClick}
        title={eventTitle}
      >
        {isSaved || visiting ? (
          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
        ) : (
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
        )}
        {busy && !isSaved && !visiting ? "…" : label}
      </Button>
    </div>
  )
}
