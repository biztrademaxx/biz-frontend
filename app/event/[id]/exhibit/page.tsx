"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUserId } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, Building, ArrowLeft, IndianRupee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface ExhibitPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ExhibitPage({ params }: ExhibitPageProps) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [spaceType, setSpaceType] = useState("")
  const [area, setArea] = useState(1)
  const [additionalServices, setAdditionalServices] = useState<string[]>([])
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

  const handleBookBooth = async () => {
    if (!isAuthenticated() || !userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an exhibition booth",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      setBooking(true)
      if (!event?.id) {
        throw new Error("Event not loaded")
      }

      const response = await fetch(`/api/events/${event.id}/exhibit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          spaceType,
          area,
          additionalServices,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully booked exhibition booth!",
        })
        router.push(`/exhibitor-management/${event.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Booth booking failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book exhibition booth",
        variant: "destructive",
      })
    } finally {
      setBooking(false)
    }
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setAdditionalServices([...additionalServices, service])
    } else {
      setAdditionalServices(additionalServices.filter((s) => s !== service))
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
            <h1 className="text-2xl font-bold">Exhibition Booth Booking</h1>
            <p className="text-gray-600">Book your exhibition space</p>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
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
            </div>
          </CardContent>
        </Card>

        {/* Available Spaces */}
        {event.exhibitionSpaces && event.exhibitionSpaces.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Available Exhibition Spaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.exhibitionSpaces.map((space: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{space.name}</h4>
                      <p className="text-sm text-gray-600">{space.description}</p>
                      <p className="text-xs text-gray-500">
                        Minimum area: {space.minArea} {space.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">
                        {event.currency} {space.basePrice.toLocaleString()}
                      </span>
                      {space.pricePerSqm > 0 && (
                        <p className="text-sm text-gray-600">
                          + {event.currency} {space.pricePerSqm}/{space.unit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Booth Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spaceType">Space Type</Label>
              <Select value={spaceType} onValueChange={setSpaceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select space type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard Booth</SelectItem>
                  <SelectItem value="PREMIUM">Premium Booth</SelectItem>
                  <SelectItem value="CORNER">Corner Booth</SelectItem>
                  <SelectItem value="ISLAND">Island Booth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area (sq meters)</Label>
              <Input
                id="area"
                type="number"
                min="1"
                max="100"
                value={area}
                onChange={(e) => setArea(Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Services</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="power"
                    checked={additionalServices.includes("POWER")}
                    onCheckedChange={(checked) => handleServiceChange("POWER", checked as boolean)}
                  />
                  <Label htmlFor="power">Power Connection (+₹2,000)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compressed-air"
                    checked={additionalServices.includes("COMPRESSED_AIR")}
                    onCheckedChange={(checked) => handleServiceChange("COMPRESSED_AIR", checked as boolean)}
                  />
                  <Label htmlFor="compressed-air">Compressed Air (+₹1,500)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internet"
                    checked={additionalServices.includes("INTERNET")}
                    onCheckedChange={(checked) => handleServiceChange("INTERNET", checked as boolean)}
                  />
                  <Label htmlFor="internet">Internet Connection (+₹1,000)</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Estimated Total:</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {(area * 5000 + additionalServices.length * 1500).toLocaleString()}
                </span>
              </div>
            </div>

            <Button onClick={handleBookBooth} disabled={!spaceType || booking} className="w-full">
              {booking ? "Booking..." : "Book Exhibition Booth"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
