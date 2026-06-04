export type SubAdminActivityCounts = {
  events: number
  organizers: number
  exhibitors: number
  speakers: number
  bulkImports: number
  total: number
}

export type SubAdminActivityUpdatedCounts = {
  eventsUpdated: number
  organizersUpdated: number
  exhibitorsUpdated: number
  speakersUpdated: number
  bulkImportsUpdated: number
  totalUpdated: number
}

export type SubAdminActivityPoint = SubAdminActivityCounts &
  SubAdminActivityUpdatedCounts & {
    period: string
  }

export type SubAdminActivityData = {
  generatedAt: string
  totals: SubAdminActivityCounts
  totalsUpdated: SubAdminActivityUpdatedCounts
  bySubAdmin: Array<
    {
      adminId: string
      name: string
      email: string
      onlineStatus: "ONLINE" | "OFFLINE"
      lastLogin: string | null
      lastActivityAt: string | null
    } & SubAdminActivityCounts &
      SubAdminActivityUpdatedCounts
  >
  daily?: SubAdminActivityPoint[]
  weekly?: SubAdminActivityPoint[]
  monthly?: SubAdminActivityPoint[]
}

export function formatCreatedUpdated(created: number, updated: number): string {
  if (updated > 0) return `${created} / ${updated}`
  return String(created)
}
