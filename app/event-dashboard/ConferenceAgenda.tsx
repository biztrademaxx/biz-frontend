"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConferenceSession {
  id: string
  time: string
  title: string
  description: string | null
  speaker: string | null
  type: string
  order: number
}

interface Conference {
  id: string
  eventId: string
  date: string
  day: string
  theme: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  sessions: ConferenceSession[]
}

interface ConferenceListProps {
  eventId: string
  refreshKey?: number
  onCreateNew: () => void
}

export function ConferenceList({ eventId, refreshKey, onCreateNew }: ConferenceListProps) {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchConferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/conferences?eventId=${eventId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch conferences")
      }
      const data = await response.json()
      setConferences(data)
    } catch (error) {
      console.error("[v0] Error fetching conferences:", error)
      toast({
        title: "Error",
        description: "Failed to load conferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConferences()
  }, [eventId, refreshKey])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/conferences/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete conference")
      }

      toast({
        title: "Success",
        description: "Conference deleted successfully",
      })

      fetchConferences()
    } catch (error) {
      console.error("[v0] Error deleting conference:", error)
      toast({
        title: "Error",
        description: "Failed to delete conference",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const handlePreviousDay = () => {
    setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : conferences.length - 1))
  }

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev < conferences.length - 1 ? prev + 1 : 0))
  }

  const getSessionTypeBadge = (type: string) => {
    const typeConfig = {
      SESSION: { label: "Session", variant: "default" as const },
      BREAK: { label: "Break", variant: "secondary" as const },
      KEYNOTE: { label: "Keynote", variant: "destructive" as const },
      PANEL: { label: "Panel", variant: "outline" as const },
      NETWORKING: { label: "Networking", variant: "secondary" as const },
    }

    return typeConfig[type as keyof typeof typeConfig] || { label: type, variant: "default" as const }
  }

  // Extract day number from day string (e.g., "Monday, 1 Jan 2024" -> "Day 1")
  const getDayLabel = (conference: Conference, index: number) => {
    // Try to extract day number from the date string
    const dayMatch = conference.date.match(/\d+/)
    if (dayMatch) {
      return `Day ${dayMatch[0]}`
    }
    
    // Fallback to index-based numbering
    return `Day ${index + 1}`
  }

  // Get day display name (e.g., "Monday" from "Monday, 1 Jan 2024")
  const getDayName = (conference: Conference) => {
    // Extract day name (Monday, Tuesday, etc.) from the day string
    const dayName = conference.day.split(",")[0]
    return dayName || `Day`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conferences...</p>
        </div>
      </div>
    )
  }

  if (conferences.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No conference agenda found</h3>
        <p className="text-muted-foreground mb-4">Create your first conference agenda to get started</p>

      </div>
    )
  }

  const currentConference = conferences[currentDayIndex]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conference Agenda</h2>

      </div>

      <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
        <Button variant="outline" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h3 className="text-xl font-semibold">{currentConference.date}</h3>
          <p className="text-muted-foreground">{currentConference.day}</p>
          <p className="font-medium mt-1">Theme: {currentConference.theme}</p>
        </div>

        <Button variant="outline" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center space-x-2">
        {conferences.map((conference, index) => (
          <Button
            key={conference.id}
            variant={index === currentDayIndex ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentDayIndex(index)}
            title={`${getDayName(conference)} - ${conference.date}`}
          >
            {getDayLabel(conference, index)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {currentConference.sessions.map((session) => {
          const typeBadge = getSessionTypeBadge(session.type)

          return (
            <Card key={session.id} className={session.type === "BREAK" ? "bg-muted/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {session.title}
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </CardTitle>
                  {/* Edit button removed from here */}
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(currentConference.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">{session.time}</div>
              </CardHeader>
              {(session.description || session.speaker) && (
                <CardContent>
                  {session.description && <div className="whitespace-pre-line text-sm mb-2">{session.description}</div>}
                  {session.speaker && <div className="text-sm text-muted-foreground">Speaker: {session.speaker}</div>}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conference Agenda</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conference agenda? This action cannot be undone and will also delete
              all associated sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}