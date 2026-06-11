export const ALL_CATEGORIES_LABEL = "All Categories"

export function packageTargetsAllCategories(categories: string[] | undefined): boolean {
  if (!categories?.length) return true
  return categories.some((c) => c.toLowerCase().trim() === ALL_CATEGORIES_LABEL.toLowerCase())
}

export function formatPackagePriceInr(price: number, duration?: string): string {
  const suffix = duration ? ` / ${duration}` : ""
  return `₹${price.toLocaleString("en-IN")}${suffix}`
}
