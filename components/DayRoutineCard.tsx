'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import type { RoutineWithStatus } from '@/lib/types';

interface DayRoutineCardProps {
  routine: RoutineWithStatus;
  date: string;
}

/**
 * Versión recortada de RoutineCard para editar un día pasado: un solo
 * toque alterna cumplida/pendiente para `date` (no navega a /focus — no
 * tiene sentido cronometrar un día que ya pasó, se marca directo con el
 * mínimo, igual que ya hace el botón "Completar" del timer hoy). Sin
 * modal de detalle: acá alcanza con marcar/desmarcar.
 */
export default function DayRoutineCard({ routine, date }: DayRoutineCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (routine.completed && routine.todayLog) {
        const response = await fetch('/api/routines/unmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId: routine.todayLog.id }),
        });
        if (response.ok) {
          router.refresh();
        }
      } else {
        const response = await fetch('/api/routines/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routineId: routine.id,
            type: routine.type,
            value: routine.minValue,
            date,
          }),
        });
        const result = await response.json();
        if (result.success) {
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error editando rutina del día:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`routine-card ${routine.completed ? 'routine-completed' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${routine.title}, ${routine.completed ? 'cumplida' : 'pendiente'} ese día`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="routine-header">
        <h3 className="routine-title">{routine.title}</h3>
        {routine.completed && (
          <span className="routine-check">
            <Check size={22} />
          </span>
        )}
      </div>

      <div className="routine-value-block">
        <span className="routine-value-number">
          {routine.completed && routine.todayLog ? routine.todayLog.value : routine.minValue}{' '}
          {routine.unit}
        </span>
        <span className="routine-value-label">
          {routine.completed ? 'Cumplida ese día' : 'Mínimo'}
        </span>
      </div>

      <div className="routine-action">
        <span className="routine-action-text">
          {isLoading
            ? 'Procesando...'
            : routine.completed
            ? 'Tocar para desmarcar'
            : 'Tocar para marcar cumplida'}
        </span>
      </div>
    </div>
  );
}
