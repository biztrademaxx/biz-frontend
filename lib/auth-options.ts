// lib/auth-options.ts — OAuth (Google, LinkedIn) via NextAuth; portal users live on Express/PostgreSQL.
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import type { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"

const providers: NextAuthOptions["providers"] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    })
  )
}

function backendApiOrigin(): string {
  const t = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "")
  return t || "http://localhost:4000"
}

type PortalUserPayload = {
  sub: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  avatar?: string
}

/** Same-request cache: signIn runs before jwt; avoids duplicate POST /oauth-sync on cold login. */
const oauthPortalUserByEmail = new Map<string, PortalUserPayload>()

function resolveOAuthEmail(params: {
  provider?: string
  userEmail?: string | null
  profileEmail?: string | null
  providerAccountId?: string
}): string | null {
  const direct = params.userEmail?.trim() || params.profileEmail?.trim()
  if (direct) return direct.toLowerCase()

  // LinkedIn apps can be configured without email permission.
  // Use a deterministic synthetic address so account creation/login still works.
  if (params.provider === "linkedin" && params.providerAccountId) {
    return `${params.providerAccountId}@linkedin.oauth.local`
  }

  return null
}

async function syncOAuthToBackend(params: {
  email: string
  name?: string | null
  image?: string | null
  provider: string
}): Promise<{ ok: boolean; portalUser?: PortalUserPayload }> {
  const syncSecret = process.env.OAUTH_SYNC_SECRET
  if (!syncSecret) {
    return { ok: false }
  }

  try {
    const res = await fetch(`${backendApiOrigin()}/api/auth/oauth-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OAuth-Sync-Secret": syncSecret,
      },
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        image: params.image,
        provider: params.provider,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error("OAuth backend sync failed:", res.status, text)
      return { ok: false }
    }

    const data = (await res.json()) as { user: PortalUserPayload }
    return { ok: true, portalUser: data.user }
  } catch (err) {
    console.error("OAuth backend sync error:", err)
    return { ok: false }
  }
}

const safePrisma = {
  superAdmin: {
    findUnique: async (args: any) => {
      try {
        if (!prisma?.superAdmin) return null
        return await prisma.superAdmin.findUnique(args)
      } catch (error) {
        console.error("Error in superAdmin.findUnique:", error)
        return null
      }
    },
    update: async (args: any) => {
      try {
        if (!prisma?.superAdmin) return null
        return await prisma.superAdmin.update(args)
      } catch (error) {
        console.error("Error in superAdmin.update:", error)
        return null
      }
    },
  },
  subAdmin: {
    findUnique: async (args: any) => {
      try {
        if (!prisma?.subAdmin) return null
        return await prisma.subAdmin.findUnique(args)
      } catch (error) {
        console.error("Error in subAdmin.findUnique:", error)
        return null
      }
    },
    update: async (args: any) => {
      try {
        if (!prisma?.subAdmin) return null
        return await prisma.subAdmin.update(args)
      } catch (error) {
        console.error("Error in subAdmin.update:", error)
        return null
      }
    },
  },
  user: {
    findUnique: async (args: any) => {
      try {
        if (!prisma?.user) return null
        return await prisma.user.findUnique(args)
      } catch (error) {
        console.error("Error in user.findUnique:", error)
        return null
      }
    },
    create: async (args: any) => {
      try {
        if (!prisma?.user) return null
        return await prisma.user.create(args)
      } catch (error) {
        console.error("Error in user.create:", error)
        return null
      }
    },
    update: async (args: any) => {
      try {
        if (!prisma?.user) return null
        return await prisma.user.update(args)
      } catch (error) {
        console.error("Error in user.update:", error)
        return null
      }
    },
  },
}

export const authOptions: NextAuthOptions = {
  providers: [...providers],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" && account?.provider !== "linkedin") {
        return true
      }

      const email = resolveOAuthEmail({
        provider: account.provider,
        userEmail: user.email,
        profileEmail: (profile as { email?: string } | undefined)?.email,
        providerAccountId: account.providerAccountId,
      })
      if (!email) {
        console.error(
          "OAuth sign-in rejected: missing email and providerAccountId."
        )
        return false
      }

      const key = email.toLowerCase()
      const synced = await syncOAuthToBackend({
        email,
        name: user.name,
        image: user.image,
        provider: account.provider ?? "oauth",
      })

      if (synced.ok && synced.portalUser) {
        oauthPortalUserByEmail.set(key, synced.portalUser)
        return true
      }

      if (process.env.OAUTH_SYNC_SECRET) {
        return false
      }

      if (!prisma?.user) {
        console.error(
          "OAuth: set OAUTH_SYNC_SECRET on frontend + backend, or DATABASE_URL for legacy Mongo."
        )
        return false
      }

      try {
        const existingUser = await safePrisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          await safePrisma.user.create({
            data: {
              email,
              firstName: user.name?.split(" ")[0] || "User",
              lastName: user.name?.split(" ")[1] || "",
              avatar: user.image ?? undefined,
              role: "ATTENDEE",
              isVerified: true,
              emailVerified: true,
              password: await bcrypt.hash(
                Math.random().toString(36) + Date.now().toString(),
                12
              ),
            },
          })
        } else {
          await safePrisma.user.update({
            where: { email },
            data: {
              avatar: user.image,
              firstName: user.name?.split(" ")[0] || existingUser.firstName,
              lastName: user.name?.split(" ")[1] || existingUser.lastName,
            },
          })
        }
        return true
      } catch (err) {
        console.error("Error saving OAuth user (legacy Prisma):", err)
        return false
      }
    },

    async jwt({ token, user, account, profile }) {
      const oauthProvider =
        account?.provider === "google" || account?.provider === "linkedin"

      if (user && account && oauthProvider) {
        const email = resolveOAuthEmail({
          provider: account.provider,
          userEmail: user.email,
          profileEmail: (profile as { email?: string } | undefined)?.email,
          providerAccountId: account.providerAccountId,
        })

        if (email) {
          const key = email.toLowerCase()
          let portal = oauthPortalUserByEmail.get(key)
          if (portal) {
            oauthPortalUserByEmail.delete(key)
          } else if (process.env.OAUTH_SYNC_SECRET) {
            const again = await syncOAuthToBackend({
              email,
              name: user.name,
              image: user.image,
              provider: account.provider ?? "oauth",
            })
            if (again.ok && again.portalUser) {
              portal = again.portalUser
            }
          }

          if (portal) {
            token.id = portal.sub
            token.role = portal.role
            token.email = portal.email
            token.firstName = portal.firstName
            token.lastName = portal.lastName
            token.avatar = portal.avatar ?? undefined
          } else if (prisma?.user) {
            const row = await safePrisma.user.findUnique({
              where: { email },
            })
            if (row) {
              token.id = row.id
              token.role = row.role
              token.email = row.email ?? email
              token.firstName = row.firstName
              token.lastName = row.lastName
              token.avatar = row.avatar ?? undefined
            }
          }
        }
      } else if (user) {
        token.id = user.id
        token.role = user.role as string

        if ("adminType" in user && user.adminType) {
          token.adminType = user.adminType
          token.permissions = (user as any).permissions ?? []
        } else if (user.role === "SUPER_ADMIN" || user.role === "SUB_ADMIN") {
          token.adminType = user.role
          token.permissions = (user as any).permissions ?? []
        }

        if ("firstName" in user) {
          token.firstName = user.firstName
          token.lastName = user.lastName
        }
      }

      if (token.email) {
        const superAdmin = await safePrisma.superAdmin.findUnique({
          where: { email: token.email as string },
        })

        if (superAdmin) {
          token.id = superAdmin.id
          token.role = superAdmin.role
          token.adminType = "SUPER_ADMIN"
          token.permissions = superAdmin.permissions || []
          return token
        }

        const subAdmin = await safePrisma.subAdmin.findUnique({
          where: { email: token.email as string },
        })

        if (subAdmin) {
          token.id = subAdmin.id
          token.role = subAdmin.role
          token.adminType = "SUB_ADMIN"
          token.permissions = subAdmin.permissions || []
          return token
        }

        const regularUser = await safePrisma.user.findUnique({
          where: { email: token.email as string },
        })

        if (regularUser) {
          token.id = regularUser.id
          token.role = regularUser.role
          token.firstName = regularUser.firstName
          token.lastName = regularUser.lastName
          token.avatar = regularUser.avatar
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string

        if (token.adminType) {
          session.user.adminType = token.adminType as "SUPER_ADMIN" | "SUB_ADMIN"
          session.user.permissions = token.permissions as string[]
        }

        if (token.firstName) {
          session.user.firstName = token.firstName as string
          session.user.lastName = token.lastName as string
          session.user.avatar = token.avatar as string
        }
        if (token.email) {
          session.user.email = token.email as string
        }
      }
      return session
    },
  },
}
