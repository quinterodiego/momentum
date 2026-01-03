/**
 * Server Actions para operaciones de timeboxing
 * DEPRECATED: Este archivo ya no se usa, la app ahora usa rutinas diarias
 * Se mantiene por compatibilidad pero no se importa en ningún lado
 */

'use server';

// Este archivo está deprecado y no se usa en la versión actual de la app
// Se mantiene solo para referencia histórica

// Funciones vacías para evitar errores de importación
export async function startTimebox(userId: string) {
  throw new Error('Esta función está deprecada. La app ahora usa rutinas diarias.');
}

export async function completeTimebox(timeboxId: string, userId: string) {
  throw new Error('Esta función está deprecada. La app ahora usa rutinas diarias.');
}

export async function abandonTimebox(timeboxId: string, userId: string) {
  throw new Error('Esta función está deprecada. La app ahora usa rutinas diarias.');
}

