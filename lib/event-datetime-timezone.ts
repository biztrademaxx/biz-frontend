import { getCountryTimezoneByName } from "@/lib/location-data"

export const DEFAULT_EVENT_TIMEZONE = "Asia/Kolkata"

type CalendarParts = { year: number; month: number; day: number }
type ClockParts = { hours: number; minutes: number }

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function resolveEventTimezone(timezone?: string | null, country?: string | null): string {
  const manual = timezone?.trim()
  if (manual) return manual
  const countryName = country?.trim()
  if (countryName) {
    const tz = getCountryTimezoneByName(countryName)
    if (tz) return tz
  }
  return DEFAULT_EVENT_TIMEZONE
}

function getZonedParts(utcMs: number, timeZone: string): CalendarParts & ClockParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  })
  const map: Record<string, string> = {}
  for (const p of formatter.formatToParts(new Date(utcMs))) {
    if (p.type !== "literal") map[p.type] = p.value
  }
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hours: parseInt(map.hour, 10),
    minutes: parseInt(map.minute, 10),
  }
}

/** Wall-clock date + time in `timeZone` → UTC ISO string for API/DB. */
export function combineDateAndTimeInTimeZone(
  date: CalendarParts,
  time: ClockParts,
  timeZone: string,
): Date {
  const desiredMs = Date.UTC(date.year, date.month - 1, date.day, time.hours, time.minutes, 0)
  let utc = desiredMs

  for (let i = 0; i < 5; i++) {
    const got = getZonedParts(utc, timeZone)
    const gotMs = Date.UTC(got.year, got.month - 1, got.day, got.hours, got.minutes, 0)
    const diff = desiredMs - gotMs
    if (diff === 0) break
    utc += diff
  }

  return new Date(utc)
}

export function parseTimeHm(raw: string, fallback = "10:00"): ClockParts {
  const str = raw.trim() || fallback
  const m = str.match(/^(\d{1,2}):(\d{2})/)
  if (!m) {
    const [fh, fm] = fallback.split(":").map((x) => parseInt(x, 10))
    return { hours: fh, minutes: fm }
  }
  const hours = parseInt(m[1], 10)
  const minutes = parseInt(m[2], 10)
  if (hours > 23 || minutes > 59) {
    const [fh, fm] = fallback.split(":").map((x) => parseInt(x, 10))
    return { hours: fh, minutes: fm }
  }
  return { hours, minutes }
}

export function parseDateYmd(raw: string): CalendarParts | null {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return {
    year: parseInt(m[1], 10),
    month: parseInt(m[2], 10),
    day: parseInt(m[3], 10),
  }
}

/** Build UTC ISO from calendar date + HH:mm in the event timezone. */
export function isoFromWallClock(dateYmd: string, timeHm: string, timeZone: string): string {
  const date = parseDateYmd(dateYmd)
  if (!date) return ""
  const time = parseTimeHm(timeHm)
  return combineDateAndTimeInTimeZone(date, time, timeZone).toISOString()
}

/** Read YYYY-MM-DD and HH:mm as shown in the event timezone. */
export function wallClockFromIso(iso: string, timeZone: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "10:00" }
  const parts = getZonedParts(new Date(iso).getTime(), timeZone)
  return {
    date: `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`,
    time: `${pad2(parts.hours)}:${pad2(parts.minutes)}`,
  }
}

export function wallClockDurationMinutes(
  startDateYmd: string,
  startTimeHm: string,
  endDateYmd: string,
  endTimeHm: string,
  timeZone: string,
): number {
  const startDate = parseDateYmd(startDateYmd)
  const endDate = parseDateYmd(endDateYmd)
  if (!startDate || !endDate) return 0
  const start = combineDateAndTimeInTimeZone(startDate, parseTimeHm(startTimeHm), timeZone)
  const end = combineDateAndTimeInTimeZone(endDate, parseTimeHm(endTimeHm), timeZone)
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

export function formatWallClockDateShort(iso: string, timeZone: string): string {
  const { date } = wallClockFromIso(iso, timeZone)
  const parts = parseDateYmd(date)
  if (!parts) return ""
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function formatWallClockTimeDisplay(iso: string, timeZone: string): string {
  return wallClockFromIso(iso, timeZone).time
}

export function formatWallClockDateTimeRange(
  startIso: string,
  endIso: string,
  timeZone: string,
): string {
  const start = wallClockFromIso(startIso, timeZone)
  const end = wallClockFromIso(endIso, timeZone)
  return `${start.time} – ${end.time}`
}
