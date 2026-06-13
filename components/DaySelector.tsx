'use client';

// 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
const DAYS = [
  { value: 1, label: 'L', full: 'Lunes' },
  { value: 2, label: 'M', full: 'Martes' },
  { value: 3, label: 'X', full: 'Miércoles' },
  { value: 4, label: 'J', full: 'Jueves' },
  { value: 5, label: 'V', full: 'Viernes' },
  { value: 6, label: 'S', full: 'Sábado' },
  { value: 0, label: 'D', full: 'Domingo' },
];

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function DaySelector({ selectedDays, onChange, disabled, readOnly }: DaySelectorProps) {
  // Si el array está vacío, todos los días están activos (cada día)
  const effectiveDays = selectedDays.length === 0 ? DAYS.map(d => d.value) : selectedDays;

  const toggleDay = (day: number) => {
    if (readOnly || disabled) return;
    if (effectiveDays.includes(day)) {
      const next = effectiveDays.filter(d => d !== day);
      // Si queda vacío, mantener el último día seleccionado
      if (next.length === 0) return;
      onChange(next);
    } else {
      onChange([...effectiveDays, day]);
    }
  };

  return (
    <div className="day-selector">
      {DAYS.map(({ value, label, full }) => {
        const isActive = effectiveDays.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggleDay(value)}
            disabled={disabled}
            className={`day-btn${isActive ? ' day-btn-active' : ''}${readOnly ? ' day-btn-readonly' : ''}`}
            title={full}
            aria-label={full}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
