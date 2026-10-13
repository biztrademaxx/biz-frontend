export type MessageSurface = "default" | "exhibitor" | "visitor" | "venue" | "organizer"

const blueMessageTheme = {
  shell: "border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(0,74,150,0.08)]",
  sidebar: "border-slate-100 bg-slate-50/80",
  panel: "border-slate-100 bg-white",
  chatBg: "bg-[linear-gradient(180deg,rgba(0,74,150,0.03)_0%,#f8fafc_40%)]",
  accentText: "text-[#004A96]",
  accentIcon: "bg-gradient-to-br from-[#004A96] to-[#0066cc] text-white shadow-md shadow-blue-900/20",
  activeConv: "bg-blue-50 ring-1 ring-blue-200/80",
  activeBorder: "border-[#004A96]",
  sentBubble: "bg-gradient-to-br from-[#004A96] to-[#0066cc] text-white shadow-md shadow-blue-900/15",
  receivedBubble: "bg-white text-slate-800 ring-1 ring-slate-200/90 shadow-sm",
  unreadBadge: "bg-[#FF131C]",
  btnPrimary: "bg-[#004A96] text-white hover:bg-[#003d7a] shadow-md shadow-blue-900/15",
  composer: "border-slate-100 bg-white",
  emptyBg: "bg-slate-50/60",
  hoverRow: "hover:bg-slate-100/90",
} as const

export function getMessageTheme(surface: MessageSurface) {
  switch (surface) {
    case "exhibitor":
    case "visitor":
    case "venue":
    case "organizer":
      return blueMessageTheme
    default:
      return {
        shell: "border-border bg-card shadow-lg shadow-slate-200/50 dark:shadow-none",
        sidebar: "border-border bg-muted/30",
        panel: "border-border bg-muted/40",
        chatBg: "bg-muted/20 dark:bg-muted/10",
        accentText: "text-violet-700 dark:text-violet-300",
        accentIcon: "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20",
        activeConv: "bg-violet-50 ring-1 ring-violet-200/80 dark:bg-violet-950/40 dark:ring-violet-800/50",
        activeBorder: "border-violet-500",
        sentBubble: "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/15",
        receivedBubble: "bg-card text-foreground ring-1 ring-border shadow-sm",
        unreadBadge: "bg-violet-600",
        btnPrimary: "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20",
        composer: "border-border bg-card",
        emptyBg: "bg-muted/30",
        hoverRow: "hover:bg-muted/60",
      }
  }
}

export function roleBadgeClass(role: string, surface: MessageSurface): string {
  const r = role.toLowerCase()
  const base = "border-0 font-medium capitalize"
  switch (r) {
    case "organizer":
      return surface === "visitor" || surface === "venue" || surface === "organizer"
        ? `${base} bg-blue-100 text-blue-800`
        : `${base} bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200`
    case "speaker":
      return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200`
    case "exhibitor":
      return surface === "exhibitor" || surface === "visitor" || surface === "venue" || surface === "organizer"
        ? `${base} bg-blue-100 text-blue-800`
        : `${base} bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200`
    case "venue_manager":
      return `${base} bg-orange-100 text-orange-800`
    case "admin":
      return `${base} bg-red-100 text-red-800`
    default:
      return `${base} bg-muted text-muted-foreground`
  }
}
