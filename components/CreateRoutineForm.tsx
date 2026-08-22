'use client';

import { useState } from 'react';
import { Timer, Hash, Plus } from 'lucide-react';
import { createUserRoutine } from '@/app/actions/routines-management';
import { useRouter } from 'next/navigation';
import DaySelector from './DaySelector';

interface CreateRoutineFormProps {
  userId: string;
}

export default function CreateRoutineForm({ userId }: CreateRoutineFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'time' | 'quantity'>('time');
  const [minValue, setMinValue] = useState('10');
  const [unit, setUnit] = useState('min');
  const [scheduledDays, setScheduledDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await createUserRoutine(
        userId,
        title.trim(),
        type,
        parseFloat(minValue) || 1,
        type === 'time' ? 'min' : unit,
        scheduledDays.length === 7 ? [] : scheduledDays
      );

      // Limpiar formulario
      setTitle('');
      setMinValue('10');
      setUnit('min');
      setType('time');
      setScheduledDays([1, 2, 3, 4, 5, 6, 0]);
      
      // Refrescar para mostrar la nueva rutina
      router.refresh();
    } catch (error) {
      console.error('Error creando rutina:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="routine-form">
      <div className="form-group">
        <label className="form-question-label" htmlFor="routine-title">
          ¿Qué querés hacer?
        </label>
        <input
          id="routine-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Leer, Ejercicio, Tomar agua..."
          className="onboarding-input"
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-question-label">¿Cómo la medís?</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setType('time');
              setUnit('min');
            }}
            className={`btn ${type === 'time' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, maxWidth: 'none', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
          >
            <Timer size={18} />
            Tiempo
          </button>
          <button
            type="button"
            onClick={() => {
              setType('quantity');
              setUnit('vez');
            }}
            className={`btn ${type === 'quantity' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, maxWidth: 'none', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
          >
            <Hash size={18} />
            Cantidad
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-question-label" htmlFor="routine-minvalue">
            ¿Cuál es tu mínimo?
          </label>
          <input
            id="routine-minvalue"
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            min="1"
            className="onboarding-input"
            disabled={isLoading}
            required
          />
          <span className="form-hint">{type === 'time' ? 'minutos' : unit || 'unidad'}</span>
        </div>

        {type === 'quantity' && (
          <div className="form-group">
            <label className="form-question-label" htmlFor="routine-unit">
              Unidad
            </label>
            <input
              id="routine-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ej: carilla, litro, vez..."
              className="onboarding-input"
              disabled={isLoading}
              required
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-question-label">¿Qué días?</label>
        <DaySelector
          selectedDays={scheduledDays}
          onChange={setScheduledDays}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="btn btn-primary mt-2"
        style={{ 
          fontSize: '1.125rem',
          padding: '1.25rem 2.5rem',
          minHeight: '52px', /* Más alto - elemento principal */
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center'
        }}
      >
        {isLoading ? 'Creando...' : (
          <>
            <Plus size={18} />
            Crear rutina
          </>
        )}
      </button>
      <p className="mt-2 text-sm opacity-60 text-center">
        Menos es más. Con esto alcanza.
      </p>
    </form>
  );
}
