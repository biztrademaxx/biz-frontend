import "server-only"

import { cookies } from "next/headers"
import { HOME_CITY_COOKIE } from "@/lib/home-location"

export async function getHomeCityFromCookies(): Promise<string | null> {
  try {
    const jar = await cookies()
    const raw = jar.get(HOME_CITY_COOKIE)?.value?.trim()
    return raw || null
  } catch {
    return null
  }
}
