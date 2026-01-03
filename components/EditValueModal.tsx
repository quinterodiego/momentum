'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface EditValueModalProps {
  routineTitle: string;
  currentValue: number;
  unit: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

export default function EditValueModal({
  routineTitle,
  currentValue,
  unit,
  onConfirm,
  onCancel,
}: EditValueModalProps) {
  const [value, setValue] = useState(currentValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (numValue > 0) {
      onConfirm(numValue);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Editar valor</h3>
          <button 
            onClick={onCancel}
            className="modal-close"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="modal-subtitle">{routineTitle}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-input-wrapper">
            <div className="modal-input-group">
              <input
                ref={inputRef}
                type="number"
                step="0.1"
                min="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="modal-input"
                required
              />
              <span className="modal-unit">{unit}</span>
            </div>
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
              disabled={!value || parseFloat(value) <= 0}
              className="btn btn-primary modal-action-btn"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
