/**
 * Lógica de rutinas diarias
 * Maneja la obtención y actualización de rutinas y logs diarios
 */

import { getUserRoutines, getAllLogs } from './db/routines';
import { getDayOfWeek, parseLocalDate, addDays, formatDate } from './date-utils';
import type { Routine, DailyLog, RoutineWithStatus } from './types';

/**
 * Obtener el día de la semana actual en zona horaria Argentina
 * Retorna: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
 */
export function getTodayDayOfWeek(): number {
  return getDayOfWeek(getTodayDate());
}

/**
 * Obtener rutinas del usuario con su estado de hoy
 */
export async function getRoutinesWithStatus(userId: string): Promise<RoutineWithStatus[]> {
  return getRoutinesWithStatusForDate(userId, getTodayDate());
}

/**
 * Obtener rutinas del usuario con su estado para una fecha cualquiera
 * (pasada o de hoy). Sirve tanto al dashboard (fecha = hoy) como a la
 * pantalla de editar un día pasado.
 *
 * Limitación conocida: como las rutinas no guardan fecha de creación, no
 * hay forma de saber si una rutina ya existía en una fecha pasada — se
 * muestra igual si estaba programada ese día de la semana.
 */
export async function getRoutinesWithStatusForDate(
  userId: string,
  date: string
): Promise<RoutineWithStatus[]> {
  const routines = await getUserRoutines(userId);
  const dayOfWeek = getDayOfWeek(date);
  const logs = await getAllLogs(userId);

  return routines
    .filter((routine) => {
      if (!routine.scheduledDays || routine.scheduledDays.length === 0) return true;
      return routine.scheduledDays.includes(dayOfWeek);
    })
    .map((routine) => {
      const log = logs.find((l) => l.routineId === routine.id && l.date === date);

      return {
        ...routine,
        completed: log?.completed === true || false,
        todayLog: log || null,
      };
    });
}

/**
 * ¿Es una fecha 'YYYY-MM-DD' válida y no futura? Usado para validar antes
 * de dejar cargar/editar rutinas de un día pasado.
 */
export function isBackfillableDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day, 12, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return false; // fecha inválida (ej. 2026-02-30)
  }
  return date <= getTodayDate();
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
 * Calcular la racha (días consecutivos con al menos una rutina cumplida)
 * a partir de un listado de logs ya completados, en vez de acumular +1 de
 * forma incremental. Necesario porque el usuario puede cargar un día
 * pasado que se le había olvidado marcar: un cálculo incremental que solo
 * mira "ayer" no puede detectar que ese hueco se llenó y la racha actual
 * debería extenderse hacia atrás. Recalcular siempre desde los logs reales
 * es correcto sin importar en qué orden se cargaron los días.
 *
 * Misma semántica que antes: si hoy tiene un log, cuenta hacia atrás desde
 * hoy; si hoy no tiene pero ayer sí (período de gracia, el día no
 * "rompió" la racha todavía), cuenta hacia atrás desde ayer; si ninguno
 * de los dos tiene, la racha es 0.
 */
export function computeStreakFromLogs(
  logs: DailyLog[],
  todayStr: string
): { streak: number; lastCompletedDate: string | null } {
  if (logs.length === 0) {
    return { streak: 0, lastCompletedDate: null };
  }

  const activeDates = new Set(logs.map((log) => log.date));
  const lastCompletedDate = logs.reduce(
    (max, log) => (log.date > max ? log.date : max),
    logs[0].date
  );

  const today = parseLocalDate(todayStr);
  const yesterdayStr = formatDate(addDays(today, -1));

  let cursor: Date;
  if (activeDates.has(todayStr)) {
    cursor = today;
  } else if (activeDates.has(yesterdayStr)) {
    cursor = addDays(today, -1);
  } else {
    return { streak: 0, lastCompletedDate };
  }

  let streak = 0;
  while (activeDates.has(formatDate(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return { streak, lastCompletedDate };
}

/**
 * Recalcular la racha del usuario desde los logs reales. Llamar después
 * de cualquier cambio en daily_logs (completar hoy, completar/desmarcar
 * un día pasado, desmarcar hoy).
 */
export async function calculateStreak(
  userId: string
): Promise<{ streak: number; lastCompletedDate: string | null }> {
  const logs = await getAllLogs(userId);
  return computeStreakFromLogs(logs, getTodayDate());
}
