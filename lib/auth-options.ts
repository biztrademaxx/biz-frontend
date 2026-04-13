// lib/auth-options.ts — OAuth only (Google, LinkedIn). API auth uses backend JWT.
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import type { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"

// Import Prisma (legacy Mongo client; may be null if DATABASE_URL is not set)
import { prisma } from "@/lib/prisma"

const providers: NextAuthOptions["providers"] = []

// Only enable Google if env vars are present (otherwise production will 500)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Only enable LinkedIn if env vars are present
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    })
  )
}

// Safe Prisma wrapper
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
    }
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
    }
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
    }
  }
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
      if (account?.provider === "google" || account?.provider === "linkedin") {
        try {
          const existingUser = await safePrisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist → create new user in DB
          if (!existingUser) {
            await safePrisma.user.create({
              data: {
                email: user.email!,
                firstName: user.name?.split(" ")[0] || "User",
                lastName: user.name?.split(" ")[1] || "",
                avatar: user.image,
                role: "ATTENDEE",
                isVerified: true,
                emailVerified: true,
                password: await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 12),
              },
            });
          } else {
            // Update existing user
            await safePrisma.user.update({
              where: { email: user.email! },
              data: {
                avatar: user.image,
                firstName: user.name?.split(" ")[0] || existingUser.firstName,
                lastName: user.name?.split(" ")[1] || existingUser.lastName,
              },
            });
          }
        } catch (err) {
          console.error("Error saving OAuth user:", err);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // When user first signs in
      if (user) {
        token.id = user.id
        token.role = user.role

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

      // For existing sessions, refresh from database
      if (token.email) {
        // Check all user types
        const superAdmin = await safePrisma.superAdmin.findUnique({
          where: { email: token.email },
        })

        if (superAdmin) {
          token.id = superAdmin.id
          token.role = superAdmin.role
          token.adminType = "SUPER_ADMIN"
          token.permissions = superAdmin.permissions || []
          return token
        }

        const subAdmin = await safePrisma.subAdmin.findUnique({
          where: { email: token.email },
        })

        if (subAdmin) {
          token.id = subAdmin.id
          token.role = subAdmin.role
          token.adminType = "SUB_ADMIN"
          token.permissions = subAdmin.permissions || []
          return token
        }

        const regularUser = await safePrisma.user.findUnique({
          where: { email: token.email },
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
      }
      return session
    },
  },
}