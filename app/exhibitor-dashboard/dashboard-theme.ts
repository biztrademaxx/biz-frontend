import { cn } from "@/lib/utils"

/** Glass panel for primary cards (matches visitor / exhibitor shell). */
export const exGlassCard =
  "rounded-2xl border border-white/70 bg-white/55 shadow-[0_4px_24px_rgba(0,74,150,0.08)] backdrop-blur-md"

/** Lighter inset panels, list rows, dialogs. */
export const exGlassInset =
  "rounded-xl border border-white/60 bg-white/45 shadow-sm backdrop-blur-sm"

export const exPageTitle = "text-2xl font-bold tracking-tight text-slate-800 md:text-3xl"
export const exPageSubtitle = "text-slate-600"

export const exBtnPrimary = "bg-[#004A96] text-white hover:bg-[#003d7a]"
export const exBtnDestructive = "text-white hover:opacity-95"
export const exDestructiveBg = "#FF131C"

export const exLink = "font-medium text-[#004A96] hover:underline"

/** Shadcn Input / Textarea — use with cn(exInput, className). */
export const exInput =
  "border-white/60 bg-white/50 backdrop-blur-sm focus-visible:ring-[#004A96]/25"

/** TabsList root — pass as className on TabsList */
export const exTabsList = "border border-white/50 bg-white/40 p-1 backdrop-blur-sm"

/** Active tab trigger */
export const exTabsTriggerActive =
  "data-[state=active]:bg-[#004A96] data-[state=active]:text-white data-[state=active]:shadow-sm"

export function exCardTitle(className?: string) {
  return cn("text-slate-800", className)
}

/** Badge variant helpers */
export const exBadgeBlue = "border-[#004A96]/25 bg-[#004A96]/10 text-[#004A96]"
export const exBadgeRed = "border-[#FF131C]/25 bg-[#FF131C]/10 text-[#FF131C]"
