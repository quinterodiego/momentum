'use client';

import { signIn } from 'next-auth/react';

interface SignInButtonProps {
  onEmailClick?: () => void;
}

export default function SignInButton({ onEmailClick }: SignInButtonProps) {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleEmailSignIn = () => {
    if (onEmailClick) {
      onEmailClick();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
      <button
        onClick={handleEmailSignIn}
        className="btn btn-primary hero-cta-button"
        style={{ 
          padding: '1.125rem 2.5rem',
          width: '100%',
          fontSize: '1.0625rem',
          fontWeight: 600
        }}
      >
        Iniciar sesión
      </button>
      <button
        onClick={handleGoogleSignIn}
        className="btn btn-secondary"
        style={{ 
          padding: '1rem 2.5rem',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 500
        }}
      >
        Continuar con Google
      </button>
    </div>
  );
}

