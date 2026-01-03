/**
 * Lógica central de Timeboxing adaptativo
 * 
 * Reglas:
 * - Si abandona 2 timeboxes seguidos → reducir duración (mínimo 3 min)
 * - Si completa 3 timeboxes seguidos → aumentar duración (máximo 15 min)
 * - Si abandona uno → no penalizar
 * - Nunca castigar al usuario
 */

import { getTimeboxHistory, updateStats } from './sheets';
// DEPRECATED: Este archivo ya no se usa, la app ahora usa rutinas diarias

/**
 * Analiza el historial del usuario para determinar la próxima duración
 */
export async function getNextDuration(userId: string): Promise<3 | 5 | 10 | 15> {
  const history = await getTimeboxHistory(userId);

  // Si no hay historial, empezar con 5 minutos (duración media)
  if (history.length === 0) {
    return 5;
  }

  // Filtrar solo timeboxes completados (con status)
  const completedTimeboxes = history.filter(
    (tb) => tb.status === 'completed' || tb.status === 'abandoned'
  );

  if (completedTimeboxes.length === 0) {
    return 5;
  }

  // Obtener los últimos 5 timeboxes para análisis
  const lastFive = completedTimeboxes.slice(0, 5);
  const lastTwo = lastFive.slice(0, 2);

  // Obtener la duración actual (del último timebox)
  const currentDuration = lastFive[0]?.duration || 5;

  // Regla 1: Si abandona 2 seguidos → reducir
  if (lastTwo.length === 2) {
    const bothAbandoned = lastTwo.every((tb) => tb.status === 'abandoned');
    if (bothAbandoned && currentDuration > 3) {
      // Reducir en un nivel: 15→10, 10→5, 5→3
      const reductions: Record<number, number> = {
        15: 10,
        10: 5,
        5: 3,
        3: 3, // Mínimo
      };
      return reductions[currentDuration] as 3 | 5 | 10 | 15;
    }
  }

  // Regla 2: Si completa 3 seguidos → aumentar
  if (lastFive.length >= 3) {
    const lastThree = lastFive.slice(0, 3);
    const allCompleted = lastThree.every((tb) => tb.status === 'completed');
    if (allCompleted && currentDuration < 15) {
      // Aumentar en un nivel: 3→5, 5→10, 10→15
      const increases: Record<number, number> = {
        3: 5,
        5: 10,
        10: 15,
        15: 15, // Máximo
      };
      return increases[currentDuration] as 3 | 5 | 10 | 15;
    }
  }

  // Si no aplica ninguna regla, mantener la duración actual
  return currentDuration;
}

/**
 * Calcula y actualiza las estadísticas después de completar un timebox
 */
export async function updateStatsAfterCompletion(
  userId: string,
  duration: number,
  status: string
): Promise<void> {
  const history = await getTimeboxHistory(userId);
  const completedTimeboxes = history.filter(
    (tb) => tb.status === 'completed' || tb.status === 'abandoned'
  );

  // Calcular racha (días consecutivos con al menos un timebox completado)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Agrupar por día
  const timeboxesByDay = new Map<string, boolean>();
  for (const tb of completedTimeboxes) {
    if (tb.status === 'completed' && tb.endedAt) {
      const day = new Date(tb.endedAt);
      day.setHours(0, 0, 0, 0);
      const dayKey = day.toISOString();
      timeboxesByDay.set(dayKey, true);
    }
  }

  // Calcular racha desde hoy hacia atrás
  let currentDay = new Date(today);
  while (timeboxesByDay.has(currentDay.toISOString())) {
    streak++;
    currentDay.setDate(currentDay.getDate() - 1);
  }

  // Calcular duración promedio (solo de completados)
  const completedDurations = completedTimeboxes
    .filter((tb) => tb.status === 'completed')
    .map((tb) => tb.duration);

  const avgDuration =
    completedDurations.length > 0
      ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
      : duration;

  // Actualizar stats
  await updateStats(userId, {
    streak,
    lastCompletedAt: status === 'completed' ? new Date().toISOString() : null,
    avgDuration: Math.round(avgDuration * 10) / 10, // Redondear a 1 decimal
  });
}

/**
 * Obtiene un mensaje motivacional según la hora del día
 */
export function getMotivationalMessage(hour: number): string {
  if (hour >= 6 && hour < 12) {
    return 'Buen día para empezar';
  } else if (hour >= 12 && hour < 18) {
    return 'Seguí con energía';
  } else if (hour >= 18 && hour < 22) {
    return 'Un último empujón';
  } else {
    return 'Cada minuto cuenta';
  }
}

