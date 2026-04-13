"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserId } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Users, ArrowLeft, IndianRupee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface RegisterPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [ticketType, setTicketType] = useState("GENERAL")
  const [quantity, setQuantity] = useState(1)
  const userId = getCurrentUserId()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchEvent() {
      try {
        const resolvedParams = await params
        const eventId = resolvedParams.id

        const data = await apiFetch<Record<string, unknown>>(
          `/api/events/${encodeURIComponent(eventId)}`,
          { auth: false },
        )
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params, toast])

  const handleRegister = async () => {
    if (!isAuthenticated() || !userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for this event",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      setRegistering(true)
      if (!event?.id) {
        throw new Error("Event not loaded")
      }

      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ticketType,
          quantity,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully registered for the event!",
        })
        router.push(`/attendee-management/${event.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Registration failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register for the event",
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Event not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Event Registration</h1>
            <p className="text-gray-600">Register for this event</p>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {event.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.location || "Location TBA"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{new Date(event.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{event.maxAttendees ? `${event.maxAttendees} max attendees` : "Unlimited"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={event.isRegistrationOpen ? "default" : "secondary"}>
                  {event.isRegistrationOpen ? "Registration Open" : "Registration Closed"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketType">Ticket Type</Label>
              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Admission</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {(quantity * 500).toLocaleString()} {/* Base price calculation */}
                </span>
              </div>
            </div>

            <Button onClick={handleRegister} disabled={!event.isRegistrationOpen || registering} className="w-full">
              {registering ? "Registering..." : "Register Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
