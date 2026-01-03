'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError('Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '420px', margin: '2rem auto' }}>
        <div className="page-header">
          <h1 className="page-title">Iniciar sesión</h1>
        </div>

        <p className="page-subtitle" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Ingresá a tu cuenta para continuar
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

          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="onboarding-input"
              placeholder="Tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {isLoading ? 'Iniciando sesión...' : (
              <>
                Iniciar sesión <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <span>o</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            Iniciar sesión con Google
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            ¿No tenés cuenta?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Crear cuenta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
