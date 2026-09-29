/**
 * Dashboard principal - Rutinas del día
 * Muestra las rutinas diarias del usuario y su estado
 */

import { redirect } from 'next/navigation';
import Image from 'next/image';
import { ListPlus, History, Check } from 'lucide-react';
import { getRoutinesWithStatus } from '@/lib/routines';
import { getStats } from '@/lib/db/routines';
import { getCurrentUser } from '@/lib/auth';
import { parseLocalDate } from '@/lib/date-utils';
import RoutineCard from '@/components/RoutineCard';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';

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
        <div className="page-header dashboard-page-header">
          <h1 className="page-title">
            <span className="page-title-content">
              <span>Momentum</span>
              <Image 
                src="/cubo.png" 
                alt="Cubo" 
                width={32} 
                height={32} 
                className="page-title-icon"
              />
            </span>
          </h1>
          <div className="header-actions">
            <ThemeToggle />
            <a href="/history" className="header-icon" title="Ver historial">
              <History size={20} className="text-primary" />
            </a>
            <a href="/settings" className="header-icon" title="Gestionar rutinas">
              <ListPlus size={20} className="text-primary" />
            </a>
          </div>
        </div>
        
        <div className="page-subtitle dashboard-status-block">
          <p className="subtitle-text">Hoy con lo mínimo alcanza</p>
          {totalCount > 0 && (
            <div className="today-progress">
              <p className={`today-progress-hint ${completedCount === totalCount ? 'today-progress-done' : ''}`}>
                {completedCount === totalCount ? (
                  <>
                    Por hoy alcanza
                    <Check size={16} className="today-progress-check" />
                  </>
                ) : (
                  `${completedCount} de ${totalCount} cumplidas`
                )}
              </p>
              <div
                className="today-progress-track"
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-label="Progreso de rutinas de hoy"
              >
                <div
                  className="today-progress-fill"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="streak-inline">
            <span className="streak-inline-main">
              <strong>{stats.streak} {stats.streak === 1 ? 'día' : 'días'}</strong> · Racha actual
            </span>
            {stats.lastCompletedDate && (
              <span className="streak-inline-last">
                Último día: {parseLocalDate(stats.lastCompletedDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
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
          <div className="routines-list">
            {routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} userId={userId} />
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
