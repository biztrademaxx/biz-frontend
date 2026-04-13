import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "./prisma"

interface AuthUser {
  id: string
  email: string
  role: "SUPER_ADMIN" | "SUB_ADMIN"
  type: "SUPER_ADMIN" | "SUB_ADMIN"
}

interface AuthResult {
  isValid: boolean
  user: AuthUser | null
}

export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from NextAuth
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token || !token.email) {
      return { isValid: false, user: null }
    }

    const userEmail = token.email as string

    // Check if it's a super admin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: {
        email: userEmail,
        isActive: true,
      },
    })

    if (superAdmin) {
      return {
        isValid: true,
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: "SUPER_ADMIN",
          type: "SUPER_ADMIN",
        },
      }
    }

    // Check if it's a sub admin
    const subAdmin = await prisma.subAdmin.findUnique({
      where: {
        email: userEmail,
        isActive: true,
      },
      include: { createdBy: true },
    })

    if (subAdmin) {
      return {
        isValid: true,
        user: {
          id: subAdmin.id,
          email: subAdmin.email,
          role: "SUB_ADMIN",
          type: "SUB_ADMIN",
        },
      }
    }

    return { isValid: false, user: null }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return { isValid: false, user: null }
  }
}