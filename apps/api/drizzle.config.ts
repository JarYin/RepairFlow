import { defineConfig } from 'drizzle-kit';

// `||`, not `??`: the line in .env.example leaves the variable empty. The fallback
// is the Postgres from compose.yaml, so a missing secret can never reach Neon.
const url =
  process.env.MIGRATION_DATABASE_URL ||
  'postgres://postgres@127.0.0.1:5432/repairflow';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
});
