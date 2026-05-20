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
import { fetchGeoHint } from "@/lib/browse-geo"
import { HOME_CITY_STORAGE_KEY } from "@/lib/home-location"

type HomeLocationApi = {
  city?: string | null
  countryCode?: string | null
  countryName?: string | null
  displayLabel?: string | null
  auto?: boolean
  /** Set when this response just wrote the IP-detected cookie (one-time refresh). */
  primed?: boolean
}

type HomeLocationContextValue = {
  city: string | null
  isLoading: boolean
  isDetecting: boolean
  setCity: (city: string) => Promise<void>
  clearCity: () => Promise<void>
  detectFromBrowser: () => Promise<void>
  detectFromIp: () => Promise<void>
}

const HomeLocationContext = createContext<HomeLocationContextValue | null>(null)

async function persistLocation(payload: {
  city: string | null
  countryCode?: string | null
  countryName?: string | null
  auto?: boolean
}) {
  const label =
    payload.city?.trim() ||
    payload.countryName?.trim() ||
    payload.countryCode?.trim() ||
    null

  if (typeof window !== "undefined") {
    if (label) window.localStorage.setItem(HOME_CITY_STORAGE_KEY, label)
    else window.localStorage.removeItem(HOME_CITY_STORAGE_KEY)
  }

  if (label) {
    await fetch("/api/home-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: payload.city || label,
        countryCode: payload.countryCode,
        countryName: payload.countryName,
        auto: payload.auto,
      }),
    })
  } else {
    await fetch("/api/home-location", { method: "DELETE" })
  }
}

async function reverseGeocodeCity(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json`
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "BizTradeFairs/1.0" },
    })
    if (!r.ok) return null
    const data = (await r.json()) as {
      address?: { city?: string; town?: string; village?: string; state_district?: string }
    }
    const a = data.address
    return a?.city || a?.town || a?.village || a?.state_district || null
  } catch {
    return null
  }
}

function labelFromApi(data: HomeLocationApi): string | null {
  return (
    data.displayLabel?.trim() ||
    data.city?.trim() ||
    data.countryName?.trim() ||
    data.countryCode?.trim() ||
    null
  )
}

export function HomeLocationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [city, setCityState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // GET auto-detects from IP when no cookie (sets cookie server-side).
        const r = await fetch("/api/home-location", { cache: "no-store" })
        if (r.ok) {
          const data = (await r.json()) as HomeLocationApi
          const label = labelFromApi(data)
          if (!cancelled && label) {
            setCityState(label)
            window.localStorage.setItem(HOME_CITY_STORAGE_KEY, label)
            if (data.primed) {
              router.refresh()
            }
            return
          }
        }

        const stored = window.localStorage.getItem(HOME_CITY_STORAGE_KEY)?.trim()
        if (stored) {
          if (!cancelled) setCityState(stored)
          await persistLocation({ city: stored })
          return
        }

        // Fallback client geo (same IP logic via /api/geo).
        const geo = await fetchGeoHint()
        const detected =
          geo?.city?.trim() ||
          geo?.countryName?.trim() ||
          geo?.countryCode?.trim() ||
          null
        if (!cancelled && detected) {
          setCityState(detected)
          window.localStorage.setItem(HOME_CITY_STORAGE_KEY, detected)
          await persistLocation({
            city: geo?.city?.trim() || detected,
            countryCode: geo?.countryCode,
            countryName: geo?.countryName,
            auto: true,
          })
          router.refresh()
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const applyCity = useCallback(
    async (next: string | null) => {
      const trimmed = next?.trim() || null
      setCityState(trimmed)
      await persistLocation({ city: trimmed, auto: false })
      router.refresh()
    },
    [router],
  )

  const setCity = useCallback(
    async (nextCity: string) => {
      await applyCity(nextCity)
    },
    [applyCity],
  )

  const clearCity = useCallback(async () => {
    await applyCity(null)
  }, [applyCity])

  const detectFromIp = useCallback(async () => {
    setIsDetecting(true)
    try {
      const geo = await fetchGeoHint()
      const detected =
        geo?.city?.trim() ||
        geo?.countryName?.trim() ||
        geo?.countryCode?.trim() ||
        null
      if (detected) {
        await persistLocation({
          city: geo?.city?.trim() || detected,
          countryCode: geo?.countryCode,
          countryName: geo?.countryName,
          auto: true,
        })
        setCityState(detected)
        router.refresh()
      }
    } finally {
      setIsDetecting(false)
    }
  }, [router])

  const detectFromBrowser = useCallback(async () => {
    if (!navigator.geolocation) {
      await detectFromIp()
      return
    }
    setIsDetecting(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12_000,
          maximumAge: 300_000,
        })
      })
      const detected = await reverseGeocodeCity(position.coords.latitude, position.coords.longitude)
      if (detected) {
        await applyCity(detected)
        return
      }
      await detectFromIp()
    } catch {
      await detectFromIp()
    } finally {
      setIsDetecting(false)
    }
  }, [applyCity, detectFromIp])

  const value = useMemo(
    () => ({
      city,
      isLoading,
      isDetecting,
      setCity,
      clearCity,
      detectFromBrowser,
      detectFromIp,
    }),
    [city, isLoading, isDetecting, setCity, clearCity, detectFromBrowser, detectFromIp],
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
