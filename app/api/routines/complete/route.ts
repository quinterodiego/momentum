/**
 * API route para completar rutinas quantity-based
 */

import { NextRequest, NextResponse } from 'next/server';
import { completeQuantityRoutine } from '@/app/actions/routines';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getTodayDate, isBackfillableDate } from '@/lib/routines';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email!;
    const body = await request.json();
    const { routineId, type, value, date = getTodayDate() } = body;

    if (!routineId || (type !== 'quantity' && type !== 'time') || !value) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    if (!isBackfillableDate(date)) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
    }

    // Usar el valor proporcionado por el usuario. La distinción de tipo ya
    // no importa acá: ambos terminan creando un log + recalculando racha.
    const result = await completeQuantityRoutine(routineId, userId, value, date);

    if (result.success) {
      return NextResponse.json({ success: true, logId: result.logId });
    }

    return NextResponse.json({ error: 'Error al completar' }, { status: 500 });
  } catch (error) {
    console.error('Error completando rutina:', error);
    return NextResponse.json({ error: 'Error al completar rutina' }, { status: 500 });
  }
}
