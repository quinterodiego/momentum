import type { RoutineCompletionRate } from '@/lib/stats';

interface RoutineCompletionChartProps {
  data: RoutineCompletionRate[];
  days: number;
}

function statusColor(rate: number): string {
  if (rate >= 80) return 'var(--color-primary)';
  if (rate >= 50) return 'var(--color-yellow)';
  return 'var(--color-red)';
}

export default function RoutineCompletionChart({ data, days }: RoutineCompletionChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">Todavía no hay rutinas activas para medir</p>
      </div>
    );
  }

  return (
    <div className="completion-chart">
      <div className="completion-chart-legend">
        <span className="completion-legend-item">
          <span className="completion-legend-dot" style={{ background: 'var(--color-primary)' }} />
          Al día (≥80%)
        </span>
        <span className="completion-legend-item">
          <span className="completion-legend-dot" style={{ background: 'var(--color-yellow)' }} />
          Al límite (50-79%)
        </span>
        <span className="completion-legend-item">
          <span className="completion-legend-dot" style={{ background: 'var(--color-red)' }} />
          Flaqueando (&lt;50%)
        </span>
      </div>

      <div className="completion-chart-rows">
        {data.map((routine) => (
          <div key={routine.routineId} className="completion-bar-row">
            <div className="completion-bar-header">
              <span className="completion-bar-label">{routine.title}</span>
              <span className="completion-bar-value">{routine.rate}%</span>
            </div>
            <div
              className="completion-bar-track"
              role="img"
              aria-label={`${routine.title}: ${routine.rate}% de cumplimiento, ${routine.completedDays} de ${routine.dueDays} días en los últimos ${days} días`}
            >
              <div
                className="completion-bar-fill"
                style={{ width: `${routine.rate}%`, background: statusColor(routine.rate) }}
              />
            </div>
            <span className="completion-bar-caption">
              {routine.completedDays} de {routine.dueDays} días
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
