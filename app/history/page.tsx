/**
 * Página de historial - Muestra rachas y logs anteriores
 */

import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Flame } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAllLogs } from '@/lib/sheets-routines';
import { getUserRoutines } from '@/lib/sheets-routines';
import { getStats } from '@/lib/sheets-routines';
import type { DailyLog, Routine } from '@/lib/types';

interface LogWithRoutine extends DailyLog {
  routine: Routine | null;
}

interface DaySummary {
  date: string;
  logs: LogWithRoutine[];
  completedCount: number;
}

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userId = user.id;
  const allLogs = await getAllLogs(userId);
  const routines = await getUserRoutines(userId);
  const stats = await getStats(userId);

  // Crear un mapa de rutinas por ID
  const routinesMap = new Map(routines.map(r => [r.id, r]));

  // Agregar información de rutina a cada log
  const logsWithRoutines: LogWithRoutine[] = allLogs.map(log => ({
    ...log,
    routine: routinesMap.get(log.routineId) || null,
  }));

  // Agrupar logs por fecha
  const logsByDate = new Map<string, LogWithRoutine[]>();
  logsWithRoutines.forEach(log => {
    const existing = logsByDate.get(log.date) || [];
    existing.push(log);
    logsByDate.set(log.date, existing);
  });

  // Convertir a array y ordenar por fecha descendente
  const daySummaries: DaySummary[] = Array.from(logsByDate.entries())
    .map(([date, logs]) => ({
      date,
      logs,
      completedCount: logs.length,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calcular rachas históricas
  const streaks: Array<{ startDate: string; endDate: string; days: number }> = [];
  if (daySummaries.length > 0) {
    let currentStreakStart = daySummaries[0].date;
    let currentStreakEnd = daySummaries[0].date;
    let currentStreakDays = 1;

    for (let i = 1; i < daySummaries.length; i++) {
      const prevDate = new Date(daySummaries[i - 1].date);
      const currDate = new Date(daySummaries[i].date);
      const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Día consecutivo
        currentStreakDays++;
        currentStreakEnd = daySummaries[i].date;
      } else {
        // Se rompió la racha
        if (currentStreakDays > 1) {
          streaks.push({
            startDate: currentStreakStart,
            endDate: currentStreakEnd,
            days: currentStreakDays,
          });
        }
        currentStreakStart = daySummaries[i].date;
        currentStreakEnd = daySummaries[i].date;
        currentStreakDays = 1;
      }
    }

    // Agregar la última racha
    if (currentStreakDays > 1) {
      streaks.push({
        startDate: currentStreakStart,
        endDate: currentStreakEnd,
        days: currentStreakDays,
      });
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="page-header">
          <a href="/dashboard" className="header-icon" title="Volver al dashboard">
            <ArrowLeft size={20} className="text-primary" />
          </a>
          <h1 className="page-title">Historial</h1>
          <div style={{ width: '20px' }} /> {/* Spacer para centrar */}
        </div>

        <div className="page-subtitle">
          <p className="subtitle-text">Tus rachas y días cumplidos</p>
        </div>

        {/* Estadísticas generales */}
        <div className="history-stats">
          <div className="history-stat-item">
            <div className="history-stat-value">{stats.streak}</div>
            <div className="history-stat-label">Racha actual</div>
          </div>
          <div className="history-stat-item">
            <div className="history-stat-value">{daySummaries.length}</div>
            <div className="history-stat-label">Días cumplidos</div>
          </div>
          <div className="history-stat-item">
            <div className="history-stat-value">{streaks.length > 0 ? streaks[0].days : 0}</div>
            <div className="history-stat-label">Mejor racha</div>
          </div>
        </div>

        {/* Rachas históricas */}
        {streaks.length > 0 && (
          <div className="history-section">
            <h2 className="history-section-title">
              <Flame size={18} className="text-primary" style={{ marginRight: '0.5rem' }} />
              Rachas anteriores
            </h2>
            <div className="streaks-list">
              {streaks.map((streak, index) => (
                <div key={index} className="streak-item">
                  <div className="streak-days">{streak.days} días</div>
                  <div className="streak-dates">
                    {new Date(streak.startDate).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: streak.startDate !== streak.endDate ? 'numeric' : undefined,
                    })}
                    {streak.startDate !== streak.endDate && (
                      <>
                        {' - '}
                        {new Date(streak.endDate).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial por día */}
        <div className="history-section">
          <h2 className="history-section-title">
            <Calendar size={18} className="text-primary" style={{ marginRight: '0.5rem' }} />
            Días cumplidos
          </h2>
          <div className="days-list">
            {daySummaries.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">Aún no tenés días registrados</p>
                <p className="empty-state-hint">Cumplí tu primera rutina para empezar</p>
              </div>
            ) : (
              daySummaries.map((day) => (
                <div key={day.date} className="day-item">
                  <div className="day-header">
                    <div className="day-date">
                      {new Date(day.date).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="day-count">{day.completedCount} rutina{day.completedCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="day-routines">
                    {day.logs.map((log) => (
                      <div key={log.id} className="day-routine-item">
                        <span className="day-routine-name">
                          {log.routine?.title || 'Rutina eliminada'}
                        </span>
                        <span className="day-routine-value">
                          {log.value} {log.routine?.unit || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
