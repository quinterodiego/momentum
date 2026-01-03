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
        <h1 className="text-3xl font-bold mb-6">Enfocándote</h1>

        <div className="mb-4 p-4 bg-white bg-opacity-10 rounded-lg">
          <p className="opacity-80 mb-1">Rutina:</p>
          <p className="text-lg font-bold">{routine.title}</p>
          <p className="text-sm opacity-70 mt-1">
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
