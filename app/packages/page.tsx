'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getDashboardPlansForRole,
  isFreeDashboardPlan,
  type DashboardPlanDefinition,
  type PlanFeatureState,
} from '@/lib/dashboard-packages'
import {
  activateFreeDashboardPlan,
  fetchCurrentDashboardPlan,
} from '@/lib/subscription-checkout'
import { PlanPaymentDialog } from '@/components/dashboard-packages/plan-payment-dialog'
import { getAccessToken } from '@/lib/api'
import './packages.css'

function planShortName(plan: DashboardPlanDefinition): string {
  return plan.name.replace(/\s*Plan\s*$/i, '').trim() || plan.name
}

function normalizePlanKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isSamePlan(plan: DashboardPlanDefinition, slugOrName: string | null | undefined): boolean {
  if (!slugOrName) return false
  const target = normalizePlanKey(slugOrName)
  if (!target) return false
  const idKey = normalizePlanKey(plan.id)
  const nameKey = normalizePlanKey(plan.name)
  return (
    idKey === target ||
    nameKey === target ||
    idKey.includes(target) ||
    target.includes(idKey) ||
    nameKey.includes(target) ||
    target.includes(nameKey)
  )
}

function featureCellValue(state: PlanFeatureState, detail?: string): string | boolean {
  if (state === true) return true
  if (state === false) return false
  return detail?.trim() || 'Partial'
}

function pricingLabel(plan: DashboardPlanDefinition): string {
  if (isFreeDashboardPlan(plan)) return 'Free'
  const note = plan.billingNote?.trim()
  if (!note) return plan.priceDisplay
  return `${plan.priceDisplay} / ${note}`
}

