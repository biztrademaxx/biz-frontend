"use client"

import { useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Baby,
  Briefcase,
  Building2,
  Car,
  DollarSign,
  Factory,
  FlaskConical,
  GraduationCap,
  Home,
  LayoutGrid,
  Leaf,
  Monitor,
  Paintbrush,
  PawPrint,
  Phone,
  Plane,
  Plug,
  Recycle,
  Shield,
  ShoppingBag,
  Stethoscope,
  Truck,
  Utensils,
  Video,
  Zap,
} from "lucide-react"
import type { BrowseCategoryTile } from "@/lib/categories/types"
import { formatEventCountDisplay } from "@/lib/format-event-count"

const NAV_BLUE = "#002C71"

const categoryCardClass =
  "flex min-h-[110px] w-full flex-col items-start rounded-md border border-gray-200/90 bg-white px-3 pt-3 pb-3 text-left shadow-sm transition-shadow duration-200 hover:border-gray-300 hover:shadow-md"

const viewAllCardClass =
  "flex min-h-[110px] w-full items-center justify-center rounded-md border border-[#002C71]/20 bg-[#002C71]/[0.06] px-3 py-3 text-center text-sm font-medium shadow-sm transition-colors duration-200 hover:border-[#002C71]/35 hover:bg-[#002C71]/10"

function categoryIconForName(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes("education") || n.includes("training")) return GraduationCap
  if (n.includes("medical") || n.includes("pharma")) return Stethoscope
  if (n.includes("technology") || n.includes("it &") || n.includes("it ")) return Monitor
  if (n.includes("finance") || n.includes("banking")) return DollarSign
  if (n.includes("business")) return Briefcase
  if (n.includes("building") || n.includes("construction")) return Building2
  if (n.includes("science") || n.includes("research")) return FlaskConical
  if (n.includes("industrial") || n.includes("engineering")) return Factory
  if (n.includes("power") || n.includes("energy")) return Zap
  if (n.includes("wellness") || n.includes("fitness") || n.includes("health")) return Stethoscope
  if (n.includes("entertainment") || n.includes("media")) return Video
  if (n.includes("environment") || n.includes("waste")) return Recycle
  if (n.includes("logistics") || n.includes("transport")) return Truck
  if (n.includes("electric") || n.includes("electronics")) return Plug
  if (n.includes("food") || n.includes("beverage")) return Utensils
  if (n.includes("agriculture") || n.includes("forestry")) return Leaf
  if (n.includes("security") || n.includes("defense")) return Shield
  if (n.includes("arts") || n.includes("crafts")) return Paintbrush
  if (n.includes("auto") || n.includes("automotive")) return Car
  if (n.includes("telecommunication")) return Phone
  if (n.includes("travel") || n.includes("tourism")) return Plane
  if (n.includes("home") && n.includes("office")) return Home
  if (n.includes("fashion") || n.includes("beauty") || n.includes("apparel")) return ShoppingBag
  if (n.includes("packaging") || n.includes("packing")) return Archive
  if (n.includes("animal") || n.includes("pets")) return PawPrint
  if (n.includes("baby") || n.includes("kids") || n.includes("maternity")) return Baby
  if (n.includes("hospitality")) return Utensils
  return LayoutGrid
}

function categoryHref(name: string): string {
  return `/event?category=${encodeURIComponent(name)}`
}

function countLabel(eventCount: number): string | null {
  if (typeof eventCount !== "number" || !Number.isFinite(eventCount) || eventCount < 0) return null
  return `${formatEventCountDisplay(eventCount)} Events`
}

export interface CategoryGridClientProps {
  categories: BrowseCategoryTile[]
  /** `home`: first five tiles + View All. `full`: every category, no View All tile (dedicated browse page). */
  variant?: "home" | "full"
}

export default function CategoryGridClient({ categories, variant = "home" }: CategoryGridClientProps) {
  const isFull = variant === "full"
  const [expanded, setExpanded] = useState(false)
  const showExpandToggle = !isFull && categories.length > 5
  const visibleCategories = isFull || expanded ? categories : categories.slice(0, 5)

  return (
    <section
      id={isFull ? "browse-all-categories" : "category"}
      className="home-tt-section bg-[#F3F2F0] py-6 sm:py-8"
      aria-label="Browse events by category"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <h2 className="home-tt-h2 mb-3">{isFull ? "Browse By Category" : "Browse Events By Category"}</h2>

        <div id="category-grid-tiles" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {visibleCategories.map((category) => {
            const Icon = categoryIconForName(category.name)
            const sub = countLabel(category.eventCount)
            return (
              <Link
                key={category.id}
                href={categoryHref(category.name)}
                className={`${categoryCardClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002C71] focus-visible:ring-offset-2`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efefef] text-gray-800">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </div>
                <div className="mt-3 w-full min-w-0 overflow-hidden text-xs font-medium leading-snug text-gray-900">
                  {category.name}
                </div>
                {sub ? (
                  <div className="mt-1 text-[11px] leading-tight text-gray-500">{sub}</div>
                ) : (
                  <div className="mt-1 text-[11px] leading-tight text-gray-500">Explore events</div>
                )}
              </Link>
            )
          })}

          {showExpandToggle && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`${viewAllCardClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002C71] focus-visible:ring-offset-2`}
              style={{ color: NAV_BLUE }}
              aria-expanded={false}
              aria-controls="category-grid-tiles"
            >
              View All
            </button>
          )}

          {showExpandToggle && expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className={`${viewAllCardClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002C71] focus-visible:ring-offset-2`}
              style={{ color: NAV_BLUE }}
              aria-expanded={true}
              aria-controls="category-grid-tiles"
            >
              View Less
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
