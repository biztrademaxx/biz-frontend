/** Strip to digits only for checks (E.164-ish length). */
export function phoneDigitsOnly(raw: string): string {
  return raw.replace(/\D/g, "")
}

/**
 * Rejects empty, too short/long, all-same-digit, and common test / autofill sequences.
 * Use on signup so we never persist browser "default" junk numbers.
 */
export function isPlaceholderOrInvalidPhone(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return true
  const digits = phoneDigitsOnly(trimmed)
  if (digits.length < 8 || digits.length > 15) return true
  if (/^(\d)\1+$/.test(digits)) return true
  const duds = new Set([
    "1234567890",
    "0123456789",
    "0987654321",
    "9876543210",
    "1111111111",
    "0000000000",
    "123456789",
    "12345678",
  ])
  if (duds.has(digits)) return true
  return false
}
