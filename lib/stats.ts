/**
 * Estadísticas derivadas de rutinas y logs: cumplimiento por rutina y
 * evolución de la racha en el tiempo.
 */

import { getTodayDate } from './routines';
import type { DailyLog, Routine } from './types';

export interface RoutineCompletionRate {
  routineId: string;
  title: string;
  unit: string;
  completedDays: number;
  dueDays: number;
  rate: number; // 0-100
}

export interface StreakPoint {
  date: string; // YYYY-MM-DD
  streak: number;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Mediodía local: evita que restar/sumar días cruce a otra fecha por TZ.
  return new Date(year, month - 1, day, 12, 0, 0);
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * % de cumplimiento de cada rutina activa en los últimos `days` días,
 * contando solo los días en que la rutina estaba programada.
 * Recibe rutinas y logs ya obtenidos (no vuelve a leer Sheets).
 */
export function getRoutineCompletionRates(
  routines: Routine[],
  logs: DailyLog[],
  days = 30
): RoutineCompletionRate[] {
  const today = parseLocalDate(getTodayDate());
  const windowStart = addDays(today, -(days - 1));
  const windowStartStr = formatDate(windowStart);

  const completedKeys = new Set(
    logs
      .filter((log) => log.date >= windowStartStr)
      .map((log) => `${log.routineId}|${log.date}`)
  );

  return routines
    .filter((routine) => routine.active)
    .map((routine) => {
      let dueDays = 0;
      let completedDays = 0;

      for (let i = 0; i < days; i++) {
        const date = addDays(windowStart, i);
        const isDue =
          !routine.scheduledDays ||
          routine.scheduledDays.length === 0 ||
          routine.scheduledDays.includes(date.getDay());

        if (isDue) {
          dueDays++;
          if (completedKeys.has(`${routine.id}|${formatDate(date)}`)) {
            completedDays++;
          }
        }
      }

      return {
        routineId: routine.id,
        title: routine.title,
        unit: routine.unit,
        completedDays,
        dueDays,
        rate: dueDays > 0 ? Math.round((completedDays / dueDays) * 100) : 0,
      };
    })
    .sort((a, b) => b.rate - a.rate);
}

/**
 * Serie diaria de la racha (días consecutivos con al menos una rutina
 * cumplida), recortada a los últimos `days` días para graficar. La racha
 * se calcula desde el primer log real para que el valor de cada punto sea
 * correcto aunque haya empezado antes de la ventana visible.
 * Recibe los logs ya obtenidos (no vuelve a leer Sheets).
 */
export function getStreakSeries(logs: DailyLog[], days = 60): StreakPoint[] {
  if (logs.length === 0) return [];

  const activeDates = new Set(logs.map((log) => log.date));
  const earliestDate = logs.reduce(
    (min, log) => (log.date < min ? log.date : min),
    logs[0].date
  );

  const today = parseLocalDate(getTodayDate());
  let cursor = parseLocalDate(earliestDate);
  let streak = 0;
  let prevWasActive = false;
  const fullSeries: StreakPoint[] = [];

  while (cursor <= today) {
    const dateStr = formatDate(cursor);
    const isActive = activeDates.has(dateStr);
    streak = isActive ? (prevWasActive ? streak + 1 : 1) : 0;

    fullSeries.push({ date: dateStr, streak });
    prevWasActive = isActive;
    cursor = addDays(cursor, 1);
  }

  return fullSeries.slice(-days);
}
