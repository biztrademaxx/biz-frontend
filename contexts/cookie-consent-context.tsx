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
import {
  ACCEPT_ALL_COOKIE_PREFERENCES,
  COOKIE_CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  readStoredCookieConsent,
  saveCookieConsent,
  type CookieConsentPreferences,
  type StoredCookieConsent,
} from "@/lib/cookie-consent"

type CookieConsentContextValue = {
  hasConsented: boolean
  preferences: CookieConsentPreferences
  showBanner: boolean
  preferencesOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (preferences: CookieConsentPreferences) => void
  openPreferences: () => void
  closePreferences: () => void
  dismissBanner: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [storedConsent, setStoredConsent] = useState<StoredCookieConsent | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const existing = readStoredCookieConsent()
    setStoredConsent(existing)
    setShowBanner(!existing)
    setHydrated(true)
  }, [])

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<StoredCookieConsent>).detail
      if (detail) setStoredConsent(detail)
    }
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onUpdated)
  }, [])

  const persist = useCallback((preferences: CookieConsentPreferences) => {
    const saved = saveCookieConsent(preferences)
    setStoredConsent(saved)
    setShowBanner(false)
    setPreferencesOpen(false)
  }, [])

  const acceptAll = useCallback(() => {
    persist(ACCEPT_ALL_COOKIE_PREFERENCES)
  }, [persist])

  const rejectAll = useCallback(() => {
    persist(DEFAULT_COOKIE_PREFERENCES)
  }, [persist])

  const savePreferences = useCallback(
    (preferences: CookieConsentPreferences) => {
      persist({
        essential: true,
        analytics: preferences.analytics,
        functional: preferences.functional,
        marketing: preferences.marketing,
      })
    },
    [persist]
  )

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      hasConsented: hydrated && Boolean(storedConsent),
      preferences: storedConsent?.preferences ?? DEFAULT_COOKIE_PREFERENCES,
      showBanner: hydrated && showBanner,
      preferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      dismissBanner: () => setShowBanner(false),
    }),
    [
      hydrated,
      storedConsent,
      showBanner,
      preferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
    ]
  )

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return context
}
