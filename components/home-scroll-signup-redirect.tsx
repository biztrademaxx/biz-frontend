"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getAccessToken } from "@/lib/api"
import  SignupFormCard  from "@/components/signup/signup-form-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Bumped when prompt logic changes so devs are not stuck with an old "already shown" flag.
 * Clear in DevTools: sessionStorage.removeItem("biz_home_signup_popup_v3")
 */
const SESSION_KEY = "biz_home_signup_popup_v3"

/** Show signup / login prompt on the home page after this delay when the visitor is not logged in. */
const POPUP_DELAY_MS = 19_000

function alreadyPrompted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    // If storage is blocked, still allow the timer (do not skip the popup).
    return false
  }
}

function markPrompted() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    /* ignore */
  }
}

/**
 * Home page (`/`): if not logged in, opens the account dialog once per session after {@link POPUP_DELAY_MS}.
 */
export default function HomeScrollSignupRedirect() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    if (pathname !== "/") return
    if (getAccessToken()) return
    if (alreadyPrompted()) return

    const timerId = window.setTimeout(() => {
      if (fired.current) return
      if (getAccessToken()) return
      if (alreadyPrompted()) return

      fired.current = true
      markPrompted()
      setOpen(true)
    }, POPUP_DELAY_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [pathname])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="top-[5%] left-1/2 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 translate-y-0 overflow-visible border-gray-200 p-4 sm:top-[8%] sm:p-6"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Create an account</DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            Join to save events and get updates — or{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              log in
            </Link>{" "}
            if you already have an account.
          </DialogDescription>
        </DialogHeader>
        <SignupFormCard variant="dialog" onRegistrationSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
