/**
 * API route para registrar nuevos usuarios
 */

import { NextResponse } from 'next/server';
import { createUser } from '@/lib/sheets-users';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error registrando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
