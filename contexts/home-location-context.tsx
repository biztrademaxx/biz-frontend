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

async function persistCity(city: string | null) {
  if (typeof window !== "undefined") {
    if (city) window.localStorage.setItem(HOME_CITY_STORAGE_KEY, city)
    else window.localStorage.removeItem(HOME_CITY_STORAGE_KEY)
  }
  if (city) {
    await fetch("/api/home-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
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

export function HomeLocationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [city, setCityState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const stored =
          typeof window !== "undefined" ? window.localStorage.getItem(HOME_CITY_STORAGE_KEY)?.trim() : ""
        if (stored) {
          if (!cancelled) setCityState(stored)
          await fetch("/api/home-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city: stored }),
          }).catch(() => null)
          return
        }
        const r = await fetch("/api/home-location", { cache: "no-store" })
        if (r.ok) {
          const data = (await r.json()) as { city?: string | null }
          const fromCookie = data.city?.trim() || null
          if (!cancelled && fromCookie) {
            setCityState(fromCookie)
            window.localStorage.setItem(HOME_CITY_STORAGE_KEY, fromCookie)
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const applyCity = useCallback(
    async (next: string | null) => {
      const trimmed = next?.trim() || null
      setCityState(trimmed)
      await persistCity(trimmed)
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
      const detected = geo?.city?.trim() || null
      if (detected) await applyCity(detected)
    } finally {
      setIsDetecting(false)
    }
  }, [applyCity])

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
