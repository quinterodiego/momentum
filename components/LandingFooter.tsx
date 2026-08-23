/**
 * Footer para la landing page
 */

import Image from 'next/image';

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-text">
            <span className="footer-text-content">
              <span>Momentum</span>
              <Image 
                src="/cubo.png" 
                alt="Cubo" 
                width={24} 
                height={24} 
                className="footer-text-icon"
              />
            </span>
          </p>
          <p className="footer-subtext">
            Hoy con lo mínimo alcanza.
          </p>
          <p className="footer-credit">
            Creado por{' '}
            <a href="https://www.diegoquintero.com.ar/" target="_blank" rel="noopener noreferrer">
              Diego Quintero
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

