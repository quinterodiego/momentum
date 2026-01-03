'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import type { RoutineWithStatus } from '@/lib/types';
import UndoToast from './UndoToast';
import ValueInputModal from './ValueInputModal';
import EditValueModal from './EditValueModal';
import RoutineDetailModal from './RoutineDetailModal';
import { CelebrationEffect } from './CelebrationEffect';

interface RoutineCardProps {
  routine: RoutineWithStatus;
  userId: string;
}

export default function RoutineCard({ routine, userId }: RoutineCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [undoLogId, setUndoLogId] = useState<string | null>(null);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = async () => {
    if (isLoading) {
      return;
    }
    // Abrir modal de detalles
    setShowDetailModal(true);
  };

  const handleConfirmValue = async (value: number) => {
    setShowValueModal(false);
    setIsLoading(true);
    try {
      const response = await fetch('/api/routines/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId: routine.id,
          type: 'quantity',
          value: value,
        }),
      });
      const result = await response.json();
      
      if (result.success && result.logId) {
        setUndoLogId(result.logId);
        setShowUndo(true);
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

  const handleEditValue = async (newValue: number) => {
    setShowEditModal(false);
    setIsLoading(true);
    try {
      const response = await fetch('/api/routines/update-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: routine.todayLog?.id,
          value: newValue,
        }),
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error actualizando valor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoTimeout = () => {
    setShowUndo(false);
    setUndoLogId(null);
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
      >
        <div className="routine-header">
          <h3 className="routine-title">{routine.title}</h3>
          {routine.completed && (
            <span className="routine-check">
              <Check size={24} />
            </span>
          )}
        </div>
        
        <div className="routine-info">
          <span className="routine-minimum">
            Mínimo: {routine.minValue} {routine.unit}
          </span>
          {routine.completed && routine.todayLog && (
            <span className="routine-value">
              Cumpliste: {routine.todayLog.value} {routine.unit}
              {routine.todayLog.value > routine.minValue && (
                <span className="routine-extra" title="Tocar para editar">
                  {' '}(+{((routine.todayLog.value / routine.minValue - 1) * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          )}
        </div>

        {!routine.completed && (
          <div className="routine-action">
            {isLoading ? (
              <span className="routine-action-text">Procesando...</span>
            ) : routine.type === 'time' ? (
              <span className="routine-action-text">Tocar para empezar timer</span>
            ) : (
              <span className="routine-action-text">Tocar para marcar como cumplida</span>
            )}
          </div>
        )}

        {showUndo && undoLogId && (
          <UndoToast
            logId={undoLogId}
            userId={userId}
            routineTitle={routine.title}
            onUndo={handleUndoTimeout}
          />
        )}

        {showValueModal && (
          <ValueInputModal
            routineTitle={routine.title}
            minValue={routine.minValue}
            unit={routine.unit}
            onConfirm={handleConfirmValue}
            onCancel={() => setShowValueModal(false)}
          />
        )}

        {showEditModal && routine.todayLog && (
          <EditValueModal
            routineTitle={routine.title}
            currentValue={routine.todayLog.value || routine.minValue}
            unit={routine.unit}
            onConfirm={handleEditValue}
            onCancel={() => setShowEditModal(false)}
          />
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
