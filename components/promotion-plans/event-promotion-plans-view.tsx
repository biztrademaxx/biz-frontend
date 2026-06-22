"use client"

import { useMemo, useState } from "react"
import {
  BarChart3,
  Check,
  Crown,
  Diamond,
  Globe,
  Mail,
  Megaphone,
  Rocket,
  Share2,
  Shield,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPackagePriceInr } from "@/lib/promotion-package-constants"

export interface PromotionPlanPackage {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  userCount: number
  duration: string
  recommended?: boolean
  section?: "subscription" | "on_demand"
  ctaLabel?: string
  visibilityLabel?: string
  leadsLabel?: string
  planKey?: string
}

const ADD_ON_ITEMS = [
  { icon: Megaphone, title: "Homepage Hero Banner", subtitle: "Maximize exposure" },
  { icon: Star, title: "Industry Spotlight Campaign", subtitle: "Get industry attention" },
  { icon: Mail, title: "Newsletter Sponsorship", subtitle: "Reach targeted audience" },
  { icon: Share2, title: "Social Media Blast", subtitle: "Amplify your event" },
  { icon: Globe, title: "Country Category Sponsorship", subtitle: "Dominate regions" },
] as const

const CUSTOM_FEATURES = [
  "Homepage Banner Placements",
  "Industry Category Sponsorships",
  "Newsletter Sponsorships",
  "Social Media Promotions",
  "Featured Event Campaigns",
  "Lead Generation Programs",
  "Dedicated Marketing Support",
] as const

function PlanIcon({ planKey }: { planKey?: string }) {
  const className = "h-6 w-6"
  if (planKey === "professional") return <Diamond className={className} />
  if (planKey === "enterprise") return <Crown className={className} />
  if (planKey === "visitor_reach") return <Mail className={className} />
  if (planKey === "prospector") return <Target className={className} />
  if (planKey === "leadboost") return <Zap className={className} />
  return <Rocket className={className} />
}

function yearlyPrice(monthly: number): number {
  return Math.round(monthly * 12 * 0.8)
}

export interface EventPromotionPlansViewProps {
  packages: PromotionPlanPackage[]
  selectedPackageId: string
  onSelectPackage: (packageId: string) => void
  onContactCustom?: () => void
}

