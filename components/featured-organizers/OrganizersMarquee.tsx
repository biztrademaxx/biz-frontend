// OrganizersMarquee.tsx
"use client"

import type { CSSProperties } from "react"
import { memo, useMemo, useRef, useCallback, useEffect } from "react"
import type { OrganizerListEntry } from "@/lib/organizers/types"
import { OrganizerLogoTile } from "./OrganizerLogoTile"

const MARQUEE_MIN_ORGANIZERS = 3

export interface OrganizersMarqueeProps {
  organizers: OrganizerListEntry[]
  onOrganizerActivate: (organizerId: string) => void
  hideHeading?: boolean
}

function OrganizersMarqueeComponent({
  organizers,
  onOrganizerActivate,
  hideHeading = false,
}: OrganizersMarqueeProps) {
  const stripClass = "flex w-max shrink-0 flex-row flex-nowrap items-stretch gap-4"

  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  const isPaused = useRef(false)

  // JS-based auto scroll
  useEffect(() => {
    if (organizers.length < MARQUEE_MIN_ORGANIZERS) return
    const el = scrollRef.current
    if (!el) return

    const speed = 0.5 // px per frame

    const step = () => {
      if (!isPaused.current && el) {
        el.scrollLeft += speed
        // Reset to start for seamless loop
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [organizers.length])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    isPaused.current = true
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0)
    scrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing"
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    isPaused.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = "grab"
  }, [])

  if (organizers.length < MARQUEE_MIN_ORGANIZERS) {
    return (
      <div className="py-2">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-1 cursor-grab select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div className={`mx-auto ${stripClass} justify-center px-1`}>
            {organizers.map((organizer) => (
              <div key={String(organizer.id)} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="interactive"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2">
      <div
        ref={scrollRef}
        className="overflow-x-auto cursor-grab select-none"
        style={{ scrollbarWidth: "none" } as CSSProperties}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="flex w-max flex-row flex-nowrap items-stretch gap-4">
          {/* First strip */}
          <div className={stripClass}>
            {organizers.map((organizer) => (
              <div key={String(organizer.id)} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="interactive"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>

          {/* Duplicate strip for seamless loop */}
          <div className={stripClass} aria-hidden>
            {organizers.map((organizer) => (
              <div key={`dup-${String(organizer.id)}`} className="flex-shrink-0">
                <OrganizerLogoTile
                  organizer={organizer}
                  mode="decorative"
                  onOpenProfile={onOrganizerActivate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const OrganizersMarquee = memo(OrganizersMarqueeComponent)