"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useHeroTransition } from "@/lib/hero/hero-transition-context"

/** Tracks whether the home hero block is still behind the sticky navbar. */
export default function HomeHeroInViewObserver() {
  const pathname = usePathname()
  const { setHeroInView } = useHeroTransition()

  useEffect(() => {
    if (pathname !== "/") {
      setHeroInView(false)
      return
    }

    setHeroInView(true)

    const el = document.getElementById("home-hero-section")
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -64px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [pathname, setHeroInView])

  return null
}
