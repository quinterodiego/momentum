'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DayJumpFormProps {
  maxDate: string; // YYYY-MM-DD, no se puede editar el futuro
}

/**
 * Selector de fecha para ir a editar un día que todavía no tiene ningún
 * log (por eso no aparece en "Días cumplidos") y cargar ahí la primera
 * rutina que se olvidó marcar.
 */
export default function DayJumpForm({ maxDate }: DayJumpFormProps) {
  const router = useRouter();
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    router.push(`/day?date=${date}`);
  };

  return (
    <form onSubmit={handleSubmit} className="day-jump-form">
      <label htmlFor="day-jump-date" className="day-jump-label">
        ¿Te olvidaste de marcar un día?
      </label>
      <div className="day-jump-controls">
        <input
          id="day-jump-date"
          type="date"
          value={date}
          max={maxDate}
          onChange={(e) => setDate(e.target.value)}
          className="onboarding-input"
          required
        />
        <button type="submit" className="btn btn-secondary" disabled={!date}>
          Editar día
        </button>
      </div>
    </form>
  );
}
