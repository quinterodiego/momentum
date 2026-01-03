/**
 * Lógica de rutinas diarias
 * Maneja la obtención y actualización de rutinas y logs diarios
 */

import { getUserRoutines, getTodayLogs, createDailyLog, updateStreak } from './sheets-routines';
import type { Routine, DailyLog, RoutineWithStatus } from './types';

/**
 * Obtener rutinas del usuario con su estado de hoy
 */
export async function getRoutinesWithStatus(userId: string): Promise<RoutineWithStatus[]> {
  const routines = await getUserRoutines(userId);
  const todayLogs = await getTodayLogs(userId);
  
  // Formatear fecha de hoy como YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  return routines.map((routine) => {
    const todayLog = todayLogs.find(
      (log) => log.routineId === routine.id && log.date === today
    );
    
    return {
      ...routine,
      completed: todayLog?.completed || false,
      todayLog: todayLog || null,
    };
  });
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Verificar si el usuario cumplió al menos una rutina hoy
 */
export async function hasCompletedAnyToday(userId: string): Promise<boolean> {
  const todayLogs = await getTodayLogs(userId);
  const today = getTodayDate();
  
  return todayLogs.some(
    (log) => log.date === today && log.completed
  );
}

/**
 * Calcular racha del usuario
 * La racha aumenta si cumple al menos una rutina hoy
 * Se mantiene si no cumplió hoy (no se rompe hasta que pase el día)
 */
export async function calculateStreak(userId: string): Promise<number> {
  const { getStats } = await import('./sheets-routines');
  const stats = await getStats(userId);
  const today = getTodayDate();
  const hasCompletedToday = await hasCompletedAnyToday(userId);
  
  if (hasCompletedToday) {
    // Si cumplió hoy
    if (stats.lastCompletedDate === today) {
      // Ya había cumplido hoy antes, mantener racha
      return stats.streak;
    } else {
      // Primera vez que cumple hoy
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (stats.lastCompletedDate === yesterdayStr) {
        // Cumplió ayer también, aumentar racha
        return stats.streak + 1;
      } else {
        // No cumplió ayer, reiniciar racha
        return 1;
      }
    }
  } else {
    // No cumplió hoy todavía, mantener racha anterior
    return stats.streak;
  }
}
