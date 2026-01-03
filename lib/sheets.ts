/**
 * Integración con Google Sheets como base de datos
 * DEPRECATED: Este archivo ya no se usa, la app ahora usa rutinas diarias
 * Se mantiene solo para compatibilidad con archivos deprecados
 */

import { google } from 'googleapis';
import type { Stats } from './types';

// Inicializar cliente de Google Sheets
function getSheetsClient() {
  if (!checkSheetsConfig()) {
    throw new Error('Google Sheets no está configurado. Por favor, configura las variables de entorno: GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Verificar si Google Sheets está configurado
function checkSheetsConfig() {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return false;
  }
  return true;
}

/**
 * Obtener todas las tareas activas de un usuario
 * DEPRECATED: Ya no se usa
 */
export async function getActiveTask(userId: string): Promise<any | null> {
  if (!checkSheetsConfig()) {
    // Si Google Sheets no está configurado, retornar null
    return null;
  }

  const sheets = getSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID!,
      range: 'tasks!A2:E',
    });

    const rows = response.data.values || [];
    
    // Buscar tarea activa del usuario
    for (const row of rows) {
      if (row[1] === userId && row[3] === 'TRUE') {
        return {
          id: row[0],
          userId: row[1],
          title: row[2],
          active: row[3] === 'TRUE',
          createdAt: row[4],
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo tarea activa:', error);
    throw error;
  }
}

/**
 * Crear una nueva tarea
 * DEPRECATED: Ya no se usa
 */
export async function createTask(userId: string, title: string): Promise<any> {
  const sheets = getSheetsClient();
  const taskId = `task_${Date.now()}`;
  const createdAt = new Date().toISOString();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'tasks!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[taskId, userId, title, 'TRUE', createdAt]],
      },
    });

    return {
      id: taskId,
      userId,
      title,
      active: true,
      createdAt,
    };
  } catch (error) {
    console.error('Error creando tarea:', error);
    throw error;
  }
}

/**
 * Obtener historial de timeboxes de un usuario (últimos 10)
 * DEPRECATED: Ya no se usa
 */
export async function getTimeboxHistory(userId: string): Promise<any[]> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'timeboxes!A2:G',
    });

    const rows = response.data.values || [];
    const userTimeboxes: any[] = [];

    // Filtrar timeboxes del usuario y ordenar por fecha (más recientes primero)
    for (const row of rows) {
      if (row[1] === userId) {
        userTimeboxes.push({
          id: row[0],
          userId: row[1],
          taskId: row[2],
          duration: parseInt(row[3]) as 3 | 5 | 10 | 15,
          status: row[4] || null,
          startedAt: row[5] || null,
          endedAt: row[6] || null,
        });
      }
    }

    // Ordenar por fecha de inicio (más recientes primero) y tomar últimos 10
    return userTimeboxes
      .sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Error obteniendo historial de timeboxes:', error);
    throw error;
  }
}

/**
 * Crear un nuevo timebox
 * DEPRECATED: Ya no se usa
 */
export async function createTimebox(
  userId: string,
  taskId: string,
  duration: 3 | 5 | 10 | 15
): Promise<any> {
  const sheets = getSheetsClient();
  const timeboxId = `timebox_${Date.now()}`;
  const startedAt = new Date().toISOString();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'timeboxes!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timeboxId, userId, taskId, duration, '', startedAt, '']],
      },
    });

    return {
      id: timeboxId,
      userId,
      taskId,
      duration,
      status: null,
      startedAt,
      endedAt: null,
    };
  } catch (error) {
    console.error('Error creando timebox:', error);
    throw error;
  }
}

/**
 * Actualizar estado de un timebox
 * DEPRECATED: Ya no se usa
 */
export async function updateTimeboxStatus(
  timeboxId: string,
  status: string
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    // Primero obtener todas las filas para encontrar el índice
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'timeboxes!A2:G',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === timeboxId);

    if (rowIndex === -1) {
      throw new Error('Timebox no encontrado');
    }

    // Actualizar status y endedAt
    const actualRowIndex = rowIndex + 2; // +2 porque empezamos en A2
    const endedAt = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `timeboxes!E${actualRowIndex}:G${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status, rows[rowIndex][5], endedAt]],
      },
    });
  } catch (error) {
    console.error('Error actualizando timebox:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas del usuario
 */
export async function getStats(userId: string): Promise<Stats> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
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
 * Actualizar estadísticas del usuario
 */
export async function updateStats(
  userId: string,
  stats: Partial<Stats>
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    // Obtener filas existentes
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'stats!A2:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === userId);

    const updatedStats: Stats = {
      userId,
      streak: stats.streak ?? parseInt(rows[rowIndex]?.[1] || '0'),
      lastCompletedDate: stats.lastCompletedDate ?? (rows[rowIndex]?.[2] || null),
    };

    if (rowIndex === -1) {
      // Crear nueva fila
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'stats!A:C',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            updatedStats.userId,
            updatedStats.streak,
            updatedStats.lastCompletedDate || '',
          ]],
        },
      });
    } else {
      // Actualizar fila existente
      const actualRowIndex = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `stats!A${actualRowIndex}:C${actualRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            updatedStats.userId,
            updatedStats.streak,
            updatedStats.lastCompletedDate || '',
          ]],
        },
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    throw error;
  }
}

