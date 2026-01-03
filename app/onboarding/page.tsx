/**
 * Pantalla de onboarding
 * Permite crear rutinas iniciales después del primer login
 */

import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getUserRoutines } from '@/lib/sheets-routines';
import { getCurrentUser } from '@/lib/auth';
import RoutineOnboardingForm from '@/components/RoutineOnboardingForm';
import LogoutButton from '@/components/LogoutButton';

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userId = user.id;
  const routines = await getUserRoutines(userId);

  // Si ya tiene rutinas, ir al dashboard
  if (routines.length > 0) {
    redirect('/dashboard');
  }

  return (
    <div className="container">
      <div className="card onboarding-card">
        <div className="onboarding-header">
          <h1 className="onboarding-title">
            <span className="onboarding-title-content">
              <span>Momentum</span>
              <Image 
                src="/cubo.png" 
                alt="Cubo" 
                width={40} 
                height={40} 
                className="onboarding-title-icon"
              />
            </span>
          </h1>
          <p className="onboarding-subtitle">
            Creá tu primera rutina diaria
          </p>
          <p className="onboarding-hint">
            Empezá con una. Podés agregar más después.
          </p>
        </div>
        <RoutineOnboardingForm userId={userId} />
        <div className="onboarding-logout">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
