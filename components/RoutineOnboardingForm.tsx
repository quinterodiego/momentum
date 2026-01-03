'use client';

import { useState } from 'react';
import { Timer, Hash } from 'lucide-react';
import { createRoutine } from '@/lib/sheets-routines';
import { useRouter } from 'next/navigation';

interface RoutineOnboardingFormProps {
  userId: string;
}

export default function RoutineOnboardingForm({ userId }: RoutineOnboardingFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'time' | 'quantity'>('time');
  const [minValue, setMinValue] = useState('10');
  const [unit, setUnit] = useState('min');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/routines/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: title.trim(),
          type,
          minValue: parseFloat(minValue) || 1,
          unit: type === 'time' ? 'min' : unit,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Error creando rutina:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="onboarding-form">
      <div className="onboarding-field">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Leer, Ejercicio, Agua..."
          className="onboarding-input"
          autoFocus
          disabled={isLoading}
        />
      </div>

      <div className="onboarding-field">
        <label className="onboarding-label">Tipo de rutina</label>
        <div className="onboarding-type-buttons">
          <button
            type="button"
            onClick={() => {
              setType('time');
              setUnit('min');
            }}
            className={`onboarding-type-btn ${type === 'time' ? 'onboarding-type-btn-active' : ''}`}
          >
            <Timer size={20} />
            Por tiempo
          </button>
          <button
            type="button"
            onClick={() => {
              setType('quantity');
              setUnit('vez');
            }}
            className={`onboarding-type-btn ${type === 'quantity' ? 'onboarding-type-btn-active' : ''}`}
          >
            <Hash size={20} />
            Por cantidad
          </button>
        </div>
      </div>

      <div className="onboarding-field">
        <label className="onboarding-label">
          Mínimo {type === 'time' ? '(minutos)' : '(cantidad)'}
        </label>
        <input
          type="number"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          min="1"
          className="onboarding-input"
          disabled={isLoading}
        />
      </div>

      {type === 'quantity' && (
        <div className="onboarding-field">
          <label className="onboarding-label">Unidad</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ej: carilla, litro, vez..."
            className="onboarding-input"
            disabled={isLoading}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="btn btn-primary onboarding-submit-btn"
      >
        {isLoading ? 'Creando...' : 'Crear rutina'}
      </button>
      <p className="onboarding-help-text">
        No te preocupes, podés cambiarlo después
      </p>
    </form>
  );
}
