/**
 * Server Actions para operaciones de timeboxing
 * Todas las operaciones se ejecutan en el servidor
 */

'use server';

import { redirect } from 'next/navigation';
import {
  getActiveTask,
  createTask,
  createTimebox,
  updateTimeboxStatus,
  getTimeboxHistory,
} from '@/lib/sheets';
import { getNextDuration, updateStatsAfterCompletion } from '@/lib/timeboxing';
import type { TimeboxStatus } from '@/lib/types';

/**
 * Inicia un nuevo timebox cuando el usuario hace clic en "Estoy procrastinando"
 */
export async function startTimebox(userId: string) {
  try {
    // 1. Obtener o crear tarea activa
    let task = await getActiveTask(userId);
    
    if (!task) {
      // Crear una tarea por defecto si no existe
      task = await createTask(userId, 'Mi tarea');
    }

    // 2. Calcular duración adaptativa
    const duration = await getNextDuration(userId);

    // 3. Crear timebox
    const timebox = await createTimebox(userId, task.id, duration);

    // 4. Redirigir a /focus con el ID del timebox
    redirect(`/focus?timeboxId=${timebox.id}`);
  } catch (error) {
    console.error('Error iniciando timebox:', error);
    throw error;
  }
}

/**
 * Completa un timebox exitosamente
 */
export async function completeTimebox(timeboxId: string, userId: string) {
  try {
    // Actualizar status del timebox
    await updateTimeboxStatus(timeboxId, 'completed');

    // Obtener el timebox para saber su duración
    const history = await getTimeboxHistory(userId);
    const timebox = history.find((tb) => tb.id === timeboxId);

    if (timebox) {
      // Actualizar estadísticas
      await updateStatsAfterCompletion(userId, timebox.duration, 'completed');
    }

    // Redirigir al dashboard con mensaje de éxito
    redirect('/dashboard?completed=true');
  } catch (error) {
    console.error('Error completando timebox:', error);
    throw error;
  }
}

/**
 * Abandona un timebox (sin penalización)
 */
export async function abandonTimebox(timeboxId: string, userId: string) {
  try {
    // Actualizar status del timebox
    await updateTimeboxStatus(timeboxId, 'abandoned');

    // Obtener el timebox para saber su duración
    const history = await getTimeboxHistory(userId);
    const timebox = history.find((tb) => tb.id === timeboxId);

    if (timebox) {
      // Actualizar estadísticas (sin penalizar)
      await updateStatsAfterCompletion(userId, timebox.duration, 'abandoned');
    }

    // Redirigir al dashboard con mensaje amable
    redirect('/dashboard?abandoned=true');
  } catch (error) {
    console.error('Error abandonando timebox:', error);
    throw error;
  }
}

