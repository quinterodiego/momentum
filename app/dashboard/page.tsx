/**
 * Dashboard principal - Rutinas del día
 * Muestra las rutinas diarias del usuario y su estado
 */

import { redirect } from 'next/navigation';
import { ListPlus } from 'lucide-react';
import { getRoutinesWithStatus, getTodayDate } from '@/lib/routines';
import { getStats } from '@/lib/sheets-routines';
import { getCurrentUser } from '@/lib/auth';
import RoutineCard from '@/components/RoutineCard';
import StatsDisplay from '@/components/StatsDisplay';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { completed?: string; abandoned?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userId = user.id;
  const routines = await getRoutinesWithStatus(userId);
  const stats = await getStats(userId);
  const today = getTodayDate();

  // Mensajes según el resultado
  let statusMessage = '';
  if (searchParams.completed === 'true') {
    statusMessage = 'Cumpliste el mínimo, eso alcanza';
  } else if (searchParams.abandoned === 'true') {
    statusMessage = 'Parar también es progreso';
  }

  // Contar rutinas completadas
  const completedCount = routines.filter((r) => r.completed).length;
  const totalCount = routines.length;

  return (
    <div className="container">
      <div className="card">
        <div className="page-header">
          <h1 className="page-title">Momentum</h1>
          <a href="/settings" className="header-icon" title="Agregar rutina">
            <ListPlus size={20} className="text-primary" />
          </a>
        </div>
        
        <div className="page-subtitle">
          <p className="subtitle-text">Hoy con lo mínimo alcanza</p>
          {totalCount > 0 && (
            <p className="subtitle-hint">
              {completedCount} de {totalCount} cumplidas hoy
            </p>
          )}
        </div>

        {statusMessage && (
          <div className="status-message mb-4">
            <p className="text-lg font-semibold">{statusMessage}</p>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg opacity-80 mb-4">
              Aún no tenés rutinas configuradas
            </p>
            <p className="text-sm opacity-60">
              Creá tu primera rutina para empezar
            </p>
          </div>
        ) : (
          <div className="dashboard-content-grid">
            <div className="routines-list">
              {routines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} userId={userId} />
              ))}
            </div>
            <div className="dashboard-sidebar">
              <StatsDisplay stats={stats} />
            </div>
          </div>
        )}

        {routines.length === 0 && (
          <div className="mt-6">
            <StatsDisplay stats={stats} />
          </div>
        )}

        <div className="mt-4 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
