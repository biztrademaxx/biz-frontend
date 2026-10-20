"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { getDashboardPlansForRole, type DashboardPackageRole } from "@/lib/dashboard-packages"

export type SubscriptionPlanPrice = {
  slug: string
  role: DashboardPackageRole
  name: string
  amountInr: number
  billingNote: string
  billingKind: "FREE" | "ONE_TIME" | "MONTHLY" | "YEARLY"
  displayOrder: number
}

async function fetchPrices(url: string): Promise<SubscriptionPlanPrice[]> {
  const response = await fetch(url, { cache: "no-store" })
  const body = await response.json()
  if (!response.ok || !Array.isArray(body.data)) {
    throw new Error(body.message || "Unable to load plan prices.")
  }
  return body.data
}

export function useDashboardPlanPrices(role: DashboardPackageRole) {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionPlanPrice[]>(
    `/api/subscriptions/plans?role=${role}`, fetchPrices,
    { revalidateOnFocus: true, revalidateOnReconnect: true, dedupingInterval: 0 },
  )
  const resolved = useMemo(() => {
    if (!data) return { plans: [], invalid: false }
    const prices = new Map(data.filter((plan) => plan.role === role).map((plan) => [plan.slug, plan]))
    const definitions = getDashboardPlansForRole(role)
    if (definitions.some((plan) => {
      const price = prices.get(plan.id)
      return !price || typeof price.amountInr !== "number" || !Number.isFinite(price.amountInr) ||
        price.amountInr < 0 || (plan.priceInr > 0 && price.amountInr < 1)
    })) return { plans: [], invalid: true }
    return {
      invalid: false,
      plans: definitions.map((plan) => {
        const price = prices.get(plan.id)!
        return {
          ...plan,
          priceInr: price.amountInr,
          priceDisplay: price.amountInr === 0 ? plan.priceDisplay : `₹${price.amountInr.toLocaleString("en-IN")}`,
          billingNote: price.billingNote,
        }
      }),
    }
  }, [role, data])
  return {
    plans: resolved.plans,
    pricingLoading: isLoading,
    pricingError: error ? "Unable to load current plan prices. Please try again." :
      resolved.invalid ? "Unable to load current plan prices. Please try again." : null,
    retryPrices: () => { void mutate() },
  }
}
