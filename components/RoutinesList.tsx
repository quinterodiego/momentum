'use client';

import { useState } from 'react';
import { Timer, Hash, Pencil, Ban } from 'lucide-react';
import { updateUserRoutine, deactivateUserRoutine } from '@/app/actions/routines-management';
import { useRouter } from 'next/navigation';
import type { Routine } from '@/lib/types';
import DaySelector from './DaySelector';

interface RoutinesListProps {
  routines: Routine[];
  userId: string;
}

export default function RoutinesList({ routines, userId }: RoutinesListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMinValue, setEditMinValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editScheduledDays, setEditScheduledDays] = useState<number[]>([]);

  const activeRoutines = routines.filter(r => r.active);
  const inactiveRoutines = routines.filter(r => !r.active);

  const handleEdit = (routine: Routine) => {
    setEditingId(routine.id);
    setEditTitle(routine.title);
    setEditMinValue(routine.minValue.toString());
    setEditUnit(routine.unit);
    // Si scheduledDays está vacío, mostrar todos seleccionados para edición
    setEditScheduledDays(
      routine.scheduledDays && routine.scheduledDays.length > 0
        ? routine.scheduledDays
        : [1, 2, 3, 4, 5, 6, 0]
    );
  };

  const handleSave = async (routineId: string) => {
    try {
      await updateUserRoutine(routineId, {
        title: editTitle,
        minValue: parseFloat(editMinValue) || 1,
        unit: editUnit,
        scheduledDays: editScheduledDays.length === 7 ? [] : editScheduledDays,
      });
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error('Error actualizando rutina:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDeactivate = async (routineId: string) => {
    if (confirm('¿Desactivar esta rutina? No se eliminará, solo dejará de aparecer en el dashboard.')) {
      try {
        // Agregar animación de fade out
        const routineElement = document.querySelector(`[data-routine-id="${routineId}"]`);
        if (routineElement) {
          routineElement.classList.add('fade-out');
          setTimeout(async () => {
            await deactivateUserRoutine(routineId);
            router.refresh();
          }, 300);
        } else {
          await deactivateUserRoutine(routineId);
          router.refresh();
        }
      } catch (error) {
        console.error('Error desactivando rutina:', error);
      }
    }
  };

  return (
    <div className="routines-list">
      {activeRoutines.map((routine) => (
        <div key={routine.id} className="routine-item" data-routine-id={routine.id}>
          {editingId === routine.id ? (
            <div className="routine-edit-form">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="onboarding-input"
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="number"
                  value={editMinValue}
                  onChange={(e) => setEditMinValue(e.target.value)}
                  className="onboarding-input"
                  style={{ flex: 1 }}
                  min="1"
                />
                {routine.type === 'quantity' && (
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="onboarding-input"
                    style={{ flex: 1 }}
                  />
                )}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <p className="form-label" style={{ marginBottom: '0.4rem' }}>Días de la semana</p>
                <DaySelector
                  selectedDays={editScheduledDays}
                  onChange={setEditScheduledDays}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSave(routine.id)}
                  className="btn btn-primary"
                  style={{ flex: 1, maxWidth: 'none', padding: '0.75rem' }}
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  style={{ flex: 1, maxWidth: 'none', padding: '0.75rem' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="routine-item-content">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="routine-title" style={{ marginBottom: '0.5rem' }}>{routine.title}</h3>
                <p className="routine-info-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {routine.type === 'time' ? <Timer size={16} /> : <Hash size={16} />}
                  Mínimo: {routine.minValue} {routine.unit}
                </p>
                <div style={{ marginTop: '0.5rem' }}>
                  <DaySelector
                    selectedDays={routine.scheduledDays ?? []}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              </div>
              <div className="routine-item-actions">
                <button
                  onClick={() => handleEdit(routine)}
                  className="routine-action-btn"
                  title="Editar"
                  aria-label="Editar rutina"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDeactivate(routine.id)}
                  className="routine-action-btn"
                  title="Desactivar"
                  aria-label="Desactivar rutina"
                >
                  <Ban size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {inactiveRoutines.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm opacity-60 mb-2">Rutinas desactivadas</h3>
          {inactiveRoutines.map((routine) => (
            <div key={routine.id} className="routine-item routine-item-inactive">
              <div>
                <h3 className="routine-title" style={{ opacity: 0.6 }}>
                  {routine.title}
                </h3>
                <p className="routine-info-text" style={{ opacity: 0.5 }}>
                  {routine.minValue} {routine.unit} (desactivada)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
