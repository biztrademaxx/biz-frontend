"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { CreditCard, ExternalLink, Loader2, LockKeyhole } from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"
import type { SubscriptionPlanPrice } from "@/hooks/use-dashboard-plan-prices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`
const MAX_PRICE_INR = 10_000_000

function PlanPriceEditor({ plan, onSaved }: {
  plan: SubscriptionPlanPrice
  onSaved: (plan: SubscriptionPlanPrice) => void
}) {
  const { toast } = useToast()
  const [amount, setAmount] = useState(String(plan.amountInr))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFree = plan.billingKind === "FREE"
  const changed = amount.trim() !== "" && Number(amount) !== plan.amountInr

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value < 1 || value > MAX_PRICE_INR ||
      Math.abs(value * 100 - Math.round(value * 100)) >= 0.000001) {
      setError("Enter an amount from ₹1 to ₹1,00,00,000 with up to two decimal places.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const result = await adminApi<{ success: boolean; data: SubscriptionPlanPrice }>(
        `/subscription-plans/${plan.slug}`,
        { method: "PATCH", body: { amountInr: value } },
      )
      onSaved(result.data)
      setAmount(String(result.data.amountInr))
      toast({ title: "Plan price saved", description: `${plan.name} is now ${formatInr(result.data.amountInr)}.` })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the plan price.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          {isFree ? <LockKeyhole className="h-4 w-4 text-muted-foreground" aria-label="Free plan price is fixed" /> :
            <CreditCard className="h-5 w-5 text-[#004A96]" aria-hidden />}
        </div>
        <p className="text-sm text-muted-foreground">{plan.billingKind === "YEARLY" ? "Yearly" :
          plan.billingKind === "MONTHLY" ? "Monthly" : plan.billingNote}</p>
        <p className="pt-2 text-2xl font-bold">{formatInr(plan.amountInr)}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <form onSubmit={save} className="flex flex-1 flex-col gap-3">
          <Label htmlFor={`price-${plan.slug}`}>Amount (INR)</Label>
          <Input id={`price-${plan.slug}`} type="number" min={isFree ? 0 : 1} max={MAX_PRICE_INR}
            step="0.01" required value={amount} disabled={isFree || saving}
            aria-describedby={error ? `error-${plan.slug}` : undefined}
            aria-invalid={Boolean(error)}
            onChange={(event) => { setAmount(event.target.value); setError(null) }} />
          <p className="text-xs text-muted-foreground">
            {isFree ? "The Free plan always remains ₹0." : "Enter the price in rupees, with up to two decimal places."}
          </p>
          {error && <p id={`error-${plan.slug}`} role="alert" className="text-sm text-destructive">{error}</p>}
          {!isFree && <div className="mt-auto flex gap-2 pt-4">
            <Button type="submit" disabled={!changed || saving} className="flex-1 bg-[#004A96] text-white hover:bg-[#003d7a]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" disabled={saving || (amount === String(plan.amountInr) && !error)}
              onClick={() => { setAmount(String(plan.amountInr)); setError(null) }}>Cancel</Button>
          </div>}
        </form>
      </CardContent>
    </Card>
  )
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlanPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminApi<{ success: boolean; data: SubscriptionPlanPrice[] }>("/subscription-plans")
      setPlans(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load subscription plans.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Subscription Plan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage organizer plan prices shown on the packages page.</p>
        </div>
        <Button asChild variant="outline"><Link href="/packages" target="_blank" rel="noopener noreferrer">
          View packages <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
        </Link></Button>
      </div>
      <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Saved prices apply to new purchases. Existing subscriptions and orders keep their original amounts.
      </p>
      {loading ? (
        <div role="status" className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />Loading subscription plans…
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void load()}>Try again</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => <PlanPriceEditor key={plan.slug} plan={plan}
            onSaved={(saved) => setPlans((current) => current.map((item) => item.slug === saved.slug ? saved : item))} />)}
        </div>
      )}
    </div>
  )
}
