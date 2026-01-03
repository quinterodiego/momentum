'use client';

import type { Stats } from '@/lib/types';

interface StatsDisplayProps {
  stats: Stats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="stats-grid">
      <div className="stat-item">
        <div className="stat-value">{stats.streak}</div>
        <div className="stat-label">Días de racha</div>
      </div>
      {stats.lastCompletedDate && (
        <div className="stat-item">
          <div className="stat-value">
            {new Date(stats.lastCompletedDate).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short'
            })}
          </div>
          <div className="stat-label">Último día</div>
        </div>
      )}
    </div>
  );
}

