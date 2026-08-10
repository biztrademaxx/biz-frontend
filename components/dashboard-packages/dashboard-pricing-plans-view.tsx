"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Crown, Loader2, Minus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  type DashboardPackageRole,
  type DashboardPlanDefinition,
  type PlanFeatureState,
  dashboardPlansPageSubtitle,
  dashboardPlansPageTitle,
  getDashboardPlansForRole,
  isFreeDashboardPlan,
} from "@/lib/dashboard-packages"
import { PlanPaymentDialog } from "@/components/dashboard-packages/plan-payment-dialog"
import {
  activateFreeDashboardPlan,
  fetchCurrentDashboardPlan,
} from "@/lib/subscription-checkout"

// Normalized comparison so slugs like "organizer-silver" and names like "Silver Plan"
// (or an API returning a bare "silver") all match correctly, case/punctuation-insensitive.
function normalizePlanKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
}

function isSamePlan(plan: DashboardPlanDefinition, slugOrName: string | null | undefined): boolean {
  if (!slugOrName) return false
  const target = normalizePlanKey(slugOrName)
  if (!target) return false
  const idKey = normalizePlanKey(plan.id)
  const nameKey = normalizePlanKey(plan.name)
  return (
    idKey === target || nameKey === target ||
    idKey.includes(target) || target.includes(idKey) ||
    nameKey.includes(target) || target.includes(nameKey)
  )
}

function FeatureIcon({ state }: { state: PlanFeatureState }) {
  if (state === true) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  if (state === false) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
      <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </span>
  )
}

function PlanCard({
  plan,
  accent,
  isCurrent,
  loading,
  onCta,
}: {
  plan: DashboardPlanDefinition
  accent: "visitor" | "exhibitor" | "organizer"
  isCurrent: boolean
  loading: boolean
  onCta: (plan: DashboardPlanDefinition) => void
}) {
  const borderPopular =
    accent === "visitor" || accent === "exhibitor" || accent === "organizer"
      ? "ring-2 ring-[#004A96] shadow-lg shadow-[#004A96]/12"
      : ""

  const ctaClass =
    accent === "visitor" || accent === "exhibitor" || accent === "organizer"
      ? "bg-[#004A96] hover:bg-[#003d7a]"
      : ""

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm",
        plan.popular && borderPopular,
      )}
    >
      {plan.popular ? (
        <div
          className={cn(
            "absolute right-3 top-3",
            (accent === "visitor" || accent === "exhibitor" || accent === "organizer") && "text-[#004A96]",
          )}
        >
          <Badge className="border-0 bg-amber-100 text-amber-900 hover:bg-amber-100">Most popular</Badge>
        </div>
      ) : null}
      {isCurrent ? (
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="border border-emerald-200 bg-emerald-50 text-emerald-800">
            Current plan
          </Badge>
        </div>
      ) : null}

      <div className="border-b border-gray-100 px-5 pb-4 pt-12">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{plan.tagline}</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-gray-900">{plan.priceDisplay}</span>
          {plan.billingNote ? (
            <span className="text-sm font-medium text-gray-500">/ {plan.billingNote}</span>
          ) : null}
        </div>
        <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
          {plan.topStats.map((s) => (
            <li key={s} className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        {plan.groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{g.title}</p>
            <ul className="space-y-2.5">
              {g.rows.map((row) => (
                <li key={row.label} className="flex gap-2.5 text-sm">
                  <FeatureIcon state={row.state} />
                  <span className="min-w-0 flex-1 leading-snug text-gray-800">
                    {row.label}
                    {row.detail ? (
                      <span className="mt-0.5 block text-xs font-normal text-gray-500">{row.detail}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-100 px-5 py-4">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Active plan
          </Button>
        ) : (
          <Button
            type="button"
            className={cn("w-full text-white shadow-sm", ctaClass)}
            disabled={loading}
            onClick={() => onCta(plan)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Please wait…
              </>
            ) : isFreeDashboardPlan(plan) ? (
              "Switch to this plan"
            ) : (
              "Upgrade & pay"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export interface DashboardPricingPlansViewProps {
  role: DashboardPackageRole
  onPlanSelect?: (planId: string) => void
}

export function DashboardPricingPlansView({ role, onPlanSelect }: DashboardPricingPlansViewProps) {
  const { toast } = useToast()
  const plans = getDashboardPlansForRole(role)
  const accent: "visitor" | "exhibitor" | "organizer" =
    role === "VISITOR" ? "visitor" : role === "EXHIBITOR" ? "exhibitor" : "organizer"

  const [currentPlanSlug, setCurrentPlanSlug] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [actionPlanId, setActionPlanId] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<DashboardPlanDefinition | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const loadCurrentPlan = useCallback(async () => {
    try {
      const current = await fetchCurrentDashboardPlan(role)
      setCurrentPlanSlug(current.planSlug)
    } catch {
      const fallback = plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id ?? null
      setCurrentPlanSlug(fallback)
    } finally {
      setLoadingPlan(false)
    }
  }, [role, plans])

  useEffect(() => {
    void loadCurrentPlan()
  }, [loadCurrentPlan])

  const handlePlanActivated = async () => {
    await loadCurrentPlan()
    toast({
      title: "Plan updated",
      description: "Your subscription is now active on this account.",
    })
  }

  const handleCta = async (plan: DashboardPlanDefinition) => {
    onPlanSelect?.(plan.id)
    if (isSamePlan(plan, currentPlanSlug)) return

    if (isFreeDashboardPlan(plan)) {
      setActionPlanId(plan.id)
      try {
        await activateFreeDashboardPlan(role, plan.id)
        await handlePlanActivated()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Could not switch plan",
          description: error instanceof Error ? error.message : "Please try again.",
        })
      } finally {
        setActionPlanId(null)
      }
      return
    }

    setCheckoutPlan(plan)
    setPaymentOpen(true)
  }

  const resolvedCurrentSlug =
    currentPlanSlug ?? plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id

  // Only rule: the Free plan is never shown as a card. Every other plan shows —
  // whichever one matches the account's current plan is marked "Current plan"
  // (disabled); the rest behave as normal upgrade options.
  const visiblePlans = plans.filter((plan) => !isFreeDashboardPlan(plan))

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-6 w-6 shrink-0 text-amber-500" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {role === "VISITOR" ? "Visitor" : role === "EXHIBITOR" ? "Exhibitor" : "Organizer"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {dashboardPlansPageTitle(role)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              {dashboardPlansPageSubtitle(role)}
            </p>
          </div>
          {loadingPlan ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading your plan…
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              accent={accent}
              isCurrent={isSamePlan(plan, resolvedCurrentSlug)}
              loading={actionPlanId === plan.id}
              onCta={handleCta}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">
          Paid plans are processed securely via Razorpay. Subscription details appear in Admin → Subscriptions
          &amp; plans with payment reference and plan name.
        </p>
      </div>

      <PlanPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        role={role}
        plan={checkoutPlan}
        onSuccess={handlePlanActivated}
      />
    </>
  )
}