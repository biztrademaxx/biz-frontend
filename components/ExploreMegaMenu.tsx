"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import { apiFetch } from "@/lib/api"
import {
  EXPLORE_EVENT_TYPE_KEYS,
  type ExploreEventTypeKey,
  classifyExploreEventType,
  exploreTypeMenuLabel,
  exploreTypeQueryValue,
} from "@/lib/explore-event-types"

function emptyCategoryCountMap(): Record<ExploreEventTypeKey, Map<string, number>> {
  return Object.fromEntries(
    EXPLORE_EVENT_TYPE_KEYS.map((k) => [k, new Map<string, number>()]),
  ) as Record<ExploreEventTypeKey, Map<string, number>>
}

function zeroTypeCounts(): Record<ExploreEventTypeKey, number> {
  return Object.fromEntries(EXPLORE_EVENT_TYPE_KEYS.map((k) => [k, 0])) as Record<
    ExploreEventTypeKey,
    number
  >
}

function typeRawFromEventRecord(e: Record<string, unknown>): unknown {
  const et = e.eventType
  if (Array.isArray(et)) return et
  if (typeof et === "string") return et
  const cat = e.category
  if (Array.isArray(cat)) return cat
  if (typeof cat === "string") return cat
  const cats = e.categories
  if (Array.isArray(cats)) return cats
  if (typeof cats === "string") return cats
  return null
}

/** Category labels on an event (deduped); supports API `category` / `categories` shapes. */
function categoriesFromEventRecord(e: Record<string, unknown>): string[] {
  const raw: string[] = []
  const push = (x: unknown) => {
    if (typeof x === "string" && x.trim()) raw.push(x.trim())
  }
  const cat = e.category
  if (Array.isArray(cat)) cat.forEach(push)
  else push(cat)
  const cats = e.categories
  if (Array.isArray(cats)) cats.forEach(push)
  else push(cats)
  return [...new Set(raw)]
}

