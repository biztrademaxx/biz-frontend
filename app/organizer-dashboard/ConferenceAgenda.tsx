// components/conference-agenda.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"

interface Session {
  id: string
  time: string
  title: string
  description?: string
  speaker?: string
  type: "session" | "break" | "keynote" | "panel" | "networking"
}

interface Day {
  date: string
  day: string
  theme: string
  sessions: Session[]
}

interface ConferenceAgendaProps {
  organizerId: string
}

export default function ConferenceAgenda({ organizerId }: ConferenceAgendaProps) {
  const [days, setDays] = useState<Day[]>([])
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch agenda data from API
    const fetchAgenda = async () => {
      try {
        // This would be an API call in a real application
        // const response = await fetch(`/api/organizers/${organizerId}/conference-agenda`)
        // const data = await response.json()
        
        // Mock data for demonstration
        const mockData: Day[] = [
          {
            date: "20 November 2025",
            day: "Thursday, 20 November 2025",
            theme: "Future-ready Manufacturing – Precision & Productivity",
            sessions: [
              {
                id: "1",
                time: "09:00 – 09:35",
                title: "Registration & Hi Tea",
                type: "break"
              },
              {
                id: "2",
                time: "09:35 – 09:40",
                title: "Lamp Lighting",
                type: "session"
              },
              {
                id: "3",
                time: "09:40 – 09:45",
                title: "Welcome Address",
                description: "Speaker: MD, Maxx Business Media Pvt.Ltd.",
                type: "keynote"
              },
              {
                id: "4",
                time: "09:45 – 09:55",
                title: "Chief Guest Address",
                description: "Speaker: TBD",
                type: "keynote"
              },
              {
                id: "5",
                time: "09:55 – 10:05",
                title: "Guest of Honour Address",
                description: "Speaker: TBD",
                type: "keynote"
              },
              {
                id: "6",
                time: "10:05 – 10:15",
                title: "Guest of Honour Address",
                description: "Speaker: TBD",
                type: "keynote"
              },
              {
                id: "7",
                time: "10:15 – 10:25",
                title: "Inaugural Keynote – India's Roadmap for Advanced Manufacturing 2030",
                type: "keynote"
              },
              {
                id: "8",
                time: "10:25 – 10:30",
                title: "Vote of Thanks",
                description: "Speaker: TBD",
                type: "keynote"
              },
              {
                id: "9",
                time: "10:30 – 11:30",
                title: "Panel Discussion: Digital Transformation in Die, Mould & Plastic Processing",
                description: "• Integrating CAD/CAM, AI, IoT & Robotics\n• Digital twin applications for faster prototyping\n• Predictive maintenance in high-volume production\nSpeaker: TBD",
                type: "panel"
              },
              {
                id: "10",
                time: "11:30 – 12:00",
                title: "Technical Session 1: High-Performance Materials for Tooling & Moulding",
                description: "Speaker: TBD",
                type: "session"
              },
              {
                id: "11",
                time: "12:00 – 12:30",
                title: "Technical Session 2: Precision Machining for Complex Geometries",
                description: "• High-speed milling, EDM, micro-machining\n• Accuracy & repeatability in mould inserts\n\nSpeaker: TBD",
                type: "session"
              },
              {
                id: "12",
                time: "12:30 – 13:00",
                title: "Fireside Chat: Designing for Fun and Safety: Mold Innovations in the Toy Industry",
                description: "This session can cover breakthroughs and challenges unique to toy mold design, including safety regulations, rapid product cycles, and creative flexibility.\n\nSpeaker: TBD",
                type: "session"
              },
              {
                id: "13",
                time: "13:00 – 14:00",
                title: "Networking Lunch",
                type: "break"
              },
              {
                id: "14",
                time: "14:00 – 14:30",
                title: "Technical Session 3: Surface Finishing, Coatings & Wear Protection",
                description: "• PVD, CVD, DLC coatings\n• Improving mould surface quality\n\nSpeaker: TBD",
                type: "session"
              },
              {
                id: "15",
                time: "14:30 – 15:30",
                title: "Panel Discussion: Automation & Industry 4.0 in Moulding and Tool Rooms",
                description: "• Robotics in injection moulding\n• Lights-out manufacturing for tool shops\n• Reducing cycle times through smart automation\n\nSpeaker: TBD",
                type: "panel"
              },
              {
                id: "16",
                time: "15:30 – 16:00",
                title: "Networking Hi Tea",
                type: "break"
              },
              {
                id: "17",
                time: "16:00 – 16:30",
                title: "Fireside Chat: AI, Simulation & Smart Manufacturing – Digitalizing the Mold Shop",
                description: "• AI-driven mold flow and simulation for zero-defect molding.\n• Use of digital twins & predictive maintenance in tool rooms.\n• From manual know-how to knowledge-driven digital workflows.\n\nSpeaker: TBD",
                type: "session"
              },
              {
                id: "18",
                time: "16:30 – 17:00",
                title: "Technical Session 4: Design for Manufacturability (DFM) in Tooling & Plastic Parts",
                description: "• Optimising part geometry for efficiency\n• Reducing rework & scrap\n\nSpeaker: TBD",
                type: "session"
              },
              {
                id: "19",
                time: "17:00 – 17:10",
                title: "Closing Remarks",
                description: "Speaker: TBD",
                type: "keynote"
              }
            ]
          },
          {
            date: "21 November 2025",
            day: "Friday, 21 November 2025",
            theme: "Innovation in Manufacturing Technologies",
            sessions: [
              {
                id: "20",
                time: "09:00 – 09:30",
                title: "Registration & Coffee",
                type: "break"
              },
              {
                id: "21",
                time: "09:30 – 10:15",
                title: "Keynote: Future Trends in Advanced Manufacturing",
                description: "Speaker: TBD",
                type: "keynote"
              },
              {
                id: "22",
                time: "10:15 – 11:00",
                title: "Technical Session: Additive Manufacturing in Tooling",
                description: "Speaker: TBD",
                type: "session"
              },
              {
                id: "23",
                time: "11:00 – 11:30",
                title: "Networking Break",
                type: "break"
              },
              {
                id: "24",
                time: "11:30 – 12:30",
                title: "Panel Discussion: Sustainable Manufacturing Practices",
                description: "Speaker: TBD",
                type: "panel"
              }
            ]
          }
        ]
        
        setDays(mockData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching conference agenda:", error)
        setLoading(false)
      }
    }

    fetchAgenda()
  }, [organizerId])

  const handlePreviousDay = () => {
    setCurrentDayIndex(prev => (prev > 0 ? prev - 1 : days.length - 1))
  }

  const handleNextDay = () => {
    setCurrentDayIndex(prev => (prev < days.length - 1 ? prev + 1 : 0))
  }

  const getSessionTypeBadge = (type: string) => {
    const typeConfig = {
      session: { label: "Session", variant: "default" as const },
      break: { label: "Break", variant: "secondary" as const },
      keynote: { label: "Keynote", variant: "destructive" as const },
      panel: { label: "Panel", variant: "outline" as const },
      networking: { label: "Networking", variant: "secondary" as const }
    }
    
    return typeConfig[type as keyof typeof typeConfig] || { label: type, variant: "default" as const }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading agenda...</span>
      </div>
    )
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No conference agenda found</h3>
        <p className="text-muted-foreground mb-4">Create your first conference agenda to get started</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Agenda
        </Button>
      </div>
    )
  }

  const currentDay = days[currentDayIndex]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conference Agenda</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Agenda
        </Button>
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
        <Button variant="outline" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold">{currentDay.date}</h3>
          <p className="text-muted-foreground">{currentDay.day}</p>
          <p className="font-medium mt-1">Theme: {currentDay.theme}</p>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Indicator */}
      <div className="flex justify-center space-x-2">
        {days.map((day, index) => (
          <Button
            key={day.date}
            variant={index === currentDayIndex ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentDayIndex(index)}
          >
            Day {index + 1}
          </Button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {currentDay.sessions.map((session) => {
          const typeBadge = getSessionTypeBadge(session.type)
          
          return (
            <Card key={session.id} className={session.type === "break" ? "bg-muted/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {session.title}
                    <Badge variant={typeBadge.variant}>
                      {typeBadge.label}
                    </Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{session.time}</div>
              </CardHeader>
              <CardContent>
                {session.description && (
                  <div className="whitespace-pre-line text-sm">
                    {session.description}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}