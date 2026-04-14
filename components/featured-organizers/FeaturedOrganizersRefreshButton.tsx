"use client"

import { useRouter } from "next/navigation"

export function FeaturedOrganizersRefreshButton({ label = "Try again" }: { label?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="shrink-0 rounded-sm border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-50"
    >
      {label}
    </button>
  )
}
