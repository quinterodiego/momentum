/**
 * Página de inicio - Redirige a landing o dashboard según corresponda
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  // Si ya está logueado, verificar si necesita onboarding
  if (user) {
    try {
      const { getUserRoutines } = await import('@/lib/sheets-routines');
      const routines = await getUserRoutines(user.id);
      
      // Si no tiene rutinas, ir a onboarding
      if (routines.length === 0) {
        redirect('/onboarding');
      } else {
        redirect('/dashboard');
      }
    } catch (error: any) {
      // No capturar redirects de Next.js (tienen digest 'NEXT_REDIRECT')
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error; // Re-lanzar redirects para que Next.js los maneje
      }
      // Si Google Sheets no está configurado, redirigir a landing
      // El usuario verá la landing pero necesitará configurar Sheets
      console.warn('Google Sheets no configurado:', error);
      redirect('/landing');
    }
  }

  // Si no está logueado, redirigir a login
  redirect('/login');
}

