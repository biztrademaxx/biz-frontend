import type { ReactElement, ReactNode } from "react"
import { render, type RenderOptions } from "@testing-library/react"

import { Toaster } from "@/components/ui/toaster"

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

/** Minimal `window.matchMedia` so responsive Tailwind classes behave consistently in jsdom. */
export function mockMatchMedia(matchesLg = true) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: matchesLg && typeof query === "string" && query.includes("1024"),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}
