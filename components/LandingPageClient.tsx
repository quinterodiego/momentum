'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Timer, Hash } from 'lucide-react';
import SignInButton from '@/components/SignInButton';
import LandingFooter from '@/components/LandingFooter';
import LoginModal from '@/components/LoginModal';

const EXAMPLES = [
  { title: 'Leer', value: '2 páginas' },
  { title: 'Tomar agua', value: '1 litro' },
  { title: 'Estudiar', value: '30 minutos' },
  { title: 'Hacer ejercicio', value: '20 minutos' },
];

const TODAY_DEMO = [
  { title: 'Leer libro', value: '2 páginas', done: true },
  { title: 'Tomar agua', value: '1 litro', done: false },
  { title: 'Estudiar', value: '30 min', done: false },
  { title: 'Hacer ejercicio', value: '20 min', done: false },
];

export default function LandingPageClient() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const completedDemo = TODAY_DEMO.filter((r) => r.done).length;

  return (
    <>
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-wrapper">
              <div className="hero-image">
                <div className="preview-card" aria-hidden="true">
                  <div className="preview-card-header">
                    <span className="preview-card-label">HOY</span>
                  </div>
                  <div className="preview-routine-list">
                    {TODAY_DEMO.map((r) => (
                      <div
                        key={r.title}
                        className={`preview-routine ${r.done ? 'preview-routine-done' : ''}`}
                      >
                        <div className="preview-routine-info">
                          <span className="preview-routine-name">{r.title}</span>
                          <span className="preview-routine-value">{r.value}</span>
                        </div>
                        {r.done && <Check size={18} className="preview-routine-check" />}
                      </div>
                    ))}
                  </div>
                  <div className="preview-progress">
                    <span className="preview-progress-text">
                      {completedDemo} de {TODAY_DEMO.length} cumplidas
                    </span>
                    <div className="preview-progress-track">
                      <div
                        className="preview-progress-fill"
                        style={{ width: `${(completedDemo / TODAY_DEMO.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-content">
                <div className="hero-brand">
                  <Image src="/cubo.png" alt="" width={28} height={28} className="hero-brand-icon" />
                  <span>Momentum</span>
                </div>
                <h1 className="hero-title">Hacé un poco.<br />Todos los días.</h1>
                <p className="hero-description">
                  Creá mínimos simples para las cosas que querés mantener en movimiento.
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

        {/* Vos decidís cuánto alcanza */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Vos decidís cuánto alcanza.</h2>
            <div className="example-grid">
              {EXAMPLES.map((ex) => (
                <div key={ex.title} className="example-card">
                  <p className="example-card-title">{ex.title}</p>
                  <p className="example-card-value">{ex.value}</p>
                </div>
              ))}
            </div>
            <div className="example-type-row">
              <span className="example-type-badge">
                <Timer size={16} />
                Tiempo
              </span>
              <span className="example-type-badge">
                <Hash size={16} />
                Cantidad
              </span>
            </div>
          </div>
        </section>

        {/* A tu ritmo */}
        <section className="philosophy-section">
          <div className="container">
            <h2 className="section-title">No tiene que ser todos los días.</h2>
            <p className="cta-description" style={{ maxWidth: '520px', margin: '0 auto' }}>
              Elegí cuándo querés sostener cada rutina.
            </p>
            <div className="landing-rhythm-demo" aria-hidden="true">
              <div className="day-selector">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label, i) => (
                  <span
                    key={label}
                    className={`day-btn day-btn-readonly ${i < 3 ? 'day-btn-active' : ''}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hoy - la interfaz real como protagonista */}
        <section className="cta-section">
          <div className="container">
            <h2 className="section-title">Hoy con lo mínimo alcanza.</h2>
            <div className="landing-demo-progress" aria-hidden="true">
              <p className="today-progress-hint">
                {completedDemo} de {TODAY_DEMO.length} cumplidas
              </p>
              <div className="today-progress-track">
                <div
                  className="today-progress-fill"
                  style={{ width: `${(completedDemo / TODAY_DEMO.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="landing-demo-wrap" aria-hidden="true">
              <div className="routines-list">
                {TODAY_DEMO.map((r) => (
                  <div key={r.title} className={`routine-card ${r.done ? 'routine-completed' : ''}`}>
                    <div className="routine-header">
                      <h3 className="routine-title">{r.title}</h3>
                      {r.done && (
                        <span className="routine-check">
                          <Check size={22} />
                        </span>
                      )}
                    </div>
                    <div className="routine-value-block">
                      <span className="routine-value-number">{r.value}</span>
                      <span className="routine-value-label">
                        {r.done ? 'Cumplido hoy' : 'Mínimo de hoy'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Constancia */}
        <section className="philosophy-section">
          <div className="container">
            <h2 className="section-title">Lo importante es volver.</h2>
            <div className="landing-history-demo" aria-hidden="true">
              <div className="history-stats">
                <div className="history-hero-stat">
                  <div className="history-hero-value">7</div>
                  <div className="history-hero-label">días de racha actual</div>
                </div>
                <div className="history-secondary-stats">
                  <div className="history-stat-item">
                    <div className="history-stat-value">24</div>
                    <div className="history-stat-label">Días cumplidos</div>
                  </div>
                  <div className="history-stat-item">
                    <div className="history-stat-value">12</div>
                    <div className="history-stat-label">Mejor racha</div>
                  </div>
                </div>
              </div>
              <div className="landing-streaks-demo">
                <div className="streak-item">
                  <div className="streak-days">12 días</div>
                  <div className="streak-dates">3 jul - 14 jul</div>
                </div>
                <div className="streak-item" style={{ marginTop: '0.75rem' }}>
                  <div className="streak-days">5 días</div>
                  <div className="streak-dates">22 jun - 26 jun</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sin pendientes */}
        <section className="features-section">
          <div className="container">
            <div className="statement-card">
              <h2 className="statement-title">Mañana empezás de nuevo.</h2>
              <p className="statement-text">
                No se acumulan tareas pendientes. No hay una lista creciente de cosas atrasadas.
                No se trata de recuperar ayer. Cada día vuelve a empezar.
              </p>
            </div>
          </div>
        </section>

        {/* Mensaje diferencial */}
        <section className="philosophy-section">
          <div className="container">
            <div className="pull-quote">
              <p className="pull-quote-text">
                No organices todo lo que tenés que hacer. Elegí lo mínimo que querés sostener.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2 className="cta-title">Empezá por lo mínimo.</h2>
              <p className="cta-description">
                Hoy alcanza con empezar.
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
