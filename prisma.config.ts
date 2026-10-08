// Prisma CLI (migrate/status/seed) must use a DIRECT non-pooled connection.
// The pooled Neon URL (DATABASE_URL, -pooler host, PgBouncer transaction mode)
// cannot hold the session-scoped advisory lock (SELECT pg_advisory_lock(72707369))
// and fails with P1002. Runtime keeps using DATABASE_URL via lib/prisma.ts.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const directUrl = process.env["DIRECT_URL"];
if (!directUrl) {
  throw new Error(
    'DIRECT_URL is not set. Set it to the Neon direct (non-pooled, without "-pooler") connection string in .env (local) and Vercel Production + Preview env. DATABASE_URL (pooled) is for runtime only and must not be used for `prisma migrate deploy`.',
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
