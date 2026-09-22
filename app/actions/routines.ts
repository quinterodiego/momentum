/**
 * Server Actions para operaciones de rutinas
 */

'use server';

import { redirect } from 'next/navigation';
import { createDailyLog, updateStreak, getStats } from '@/lib/sheets-routines';
import { calculateStreak, getTodayDate } from '@/lib/routines';

/**
 * Completar una rutina time-based (desde el timer)
 * Retorna el logId para permitir deshacer
 */
export async function completeTimeRoutine(
  routineId: string,
  userId: string,
  value: number
) {
  try {
    const today = getTodayDate();
    
    // Crear log de completado
    const log = await createDailyLog(routineId, userId, today, true, value);
    
    // Actualizar racha
    const newStreak = await calculateStreak(userId);
    await updateStreak(userId, newStreak, today);
    
    // Retornar logId en lugar de redirigir (el componente manejará el redirect)
    return { success: true, logId: log.id };
  } catch (error) {
    console.error('Error completando rutina time:', error);
    throw error;
  }
}

/**
 * Completar una rutina quantity-based (botón "Lo hice")
 * Retorna el logId para permitir deshacer
 */
export async function completeQuantityRoutine(
  routineId: string,
  userId: string,
  value: number
) {
  try {
    const today = getTodayDate();
    
    // Crear log de completado
    const log = await createDailyLog(routineId, userId, today, true, value);
    
    // Actualizar racha
    const newStreak = await calculateStreak(userId);
    await updateStreak(userId, newStreak, today);
    
    // Retornar logId en lugar de redirigir (el componente manejará el redirect)
    return { success: true, logId: log.id };
  } catch (error) {
    console.error('Error completando rutina quantity:', error);
    throw error;
  }
}

/**
 * Abandonar una rutina time-based (sin penalizar)
 */
export async function abandonTimeRoutine(
  routineId: string,
  userId: string
) {
  // No crear log, solo redirigir. No penalizar, no romper racha.
  // redirect() funciona lanzando una excepción especial (NEXT_REDIRECT) que
  // Next.js intercepta más arriba: no debe envolverse en try/catch.
  redirect('/dashboard?abandoned=true');
}
