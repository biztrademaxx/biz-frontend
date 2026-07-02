"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCookieConsent } from "@/contexts/cookie-consent-context"
import CookiePreferencesDialog from "@/components/cookies/CookiePreferencesDialog"

export default function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useCookieConsent()

  if (!showBanner) {
    return <CookiePreferencesDialog />
  }

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-5"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 sm:text-base">
              We use cookies
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              BizTradeFairs uses essential cookies to run the site and optional cookies for
              analytics, preferences, and marketing. You can accept all, reject optional cookies,
              or customize your choices. See our{" "}
              <Link
                href="/cookie-policy"
                className="font-medium text-[#004A96] underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={rejectAll}
            >
              Reject optional
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={openPreferences}
            >
              Customize
            </Button>
            <Button
              type="button"
              className="w-full bg-[#004A96] hover:bg-[#003d7a] sm:w-auto"
              onClick={acceptAll}
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferencesDialog />
    </>
  )
}
