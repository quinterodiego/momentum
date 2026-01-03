'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="btn btn-secondary"
      style={{ 
        maxWidth: '200px', 
        marginTop: '1rem',
        fontSize: '0.9rem',
        padding: '0.75rem 1.5rem'
      }}
    >
      Cerrar sesión
    </button>
  );
}

