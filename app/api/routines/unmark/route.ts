/**
 * API route para desmarcar una rutina completada
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { deleteDailyLog, updateStreak } from '@/lib/db/routines';
import { calculateStreak } from '@/lib/routines';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email!;
    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ error: 'logId es requerido' }, { status: 400 });
    }

    // Borrar el log, solo si es del usuario logueado
    const deleted = await deleteDailyLog(logId, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Log no encontrado' }, { status: 404 });
    }

    // Recalcular racha desde los logs reales
    const { streak, lastCompletedDate } = await calculateStreak(userId);
    await updateStreak(userId, streak, lastCompletedDate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error desmarcando rutina:', error);
    return NextResponse.json({ error: 'Error al desmarcar rutina' }, { status: 500 });
  }
}
