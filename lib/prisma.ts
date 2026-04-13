import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
};

/**
 * Legacy optional Prisma client for older Next.js `app/api/*` routes.
 *
 * **Preferred:** do **not** set `DATABASE_URL` in this app. All real data should come from
 * the Express API (`NEXT_PUBLIC_API_URL`, PostgreSQL on the backend). When `DATABASE_URL`
 * is unset, `prisma` is `null` — routes must proxy to the backend or use mocks.
 *
 * Do not point this at MongoDB for production; the active schema lives on the backend.
 */
let prismaInstance: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
