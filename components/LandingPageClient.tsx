'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Timer, RefreshCw, Target, Flame, Check } from 'lucide-react';
import SignInButton from '@/components/SignInButton';
import LandingFooter from '@/components/LandingFooter';
import LoginModal from '@/components/LoginModal';

export default function LandingPageClient() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-wrapper">
              <div className="hero-image">
                <Image
                  src="/hero-banner.png"
                  alt="Momentum - Rutinas diarias mínimas"
                  width={1200}
                  height={600}
                  priority
                  className="hero-banner-image"
                />
              </div>
              <div className="hero-content">
                <h1 className="hero-title">Momentum</h1>
                <p className="hero-subtitle">
                  Rutinas diarias mínimas. Sin presión, sin culpa.
                </p>
                <p className="hero-description">
                  Cumplir el mínimo diario es éxito. No existe "fallar", solo "no registrar hoy".
                </p>
                <div className="hero-cta">
                  <SignInButton onEmailClick={() => setIsLoginModalOpen(true)} />
                  <p className="hero-cta-subtitle">
                    Gratis. Sin tarjetas. Sin compromiso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Cómo funciona</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <RefreshCw size={32} />
                </div>
                <h3 className="feature-title">Rutinas diarias</h3>
                <p className="feature-description">
                  Creá rutinas mínimas que se repiten cada día. Por tiempo o por cantidad.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Target size={32} />
                </div>
                <h3 className="feature-title">Mínimos, no máximos</h3>
                <p className="feature-description">
                  El objetivo es cumplir el mínimo diario. No hay perfección, solo constancia.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Timer size={32} />
                </div>
                <h3 className="feature-title">Flexible</h3>
                <p className="feature-description">
                  Rutinas por tiempo (10 min) o por cantidad (1 litro). Vos elegís.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Flame size={32} />
                </div>
                <h3 className="feature-title">Rachas diarias</h3>
                <p className="feature-description">
                  Cada día que cumplís suma a tu racha. Sin presión, sin culpa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="philosophy-section">
          <div className="container">
            <h2 className="section-title">Nuestra filosofía</h2>
            <div className="philosophy-content">
              <div className="philosophy-item">
                <div className="philosophy-icon">
                  <Check size={24} />
                </div>
                <div className="philosophy-item-content">
                  <h3 className="philosophy-title">No existe "fallar"</h3>
                  <p className="philosophy-text">
                    Solo existe "no registrar hoy". Cada día empieza limpio. No hay atrasos, no hay días fallidos.
                  </p>
                </div>
              </div>
              <div className="philosophy-item">
                <div className="philosophy-icon">
                  <Check size={24} />
                </div>
                <div className="philosophy-item-content">
                  <h3 className="philosophy-title">El mínimo alcanza</h3>
                  <p className="philosophy-text">
                    No necesitás hacer más. Cumplir el mínimo diario es éxito. La perfección no existe.
                  </p>
                </div>
              </div>
              <div className="philosophy-item">
                <div className="philosophy-icon">
                  <Check size={24} />
                </div>
                <div className="philosophy-item-content">
                  <h3 className="philosophy-title">Rutinas, no tareas</h3>
                  <p className="philosophy-text">
                    No hay pendientes acumulados. Solo rutinas que se repiten cada día. Simple y sostenible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2 className="cta-title">¿Listo para empezar?</h2>
              <p className="cta-description">
                No necesitás planificar nada. Solo empezá.
              </p>
              <div className="cta-buttons">
                <SignInButton onEmailClick={() => setIsLoginModalOpen(true)} />
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
