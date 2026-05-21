import { countryNameFromCode } from "@/lib/geo-from-request"

/** Card/footer line: "Bengaluru, India" (skips duplicate if city already includes country). */
export function formatVenueLocationLabel(city: string, country: string): string {
  const c = city.trim()
  let co = country.trim()
  if (/^[A-Za-z]{2}$/.test(co)) {
    co = countryNameFromCode(co) || co
  }
  if (c && co) {
    const cLower = c.toLowerCase()
    const coLower = co.toLowerCase()
    if (cLower.includes(coLower)) return c
    return `${c}, ${co}`
  }
  return c || co || "Location TBD"
}
