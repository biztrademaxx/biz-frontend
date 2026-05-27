import { getCountryTimezoneByName } from "@/lib/location-data"
import { isoFromWallClock } from "@/lib/event-datetime-timezone"
import type { EventFormData, SpaceCost } from "./types"

/** Organizer publish: every exhibitor space row needs a name and valid pricing (per-unit services vs sq.m + min area). */
export function validateOrganizerExhibitorSpaceCosts(spaceCosts: SpaceCost[]): string | undefined {
  if (!spaceCosts.length) {
    return "Add at least one exhibitor space type with pricing."
  }
  for (const cost of spaceCosts) {
    const label = cost.type?.trim() ?? ""
    if (!label) {
      return "Each exhibitor space row must have a space type name."
    }
    if (cost.unit) {
      if ((cost.pricePerUnit ?? 0) <= 0) {
        return `Set a price greater than zero for "${label}".`
      }
    } else {
      if ((cost.pricePerSqm ?? 0) <= 0) {
        return `Set a price per sq.m greater than zero for "${label}".`
      }
      if ((cost.minArea ?? 0) <= 0) {
        return `Set a minimum area greater than zero for "${label}".`
      }
    }
  }
  return undefined
}

export const convertUTCToLocalTime = (utcDateString: string, timezone: string = "UTC"): string => {
  if (!utcDateString) return ""
  try {
    const date = new Date(utcDateString)
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error converting UTC to local time:", error)
    return ""
  }
}

export const convertLocalToUTC = (localTime: string, dateString: string, timezone: string = "UTC"): string => {
  if (!localTime || !dateString) return ""
  try {
    return isoFromWallClock(dateString, localTime, timezone || "UTC")
  } catch (error) {
    console.error("Error converting local to UTC:", error)
    return ""
  }
}

export const formatTimeTo12Hour = (time24: string): string => {
  if (!time24 || time24.trim() === "") return ""
  try {
    const [hoursStr, minutesStr] = time24.split(":")
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)
    if (isNaN(hours) || isNaN(minutes)) return time24
    const period = hours >= 12 ? "pm" : "am"
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, "0")}${period}`
  } catch {
    return time24
  }
}

export const getDatePart = (isoString: string): string => {
  if (!isoString) return ""
  return isoString.split("T")[0]
}

export const getTimePart = (isoString: string): string => {
  if (!isoString) return "00:00"
  const timePart = isoString.split("T")[1]
  if (!timePart) return "00:00"
  return timePart.substring(0, 5)
}

export const slugifyTitle = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

export function getEffectiveEventCreationTimezone(formData: Pick<EventFormData, "timezone" | "country">): string {
  const manual = formData.timezone?.trim()
  if (manual) return manual
  const country = formData.country?.trim()
  if (country) {
    const tz = getCountryTimezoneByName(country)
    if (tz) return tz
  }
  // Default organizer events to India time unless explicitly changed
  return "Asia/Kolkata"
}
