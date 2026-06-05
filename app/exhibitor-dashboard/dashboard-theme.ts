import { cn } from "@/lib/utils"

/** Exhibitor dashboard — aligned with visitor / organizer blue palette. */
export const EX_PRIMARY = "#004A96"
export const EX_PRIMARY_HOVER = "#003d7a"

export const exPageBg = "bg-[#f8fafc]"
export const exSidebarSurface = "border-r border-slate-200 bg-white"
export const exCardShell = "rounded-2xl border border-slate-100 bg-white shadow-sm"
export const exPrimaryBtn = "bg-[#004A96] text-white shadow-sm hover:bg-[#003d7a]"
export const exNavActive =
  "rounded-lg bg-[#004A96] pl-2.5 font-medium text-white shadow-sm [&_svg]:text-white"
export const exNavInactive =
  "rounded-lg pl-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#004A96] [&_svg]:text-slate-500"
export const exNavGroupLabel =
  "px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
export const exUpgradeCard =
  "rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4"
export const exAccentText = "text-[#004A96]"
export const exAccentMuted = "text-[#004A96]/80"

/** Backward-compatible aliases used across exhibitor sections. */
export const exGradientFrom = EX_PRIMARY
export const exGradientTo = EX_PRIMARY_HOVER
export const exGlassCard = exCardShell
export const exGlassCardPremium = exCardShell
export const exGlassNested = "rounded-2xl border border-slate-100 bg-slate-50"
export const exGlassInset = "rounded-xl border border-slate-100 bg-slate-50"
export const exCtaGradient = exPrimaryBtn
export const exCompanyGlowLayer = "pointer-events-none absolute inset-0 -z-10"
export const exPageTitle = "text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
export const exPageSubtitle = "text-slate-600"
export const exBtnPrimary = exPrimaryBtn
export const exBtnDestructive = "text-white hover:opacity-95"
export const exDestructiveBg = EX_PRIMARY
export const exLink = "font-medium text-[#004A96] hover:underline"
export const exInput = "border-slate-200 bg-white focus-visible:ring-[#004A96]/25"
export const exTabsList = "border border-slate-200 bg-slate-50 p-1"
export const exTabsTriggerActive =
  "data-[state=active]:bg-[#004A96] data-[state=active]:text-white data-[state=active]:shadow-sm"
export const exBadgeBlue = "border-[#004A96]/25 bg-blue-50 text-[#004A96]"
export const exBadgeRed = "border-red-200 bg-red-50 text-red-700"

export function exCardTitle(className?: string) {
  return cn("text-slate-900", className)
}
