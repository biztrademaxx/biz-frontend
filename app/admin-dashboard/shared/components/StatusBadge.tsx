"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  published: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "pending review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  flagged: "bg-orange-100 text-orange-800 border-orange-200",
}

export function StatusBadge({ status, variant = "secondary", className = "" }: StatusBadgeProps) {
  const normalized = (status ?? "").toLowerCase().replace(/\s+/g, " ")
  const styleClass = STATUS_STYLES[normalized]
  return (
    <Badge variant={variant} className={styleClass ? `${styleClass} ${className}` : className}>
      {status ?? "—"}
    </Badge>
  )
}
