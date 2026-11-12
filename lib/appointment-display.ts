type AppointmentClock = {
  requestedDate?: string | null
  requestedTime?: string | null
  scheduledAt?: string | null
}

/** Appointments store a calendar date and local meeting time, not a UTC instant. */
export function formatAppointmentDateTime(appointment: AppointmentClock): { date: string; time: string } {
  const dateKey = appointment.requestedDate?.slice(0, 10) || appointment.scheduledAt?.slice(0, 10)
  const clock = appointment.requestedTime || appointment.scheduledAt?.slice(11, 16)
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return { date: "TBD", time: "" }
  const date = new Date(`${dateKey}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) {
    return { date: "TBD", time: "" }
  }
  const match = clock?.match(/^(\d{1,2}):(\d{2})$/)
  const hour = Number(match?.[1])
  const minute = Number(match?.[2])
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    time: match && hour < 24 && minute < 60
      ? `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`
      : "",
  }
}
