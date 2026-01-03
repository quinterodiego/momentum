'use client';

import { useState } from 'react';
import { createUserTask } from '@/app/actions/tasks';
import { useRouter } from 'next/navigation';

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createUserTask(userId, title.trim());
      
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        console.error('Error:', result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creando tarea:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej: Estudiar para el examen, Limpiar la casa..."
        className="onboarding-input"
        autoFocus
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="btn btn-primary mt-2"
      >
        {isLoading ? 'Creando...' : 'Empezar'}
      </button>
      <p className="mt-2 text-sm opacity-60">
        No te preocupes, podés cambiarlo después
      </p>
    </form>
  );
}

