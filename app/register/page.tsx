'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Crear el usuario
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al registrar usuario');
        setIsLoading(false);
        return;
      }

      // Iniciar sesión automáticamente después del registro
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/onboarding');
        router.refresh();
      } else {
        setError('Usuario creado, pero error al iniciar sesión. Por favor, inicia sesión manualmente.');
        setIsLoading(false);
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario');
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '420px', margin: '2rem auto' }}>
        <div className="page-header">
          <h1 className="page-title">Crear cuenta</h1>
        </div>

        <p className="page-subtitle" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Registrate para empezar con tus rutinas diarias
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '12px',
            color: '#c33',
            fontSize: '0.9375rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="onboarding-input"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="onboarding-input"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} />
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="onboarding-input"
              placeholder="Repetí tu contraseña"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {isLoading ? 'Creando cuenta...' : (
              <>
                Crear cuenta <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
