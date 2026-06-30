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

type HeroTransitionContextValue = {
  phase: HeroTransitionPhase
  direction: 1 | -1
  setHeroTransition: (phase: HeroTransitionPhase, direction?: 1 | -1) => void
}

const HeroTransitionContext = createContext<HeroTransitionContextValue | null>(null)

export function HeroTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<HeroTransitionPhase>("idle")
  const [direction, setDirection] = useState<1 | -1>(1)

  const setHeroTransition = useCallback((nextPhase: HeroTransitionPhase, nextDirection?: 1 | -1) => {
    setPhase(nextPhase)
    if (nextDirection !== undefined) setDirection(nextDirection)
  }, [])

  const value = useMemo(
    () => ({ phase, direction, setHeroTransition }),
    [phase, direction, setHeroTransition],
  )

  return <HeroTransitionContext.Provider value={value}>{children}</HeroTransitionContext.Provider>
}

export function useHeroTransition() {
  const ctx = useContext(HeroTransitionContext)
  if (!ctx) {
    return {
      phase: "idle" as const,
      direction: 1 as const,
      setHeroTransition: () => {},
    }
  }
  return ctx
}
