"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QrCode, User, Mail, Phone, Building, MapPin, Briefcase, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  avatar?: string
  event: {
    id: string
    title: string
    startDate: string
    images?: string[]
  }
  registration: {
    id: string
    status: string
    ticketType: string
    quantity: number
    totalAmount: number
    registeredAt: string
  }
}

interface ScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}

export function ScannerDialog({ open, onOpenChange, eventId }: ScannerDialogProps) {
  const [scanning, setScanning] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [fetchingAttendee, setFetchingAttendee] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Fetch attendee details by ID
  const fetchAttendeeById = async (attendeeId: string) => {
    try {
      setFetchingAttendee(true)
      const response = await fetch(`/api/attendees/${attendeeId}`)
      if (!response.ok) throw new Error("Failed to fetch attendee")

      const data = await response.json()
      if (data.success && data.attendee) {
        setSelectedAttendee(data.attendee)
        toast({
          title: "Attendee Found",
          description: `Scanned ${data.attendee.firstName} ${data.attendee.lastName}`,
        })
      } else {
        throw new Error("Attendee not found")
      }
    } catch (error) {
      console.error("Error fetching attendee:", error)
      toast({
        title: "Error",
        description: "Attendee not found or invalid QR code",
        variant: "destructive",
      })
    } finally {
      setFetchingAttendee(false)
    }
  }

  // Handle QR code scan result
  const handleScan = (attendeeId: string) => {
    fetchAttendeeById(attendeeId)
    setScanning(false)
  }

  // Start/stop QR code scanning
  const toggleScanning = async () => {
    if (scanning) {
      stopScanning()
    } else {
      await startScanning()
    }
  }

  const startScanning = async () => {
    try {
      setScanning(true)
      setSelectedAttendee(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera for QR scanning",
        variant: "destructive",
      })
    }
  }

  const stopScanning = () => {
    setScanning(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      stopScanning()
      setSelectedAttendee(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>QR Code Scanner</DialogTitle>
          <DialogDescription>
            Scan attendee QR codes to view their details
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {scanning ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Camera preview will appear here</p>
                  </div>
                </div>
              )}
              
              {/* Scanner overlay */}
              {scanning && (
                <div className="absolute inset-0 border-2 border-blue-400 rounded-lg m-4">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400"></div>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <Button 
              onClick={toggleScanning} 
              variant={scanning ? "destructive" : "default"}
              className="w-full flex items-center gap-2"
              disabled={fetchingAttendee}
            >
              <QrCode className="w-4 h-4" />
              {scanning ? "Stop Scanning" : "Start Scanning"}
            </Button>

            {/* Demo buttons for testing */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Test with demo attendees:</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScan("demo-attendee-1")}
                  disabled={fetchingAttendee}
                >
                  Scan Demo 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScan("demo-attendee-2")}
                  disabled={fetchingAttendee}
                >
                  Scan Demo 2
                </Button>
              </div>
            </div>
          </div>

          {/* Attendee Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Attendee Details</h3>
            
            {fetchingAttendee ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading attendee details...</span>
              </div>
            ) : selectedAttendee ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedAttendee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedAttendee.firstName[0]}
                      {selectedAttendee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedAttendee.firstName} {selectedAttendee.lastName}
                    </h3>
                    <Badge className={getStatusColor(selectedAttendee.registration.status)}>
                      {getStatusDisplayName(selectedAttendee.registration.status)}
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Job Title */}
                  {selectedAttendee.jobTitle && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Designation</p>
                        <p className="font-medium">{selectedAttendee.jobTitle}</p>
                      </div>
                    </div>
                  )}

                  {/* Company */}
                  {selectedAttendee.company && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{selectedAttendee.company}</p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedAttendee.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {selectedAttendee.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedAttendee.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Registration Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="font-medium">
                        {new Date(selectedAttendee.registration.registeredAt).toLocaleDateString()} at{" "}
                        {new Date(selectedAttendee.registration.registeredAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event Information
                  </h4>
                  <p className="text-sm font-medium">{selectedAttendee.event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAttendee.event.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Scan a QR code to view attendee details</p>
                <p className="text-sm mt-2">The attendee information will appear here</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Status helper functions
function getStatusColor(status: string) {
  switch (status) {
    case "CONVERTED":
      return "bg-green-100 text-green-800"
    case "NEW":
      return "bg-blue-100 text-blue-800"
    case "CONTACTED":
      return "bg-yellow-100 text-yellow-800"
    case "QUALIFIED":
      return "bg-purple-100 text-purple-800"
    case "FOLLOW_UP":
      return "bg-orange-100 text-orange-800"
    case "REJECTED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusDisplayName(status: string) {
  switch (status) {
    case "CONVERTED":
      return "Confirmed"
    case "NEW":
      return "New"
    case "CONTACTED":
      return "Contacted"
    case "QUALIFIED":
      return "Qualified"
    case "FOLLOW_UP":
      return "Follow Up"
    case "REJECTED":
      return "Rejected"
    default:
      return status
  }
}