export function EventPromotionPlansView({
  packages,
  selectedPackageId,
  onSelectPackage,
  onContactCustom,
}: EventPromotionPlansViewProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  const subscriptionPlans = useMemo(() => {
    const canonical = packages.filter((p) =>
      ["starter", "professional", "enterprise"].includes(p.planKey ?? ""),
    )
    if (canonical.length > 0) {
      const order = ["starter", "professional", "enterprise"]
      return [...canonical].sort(
        (a, b) => order.indexOf(a.planKey ?? "") - order.indexOf(b.planKey ?? ""),
      )
    }
    return packages.filter((p) => p.section !== "on_demand").slice(0, 3)
  }, [packages])

  const onDemandPlans = useMemo(() => {
    const canonical = packages.filter((p) =>
      ["visitor_reach", "prospector", "leadboost"].includes(p.planKey ?? ""),
    )
    if (canonical.length > 0) return canonical
    return packages.filter((p) => p.section === "on_demand")
  }, [packages])

  const displayPrice = (pkg: PromotionPlanPackage) => {
    if (billing === "yearly" && pkg.duration === "month") {
      return formatPackagePriceInr(yearlyPrice(pkg.price), "year")
    }
    return formatPackagePriceInr(pkg.price, pkg.duration)
  }

  const planAccent = (planKey?: string, recommended?: boolean) => {
    if (recommended || planKey === "professional") {
      return {
        border: "border-[#004A96] ring-2 ring-[#004A96]/15",
        iconBg: "bg-[#004A96]",
        price: "text-[#004A96]",
        check: "text-[#004A96]",
        btn: "bg-[#004A96] hover:bg-[#003d7a] text-white",
        btnOutline: "border-[#004A96] text-[#004A96] hover:bg-[#004A96]/5",
      }
    }
    if (planKey === "enterprise") {
      return {
        border: "border-emerald-500/40",
        iconBg: "bg-emerald-600",
        price: "text-emerald-700",
        check: "text-emerald-600",
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
        btnOutline: "border-emerald-600 text-emerald-700 hover:bg-emerald-50",
      }
    }
    return {
      border: "border-slate-200",
      iconBg: "bg-emerald-600",
      price: "text-emerald-700",
      check: "text-emerald-600",
      btn: "bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50",
      btnOutline: "border-emerald-600 text-emerald-700 hover:bg-emerald-50",
    }
  }

  return (
    <div className="min-w-0 space-y-6 sm:space-y-10">
      {/* Hero */}
      <div className="min-w-0 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
          BizTradeFairs.com Pricing Plans
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Event Promotion Plans
        </h2>
        <p className="mx-auto mt-3 max-w-2xl px-1 text-sm text-slate-600 sm:text-base">
          Choose the perfect plan to grow your event visibility, attract more leads and maximize ROI.
        </p>

        <div className="mx-auto mt-5 flex w-full max-w-md flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:inline-flex sm:max-w-none sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:rounded-full sm:px-5",
              billing === "monthly" ? "bg-[#004A96] text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:rounded-full sm:px-5",
              billing === "yearly" ? "bg-[#004A96] text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
            )}
          >
            <span>Yearly</span>
            <Badge className="border-0 bg-emerald-500 text-[10px] whitespace-nowrap text-white hover:bg-emerald-500">
              Save up to 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Subscription plans */}
      {subscriptionPlans.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {subscriptionPlans.map((pkg) => {
            const accent = planAccent(pkg.planKey, pkg.recommended)
            const isSelected = selectedPackageId === pkg.id
            const isPopular = pkg.recommended || pkg.planKey === "professional"

            return (
              <div
                key={pkg.id}
                className={cn(
                  "relative flex min-w-0 flex-col rounded-2xl border-2 bg-white p-4 shadow-sm transition-all sm:p-6",
                  isPopular ? accent.border : accent.border,
                  isSelected && "shadow-lg",
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
                    <Badge className="bg-[#004A96] px-3 py-1 text-xs text-white shadow-md hover:bg-[#004A96]">
                      <Star className="mr-1 inline h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-4 flex flex-col items-center text-center">
                  <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white", accent.iconBg)}>
                    <PlanIcon planKey={pkg.planKey} />
                  </div>
                  <h3 className="text-lg font-bold tracking-wide text-slate-900">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>
                  <div className={cn("mt-4 text-3xl font-bold", accent.price)}>{displayPrice(pkg)}</div>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", accent.check)} />
                      <span className="break-words">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  className={cn(
                    "w-full font-semibold",
                    isPopular && !isSelected ? accent.btn : isSelected ? accent.btn : accent.btnOutline,
                  )}
                  variant={isPopular || isSelected ? "default" : "outline"}
                  onClick={() => onSelectPackage(pkg.id)}
                >
                  {isSelected ? "Selected" : pkg.ctaLabel || "Select Plan"}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Average results */}
      {subscriptionPlans.some((p) => p.visibilityLabel) && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BarChart3 className="h-5 w-5 text-[#004A96]" />
            Average Results
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {subscriptionPlans.map((pkg) => (
              <div key={pkg.id} className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{pkg.name}</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    pkg.planKey === "professional" ? "text-[#004A96]" : "text-emerald-700",
                  )}
                >
                  {pkg.visibilityLabel}
                  {pkg.leadsLabel ? ` | ${pkg.leadsLabel}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-on strip */}
      <div className="space-y-4">
        <h3 className="text-center text-lg font-bold text-slate-900">Need More Visibility? Add-On Promotions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ADD_ON_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex min-w-0 flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:p-4"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#004A96]/10 text-[#004A96]">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-900 break-words">{item.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* On-demand solutions */}
      {onDemandPlans.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900">On-Demand Marketing Solutions</h3>
            <p className="mt-2 text-sm text-slate-600">
              Flexible campaigns and tools — pay only for what you need.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {onDemandPlans.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id
              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "flex min-w-0 flex-col rounded-2xl border-2 bg-white p-4 shadow-sm transition-all sm:p-6",
                    isSelected ? "border-[#004A96] ring-2 ring-[#004A96]/15" : "border-slate-200",
                  )}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#004A96]/10 text-[#004A96]">
                    <PlanIcon planKey={pkg.planKey} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{pkg.name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Starting from{" "}
                    <span className="text-xl font-bold text-[#004A96]">
                      {formatPackagePriceInr(pkg.price, pkg.duration.replace(/^per /, ""))}
                    </span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#004A96]" />
                        <span className="break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    className={cn("mt-5 w-full", isSelected ? "bg-[#004A96] hover:bg-[#003d7a]" : "")}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onSelectPackage(pkg.id)}
                  >
                    {isSelected ? "Selected" : pkg.ctaLabel || "Select"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom package */}
      <div className="min-w-0 rounded-2xl border-2 border-dashed border-[#004A96]/30 bg-[#004A96]/5 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 shrink-0 text-[#004A96]" />
              <h3 className="text-lg font-bold text-slate-900 break-words sm:text-xl">Need a Custom Marketing Package?</h3>
            </div>
            <p className="mt-2 text-sm font-medium text-[#004A96]">Customized Solutions Available</p>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CUSTOM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="break-words">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            size="lg"
            className="h-auto w-full shrink-0 whitespace-normal bg-[#004A96] px-4 py-3 text-center text-sm leading-snug hover:bg-[#003d7a] sm:text-base lg:w-auto lg:max-w-xs"
            onClick={onContactCustom}
          >
            Contact Us for a Tailored Proposal
          </Button>
        </div>
      </div>

      <p className="flex flex-wrap items-center justify-center gap-2 px-1 text-center text-xs text-slate-500">
        <Shield className="h-4 w-4" />
        All plans include Verified Event Badge &amp; Analytics Dashboard
      </p>
    </div>
  )
}
