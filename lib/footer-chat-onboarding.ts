/** Normalize JWT / UI role strings for comparisons. */
function normalizeRole(role: string | null | undefined): string {
  return (role ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
}

/** Admin-like roles: use plain text welcome in footer chat (no signup guide). */
export function isFooterChatAdminRole(role: string | null): boolean {
  const r = normalizeRole(role)
  return (
    r === "ADMIN" ||
    r === "SUPER_ADMIN" ||
    r === "SUPERADMIN" ||
    r === "SUB_ADMIN"
  )
}
