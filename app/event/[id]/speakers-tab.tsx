"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, CheckCircle2, UsersRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPublicProfilePath } from "@/lib/profile-path"

interface Speaker {
  id: string
  publicSlug?: string
  firstName: string
  lastName: string
  company: string | null
  jobTitle: string | null
  avatar: string | null
  isVerified: boolean
}

interface Session {
  id: string
  description?: string | null
  speaker: Speaker
}

function getSpeakerInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
}

function getSpeakerAvatarStyles(firstName: string, lastName: string) {
  const seed = `${firstName}${lastName}`
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0)

  const variants = [
    "bg-[#DCEAFE] text-[#2563EB]",
    "bg-[#D9F0FF] text-[#0F9FB7]",
    "bg-[#E3F0FF] text-[#1D4ED8]",
  ]

  return variants[seed % variants.length]
}

export default function SpeakersTab({ eventId }: { eventId: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        const res = await fetch(`/api/events/speakers?eventId=${eventId}`)
        const data = await res.json()

        if (data.success && Array.isArray(data.sessions)) {
          const mappedSessions: Session[] = data.sessions.map((session: any) => ({
            id: session.id,
            description: session.description || null,
            speaker: {
              id: session.speaker.id,
              publicSlug: session.speaker.publicSlug,
              firstName: session.speaker.firstName,
              lastName: session.speaker.lastName,
              company: session.speaker.company || null,
              jobTitle: session.speaker.jobTitle || null,
              avatar: session.speaker.avatar || null,
              isVerified: session.speaker.isVerified || false,
            },
          }))
          setSessions(mappedSessions)
        } else {
          setSessions([])
        }
      } catch (err) {
        console.error("Error loading speakers", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpeakers()
  }, [eventId])

  if (loading) {
    return (
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[170px] animate-pulse rounded-[22px] border border-[#E4EAF5] bg-[#F3F6FB]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="py-6 flex min-h-[220px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#D6E0F0] bg-white/70 text-center px-6">
        <UsersRound className="h-12 w-12 text-[#9AAACA] mb-3" />
        <p className="font-semibold text-[#102A5E]">No speakers found</p>
        <p className="mt-1 text-sm text-[#5B6F98]">Speakers for this event haven't been added yet.</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h2 className="font-display text-[1.45rem] font-bold tracking-[-0.03em] text-[#102A5E]">
        Speaker List
      </h2>
      <p className="mt-1 text-sm text-[#5B6F98] mb-6">
        {sessions.length} speaker{sessions.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <article
            key={session.id}
            onClick={() =>
              router.push(
                getPublicProfilePath("speaker", {
                  id: session.speaker.id,
                  publicSlug: session.speaker.publicSlug,
                  firstName: session.speaker.firstName,
                  lastName: session.speaker.lastName,
                }),
              )
            }
            className="group cursor-pointer h-[170px] flex flex-col overflow-hidden rounded-[22px] border border-[#E4EAF5] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,94,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,42,94,0.12)]"
          >
            {/* ── Top: avatar + name/designation ── */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Avatar className="h-14 w-14 flex-shrink-0 border border-[#DDE5F3] shadow-[0_4px_12px_rgba(16,42,94,0.08)]">
                <AvatarImage
                  src={session.speaker.avatar || ""}
                  alt={`${session.speaker.firstName} ${session.speaker.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className={`${getSpeakerAvatarStyles(session.speaker.firstName, session.speaker.lastName)} font-semibold text-sm`}>
                  {getSpeakerInitials(session.speaker.firstName, session.speaker.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-display text-[1.05rem] font-semibold leading-tight tracking-[-0.03em] text-[#102A5E]">
                    {session.speaker.firstName} {session.speaker.lastName}
                  </h3>
                  {session.speaker.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#1F8B4C]" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-[0.78rem] leading-tight text-[#445C8E]">
                  {session.speaker.jobTitle || "Industry Speaker"}
                </p>
                {session.speaker.company && (
                  <div className="mt-1 flex items-center gap-1.5 text-[0.78rem] text-[#123D86]">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{session.speaker.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom: session description (2 lines) ── */}
            <div className="mt-auto border-t border-[#E4EAF5] pt-2">
              {session.description ? (
                <p className="text-[0.74rem] leading-relaxed text-[#445C8E] line-clamp-2">
                  {session.description}{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(
                        getPublicProfilePath("speaker", {
                          id: session.speaker.id,
                          publicSlug: session.speaker.publicSlug,
                          firstName: session.speaker.firstName,
                          lastName: session.speaker.lastName,
                        }),
                      )
                    }}
                    className="inline text-[#123D86] font-medium hover:underline"
                  >
                    more
                  </button>
                </p>
              ) : (
                <p className="text-[0.74rem] text-[#9AAACA] italic">No description available</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}