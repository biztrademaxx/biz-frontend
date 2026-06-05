export type MessageSurface = "default" | "exhibitor" | "visitor" | "venue"

export function getMessageTheme(surface: MessageSurface) {
  switch (surface) {
    case "exhibitor":
      return {
        shell: "border-white/60 bg-white/50 shadow-[0_8px_40px_rgba(142,84,233,0.12)] backdrop-blur-xl",
        sidebar: "border-white/50 bg-white/40",
        panel: "border-white/50 bg-white/35 backdrop-blur-sm",
        chatBg: "bg-[linear-gradient(180deg,rgba(142,84,233,0.04)_0%,rgba(255,255,255,0.2)_48%)]",
        accentText: "text-[#5b21b6]",
        accentIcon: "bg-gradient-to-br from-[#8E54E9] to-[#4776E6] text-white shadow-md shadow-violet-500/25",
        activeConv: "bg-[#8E54E9]/12 ring-1 ring-[#8E54E9]/25",
        activeBorder: "border-[#8E54E9]",
        sentBubble: "bg-gradient-to-br from-[#8E54E9] to-[#4776E6] text-white shadow-md shadow-violet-500/20",
        receivedBubble: "bg-white/80 text-slate-800 ring-1 ring-white/80 shadow-sm backdrop-blur-sm",
        unreadBadge: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6]",
        btnPrimary: "bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-white hover:opacity-95 shadow-md shadow-violet-500/25",
        composer: "border-white/60 bg-white/50 backdrop-blur-sm",
        emptyBg: "bg-white/25",
        hoverRow: "hover:bg-white/45",
      }
    case "visitor":
    case "venue":
      return {
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
      }
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
      return surface === "visitor" || surface === "venue"
        ? `${base} bg-blue-100 text-blue-800`
        : `${base} bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200`
    case "speaker":
      return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200`
    case "exhibitor":
      return `${base} bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200`
    case "venue_manager":
      return `${base} bg-orange-100 text-orange-800`
    case "admin":
      return `${base} bg-red-100 text-red-800`
    default:
      return `${base} bg-muted text-muted-foreground`
  }
}
