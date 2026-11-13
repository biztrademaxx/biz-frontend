export async function collectApprovalPages<T extends { id: string }>(
  fetchPage: (page: number) => Promise<{ items: T[]; totalPages?: number }>,
): Promise<T[]> {
  const items = new Map<string, T>()
  let totalPages = 1
  for (let page = 1; page <= totalPages; page += 1) {
    const result = await fetchPage(page)
    const pages = Math.max(1, result.totalPages ?? 1)
    if (!Array.isArray(result.items) || !Number.isSafeInteger(pages)) {
      throw new Error("Invalid approval list response")
    }
    totalPages = pages
    for (const item of result.items) items.set(item.id, item)
  }
  return [...items.values()]
}
