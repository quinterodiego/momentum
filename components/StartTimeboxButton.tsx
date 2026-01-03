'use client';

import { startTimebox } from '@/app/actions/timebox';
import { useState } from 'react';

interface StartTimeboxButtonProps {
  userId: string;
}

export default function StartTimeboxButton({ userId }: StartTimeboxButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await startTimebox(userId);
    } catch (error) {
      console.error('Error iniciando timebox:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="btn btn-primary"
    >
      {isLoading ? 'Preparando...' : 'Estoy procrastinando'}
    </button>
  );
}

