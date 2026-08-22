'use client';

import type { Stats } from '@/lib/types';

interface StatsDisplayProps {
  stats: Stats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="streak-panel">
      <div className="streak-panel-value">
        {stats.streak} {stats.streak === 1 ? 'día' : 'días'}
      </div>
      <div className="streak-panel-label">Racha actual</div>
      {stats.lastCompletedDate && (
        <div className="streak-panel-last">
          Último día:{' '}
          {new Date(stats.lastCompletedDate).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
          })}
        </div>
      )}
    </div>
  );
}

