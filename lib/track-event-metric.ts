type MetricType = "click" | "impression"

/**
 * Fire-and-forget promotion / listing metric. Dedupes clicks per browser session.
 * Never surfaces counts in the UI — server-side only for organizer/admin dashboards.
 */
export function trackEventMetric(
  eventId: string,
  type: MetricType,
  source?: string,
): void {
  if (typeof window === "undefined" || !eventId) return

  const storageKey = `evt_metric_${type}_${eventId}`
  if (type === "click" && sessionStorage.getItem(storageKey)) return
  sessionStorage.setItem(storageKey, "1")

  void fetch(`/api/events/${encodeURIComponent(eventId)}/metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, source }),
    keepalive: true,
  }).catch(() => {})
}
