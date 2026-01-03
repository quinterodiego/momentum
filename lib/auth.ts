/**
 * Utilidades de autenticación
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const userId = (session.user as any).id || session.user.email!;
  return { ...session.user, id: userId };
}

