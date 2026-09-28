/**
 * API route para cambiar la fecha de un log ya cargado
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { moveDailyLog, updateStreak } from '@/lib/db/routines';
import { calculateStreak, isBackfillableDate } from '@/lib/routines';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email!;
    const body = await request.json();
    const { logId, date } = body;

    if (!logId || !date) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    if (!isBackfillableDate(date)) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
    }

    const result = await moveDailyLog(logId, userId, date);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        return NextResponse.json({ error: 'Log no encontrado' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Ya había un registro de esta rutina en esa fecha' },
        { status: 409 }
      );
    }

    // Recalcular racha: la fecha cambió, puede afectar el cálculo en ambos extremos.
    const { streak, lastCompletedDate } = await calculateStreak(userId);
    await updateStreak(userId, streak, lastCompletedDate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moviendo rutina de fecha:', error);
    return NextResponse.json({ error: 'Error al mover la rutina' }, { status: 500 });
  }
}
