'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ValueInputModalProps {
  routineTitle: string;
  minValue: number;
  unit: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export default function ValueInputModal({
  routineTitle,
  minValue,
  unit,
  onConfirm,
  onCancel,
}: ValueInputModalProps) {
  const [value, setValue] = useState(minValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus en el input
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (numValue >= minValue) {
      onConfirm(numValue);
    }
  };

  const handleQuickValue = (multiplier: number) => {
    const quickValue = minValue * multiplier;
    setValue(quickValue.toString());
    inputRef.current?.focus();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{routineTitle}</h3>
          <button 
            onClick={onCancel}
            className="modal-close"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-question">¿Cuánto cumpliste?</p>
          <p className="modal-minimum">Mínimo: {minValue} {unit}</p>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-input-container">
              <label className="modal-label">{unit}</label>
              <input
                ref={inputRef}
                type="number"
                step="0.1"
                min={minValue}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="modal-input"
                placeholder={`${minValue}`}
                required
              />
            </div>

            <div className="modal-quick-values">
              <button
                type="button"
                onClick={() => handleQuickValue(1)}
                className={`modal-quick-btn ${Math.abs(parseFloat(value) - minValue) < 0.01 ? 'active' : ''}`}
              >
                {minValue} {unit}
              </button>
              <button
                type="button"
                onClick={() => handleQuickValue(1.5)}
                className={`modal-quick-btn ${Math.abs(parseFloat(value) - minValue * 1.5) < 0.01 ? 'active' : ''}`}
              >
                {minValue * 1.5} {unit}
              </button>
              <button
                type="button"
                onClick={() => handleQuickValue(2)}
                className={`modal-quick-btn ${Math.abs(parseFloat(value) - minValue * 2) < 0.01 ? 'active' : ''}`}
              >
                {minValue * 2} {unit}
              </button>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary modal-action-btn"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!value || parseFloat(value) < minValue}
                className="btn btn-primary modal-action-btn"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
