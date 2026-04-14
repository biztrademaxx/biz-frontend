"use client"

import Link from "next/link"
import { memo } from "react"

const VIEW_ALL_CLASS =
  "flex h-[120px] w-[200px] shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"

export interface OrganizersViewAllTileProps {
  href: string
  /** When false, link is presentational (duplicate marquee strip). */
  interactive?: boolean
}

function OrganizersViewAllTileComponent({
  href,
  interactive = true,
}: OrganizersViewAllTileProps) {
  if (!interactive) {
    return (
      <Link href={href} className={VIEW_ALL_CLASS} tabIndex={-1} aria-hidden>
        <span className="text-sm font-medium text-gray-600">View All</span>
      </Link>
    )
  }

  return (
    <Link href={href} className={VIEW_ALL_CLASS}>
      <span className="text-sm font-medium text-gray-600">View All</span>
    </Link>
  )
}

export const OrganizersViewAllTile = memo(OrganizersViewAllTileComponent)
