import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL;
  // On Vercel Serverless, /var/task is read-only — use writable /tmp SQLite fallback
  // unless the user upgraded DATABASE_URL to a hosted DB (e.g., Neon/Supabase/Turso).
  if (process.env.VERCEL && (!envUrl || envUrl.startsWith("file:./"))) {
    return "file:/tmp/buckshot.db";
  }
  return envUrl || "file:./dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
