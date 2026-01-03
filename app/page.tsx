/**
 * Landing page - Página principal de Momentum
 * Si el usuario está logueado, redirige a dashboard u onboarding
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LandingPageClient from '@/components/LandingPageClient';

export default async function Home() {
  const user = await getCurrentUser();

  // Si ya está logueado, redirigir según corresponda
  if (user) {
    try {
      const { getUserRoutines } = await import('@/lib/sheets-routines');
      const routines = await getUserRoutines(user.id);
      
      if (routines.length === 0) {
        redirect('/onboarding');
      } else {
        redirect('/dashboard');
      }
    } catch (error: any) {
      // Si Google Sheets no está configurado, mostrar landing igual
      // El usuario podrá hacer login pero necesitará configurar Sheets después
      // No capturar redirects de Next.js (tienen digest 'NEXT_REDIRECT')
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error; // Re-lanzar redirects para que Next.js los maneje
      }
      console.warn('Google Sheets no configurado:', error);
      // Si hay error, permitir ver la landing
    }
  }

  return <LandingPageClient />;
}

