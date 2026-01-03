/**
 * Manejo de usuarios en Google Sheets
 * Almacena usuarios con email y contraseña hasheada
 */

import { getSheetsClient } from './sheets-routines';
import bcrypt from 'bcryptjs';

const USERS_SHEET_NAME = 'users';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(email: string, password: string): Promise<User> {
  const { sheets, spreadsheetId } = getSheetsClient();
  
  // Verificar si el usuario ya existe
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hashear la contraseña
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generar ID único
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  // Verificar si la hoja existe, si no, crearla
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A1`,
    });
  } catch (error) {
    // La hoja no existe, crearla
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: USERS_SHEET_NAME,
              },
            },
          },
        ],
      },
    });

    // Agregar encabezados
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A1:D1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'email', 'passwordHash', 'createdAt']],
      },
    });
  }

  // Agregar el nuevo usuario
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${USERS_SHEET_NAME}!A:D`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[id, email, passwordHash, createdAt]],
    },
  });

  return {
    id,
    email,
    passwordHash,
    createdAt,
  };
}

/**
 * Obtener usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A:D`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return null;
    }

    // Buscar el usuario por email (columna B)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === email) {
        return {
          id: row[0],
          email: row[1],
          passwordHash: row[2],
          createdAt: row[3] || '',
        };
      }
    }

    return null;
  } catch (error) {
    // Si la hoja no existe, retornar null
    return null;
  }
}

/**
 * Verificar credenciales de usuario
 */
export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { sheets, spreadsheetId } = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A:D`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return null;
    }

    // Buscar el usuario por ID (columna A)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === id) {
        return {
          id: row[0],
          email: row[1],
          passwordHash: row[2],
          createdAt: row[3] || '',
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
