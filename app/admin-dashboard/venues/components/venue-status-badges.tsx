import { Badge } from "@/components/ui/badge"
import type { ReactNode } from "react"

export function VenueStatusBadge({ status = "active" }: { status?: string }): ReactNode {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function VenueEventStatusBadge({ status }: { status: string }): ReactNode {
  switch (status) {
    case "PUBLISHED":
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Published</Badge>
    case "DRAFT":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Draft</Badge>
    case "COMPLETED":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Completed</Badge>
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Cancelled</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}
