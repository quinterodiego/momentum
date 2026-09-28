/**
 * Editar un día pasado: marcar/desmarcar rutinas que se olvidaron cargar.
 */

import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getRoutinesWithStatusForDate, isBackfillableDate, getTodayDate } from '@/lib/routines';
import DayRoutineCard from '@/components/DayRoutineCard';

export default async function DayPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const date = searchParams.date;

  if (!date || !isBackfillableDate(date)) {
    redirect('/history');
  }

  const userId = user.id;
  const routines = await getRoutinesWithStatusForDate(userId, date);
  const isToday = date === getTodayDate();

  const [year, month, day] = date.split('-').map(Number);
  const formattedDate = new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container">
      <div className="card">
        <div className="page-header">
          <a href="/history" className="header-icon" title="Volver a Historial">
            <ArrowLeft size={20} className="text-primary" />
          </a>
          <h1 className="page-title">Editar día</h1>
        </div>

        <div className="page-subtitle">
          <p className="subtitle-text" style={{ textTransform: 'capitalize' }}>
            {formattedDate}
          </p>
          {isToday && (
            <p className="day-today-hint">Es hoy — también lo podés hacer desde el dashboard</p>
          )}
        </div>

        {routines.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">Ninguna rutina estaba programada este día</p>
          </div>
        ) : (
          <div className="routines-list">
            {routines.map((routine) => (
              <DayRoutineCard
                key={routine.id}
                routine={routine}
                date={date}
                maxDate={getTodayDate()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
