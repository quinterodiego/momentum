'use client';

import { useEffect, useState } from 'react';
import { completeTimebox, abandonTimebox } from '@/app/actions/timebox';
import type { TimeboxDuration } from '@/lib/types';

interface FocusTimerProps {
  timeboxId: string;
  userId: string;
  duration: TimeboxDuration;
  remainingMs: number;
}

export default function FocusTimer({
  timeboxId,
  userId,
  duration,
  remainingMs: initialRemainingMs,
}: FocusTimerProps) {
  const [remainingMs, setRemainingMs] = useState(initialRemainingMs);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (remainingMs <= 0 && !isCompleted) {
      // Auto-completar cuando llega a 0
      setIsCompleted(true);
      completeTimebox(timeboxId, userId);
      return;
    }

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const newRemaining = prev - 1000;
        if (newRemaining <= 0) {
          setIsCompleted(true);
          completeTimebox(timeboxId, userId);
          return 0;
        }
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeboxId, userId, isCompleted, remainingMs]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const percentage = (remainingMs / (duration * 60 * 1000)) * 100;

  const handleComplete = () => {
    setIsCompleted(true);
    completeTimebox(timeboxId, userId);
  };

  const handleAbandon = () => {
    abandonTimebox(timeboxId, userId);
  };

  return (
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
          {duration} minutos de enfoque
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
          ¡Cumpliste el tiempo! Eso alcanza.
        </p>
      )}
    </div>
  );
}

