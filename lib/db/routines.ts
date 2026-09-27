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
 * Obtener logs del día de hoy para un usuario
 */
export async function getTodayLogs(userId: string): Promise<DailyLog[]> {
  const { getTodayDate } = await import('../routines');
  const today = getTodayDate();

  const rows = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, today)));

  return rows.map(toDailyLog);
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
 * Eliminar un log diario (usado para desmarcar/deshacer una rutina cumplida)
 */
export async function deleteDailyLog(logId: string): Promise<void> {
  await db.delete(dailyLogs).where(eq(dailyLogs.id, logId));
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
