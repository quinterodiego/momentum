import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Conexión directa (no el transaction pooler): drizzle-kit necesita
    // hacer operaciones de DDL/introspección que el pooler no soporta bien.
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
  },
} satisfies Config;
