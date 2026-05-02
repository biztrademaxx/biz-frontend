"use client"

import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, MapPin, Users, Edit, Star, Crown } from "lucide-react"
import { VerifiedBadge } from "./VerifiedBadge"
import { getOrganizerDisplay, getCategoryDisplay } from "../types/event.types"
import type { Event } from "../types/event.types"
import { EventActions } from "./EventActions"

interface EventRowProps {
  event: Event
  onEdit: (event: Event) => void
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
  getStatusColor: (status: Event["status"]) => "default" | "secondary" | "destructive" | "outline"
}

export function EventRow({
  event,
  onEdit,
  onStatusChange,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onPromote,
  onVerify,
  getStatusColor,
}: EventRowProps) {
  const organizerDisplay = getOrganizerDisplay(event.organizer)
  const categoryDisplay = getCategoryDisplay(event.category)
  return (
    <div className="hover:shadow-md transition-shadow border-2 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 flex-1">
            <img
              src={event.thumbnailImage || event.bannerImage || event.image || "/city/c4.jpg"}
              alt={event.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
                {event.featured && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {event.vip && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" /> VIP
                  </Badge>
                )}
                {event.isVerified && <VerifiedBadge event={event} />}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {organizerDisplay}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.attendees}/{event.maxCapacity}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Type: {event.eventType || "In-Person"}</span>
                <span>Category: {categoryDisplay}</span>
                {event.edition && <span>Edition: {event.edition}</span>}
                {event.isVerified && event.verifiedAt && (
                  <span className="text-green-600 font-semibold">
                    Verified: {new Date(event.verifiedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
              <Edit className="h-4 w-4" />
            </Button>
            <EventActions
              event={event}
              onStatusChange={onStatusChange}
              onFeatureToggle={onFeatureToggle}
              onVipToggle={onVipToggle}
              onPublicToggle={onPublicToggle}
              onDelete={onDelete}
              onPromote={onPromote}
              onVerify={onVerify}
            />
          </div>
        </div>
      </CardContent>
    </div>
  )
}
