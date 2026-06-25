"use client"

import { Crown, Loader2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getPlanBadgeTier, type CurrentDashboardPlan } from "@/lib/dashboard-packages"

const tierStyles = {
  free: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50",
  standard: "border-[#004A96]/25 bg-[#004A96]/10 text-[#004A96] hover:bg-[#004A96]/10",
  premium: "border-amber-300/80 bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-900 hover:from-amber-50",
} as const

export type DashboardPlanBadgeProps = {
  plan: CurrentDashboardPlan | null
  loading?: boolean
  size?: "sm" | "md"
  className?: string
}

export function DashboardPlanBadge({
  plan,
  loading = false,
  size = "md",
  className,
}: DashboardPlanBadgeProps) {
  if (loading) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 font-medium",
          size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs",
          className,
        )}
      >
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
        Plan…
      </Badge>
    )
  }

  if (!plan?.planName) return null

  const tier = getPlanBadgeTier(plan.planSlug)
  const Icon = tier === "free" ? Sparkles : Crown

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-semibold",
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs",
        tierStyles[tier],
        className,
      )}
      title={plan.billingNote ? `${plan.planName} · ${plan.billingNote}` : plan.planName}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
      {plan.planName}
    </Badge>
  )
}
