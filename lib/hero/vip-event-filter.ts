/** True when API row marks the event as VIP. */
export function isVipEventRecord(event: Record<string, unknown>): boolean {
  return event.isVIP === true || event.is_vip === true || event.vip === true
}

export function filterVipEventRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.filter(isVipEventRecord)
}
