/**
 * Manejo de usuarios (Postgres/Neon). Misma interfaz que la implementación
 * anterior sobre Google Sheets.
 */

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from './client';
import { users } from './schema';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(email: string, password: string): Promise<User> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const [row] = await db
    .insert(users)
    .values({ id, email, passwordHash })
    .returning();

  return toUser(row);
}

/**
 * Obtener usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email));
  return row ? toUser(row) : null;
}

/**
 * Verificar credenciales de usuario
 */
export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id));
  return row ? toUser(row) : null;
}
