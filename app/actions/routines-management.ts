/**
 * Server Actions para gestión de rutinas (crear, editar, desactivar)
 */

'use server';

import { redirect } from 'next/navigation';
import { createRoutine, updateRoutine, deactivateRoutine } from '@/lib/sheets-routines';

/**
 * Crear una nueva rutina
 */
export async function createUserRoutine(
  userId: string,
  title: string,
  type: 'time' | 'quantity',
  minValue: number,
  unit: string,
  scheduledDays: number[] = []
) {
  try {
    await createRoutine(userId, title, type, minValue, unit, scheduledDays);
    // No redirigir, mantener en settings
  } catch (error) {
    console.error('Error creando rutina:', error);
    throw error;
  }
}

/**
 * Actualizar una rutina existente
 */
export async function updateUserRoutine(
  routineId: string,
  updates: { title?: string; type?: 'time' | 'quantity'; minValue?: number; unit?: string; scheduledDays?: number[] }
) {
  try {
    await updateRoutine(routineId, updates);
  } catch (error) {
    console.error('Error actualizando rutina:', error);
    throw error;
  }
}

/**
 * Desactivar una rutina
 */
export async function deactivateUserRoutine(routineId: string) {
  try {
    await deactivateRoutine(routineId);
  } catch (error) {
    console.error('Error desactivando rutina:', error);
    throw error;
  }
}
