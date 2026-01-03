'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { undoCompleteRoutine } from '@/app/actions/undo';
import { useRouter } from 'next/navigation';

interface UndoToastProps {
  logId: string;
  userId: string;
  routineTitle: string;
  onUndo: () => void;
}

export default function UndoToast({ logId, userId, routineTitle, onUndo }: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [isUndoing, setIsUndoing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) {
      // Tiempo agotado, confirmar definitivamente
      onUndo();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onUndo]);

  const handleUndo = async () => {
    setIsUndoing(true);
    try {
      const result = await undoCompleteRoutine(logId, userId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deshaciendo:', error);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="undo-toast">
      <div className="undo-toast-content">
        <span className="undo-toast-icon">
          <Check size={20} />
        </span>
        <span className="undo-toast-text">
          {routineTitle} cumplida — Deshacer ({timeLeft}s)
        </span>
        <button
          onClick={handleUndo}
          disabled={isUndoing}
          className="undo-toast-button"
        >
          Deshacer
        </button>
      </div>
    </div>
  );
}
