/** IANA time zone identifiers for venue / event scheduling (e.g. `Asia/Kolkata`). */
export function getIanaTimeZoneOptions(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone") as string[]
  } catch {
    return ["UTC"]
  }
}