export default function ExploreMegaMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [categoryCountsByType, setCategoryCountsByType] = useState<
    Record<ExploreEventTypeKey, Map<string, number>>
  >(() => emptyCategoryCountMap())
  const [counts, setCounts] = useState<Record<ExploreEventTypeKey, number>>(() => zeroTypeCounts())
  const [activeType, setActiveType] = useState<ExploreEventTypeKey>("CONFERENCE")
  const [loading, setLoading] = useState(false)
  /** Admin category order; empty = derive categories from events only. */
  const [masterCategoryNames, setMasterCategoryNames] = useState<string[]>([])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const [data, masterRes] = await Promise.all([
        apiFetch<unknown>("/api/events?limit=500", { auth: false }),
        fetch("/api/event-categories").catch(() => null),
      ])

      let masterNames: string[] = []
      if (masterRes?.ok) {
        const j = (await masterRes.json()) as { data?: Array<{ name?: string }> }
        const rows = Array.isArray(j?.data) ? j.data : []
        masterNames = rows.map((r) => r.name).filter((n): n is string => typeof n === "string" && !!n.trim())
      }

      const list = Array.isArray(data)
        ? data
        : data && typeof data === "object" && "events" in data
          ? ((data as { events?: unknown[] }).events ?? [])
          : []

      const nextCategoryCounts = emptyCategoryCountMap()
      for (const typeKey of EXPLORE_EVENT_TYPE_KEYS) {
        for (const n of masterNames) {
          nextCategoryCounts[typeKey].set(n, 0)
        }
      }

      const nextCounts = zeroTypeCounts()

      if (Array.isArray(list)) {
        for (const row of list) {
          const e = row as Record<string, unknown>
          if (e == null || e.id == null || typeof e.title !== "string") continue
          const key = classifyExploreEventType(typeRawFromEventRecord(e))
          if (!key) continue
          nextCounts[key] += 1
          const labels = categoriesFromEventRecord(e)
          const perEventCats = labels.length > 0 ? labels : ["Other"]
          for (const label of perEventCats) {
            const m = nextCategoryCounts[key]
            m.set(label, (m.get(label) ?? 0) + 1)
          }
        }
      }

      setMasterCategoryNames(masterNames)
      setCategoryCountsByType(nextCategoryCounts)
      setCounts(nextCounts)
    } catch {
      setMasterCategoryNames([])
      setCategoryCountsByType(emptyCategoryCountMap())
      setCounts(zeroTypeCounts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    void loadEvents()
  }, [open, loadEvents])

  const activeCategoryRows = useMemo(() => {
    const m = categoryCountsByType[activeType]
    if (!m || m.size === 0) return []

    if (masterCategoryNames.length === 0) {
      return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    }

    const used = new Set<string>()
    const rows: [string, number][] = []
    for (const n of masterCategoryNames) {
      if (!m.has(n)) continue
      rows.push([n, m.get(n) ?? 0])
      used.add(n)
    }
    const extras = [...m.entries()]
      .filter(([k]) => !used.has(k))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    rows.push(...extras)
    return rows
  }, [activeType, categoryCountsByType, masterCategoryNames])

  if (!open) return null

  return (
    <div
      id="explore-mega-root"
      className="fixed inset-x-3 top-[5.5rem] z-[120] max-h-[min(520px,calc(100vh-6rem))] overflow-y-auto border border-gray-200/80 bg-white text-gray-900 shadow-2xl sm:inset-x-6 lg:inset-x-[150px] lg:top-[5.5rem]"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 p-1 text-gray-600 transition-colors hover:text-gray-900"
        aria-label="Close explore menu"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="grid min-h-[280px] grid-cols-1 md:min-h-[360px] md:grid-cols-[minmax(0,240px)_1fr] lg:grid-cols-[260px_1fr]">
        <div className="border-b border-gray-200 bg-slate-50 p-4 md:border-b-0 md:border-r">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Event types
          </p>
          {loading ? (
            <p className="py-2 text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="space-y-1.5">
              {EXPLORE_EVENT_TYPE_KEYS.map((key) => {
                const active = activeType === key
                const n = counts[key]
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveType(key)}
                      onFocus={() => setActiveType(key)}
                      onClick={() => setActiveType(key)}
                      className={`flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-[13px] ${
                        active ? "bg-white font-semibold text-gray-900" : "text-gray-700 hover:bg-white"
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium tracking-tight">
                        {exploreTypeMenuLabel(key)}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                            active ? "bg-slate-200 text-gray-800" : "bg-slate-200/80 text-gray-600"
                          }`}
                        >
                          {n}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-1 text-2xl font-semibold text-gray-900 md:text-3xl">Browse by category</h3>
          <p className="mb-4 text-sm text-gray-500">
            {exploreTypeMenuLabel(activeType)}
            <span className="text-gray-400"> · </span>
            {counts[activeType]} event{counts[activeType] === 1 ? "" : "s"} total
          </p>

          {loading ? (
            <p className="text-sm text-gray-500">Loading categories…</p>
          ) : activeCategoryRows.length === 0 ? (
            <p className="text-sm text-gray-500">No categories for this type yet.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeCategoryRows.map(([categoryName, catCount]) => (
                <li key={`${activeType}-${categoryName}`}>
                  <Link
                    href={`/event?type=${encodeURIComponent(exploreTypeQueryValue(activeType))}&category=${encodeURIComponent(categoryName)}`}
                    onClick={onClose}
                    className="group flex min-w-0 items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-[13px] text-gray-700 hover:bg-slate-50 hover:text-gray-900"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-gray-700" />
                      <span className="truncate font-medium">{categoryName}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-200/90 px-2 py-0.5 text-[11px] tabular-nums text-gray-700">
                      {catCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <Link
              href={`/event?type=${encodeURIComponent(exploreTypeQueryValue(activeType))}`}
              onClick={onClose}
              className="text-sm font-semibold text-[#0070d2] hover:underline"
            >
              View all {exploreTypeMenuLabel(activeType)} events →
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            <Link
              href="/event"
              onClick={onClose}
              className="bg-[#d61a73] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bd1666]"
            >
              Advertise with us
            </Link>
            <Link
              href="/event"
              onClick={onClose}
              className="bg-[#7b2cbf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6622a4]"
            >
              Add your business
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
