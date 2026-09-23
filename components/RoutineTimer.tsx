'use client';

import { useEffect, useRef, useState } from 'react';
import { completeTimeRoutine, abandonTimeRoutine } from '@/app/actions/routines';
import { useRouter } from 'next/navigation';
import { CelebrationEffect } from './CelebrationEffect';

interface RoutineTimerProps {
  routineId: string;
  userId: string;
  duration: number; // en minutos
  routineTitle: string;
}

export default function RoutineTimer({
  routineId,
  userId,
  duration,
  routineTitle,
}: RoutineTimerProps) {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState(duration * 60 * 1000);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Evita disparar completeTimeRoutine más de una vez (llegada natural a 0 + click manual)
  const hasCompletedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finishRoutine = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);

    // Se registra siempre el mínimo planificado: completar (a tiempo o antes) cuenta como cumplido.
    completeTimeRoutine(routineId, userId, duration).then((result) => {
      if (result.success) {
        router.refresh();
      }
    });
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemainingMs((prev) => {
        const newRemaining = prev - 1000;
        if (newRemaining <= 0) {
          finishRoutine();
          return 0;
        }
        return newRemaining;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Se crea un único interval al montar; finishRoutine se guarda por ref para evitar duplicados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const percentage = (remainingMs / (duration * 60 * 1000)) * 100;

  const handleComplete = () => {
    finishRoutine();
  };

  const handleAbandon = () => {
    abandonTimeRoutine(routineId, userId);
  };

  return (
    <>
      {showCelebration && <CelebrationEffect />}
      <div className="mt-4">
        {/* Timer visual */}
        <div className="mb-8">
          <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="timer-progress">
            <div
              className="timer-progress-bar"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="opacity-70 text-sm font-semibold uppercase tracking-wide">
            {duration} {routineTitle.toLowerCase().includes('min') ? 'minutos' : routineTitle}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className="btn btn-primary"
          >
            Completar
          </button>
          <button
            onClick={handleAbandon}
            disabled={isCompleted}
            className="btn btn-secondary"
          >
            Parar (también es progreso)
          </button>
        </div>

        {isCompleted && (
          <p className="mt-4 text-lg opacity-80">
            Cumpliste el mínimo. Eso alcanza.
          </p>
        )}
      </div>
    </>
  );
}
