/**
 * API route para actualizar el valor de un log existente
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getSheetsClient } from '@/lib/sheets-routines';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { logId, value } = body;

    if (!logId || !value) {
      return NextResponse.json({ error: 'logId y value son requeridos' }, { status: 400 });
    }

    const { sheets, spreadsheetId } = getSheetsClient();

    // Buscar el log
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'daily_logs!A2:F',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === logId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Log no encontrado' }, { status: 404 });
    }

    // Actualizar el valor
    const actualRowIndex = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `daily_logs!F${actualRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando log:', error);
    return NextResponse.json({ error: 'Error al actualizar log' }, { status: 500 });
  }
}
