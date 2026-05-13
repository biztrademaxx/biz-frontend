/** Shared helpers for event URLs and API refs (UUID vs slug). Safe for client + server. */

export function isEventIdUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s ?? "").trim())
}
