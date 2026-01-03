/**
 * API route para crear rutinas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRoutine } from '@/lib/sheets-routines';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email!;
    const { title, type, minValue, unit } = await request.json();

    if (!title || !type || !minValue) {
      return NextResponse.json(
        { error: 'title, type y minValue son requeridos' },
        { status: 400 }
      );
    }

    const routine = await createRoutine(userId, title, type, minValue, unit || 'min');

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Error creando rutina:', error);
    return NextResponse.json(
      { error: 'Error al crear la rutina' },
      { status: 500 }
    );
  }
}
