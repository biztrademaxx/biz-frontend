"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { hasActiveAccessToken } from "@/lib/api"
import SignupFormCard from "@/components/signup/signup-form-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Bumped when prompt logic changes so devs are not stuck with an old "already shown" flag.
 * Clear in DevTools: sessionStorage.removeItem("biz_home_signup_popup_v4")
 */
const SESSION_KEY = "biz_home_signup_popup_v4"

/** Show signup prompt on the home page after this delay when the visitor is not logged in. */
const POPUP_DELAY_MS = 12_000

const AUTH_ROUTE_PREFIXES = ["/login", "/signup", "/organizer-signup"]

function isHomePath(pathname: string | null): boolean {
  return pathname === "/" || pathname === ""
}

function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return AUTH_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function alreadyPrompted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
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

function shouldOfferSignup(): boolean {
  return !hasActiveAccessToken()
}

/**
 * Home page (`/`): if not logged in, opens the account dialog once per session after {@link POPUP_DELAY_MS}.
 */
export default function HomeScrollSignupRedirect() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isHomePath(pathname)) return
    if (isAuthRoute(pathname)) return
    if (!shouldOfferSignup()) return
    if (alreadyPrompted()) return

    const timerId = window.setTimeout(() => {
      if (fired.current) return
      if (!isHomePath(pathname)) return
      if (!shouldOfferSignup()) return
      if (alreadyPrompted()) return

      fired.current = true
      setOpen(true)
    }, POPUP_DELAY_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [pathname, mounted])

  useEffect(() => {
    if (open) markPrompted()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        overlayClassName="bg-slate-900/55 backdrop-blur-md"
        className="top-[5%] left-1/2 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 translate-y-0 gap-3 overflow-visible rounded-2xl border border-white/50 bg-white/75 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:top-[8%] sm:gap-4 sm:p-6"
        closeButtonClassName="rounded-full border border-white/60 bg-white/50 opacity-90 shadow-sm backdrop-blur-sm hover:bg-white/80 hover:opacity-100"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-slate-900">Create an account</DialogTitle>
          <DialogDescription className="text-center text-base text-slate-600">
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
