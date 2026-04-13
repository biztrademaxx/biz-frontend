"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Star, Crown, ShieldCheck, Trash2, Megaphone } from "lucide-react"
import type { Event } from "../types/event.types"

interface EventActionsProps {
  event: Event
  onStatusChange: (eventId: string, status: Event["status"]) => void
  onFeatureToggle: (eventId: string, current: boolean) => void
  onVipToggle: (eventId: string, current: boolean) => void
  onPublicToggle: (eventId: string, current: boolean) => void
  onDelete: (eventId: string) => void
  onPromote: (event: Event) => void
  onVerify: (event: Event) => void
}

export function EventActions({
  event,
  onStatusChange,
  onFeatureToggle,
  onVipToggle,
  onPublicToggle,
  onDelete,
  onPromote,
  onVerify,
}: EventActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onStatusChange(event.id, "Approved")}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(event.id, "Pending Review")}>
          Pending Review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(event.id, "Rejected")}>
          Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onFeatureToggle(event.id, event.featured)}>
          <Star className="w-4 h-4 mr-2" />
          {event.featured ? "Remove Featured" : "Mark Featured"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onVipToggle(event.id, event.vip)}>
          <Crown className="w-4 h-4 mr-2" />
          {event.vip ? "Remove VIP" : "Mark VIP"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPublicToggle(event.id, !!event.isPublic)}>
          {event.isPublic ? "Make Private" : "Make Public"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onVerify(event)}>
          <ShieldCheck className="w-4 h-4 mr-2" />
          {event.isVerified ? "Remove Verification" : "Verify Event"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPromote(event)}>
          <Megaphone className="w-4 h-4 mr-2" />
          Promote
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(event.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
