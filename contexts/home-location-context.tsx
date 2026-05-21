"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { countryNameFromCode } from "@/lib/geo-from-request"
import { resolveCountryForCityName } from "@/lib/city-country"
import { HOME_CITY_STORAGE_KEY } from "@/lib/home-location"

type HomeLocationApi = {
  city?: string | null
  countryCode?: string | null
  countryName?: string | null
  displayLabel?: string | null
  auto?: boolean
  primed?: boolean
}

type HomeLocationContextValue = {
  /** Detected country for navbar (IP / VPN). */
  countryName: string | null
  city: string | null
  isLoading: boolean
  isDetecting: boolean
  /** @deprecated Manual picker disabled — kept for `LocationPicker.tsx`. */
  setCity: (city: string) => Promise<void>
  clearCity: () => Promise<void>
  detectFromBrowser: () => Promise<void>
  detectFromIp: () => Promise<void>
}

const HomeLocationContext = createContext<HomeLocationContextValue | null>(null)

function countryLabelFromApi(data: HomeLocationApi): string | null {
  const name = data.countryName?.trim()
  if (name) return name
  const code = data.countryCode?.trim().toUpperCase()
  if (code) return countryNameFromCode(code)
  const city = data.city?.trim()
  if (city) return resolveCountryForCityName(city)?.countryName ?? null
  return null
}

async function persistLocation(payload: {
  city: string | null
  countryCode?: string | null
  countryName?: string | null
  auto?: boolean
}) {
  const city = payload.city?.trim() || null
  let countryCode = payload.countryCode?.trim().toUpperCase() || null
  let countryName = payload.countryName?.trim() || null

  if (city && !countryCode) {
    const mapped = resolveCountryForCityName(city)
    if (mapped) {
      countryCode = mapped.countryCode
      countryName = mapped.countryName
    }
  }

  if (typeof window !== "undefined") {
    if (city) window.localStorage.setItem(HOME_CITY_STORAGE_KEY, city)
    else window.localStorage.removeItem(HOME_CITY_STORAGE_KEY)
  }

  if (city || countryCode || countryName) {
    await fetch("/api/home-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        countryCode,
        countryName,
        auto: payload.auto ?? true,
      }),
    })
  } else {
    await fetch("/api/home-location", { method: "DELETE" })
  }
}

function applyApiLocation(
  data: HomeLocationApi,
  setCityState: (c: string | null) => void,
  setCountryState: (c: string | null) => void,
) {
  const cityLabel = data.city?.trim() || null
  setCountryState(countryLabelFromApi(data))
  setCityState(cityLabel)
  if (cityLabel) window.localStorage.setItem(HOME_CITY_STORAGE_KEY, cityLabel)
  else window.localStorage.removeItem(HOME_CITY_STORAGE_KEY)
}

export function HomeLocationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [city, setCityState] = useState<string | null>(null)
  const [countryName, setCountryName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  const syncGeoFromIp = useCallback(async () => {
    const r = await fetch("/api/home-location?refresh=1", { cache: "no-store" })
    if (!r.ok) return
    const data = (await r.json()) as HomeLocationApi
    applyApiLocation(data, setCityState, setCountryName)
    router.refresh()
  }, [router])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch("/api/home-location?refresh=1", { cache: "no-store" })
        if (r.ok && !cancelled) {
          const data = (await r.json()) as HomeLocationApi
          applyApiLocation(data, setCityState, setCountryName)
          if (data.primed) router.refresh()
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncGeoFromIp()
    }
    window.addEventListener("focus", onVisible)
    document.addEventListener("visibilitychange", onVisible)
    const intervalId = window.setInterval(() => void syncGeoFromIp(), 120_000)
    return () => {
      window.removeEventListener("focus", onVisible)
      document.removeEventListener("visibilitychange", onVisible)
      window.clearInterval(intervalId)
    }
  }, [syncGeoFromIp])

  const applyCity = useCallback(
    async (
      next: string | null,
      options?: { countryCode?: string | null; countryName?: string | null; auto?: boolean },
    ) => {
      const trimmed = next?.trim() || null
      const mapped = trimmed ? resolveCountryForCityName(trimmed) : null
      const nextCountry =
        options?.countryName?.trim() ||
        (options?.countryCode ? countryNameFromCode(options.countryCode) : null) ||
        mapped?.countryName ||
        null
      setCityState(trimmed)
      setCountryName(nextCountry)
      await persistLocation({
        city: trimmed,
        countryCode: options?.countryCode ?? mapped?.countryCode,
        countryName: nextCountry,
        auto: options?.auto ?? true,
      })
      router.refresh()
    },
    [router],
  )

  const setCity = useCallback(
    async (nextCity: string) => {
      await applyCity(nextCity, { auto: true })
    },
    [applyCity],
  )

  const clearCity = useCallback(async () => {
    await applyCity(null)
    await syncGeoFromIp()
  }, [applyCity, syncGeoFromIp])

  const detectFromIp = useCallback(async () => {
    setIsDetecting(true)
    try {
      await syncGeoFromIp()
    } finally {
      setIsDetecting(false)
    }
  }, [syncGeoFromIp])

  const detectFromBrowser = useCallback(async () => {
    await detectFromIp()
  }, [detectFromIp])

  const value = useMemo(
    () => ({
      countryName,
      city,
      isLoading,
      isDetecting,
      setCity,
      clearCity,
      detectFromBrowser,
      detectFromIp,
    }),
    [countryName, city, isLoading, isDetecting, setCity, clearCity, detectFromBrowser, detectFromIp],
  )

  return <HomeLocationContext.Provider value={value}>{children}</HomeLocationContext.Provider>
}

export function useHomeLocation() {
  const ctx = useContext(HomeLocationContext)
  if (!ctx) {
    throw new Error("useHomeLocation must be used within HomeLocationProvider")
  }
  return ctx
}
