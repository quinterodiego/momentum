/**
 * Cliente de conexión a Postgres (Supabase). Instanciado a nivel de módulo
 * para reutilizarse entre invocaciones warm de la misma función serverless.
 *
 * Usa el connection string del transaction pooler (puerto 6543): abre
 * conexiones cortas por query, apto para funciones serverless. Ese pooler
 * no soporta prepared statements, por eso `prepare: false`.
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado. Agregalo a .env.local.');
}

const client = postgres(DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
