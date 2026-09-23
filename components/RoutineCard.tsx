'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ArrowRight, Play } from 'lucide-react';
import type { RoutineWithStatus } from '@/lib/types';
import RoutineDetailModal from './RoutineDetailModal';
import { CelebrationEffect } from './CelebrationEffect';

interface RoutineCardProps {
  routine: RoutineWithStatus;
  userId: string;
}

export default function RoutineCard({ routine, userId }: RoutineCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isLoading) {
      return;
    }

    if (routine.completed) {
      // Ya cumplida: abrir detalle solo para desmarcar
      setShowDetailModal(true);
      return;
    }

    if (routine.type === 'time') {
      // Ir directo al timer, sin pasar por el modal de detalle
      router.push(`/focus?routineId=${routine.id}`);
      return;
    }

    // Quantity: un solo toque la marca cumplida con el mínimo. Sin edición de valor.
    handleComplete();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/routines/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId: routine.id,
          type: 'quantity',
          value: routine.minValue,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setJustCompleted(true);
        setShowCelebration(true);
        setTimeout(() => setJustCompleted(false), 600);
        setTimeout(() => setShowCelebration(false), 2000);
        router.refresh();
      }
    } catch (error) {
      console.error('Error completando rutina:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showCelebration && !showDetailModal && (() => {
        const rect = cardRef.current?.getBoundingClientRect();
        return (
          <CelebrationEffect 
            originX={rect ? rect.left + rect.width / 2 : undefined}
            originY={rect ? rect.top + rect.height / 2 : undefined}
          />
        );
      })()}
      <div
        ref={cardRef}
        className={`routine-card ${routine.completed ? 'routine-completed' : ''} ${justCompleted ? 'just-completed' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`${routine.title}, ${routine.completed ? 'cumplida hoy' : 'pendiente'}`}
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
            {routine.completed ? 'Cumplido hoy' : 'Mínimo de hoy'}
          </span>
        </div>

        {!routine.completed && (
          <div className="routine-action">
            {isLoading ? (
              <span className="routine-action-text">Procesando...</span>
            ) : routine.type === 'time' ? (
              <span className="routine-action-text">
                <Play size={14} /> Empezar
              </span>
            ) : (
              <span className="routine-action-text">
                Tocar para completar <ArrowRight size={14} />
              </span>
            )}
          </div>
        )}
      </div>

      {showDetailModal && typeof window !== 'undefined' && createPortal(
        <RoutineDetailModal
          routine={routine}
          userId={userId}
          onClose={() => setShowDetailModal(false)}
          onRoutineCompleted={() => {
            setShowDetailModal(false);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
          }}
        />,
        document.body
      )}
    </>
  );
}
