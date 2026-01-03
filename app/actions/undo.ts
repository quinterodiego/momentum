/**
 * Server Action para deshacer completado de rutina
 */

'use server';

import { deleteDailyLog } from '@/lib/sheets-routines';
import { calculateStreak, getTodayDate } from '@/lib/routines';
import { updateStreak } from '@/lib/sheets-routines';

/**
 * Deshacer el completado de una rutina (eliminar el log recién creado)
 */
export async function undoCompleteRoutine(logId: string, userId: string) {
  try {
    // Eliminar el log
    await deleteDailyLog(logId);
    
    // Recalcular racha
    const newStreak = await calculateStreak(userId);
    const stats = await import('@/lib/sheets-routines').then(m => m.getStats(userId));
    await updateStreak(userId, newStreak, stats.lastCompletedDate);
    
    return { success: true };
  } catch (error) {
    console.error('Error deshaciendo rutina:', error);
    return { success: false, error: 'Error al deshacer' };
  }
}
