/**
 * Lógica de rutinas diarias
 * Maneja la obtención y actualización de rutinas y logs diarios
 */

import { getUserRoutines, getTodayLogs, createDailyLog, updateStreak } from './sheets-routines';
import type { Routine, DailyLog, RoutineWithStatus } from './types';

/**
 * Obtener el día de la semana actual en zona horaria Argentina
 * Retorna: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
 */
export function getTodayDayOfWeek(): number {
  const timezone = 'America/Argentina/Buenos_Aires';
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [year, month, day] = dateStr.split('-').map(Number);
  // Usar mediodía local para evitar desfases de zona horaria al parsear
  return new Date(year, month - 1, day, 12, 0, 0).getDay();
}

/**
 * Obtener rutinas del usuario con su estado de hoy
 */
export async function getRoutinesWithStatus(userId: string): Promise<RoutineWithStatus[]> {
  const routines = await getUserRoutines(userId);
  const today = getTodayDate();
  const todayDayOfWeek = getTodayDayOfWeek();
  const todayLogs = await getTodayLogs(userId);

  // Debug: Log para verificar
  console.log('getRoutinesWithStatus - Fecha de hoy:', today, '- Día de semana:', todayDayOfWeek);
  console.log('getRoutinesWithStatus - Logs de hoy encontrados:', todayLogs.length);
  console.log('getRoutinesWithStatus - Fechas de logs:', todayLogs.map(l => l.date));

  return routines
    .filter((routine) => {
      // Si no tiene días programados (vacío), mostrar todos los días
      if (!routine.scheduledDays || routine.scheduledDays.length === 0) return true;
      return routine.scheduledDays.includes(todayDayOfWeek);
    })
    .map((routine) => {
      // Buscar log de hoy para esta rutina
      // IMPORTANTE: Solo considerar logs con fecha exacta de hoy
      const todayLog = todayLogs.find(
        (log) => log.routineId === routine.id && log.date === today && log.completed === true
      );

      // Debug: Log para cada rutina
      if (todayLog) {
        console.log(`Rutina "${routine.title}": completada hoy (${todayLog.date})`);
      } else {
        console.log(`Rutina "${routine.title}": pendiente (no hay log de hoy)`);
      }

      return {
        ...routine,
        // Solo marcar como completada si hay un log de HOY con completed=true
        completed: todayLog?.completed === true || false,
        todayLog: todayLog || null,
      };
    });
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 * Usa la zona horaria de Argentina (America/Argentina/Buenos_Aires)
 * para evitar problemas con UTC en el servidor
 */
export function getTodayDate(): string {
  const now = new Date();
  
  // Usar Intl.DateTimeFormat para obtener la fecha en zona horaria de Argentina
  // Esto asegura que la fecha sea correcta independientemente de dónde esté el servidor
  const timezone = 'America/Argentina/Buenos_Aires';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  // Formato 'en-CA' devuelve YYYY-MM-DD directamente
  return formatter.format(now);
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
      // Calcular ayer en la misma zona horaria
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const timezone = 'America/Argentina/Buenos_Aires';
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      
      const yesterdayStr = formatter.format(yesterday);
      
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
