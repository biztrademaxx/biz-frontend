// /lib/auth.ts
import bcrypt from "bcryptjs"

/**
 * Hashes a plain text password before storing in the database
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

/**
 * Verifies a plain text password against a hashed one
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
