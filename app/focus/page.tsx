/**
 * Pantalla de Focus Mode para rutinas time-based
 * Muestra el timer y la rutina
 * No se puede pausar, solo completar o abandonar
 */

import { redirect } from 'next/navigation';
import { getUserRoutines } from '@/lib/sheets-routines';
import RoutineTimer from '@/components/RoutineTimer';
import { getCurrentUser } from '@/lib/auth';

export default async function FocusPage({
  searchParams,
}: {
  searchParams: { routineId?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userId = user.id;

  if (!searchParams.routineId) {
    redirect('/dashboard');
  }

  // Obtener la rutina
  const routines = await getUserRoutines(userId);
  const routine = routines.find((r) => r.id === searchParams.routineId);

  if (!routine || routine.type !== 'time') {
    redirect('/dashboard');
  }

  return (
    <div className="container">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-4">Enfocándote</h1>

        <div className="focus-routine-info">
          <p className="focus-routine-label">Rutina</p>
          <p className="focus-routine-title">{routine.title}</p>
          <p className="focus-routine-minimum">
            Mínimo: {routine.minValue} {routine.unit}
          </p>
        </div>

        <RoutineTimer
          routineId={routine.id}
          userId={userId}
          duration={routine.minValue}
          routineTitle={routine.title}
        />
      </div>
    </div>
  );
}
