"use client"

import { useCookieConsent } from "@/contexts/cookie-consent-context"

type CookieSettingsButtonProps = {
  className?: string
  children?: React.ReactNode
}

export default function CookieSettingsButton({
  className,
  children = "Cookie Settings",
}: CookieSettingsButtonProps) {
  const { openPreferences } = useCookieConsent()

  return (
    <button type="button" onClick={openPreferences} className={className}>
      {children}
    </button>
  )
}
