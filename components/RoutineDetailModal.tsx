'use client';

import { X, Timer, Hash, Check, XCircle } from 'lucide-react';
import type { RoutineWithStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface RoutineDetailModalProps {
  routine: RoutineWithStatus;
  userId: string;
  onClose: () => void;
  onRoutineCompleted?: () => void; // Callback cuando se completa la rutina
}

export default function RoutineDetailModal({
  routine,
  userId,
  onClose,
  onRoutineCompleted,
}: RoutineDetailModalProps) {
  const router = useRouter();

  const handleStartTime = () => {
    router.push(`/focus?routineId=${routine.id}`);
  };

  const handleMarkComplete = async () => {
    // Solo marca cumplida con el mínimo. No se puede editar el valor desde acá:
    // eso se hace desde la sección de edición de la rutina (Ajustes).
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
        onClose();
        if (onRoutineCompleted) {
          onRoutineCompleted();
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Error completando rutina:', error);
    }
  };

  const handleUnmark = async () => {
    if (!routine.todayLog?.id) {
      return;
    }

    try {
      const response = await fetch('/api/routines/unmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: routine.todayLog.id,
        }),
      });

      if (response.ok) {
        onClose();
        router.refresh();
      } else {
        console.error('Error desmarcando rutina');
      }
    } catch (error) {
      console.error('Error desmarcando rutina:', error);
    }
  };

  return (
      <div
        className="modal-overlay"
        onClick={(e) => {
          // Solo cerrar si el click es directamente en el overlay, no en el contenido
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="modal-title">{routine.title}</h3>
            <button 
              onClick={onClose}
              className="modal-close"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="routine-detail-info">
              <div className="routine-detail-item">
                <span className="routine-detail-label">Tipo:</span>
                <span className="routine-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {routine.type === 'time' ? (
                    <>
                      <Timer size={18} />
                      Por tiempo
                    </>
                  ) : (
                    <>
                      <Hash size={18} />
                      Por cantidad
                    </>
                  )}
                </span>
              </div>
              
              <div className="routine-detail-item">
                <span className="routine-detail-label">Mínimo:</span>
                <span className="routine-detail-value">
                  {routine.minValue} {routine.unit}
                </span>
              </div>

              {routine.completed && routine.todayLog && (
                <div className="routine-detail-item">
                  <span className="routine-detail-label">Cumpliste hoy:</span>
                  <span className="routine-detail-value routine-detail-completed">
                    {routine.todayLog.value} {routine.unit}
                  </span>
                </div>
              )}

              {!routine.completed && (
                <div className="routine-detail-status">
                  <span className="routine-detail-status-text">Pendiente</span>
                </div>
              )}

              {routine.completed && (
                <div className="routine-detail-status">
                  <span className="routine-detail-status-text routine-detail-status-completed" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Check size={18} />
                    Completada
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {routine.type === 'time' && !routine.completed && (
                <button
                  onClick={handleStartTime}
                  className="btn btn-primary modal-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Timer size={18} />
                  Empezar timer
                </button>
              )}
              
              {routine.type === 'quantity' && !routine.completed && (
                <button
                  onClick={handleMarkComplete}
                  className="btn btn-primary modal-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Check size={18} />
                  Marcar como cumplida
                </button>
              )}

              {routine.completed && (
                <button
                  onClick={handleUnmark}
                  className="btn btn-secondary modal-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--text-secondary)' }}
                >
                  <XCircle size={18} />
                  Desmarcar como pendiente
                </button>
              )}

              <button
                onClick={onClose}
                className="btn btn-secondary modal-action-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
