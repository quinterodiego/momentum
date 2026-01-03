/**
 * Integración con Google Sheets para rutinas diarias
 * Maneja todas las operaciones CRUD para routines, daily_logs y stats
 */

import { google } from 'googleapis';
import type { Routine, DailyLog, Stats } from './types';

// Inicializar cliente de Google Sheets
export function getSheetsClient() {
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Sheets no está configurado. Por favor, configura las variables de entorno: GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY');
  }

  // Procesar la clave privada para manejar diferentes formatos
  // En Vercel, la clave puede venir con \n literales o con saltos de línea reales
  let processedKey = PRIVATE_KEY;
  
  // Si la clave tiene \n literales (string), reemplazarlos con saltos de línea reales
  if (processedKey.includes('\\n')) {
    processedKey = processedKey.replace(/\\n/g, '\n');
  }
  
  // Asegurarse de que la clave tenga el formato correcto
  // Eliminar espacios al inicio y final
  processedKey = processedKey.trim();
  
  // Si la clave no empieza con -----BEGIN, puede que esté mal formateada
  if (!processedKey.startsWith('-----BEGIN')) {
    throw new Error('GOOGLE_PRIVATE_KEY tiene un formato inválido. Debe empezar con "-----BEGIN PRIVATE KEY-----"');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: processedKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId: SPREADSHEET_ID };
}

/**
 * Obtener todas las rutinas activas de un usuario
 */
export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const { sheets, spreadsheetId } = getSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'routines!A2:G',
    });

    const rows = response.data.values || [];
    const routines: Routine[] = [];

    for (const row of rows) {
      if (row[1] === userId && row[6] === 'TRUE') {
        routines.push({
          id: row[0],
          userId: row[1],
          title: row[2],
          type: row[3] as 'time' | 'quantity',
          minValue: parseFloat(row[4]) || 0,
          unit: row[5] || '',
          active: row[6] === 'TRUE',
        });
      }
    }

    return routines;
  } catch (error) {
    console.error('Error obteniendo rutinas:', error);
    throw error;
  }
}

/**
 * Crear una nueva rutina
 */
export async function createRoutine(
  userId: string,
  title: string,
  type: 'time' | 'quantity',
  minValue: number,
  unit: string
): Promise<Routine> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const routineId = `routine_${Date.now()}`;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'routines!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[routineId, userId, title, type, minValue, unit, 'TRUE']],
      },
    });

    return {
      id: routineId,
      userId,
      title,
      type,
      minValue,
      unit,
      active: true,
    };
  } catch (error) {
    console.error('Error creando rutina:', error);
    throw error;
  }
}

/**
 * Obtener logs del día de hoy para un usuario
 */
export async function getTodayLogs(userId: string): Promise<DailyLog[]> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'daily_logs!A2:F',
    });

    const rows = response.data.values || [];
    const logs: DailyLog[] = [];

    for (const row of rows) {
      if (row[2] === userId && row[3] === today) {
        logs.push({
          id: row[0],
          routineId: row[1],
          userId: row[2],
          date: row[3],
          completed: row[4] === 'TRUE',
          value: parseFloat(row[5]) || 0,
        });
      }
    }

    return logs;
  } catch (error) {
    console.error('Error obteniendo logs de hoy:', error);
    throw error;
  }
}

/**
 * Crear o actualizar un log diario
 */
export async function createDailyLog(
  routineId: string,
  userId: string,
  date: string,
  completed: boolean,
  value: number
): Promise<DailyLog> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const logId = `log_${Date.now()}`;

  try {
    // Primero verificar si ya existe un log para esta rutina y fecha
    const todayLogs = await getTodayLogs(userId);
    const existingLog = todayLogs.find(
      (log) => log.routineId === routineId && log.date === date
    );

    if (existingLog) {
      // Actualizar log existente
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'daily_logs!A2:F',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === existingLog.id);

      if (rowIndex !== -1) {
        const actualRowIndex = rowIndex + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `daily_logs!D${actualRowIndex}:F${actualRowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[date, completed ? 'TRUE' : 'FALSE', value]],
          },
        });

        return {
          ...existingLog,
          completed,
          value,
        };
      }
    }

    // Crear nuevo log
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'daily_logs!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[logId, routineId, userId, date, completed ? 'TRUE' : 'FALSE', value]],
      },
    });

    return {
      id: logId,
      routineId,
      userId,
      date,
      completed,
      value,
    };
  } catch (error) {
    console.error('Error creando log diario:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas del usuario
 */
export async function getStats(userId: string): Promise<Stats> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'stats!A2:C',
    });

    const rows = response.data.values || [];
    const userStats = rows.find((row) => row[0] === userId);

    if (userStats) {
      return {
        userId: userStats[0],
        streak: parseInt(userStats[1]) || 0,
        lastCompletedDate: userStats[2] || null,
      };
    }

    // Si no existe, crear estadísticas iniciales
    return {
      userId,
      streak: 0,
      lastCompletedDate: null,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}

/**
 * Eliminar un log diario (para deshacer acción)
 * Simplificado: marca el log como no completado en lugar de eliminarlo físicamente
 */
export async function deleteDailyLog(logId: string): Promise<void> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'daily_logs!A2:F',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === logId);

    if (rowIndex === -1) {
      throw new Error('Log no encontrado');
    }

    // Marcar como no completado (más simple que eliminar físicamente)
    const actualRowIndex = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `daily_logs!E${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['FALSE']],
      },
    });
  } catch (error) {
    console.error('Error eliminando log:', error);
    throw error;
  }
}

/**
 * Actualizar una rutina existente
 */
export async function updateRoutine(
  routineId: string,
  updates: { title?: string; minValue?: number; unit?: string }
): Promise<Routine> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'routines!A2:G',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === routineId);

    if (rowIndex === -1) {
      throw new Error('Rutina no encontrada');
    }

    const routine = rows[rowIndex];
    const updatedTitle = updates.title ?? routine[2];
    const updatedMinValue = updates.minValue ?? parseFloat(routine[4]);
    const updatedUnit = updates.unit ?? routine[5];

    const actualRowIndex = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `routines!C${actualRowIndex}:F${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[updatedTitle, routine[3], updatedMinValue, updatedUnit]],
      },
    });

    return {
      id: routine[0],
      userId: routine[1],
      title: updatedTitle,
      type: routine[3] as 'time' | 'quantity',
      minValue: updatedMinValue,
      unit: updatedUnit,
      active: routine[6] === 'TRUE',
    };
  } catch (error) {
    console.error('Error actualizando rutina:', error);
    throw error;
  }
}

/**
 * Desactivar una rutina (no eliminar, solo marcar como inactiva)
 */
export async function deactivateRoutine(routineId: string): Promise<void> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'routines!A2:G',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === routineId);

    if (rowIndex === -1) {
      throw new Error('Rutina no encontrada');
    }

    const actualRowIndex = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `routines!G${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['FALSE']],
      },
    });
  } catch (error) {
    console.error('Error desactivando rutina:', error);
    throw error;
  }
}

/**
 * Actualizar estadísticas del usuario
 */
export async function updateStreak(userId: string, streak: number, lastCompletedDate: string | null): Promise<void> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'stats!A2:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === userId);

    if (rowIndex === -1) {
      // Crear nueva fila
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'stats!A:C',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[userId, streak, lastCompletedDate || '']],
        },
      });
    } else {
      // Actualizar fila existente
      const actualRowIndex = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `stats!A${actualRowIndex}:C${actualRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[userId, streak, lastCompletedDate || '']],
        },
      });
    }
  } catch (error) {
    console.error('Error actualizando racha:', error);
    throw error;
  }
}
