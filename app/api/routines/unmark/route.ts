/**
 * API route para desmarcar una rutina completada
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { deleteDailyLog } from '@/lib/sheets-routines';
import { calculateStreak } from '@/lib/routines';
import { getStats, updateStreak } from '@/lib/sheets-routines';

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

    // Marcar el log como no completado
    await deleteDailyLog(logId);
    
    // Recalcular racha
    const newStreak = await calculateStreak(userId);
    const stats = await getStats(userId);
    await updateStreak(userId, newStreak, stats.lastCompletedDate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error desmarcando rutina:', error);
    return NextResponse.json({ error: 'Error al desmarcar rutina' }, { status: 500 });
  }
}
