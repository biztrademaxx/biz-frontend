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
        auto: payload.auto,
      }),
    })
  } else {
    await fetch("/api/home-location", { method: "DELETE" })
  }
}

type ReverseGeo = {
  city: string | null
  countryCode: string | null
  countryName: string | null
}

async function reverseGeocodeLocation(lat: number, lon: number): Promise<ReverseGeo | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json`
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "BizTradeFairs/1.0" },
    })
    if (!r.ok) return null
    const data = (await r.json()) as {
      address?: {
        city?: string
        town?: string
        village?: string
        state_district?: string
        country?: string
        country_code?: string
      }
    }
    const a = data.address
    if (!a) return null
    const city = a.city || a.town || a.village || a.state_district || null
    const countryName = a.country?.trim() || null
    const countryCode = a.country_code?.trim().toUpperCase() || null
    return { city, countryCode, countryName }
  } catch {
    return null
  }
}

function navbarCityFromApi(data: HomeLocationApi): string | null {
  return data.city?.trim() || null
}

function applyApiLocationToNavbar(
  data: HomeLocationApi,
  setCityState: (c: string | null) => void,
  setLocationAuto: (a: boolean) => void,
) {
  const cityLabel = navbarCityFromApi(data)
  setLocationAuto(data.auto === true)
  if (cityLabel) {
    setCityState(cityLabel)
    window.localStorage.setItem(HOME_CITY_STORAGE_KEY, cityLabel)
  } else {
    setCityState(null)
    window.localStorage.removeItem(HOME_CITY_STORAGE_KEY)
  }
}

export function HomeLocationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [city, setCityState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)
  const [locationAuto, setLocationAuto] = useState(false)

  const syncAutoGeoFromIp = useCallback(async () => {
    const r = await fetch("/api/home-location?refresh=1", { cache: "no-store" })
    if (!r.ok) return
    const data = (await r.json()) as HomeLocationApi
    applyApiLocationToNavbar(data, setCityState, setLocationAuto)
    router.refresh()
  }, [router])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const peek = await fetch("/api/home-location", { cache: "no-store" })
        if (peek.ok) {
          const peekData = (await peek.json()) as HomeLocationApi
          const isManualPick = peekData.auto === false && Boolean(peekData.city?.trim()) // auto cookie "0"

          if (isManualPick) {
            if (!cancelled) {
              applyApiLocationToNavbar(peekData, setCityState, setLocationAuto)
            }
            return
          }
        }

        const r = await fetch("/api/home-location?refresh=1", { cache: "no-store" })
        if (r.ok) {
          const data = (await r.json()) as HomeLocationApi
          if (!cancelled) {
            applyApiLocationToNavbar(data, setCityState, setLocationAuto)
            if (data.primed) router.refresh()
          }
          return
        }

        const geo = await fetchGeoHint()
        const detectedCity = geo?.city?.trim() || null
        if (!cancelled && (detectedCity || geo?.countryCode)) {
          await persistLocation({
            city: detectedCity,
            countryCode: geo?.countryCode,
            countryName: geo?.countryName,
            auto: true,
          })
          if (detectedCity) {
            setCityState(detectedCity)
            window.localStorage.setItem(HOME_CITY_STORAGE_KEY, detectedCity)
          }
          setLocationAuto(true)
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

  useEffect(() => {
    if (!locationAuto) return

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncAutoGeoFromIp()
    }
    window.addEventListener("focus", onVisible)
    document.addEventListener("visibilitychange", onVisible)
    const intervalId = window.setInterval(() => void syncAutoGeoFromIp(), 120_000)

    return () => {
      window.removeEventListener("focus", onVisible)
      document.removeEventListener("visibilitychange", onVisible)
      window.clearInterval(intervalId)
    }
  }, [locationAuto, syncAutoGeoFromIp])

  const applyCity = useCallback(
    async (
      next: string | null,
      options?: { countryCode?: string | null; countryName?: string | null; auto?: boolean },
    ) => {
      const trimmed = next?.trim() || null
      const mapped = trimmed ? resolveCountryForCityName(trimmed) : null
      setCityState(trimmed)
      const isAuto = options?.auto ?? false
      setLocationAuto(isAuto)
      await persistLocation({
        city: trimmed,
        countryCode: options?.countryCode ?? mapped?.countryCode,
        countryName: options?.countryName ?? mapped?.countryName,
        auto: isAuto,
      })
      router.refresh()
    },
    [router],
  )

  const setCity = useCallback(
    async (nextCity: string) => {
      await applyCity(nextCity, { auto: false })
    },
    [applyCity],
  )

  const clearCity = useCallback(async () => {
    setLocationAuto(false)
    await applyCity(null)
    await syncAutoGeoFromIp()
  }, [applyCity, syncAutoGeoFromIp])

  const detectFromIp = useCallback(async () => {
    setIsDetecting(true)
    try {
      await syncAutoGeoFromIp()
    } finally {
      setIsDetecting(false)
    }
  }, [syncAutoGeoFromIp])

  const detectFromBrowser = useCallback(async () => {
    if (!navigator.geolocation) {
      await detectFromIp()
      return
    }
    setIsDetecting(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 0,
        })
      })
      const geo = await reverseGeocodeLocation(position.coords.latitude, position.coords.longitude)
      if (geo?.city) {
        setLocationAuto(true)
        await applyCity(geo.city, {
          countryCode: geo.countryCode,
          countryName: geo.countryName,
          auto: true,
        })
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
