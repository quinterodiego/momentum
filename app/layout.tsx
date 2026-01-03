import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Momentum - Rutinas Diarias',
  description: 'Cumplir el tiempo es éxito, no terminar la tarea',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

