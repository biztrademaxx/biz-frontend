"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminThemeToggleProps = {
  className?: string
  triggerButtonClassName?: string
}

export function AdminThemeToggle({ className, triggerButtonClassName }: AdminThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 min-h-10 min-w-10 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
        triggerButtonClassName,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!mounted ? (
        <Sun className="h-5 w-5 opacity-40" aria-hidden />
      ) : isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </Button>
  )
}
