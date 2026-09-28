'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import type { RoutineWithStatus } from '@/lib/types';

interface DayRoutineCardProps {
  routine: RoutineWithStatus;
  date: string;
  maxDate: string;
}

/**
 * Versión recortada de RoutineCard para editar un día pasado: un solo
 * toque alterna cumplida/pendiente para `date` (no navega a /focus — no
 * tiene sentido cronometrar un día que ya pasó, se marca directo con el
 * mínimo, igual que ya hace el botón "Completar" del timer hoy). Sin
 * modal de detalle: acá alcanza con marcar/desmarcar, y si ya está
 * cumplida, con moverla a otra fecha.
 */
export default function DayRoutineCard({ routine, date, maxDate }: DayRoutineCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [moveDate, setMoveDate] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);

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

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!moveDate || !routine.todayLog || isLoading) return;

    setIsLoading(true);
    setMoveError(null);
    try {
      const response = await fetch('/api/routines/move-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: routine.todayLog.id, date: moveDate }),
      });
      const result = await response.json();
      if (result.success) {
        router.refresh();
      } else {
        setMoveError(result.error || 'No se pudo mover');
      }
    } catch (error) {
      console.error('Error moviendo rutina de fecha:', error);
      setMoveError('No se pudo mover');
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

      {routine.completed && !showMove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMove(true);
          }}
          className="day-move-trigger"
        >
          Mover a otro día
        </button>
      )}

      {routine.completed && showMove && (
        <form
          onSubmit={handleMoveSubmit}
          onClick={(e) => e.stopPropagation()}
          className="day-move-form"
        >
          <input
            type="date"
            value={moveDate}
            max={maxDate}
            onChange={(e) => setMoveDate(e.target.value)}
            className="onboarding-input"
            required
          />
          <div className="day-move-actions">
            <button type="submit" className="btn btn-primary" disabled={!moveDate || isLoading}>
              Mover
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setShowMove(false);
                setMoveError(null);
              }}
            >
              Cancelar
            </button>
          </div>
          {moveError && <p className="day-move-error">{moveError}</p>}
        </form>
      )}
    </div>
  );
}
