'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
        onClose();
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError('Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    onClose();
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div 
        className="modal-content login-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Iniciar sesión</h3>
          <button 
            onClick={onClose}
            className="modal-close"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="login-modal-subtitle">
            Ingresá a tu cuenta para continuar
          </p>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="onboarding-field">
              <label className="onboarding-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

            <div className="onboarding-field">
              <label className="onboarding-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              style={{ width: '100%', marginBottom: '' }}
            >
              {isLoading ? 'Iniciando sesión...' : (
                <>
                  Iniciar sesión <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span>o</span>
              <div className="login-divider-line" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '' }}
            >
              Iniciar sesión con Google
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              ¿No tenés cuenta?{' '}
              <Link 
                href="/register" 
                onClick={onClose}
                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
              >
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
