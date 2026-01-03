'use client';

import { useEffect, useState } from 'react';
import { completeTimeRoutine, abandonTimeRoutine } from '@/app/actions/routines';
import { useRouter } from 'next/navigation';
import UndoToast from './UndoToast';
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
  const [showUndo, setShowUndo] = useState(false);
  const [undoLogId, setUndoLogId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (remainingMs <= 0 && !isCompleted) {
      // Auto-completar cuando llega a 0
      setIsCompleted(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      completeTimeRoutine(routineId, userId, duration).then((result) => {
        if (result.success) {
          setUndoLogId(result.logId);
          setShowUndo(true);
          router.refresh();
        }
      });
      return;
    }

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const newRemaining = prev - 1000;
        if (newRemaining <= 0) {
          setIsCompleted(true);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
          completeTimeRoutine(routineId, userId, duration).then((result) => {
            if (result.success) {
              setUndoLogId(result.logId);
              setShowUndo(true);
              router.refresh();
            }
          });
          return 0;
        }
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [routineId, userId, duration, isCompleted, remainingMs, router]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const percentage = (remainingMs / (duration * 60 * 1000)) * 100;

  const handleComplete = async () => {
    if (isCompleted) return;
    
    const actualMinutes = duration - (remainingMs / 60000);
    setIsCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    const result = await completeTimeRoutine(routineId, userId, Math.max(actualMinutes, duration));
    
    // Si se completó exitosamente, mostrar undo toast
    if (result.success) {
      setUndoLogId(result.logId);
      setShowUndo(true);
      router.refresh();
    }
  };

  const handleAbandon = () => {
    abandonTimeRoutine(routineId, userId);
  };

  const handleUndoTimeout = () => {
    setShowUndo(false);
    setUndoLogId(null);
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

        {showUndo && undoLogId && (
          <UndoToast
            logId={undoLogId}
            userId={userId}
            routineTitle={routineTitle}
            onUndo={handleUndoTimeout}
          />
        )}
      </div>
    </>
  );
}
