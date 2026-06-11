export function visibilityMultiplier(planKey?: string): number {
  if (planKey === "professional") return 5
  if (planKey === "enterprise") return 10
  return 1
}

export function estimateReach(
  selectedCategoryIds: string[],
  categories: { id: string; userCount: number }[],
  planKey?: string,
): number {
  if (selectedCategoryIds.length === 0) return 0
  const base = selectedCategoryIds.reduce((total, categoryId) => {
    const category = categories.find((c) => c.id === categoryId)
    return total + (category?.userCount ?? 0)
  }, 0)
  return Math.round(base * visibilityMultiplier(planKey))
}

export function estimateEngagement(
  selectedCategoryIds: string[],
  categories: { id: string; avgEngagement: number }[],
): number {
  if (selectedCategoryIds.length === 0) return 0
  const total = selectedCategoryIds.reduce((sum, categoryId) => {
    const category = categories.find((c) => c.id === categoryId)
    return sum + (category?.avgEngagement ?? 0)
  }, 0)
  return Math.round(total / selectedCategoryIds.length)
}

/** Expected registrations = reach × engagement rate × conversion factor */
export function estimateRegistrations(reach: number, avgEngagementPercent: number): number {
  if (reach <= 0 || avgEngagementPercent <= 0) return 0
  return Math.max(1, Math.round(reach * (avgEngagementPercent / 100) * 0.14))
}
