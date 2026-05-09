"use client"

import { useEffect, useRef } from "react"

import { getAccessToken, setTokens } from "@/lib/api"

/**
 * When users sign in with Google/LinkedIn, NextAuth sets a session cookie but API calls use
 * backend JWTs in localStorage. After OAuth redirect, fetch tokens once if missing.
 */
export function OAuthBackendSessionBridge() {
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current || typeof window === "undefined") return
    if (getAccessToken()) return

    attempted.current = true

    void (async () => {
      try {
        const res = await fetch("/api/auth/backend-session", {
          method: "POST",
          credentials: "include",
        })
        if (!res.ok) {
          return
        }
        const data = (await res.json()) as {
          accessToken?: string
          refreshToken?: string
        }
        if (data.accessToken) {
          setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        }
      } catch {
        attempted.current = false
      }
    })()
  }, [])

  return null
}
