/**
 * Acceso a datos de rutinas, logs diarios y estadísticas (Postgres/Neon).
 * Mismas firmas y formas de retorno que la implementación anterior sobre
 * Google Sheets, para que ningún consumidor (server actions, API routes,
 * páginas) necesite cambiar.
 */

import { and, desc, eq } from 'drizzle-orm';
import { db } from './client';
import { routines as routinesTable, dailyLogs, stats } from './schema';
import type { Routine, DailyLog, Stats } from '../types';

function toRoutine(row: typeof routinesTable.$inferSelect): Routine {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    type: row.type as 'time' | 'quantity',
    minValue: Number(row.minValue),
    unit: row.unit,
    active: row.active,
    scheduledDays: row.scheduledDays,
  };
}

function toDailyLog(row: typeof dailyLogs.$inferSelect): DailyLog {
  return {
    id: row.id,
    routineId: row.routineId,
    userId: row.userId,
    date: row.date,
    completed: row.completed,
    value: Number(row.value),
  };
}

/**
 * Obtener todas las rutinas activas de un usuario
 */
export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const rows = await db
    .select()
    .from(routinesTable)
    .where(and(eq(routinesTable.userId, userId), eq(routinesTable.active, true)));

  return rows.map(toRoutine);
}

/**
 * Crear una nueva rutina
 */
export async function createRoutine(
  userId: string,
  title: string,
  type: 'time' | 'quantity',
  minValue: number,
  unit: string,
  scheduledDays: number[] = []
): Promise<Routine> {
  const routineId = `routine_${Date.now()}`;

  const [row] = await db
    .insert(routinesTable)
    .values({
      id: routineId,
      userId,
      title,
      type,
      minValue: String(minValue),
      unit,
      active: true,
      scheduledDays,
    })
    .returning();

  return toRoutine(row);
}

/**
 * Obtener todos los logs completados de un usuario (historial completo),
 * ordenados por fecha descendente (más reciente primero)
 */
export async function getAllLogs(userId: string): Promise<DailyLog[]> {
  const rows = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.completed, true)))
    .orderBy(desc(dailyLogs.date));

  return rows.map(toDailyLog);
}

/**
 * Crear o actualizar (upsert) el log diario de una rutina+fecha.
 * La constraint UNIQUE(routine_id, date) hace que esto sea atómico:
 * ya no hace falta leer primero para ver si existe (eliminaba la
 * condición de carrera que podía duplicar logs).
 */
export async function createDailyLog(
  routineId: string,
  userId: string,
  date: string,
  completed: boolean,
  value: number
): Promise<DailyLog> {
  const logId = `log_${Date.now()}`;

  const [row] = await db
    .insert(dailyLogs)
    .values({
      id: logId,
      routineId,
      userId,
      date,
      completed,
      value: String(value),
    })
    .onConflictDoUpdate({
      target: [dailyLogs.routineId, dailyLogs.date],
      set: { completed, value: String(value) },
    })
    .returning();

  return toDailyLog(row);
}

export type MoveDailyLogResult =
  | { ok: true; log: DailyLog }
  | { ok: false; reason: 'not_found' | 'conflict' };

/**
 * Cambiar la fecha de un log ya cargado (ej. se marcó un día equivocado).
 * Exige que el log sea del usuario dado. Como daily_logs tiene constraint
 * UNIQUE(routine_id, date), si la rutina ya tenía un log en la fecha
 * destino, el UPDATE falla con conflicto (23505) en vez de pisarlo.
 */
export async function moveDailyLog(
  logId: string,
  userId: string,
  newDate: string
): Promise<MoveDailyLogResult> {
  try {
    const [row] = await db
      .update(dailyLogs)
      .set({ date: newDate })
      .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.userId, userId)))
      .returning();

    if (!row) {
      return { ok: false, reason: 'not_found' };
    }

    return { ok: true, log: toDailyLog(row) };
  } catch (error: any) {
    // Drizzle envuelve el error de postgres-js en un DrizzleQueryError; el
    // código de Postgres (23505 = unique_violation) queda en error.cause.
    if (error?.code === '23505' || error?.cause?.code === '23505') {
      return { ok: false, reason: 'conflict' };
    }
    throw error;
  }
}

/**
 * Obtener estadísticas del usuario
 */
export async function getStats(userId: string): Promise<Stats> {
  const [row] = await db.select().from(stats).where(eq(stats.userId, userId));

  if (row) {
    return {
      userId: row.userId,
      streak: row.streak,
      lastCompletedDate: row.lastCompletedDate,
    };
  }

  return {
    userId,
    streak: 0,
    lastCompletedDate: null,
  };
}

/**
 * Eliminar un log diario (usado para desmarcar una rutina cumplida).
 * Exige que el log sea del usuario dado; devuelve false si no existía o
 * era de otro usuario (evita que un usuario borre logs ajenos).
 */
export async function deleteDailyLog(logId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(dailyLogs)
    .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.userId, userId)))
    .returning({ id: dailyLogs.id });

  return result.length > 0;
}

/**
 * Actualizar una rutina existente
 */
export async function updateRoutine(
  routineId: string,
  updates: { title?: string; type?: 'time' | 'quantity'; minValue?: number; unit?: string; scheduledDays?: number[] }
): Promise<Routine> {
  const [existing] = await db.select().from(routinesTable).where(eq(routinesTable.id, routineId));

  if (!existing) {
    throw new Error('Rutina no encontrada');
  }

  const [row] = await db
    .update(routinesTable)
    .set({
      title: updates.title ?? existing.title,
      type: updates.type ?? (existing.type as 'time' | 'quantity'),
      minValue: updates.minValue !== undefined ? String(updates.minValue) : existing.minValue,
      unit: updates.unit ?? existing.unit,
      scheduledDays: updates.scheduledDays ?? existing.scheduledDays,
    })
    .where(eq(routinesTable.id, routineId))
    .returning();

  return toRoutine(row);
}

/**
 * Desactivar una rutina (no eliminar, solo marcar como inactiva)
 */
export async function deactivateRoutine(routineId: string): Promise<void> {
  const result = await db
    .update(routinesTable)
    .set({ active: false })
    .where(eq(routinesTable.id, routineId))
    .returning({ id: routinesTable.id });

  if (result.length === 0) {
    throw new Error('Rutina no encontrada');
  }
}

/**
 * Actualizar (upsert) estadísticas del usuario
 */
export async function updateStreak(
  userId: string,
  streak: number,
  lastCompletedDate: string | null
): Promise<void> {
  await db
    .insert(stats)
    .values({ userId, streak, lastCompletedDate })
    .onConflictDoUpdate({
      target: stats.userId,
      set: { streak, lastCompletedDate },
    });
}
