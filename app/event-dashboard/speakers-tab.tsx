"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Speaker {
  id: string
  name: string
  company: string
  designation?: string
  imageUrl?: string
}

export default function SpeakersTab({ eventId }: { eventId: string }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        const res = await fetch(`/api/events/speakers?eventId=${eventId}`)
        const data = await res.json().catch(() => ({ success: false, sessions: [] }))
        if (data.success && Array.isArray(data.sessions)) {
          const mappedSpeakers: Speaker[] = data.sessions.map((session: any) => ({
            id: session.speaker?.id ?? "",
            name: [session.speaker?.firstName, session.speaker?.lastName].filter(Boolean).join(" ") || "Speaker",
            company: session.speaker?.company || "N/A",
            designation: session.speaker?.jobTitle || "",
            imageUrl: session.speaker?.avatar || "",
          }))
          setSpeakers(mappedSpeakers)
        } else {
          setSpeakers([])
        }
      } catch (err) {
        console.error("Error loading speakers", err)
        setSpeakers([])
      } finally {
        setLoading(false)
      }
    }
    fetchSpeakers()
  }, [eventId])


  if (loading) {
    return <p className="text-gray-600">Loading speakers...</p>
  }

  if (speakers.length === 0) {
    return <p className="text-gray-600">No speakers found for this event.</p>
  }

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Speaker List</h2>
      <p className="text-sm text-gray-500 mb-6">{speakers.length} speakers</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {speakers.map((speaker) => (
          <Card key={speaker.id} className="border">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-16 h-16 flex justify-center">
                  <Image
                    src={speaker.imageUrl || "/city/c4.jpg"}
                    alt={speaker.name}
                    width={60}
                    height={60}
                    className="object-cover shadow-sm rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{speaker.name}</p>
                  <p className="text-sm text-gray-500">{speaker.designation}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-700 mb-3">{speaker.company}</p>
              <Button className="w-full border-2 border-red-600 text-white bg-red-600 text-sm py-2 rounded-full font-semibold hover:bg-red-700 transition">
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
