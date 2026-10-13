"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useCookieConsent } from "@/contexts/cookie-consent-context"
import {
  COOKIE_CATEGORY_META,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieConsentPreferences,
  type OptionalCookieCategory,
} from "@/lib/cookie-consent"

const OPTIONAL_CATEGORIES: OptionalCookieCategory[] = [
  "analytics",
  "functional",
  "marketing",
]

export default function CookiePreferencesDialog() {
  const {
    preferences,
    preferencesOpen,
    closePreferences,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent()

  const [draft, setDraft] = useState<CookieConsentPreferences>(preferences)

  useEffect(() => {
    if (preferencesOpen) {
      setDraft(preferences)
    }
  }, [preferencesOpen, preferences])

  const updateDraft = (category: OptionalCookieCategory, enabled: boolean) => {
    setDraft((current) => ({ ...current, [category]: enabled }))
  }

  return (
    <Dialog open={preferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Choose which optional cookies we may use. Essential cookies are always active. Read
            our{" "}
            <Link href="/cookie-policy" className="text-[#004A96] underline-offset-2 hover:underline">
              Cookie Policy
            </Link>{" "}
            for details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{COOKIE_CATEGORY_META.essential.title}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {COOKIE_CATEGORY_META.essential.description}
                </p>
              </div>
              <Switch checked disabled aria-readonly />
            </div>
          </div>

          {OPTIONAL_CATEGORIES.map((category) => {
            const meta = COOKIE_CATEGORY_META[category]
            return (
              <div key={category} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{meta.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{meta.description}</p>
                  </div>
                  <Switch
                    checked={draft[category]}
                    onCheckedChange={(checked) => updateDraft(category, checked)}
                    aria-label={`Toggle ${meta.title}`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => setDraft(DEFAULT_COOKIE_PREFERENCES)}
            >
              Reject optional
            </Button>
            <Button
              type="button"
              className="w-full bg-[#004A96] hover:bg-[#003d7a] sm:flex-1"
              onClick={() => savePreferences(draft)}
            >
              Save preferences
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={rejectAll}
            >
              Reject all
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={acceptAll}
            >
              Accept all
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
