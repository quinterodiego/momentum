/**
 * Server Actions para operaciones de tareas
 */

'use server';

import { createTask } from '@/lib/sheets';

/**
 * Crear una nueva tarea
 */
export async function createUserTask(userId: string, title: string) {
  try {
    const task = await createTask(userId, title);
    return { success: true, task };
  } catch (error) {
    console.error('Error creando tarea:', error);
    return { success: false, error: 'Error al crear la tarea' };
  }
}