export default function PackagesPage() {
  const { toast } = useToast()
  const plans = useMemo(() => getDashboardPlansForRole('ORGANIZER'), [])

  const [currentPlanSlug, setCurrentPlanSlug] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [actionPlanId, setActionPlanId] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<DashboardPlanDefinition | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const featureRows = useMemo(() => {
    const labels: string[] = []
    const seen = new Set<string>()
    for (const plan of plans) {
      for (const group of plan.groups) {
        for (const row of group.rows) {
          if (seen.has(row.label)) continue
          seen.add(row.label)
          labels.push(row.label)
        }
      }
    }
    return labels
  }, [plans])

  const HIGHLIGHTED = new Set([
    'Type of Listing',
    'Event Visibility Boost',
    'Credit per Month',
  ])

  const loadCurrentPlan = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        setIsAuthenticated(false)
        setLoadingPlan(false)
        const fallback = plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id ?? null
        setCurrentPlanSlug(fallback)
        return
      }

      const current = await fetchCurrentDashboardPlan('ORGANIZER')
      setIsAuthenticated(true)
      setCurrentPlanSlug(current.planSlug)
    } catch (error) {
      console.error('Failed to load current plan:', error)

      if (
        error instanceof Error &&
        (error.message.includes('401') ||
          error.message.includes('unauthorized') ||
          error.message.includes('token'))
      ) {
        setIsAuthenticated(false)
        localStorage.removeItem('accessToken')
      } else {
        setIsAuthenticated(true)
      }

      const fallback = plans.find((p) => p.defaultCurrent)?.id ?? plans[0]?.id ?? null
      setCurrentPlanSlug(fallback)
    } finally {
      setLoadingPlan(false)
    }
  }

  useEffect(() => {
    void loadCurrentPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only current plan load
  }, [])

  const handlePlanActivated = async () => {
    await loadCurrentPlan()
    toast({
      title: 'Plan updated',
      description: 'Your subscription is now active on this account.',
    })
  }

  const handleCta = async (plan: DashboardPlanDefinition) => {
    if (isAuthenticated !== true) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to subscribe to a plan.',
      })
      window.location.href = '/login?redirect=/packages'
      return
    }

    if (isSamePlan(plan, currentPlanSlug)) {
      toast({
        title: 'Already active',
        description: `You are already on the ${plan.name} plan.`,
      })
      return
    }

    if (isFreeDashboardPlan(plan)) {
      setActionPlanId(plan.id)
      try {
        await activateFreeDashboardPlan('ORGANIZER', plan.id)
        await handlePlanActivated()
        toast({
          title: 'Plan activated',
          description: `You are now on the ${plan.name} plan.`,
        })
      } catch (error) {
        console.error('Failed to activate free plan:', error)
        toast({
          variant: 'destructive',
          title: 'Could not switch plan',
          description: error instanceof Error ? error.message : 'Please try again.',
        })
      } finally {
        setActionPlanId(null)
      }
      return
    }

    setCheckoutPlan(plan)
    setPaymentOpen(true)
  }

  const isPlanActive = (plan: DashboardPlanDefinition) => {
    return isAuthenticated === true && isSamePlan(plan, currentPlanSlug)
  }

  const currentPlanLabel = useMemo(() => {
    const match = plans.find((p) => isSamePlan(p, currentPlanSlug))
    return match ? planShortName(match) : null
  }, [plans, currentPlanSlug])

  const renderFeatureValue = (value: string | boolean) => {
    if (value === true) {
      return <span className="check" />
    }
    if (value === false) {
      return <span />
    }
    return <span className="text-gray-700">{value}</span>
  }

  const findFeature = (plan: DashboardPlanDefinition, label: string) => {
    for (const group of plan.groups) {
      const row = group.rows.find((r) => r.label === label)
      if (row) return row
    }
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">From Invisible to Unmissable</h1>
            <p className="mt-2 text-xl text-gray-600">Choose the plan that fits your event goals</p>
            {!loadingPlan && isAuthenticated === true && currentPlanLabel && (
              <p className="mt-2 text-sm text-gray-500">
                Current plan:{' '}
                <span className="font-semibold text-[#004A96]">{currentPlanLabel}</span>
              </p>
            )}
            {!loadingPlan && isAuthenticated === false && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-amber-800">
                  <span className="font-semibold">Please log in</span> to see your current plan and
                  subscribe.
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/login?redirect=/packages'
                    }}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Log in now
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
            {plans.map((plan) => (
              <span
                key={plan.id}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 shadow-sm"
              >
                <span className="font-semibold text-gray-900">{planShortName(plan)}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span>{pricingLabel(plan)}</span>
              </span>
            ))}
          </div>

          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]" id="compare-plan">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 w-[28%]">
                        Feature
                      </th>
                      {plans.map((plan) => {
                        const isPopular = Boolean(plan.popular)
                        const isActive = isPlanActive(plan)
                        return (
                          <th
                            key={plan.id}
                            className={`text-center py-4 px-4 ${isPopular ? 'bg-blue-50' : ''}`}
                          >
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {planShortName(plan)}
                              </div>
                              <div className="text-sm text-gray-500">{plan.tagline}</div>
                              <div className="mt-1 text-sm font-semibold text-[#004A96]">
                                {pricingLabel(plan)}
                              </div>
                              {isPopular && (
                                <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                                  Most Popular
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-block mt-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-gray-50 border-t-2 border-t-gray-300">
                      <td className="py-3 px-6 text-sm font-semibold text-gray-800">
                        Pricing starts from
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={`${plan.id}-price`}
                          className={`text-center py-3 px-4 font-bold ${
                            plan.popular ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          {pricingLabel(plan)}
                        </td>
                      ))}
                    </tr>
                    {featureRows.map((label) => {
                      const isHighlighted = HIGHLIGHTED.has(label)
                      return (
                        <tr
                          key={label}
                          className={`border-b border-gray-100 ${
                            isHighlighted ? 'bg-gray-50' : ''
                          }`}
                        >
                          <td
                            className={`py-3 px-6 text-sm ${
                              isHighlighted
                                ? 'font-semibold text-gray-800'
                                : 'text-gray-600'
                            }`}
                          >
                            {label}
                          </td>
                          {plans.map((plan) => {
                            const row = findFeature(plan, label)
                            const value = row
                              ? featureCellValue(row.state, row.detail)
                              : false
                            return (
                              <td
                                key={`${plan.id}-${label}`}
                                className={`text-center py-3 px-4 ${
                                  plan.popular ? 'bg-blue-50/50' : ''
                                }`}
                              >
                                {renderFeatureValue(value)}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td className="py-6 px-6" />
                      {plans.map((plan) => {
                        const isPopular = Boolean(plan.popular)
                        const isActive = isPlanActive(plan)
                        const isProcessing = actionPlanId === plan.id
                        const isFree = isFreeDashboardPlan(plan)

                        return (
                          <td key={plan.id} className="text-center py-6 px-4">
                            {loadingPlan ? (
                              <button
                                type="button"
                                className="w-full py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-wait"
                                disabled
                              >
                                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                                Loading...
                              </button>
                            ) : isAuthenticated === false ? (
                              <button
                                type="button"
                                onClick={() => {
                                  window.location.href = '/login?redirect=/packages'
                                }}
                                className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              >
                                Login to Subscribe
                              </button>
                            ) : isActive ? (
                              <button
                                type="button"
                                className="w-full py-3 px-4 rounded-lg font-medium bg-emerald-100 text-emerald-700 cursor-default"
                                disabled
                              >
                                Active
                              </button>
                            ) : isProcessing ? (
                              <button
                                type="button"
                                className="w-full py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-wait"
                                disabled
                              >
                                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleCta(plan)}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                  isPopular
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                }`}
                              >
                                {isFree ? 'Switch to Free' : 'BUY NOW'}
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Paid plans are processed securely via Razorpay. Subscription details appear in Admin →
            Subscriptions &amp; plans with payment reference and plan name.
          </p>
        </div>
      </div>

      <PlanPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        role="ORGANIZER"
        plan={checkoutPlan}
        onSuccess={handlePlanActivated}
      />
    </>
  )
}
