import { cn } from "@/lib/utils"

/** Reference palette: purple → blue-violet (glass dashboard). */
export const exGradientFrom = "#8E54E9"
export const exGradientTo = "#4776E6"

/** Glass panel for primary cards. */
export const exGlassCard =
  "rounded-2xl border border-white/70 bg-white/55 shadow-[0_4px_24px_rgba(142,84,233,0.1)] backdrop-blur-md"

/** Stronger glass: larger radius, softer frosted panel. */
export const exGlassCardPremium =
  "rounded-[1.75rem] border border-white/65 bg-white/40 shadow-[0_8px_40px_rgba(142,84,233,0.12)] backdrop-blur-xl"

/** Nested “sub-card” inside a premium glass panel. */
export const exGlassNested =
  "rounded-2xl border border-white/55 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md"

/** CTA: purple → blue-violet (sidebar promo, featured actions). */
export const exCtaGradient =
  "bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-white shadow-[0_8px_24px_rgba(142,84,233,0.35)] hover:opacity-[0.96] hover:shadow-lg"

/** Absolute layer: soft violet / pink blobs (place inside `relative` wrapper). */
export const exCompanyGlowLayer =
  "pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_85%_55%_at_0%_-10%,rgba(142,84,233,0.22),transparent_55%),radial-gradient(ellipse_75%_50%_at_100%_110%,rgba(236,72,153,0.16),transparent_52%)]"

/** Lighter inset panels, list rows, dialogs. */
export const exGlassInset =
  "rounded-xl border border-white/60 bg-white/45 shadow-sm backdrop-blur-sm"

export const exPageTitle = "text-2xl font-bold tracking-tight text-slate-800 md:text-3xl"
export const exPageSubtitle = "text-slate-600"

export const exBtnPrimary = "bg-[#4776E6] text-white hover:bg-[#3556b8]"
export const exBtnDestructive = "text-white hover:opacity-95"
export const exDestructiveBg = "#8E54E9"

export const exLink = "font-medium text-[#4776E6] hover:underline"

/** Shadcn Input / Textarea — use with cn(exInput, className). */
export const exInput =
  "border-white/60 bg-white/50 backdrop-blur-sm focus-visible:ring-[#8E54E9]/25"

/** TabsList root — pass as className on TabsList */
export const exTabsList = "border border-white/50 bg-white/40 p-1 backdrop-blur-sm"

/** Active tab trigger */
export const exTabsTriggerActive =
  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8E54E9] data-[state=active]:to-[#4776E6] data-[state=active]:text-white data-[state=active]:shadow-sm"

export function exCardTitle(className?: string) {
  return cn("text-slate-800", className)
}

/** Badge variant helpers */
export const exBadgeBlue = "border-[#4776E6]/25 bg-[#4776E6]/10 text-[#3556b8]"
export const exBadgeRed = "border-[#8E54E9]/25 bg-[#8E54E9]/10 text-[#7c3aed]"
