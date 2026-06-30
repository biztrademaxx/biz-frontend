"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type HeroTransitionPhase = "idle" | "exit" | "swap"

type HeroSurfaceState = {
  displayIdx: number
  pendingIdx: number
  phase: HeroTransitionPhase
  direction: 1 | -1
}

type HeroTransitionContextValue = HeroSurfaceState & {
  heroInView: boolean
  setHeroSurface: (patch: Partial<HeroSurfaceState>) => void
  setHeroInView: (inView: boolean) => void
}

const defaultSurface: HeroSurfaceState = {
  displayIdx: 0,
  pendingIdx: 0,
  phase: "idle",
  direction: 1,
}

const HeroTransitionContext = createContext<HeroTransitionContextValue | null>(null)

export function HeroTransitionProvider({ children }: { children: ReactNode }) {
  const [surface, setSurface] = useState<HeroSurfaceState>(defaultSurface)
  const [heroInView, setHeroInView] = useState(true)

  const setHeroSurface = useCallback((patch: Partial<HeroSurfaceState>) => {
    setSurface((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo(
    () => ({ ...surface, heroInView, setHeroSurface, setHeroInView }),
    [surface, heroInView, setHeroSurface],
  )

  return <HeroTransitionContext.Provider value={value}>{children}</HeroTransitionContext.Provider>
}

export function useHeroTransition() {
  const ctx = useContext(HeroTransitionContext)
  if (!ctx) {
    return {
      ...defaultSurface,
      heroInView: true,
      setHeroSurface: () => {},
      setHeroInView: () => {},
    }
  }
  return ctx
}
