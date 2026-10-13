export const COOKIE_CONSENT_STORAGE_KEY = "btf_cookie_consent"
export const COOKIE_CONSENT_COOKIE_NAME = "btf_cookie_consent"
export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export type OptionalCookieCategory = "analytics" | "functional" | "marketing"

export type CookieCategory = "essential" | OptionalCookieCategory

export interface CookieConsentPreferences {
  essential: true
  analytics: boolean
  functional: boolean
  marketing: boolean
}

export interface StoredCookieConsent {
  version: number
  preferences: CookieConsentPreferences
  updatedAt: string
}

export const DEFAULT_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: false,
  functional: false,
  marketing: false,
}

export const ACCEPT_ALL_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: true,
  functional: true,
  marketing: true,
}

export const COOKIE_CATEGORY_META: Record<
  CookieCategory,
  { title: string; description: string; required?: boolean }
> = {
  essential: {
    title: "Essential Cookies",
    description:
      "Required for login, security, session management, and saving your cookie choices. These cannot be disabled.",
    required: true,
  },
  analytics: {
    title: "Performance & Analytics",
    description:
      "Help us understand how visitors use BizTradeFairs.com so we can improve the website (e.g. Google Analytics).",
  },
  functional: {
    title: "Functional Cookies",
    description:
      "Remember preferences such as location, saved searches, and recently viewed listings.",
  },
  marketing: {
    title: "Marketing & Advertising",
    description:
      "Measure campaign performance and deliver relevant promotions (e.g. Google Ads, Meta Pixel, LinkedIn Insight Tag).",
  },
}

export const COOKIE_CONSENT_UPDATED_EVENT = "btf-cookie-consent-updated"

function isBrowser() {
  return typeof window !== "undefined"
}

function parseConsent(raw: string | null | undefined): StoredCookieConsent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredCookieConsent
    if (
      parsed?.version !== COOKIE_CONSENT_VERSION ||
      !parsed.preferences ||
      parsed.preferences.essential !== true
    ) {
      return null
    }
    return {
      version: COOKIE_CONSENT_VERSION,
      preferences: {
        essential: true,
        analytics: Boolean(parsed.preferences.analytics),
        functional: Boolean(parsed.preferences.functional),
        marketing: Boolean(parsed.preferences.marketing),
      },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeConsentCookie(value: string) {
  if (!isBrowser()) return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE}; SameSite=Lax${secure}`
}

export function readStoredCookieConsent(): StoredCookieConsent | null {
  if (!isBrowser()) return null

  const fromCookie = parseConsent(readCookie(COOKIE_CONSENT_COOKIE_NAME))
  if (fromCookie) return fromCookie

  const fromStorage = parseConsent(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY))
  if (fromStorage) {
    writeConsentCookie(JSON.stringify(fromStorage))
    return fromStorage
  }

  return null
}

export function saveCookieConsent(preferences: CookieConsentPreferences): StoredCookieConsent {
  const stored: StoredCookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    preferences: {
      essential: true,
      analytics: Boolean(preferences.analytics),
      functional: Boolean(preferences.functional),
      marketing: Boolean(preferences.marketing),
    },
    updatedAt: new Date().toISOString(),
  }

  if (isBrowser()) {
    const serialized = JSON.stringify(stored)
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, serialized)
    writeConsentCookie(serialized)
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: stored })
    )
  }

  return stored
}

export function hasCategoryConsent(
  preferences: CookieConsentPreferences | null | undefined,
  category: CookieCategory
): boolean {
  if (!preferences) return category === "essential"
  if (category === "essential") return true
  return Boolean(preferences[category])
}
