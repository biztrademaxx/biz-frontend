import { formatAppointmentDateTime } from "../appointment-display"
import { isUpcomingEvent } from "../event-schedule-display"
import { getVenueMonthlyActivity } from "../venue-activity"
import { serializeCsv } from "../csv"

describe("appointment wall-clock display", () => {
  it("uses the stored meeting time instead of midnight or a synthetic UTC timestamp", () => {
    expect(formatAppointmentDateTime({ requestedDate: "2026-10-16T00:00:00Z", requestedTime: "09:00", scheduledAt: "2026-10-16T14:30:00Z" }))
      .toEqual({ date: "Oct 16, 2026", time: "09:00 AM" })
  })
  it("preserves legacy appointment wall clocks and rejects invalid values", () => {
    expect(formatAppointmentDateTime({ scheduledAt: "2026-11-02T09:00:00.000Z" }).time).toBe("09:00 AM")
    expect(formatAppointmentDateTime({ requestedDate: "2026-02-31", requestedTime: "09:00" }).date).toBe("TBD")
    expect(formatAppointmentDateTime({ requestedDate: "2026-11-02", requestedTime: "25:00" }).time).toBe("")
    expect(formatAppointmentDateTime({ requestedDate: "2026-11-02", requestedTime: "00:00" }).time).toBe("12:00 AM")
  })
})

it("counts upcoming events consistently and excludes past and reversed schedules", () => {
  const now = new Date("2026-11-02T10:00:00Z")
  expect([
    { startDate: "2026-10-31", endDate: "2026-11-01" },
    { startDate: "2026-11-06", endDate: "2026-06-13" },
    { startDate: "2026-11-03", endDate: "2026-11-04" },
  ].filter((event) => isUpcomingEvent(event, now))).toHaveLength(1)
})

it("groups actual event counts in the venue timezone across a year boundary", () => {
  const activity = getVenueMonthlyActivity([
    { startDate: "2025-12-31T20:00:00Z", count: 2 },
    { startDate: "2025-12-15T10:00:00Z", count: 1 },
    { startDate: "2026-02-01T10:00:00Z", count: 7 },
  ], "Asia/Kolkata", new Date("2026-01-02T12:00:00Z"))
  expect(activity.thisMonth).toHaveLength(31)
  expect(activity.thisMonth[0]).toEqual({ day: "Jan 1", value: 2 })
  expect(activity.lastMonth[14].value).toBe(1)
  expect(activity.thisMonth.reduce((sum, day) => sum + day.value, 0)).toBe(2)
})

it("exports CSV values with commas, quotes, newlines, and spreadsheet formulas safely", () => {
  expect(serializeCsv([['Expo, "A"\nDay 2', "=1+1", 0, null]]))
    .toBe('"Expo, ""A""\nDay 2","\'=1+1","0",""')
})
