'use client';

import { useEffect, useRef } from 'react';

interface CelebrationEffectProps {
  originX?: number;
  originY?: number;
}

export function CelebrationEffect({ originX, originY }: CelebrationEffectProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determinar punto de origen (centro de la pantalla o posición específica)
    const startX = originX ?? window.innerWidth / 2;
    const startY = originY ?? window.innerHeight / 2;
    
    // Crear partículas de confetti
    const colors = ['#10b981', '#059669', '#047857', '#F6E27F', '#7DD3FC'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        createParticle(colors[Math.floor(Math.random() * colors.length)], startX, startY);
      }, i * 10); // Efecto cascada
    }
  }, [originX, originY]);

  const createParticle = (color: string, startX: number, startY: number) => {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    
    const size = 6 + Math.random() * 8;
    const isCircle = Math.random() > 0.4;
    
    particle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${isCircle ? '50%' : '2px'};
      pointer-events: none;
      z-index: 1999;
      left: ${startX}px;
      top: ${startY}px;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 6px ${color}40;
    `;
    
    document.body.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 150;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 500;
    
    let x = startX;
    let y = startY;
    let currentRotation = rotation;
    let opacity = 1;
    let scale = 1;
    
    const animate = () => {
      x += vx * 0.02;
      y += vy * 0.02 + 40 * 0.02; // Gravedad suave
      currentRotation += rotationSpeed * 0.02;
      opacity -= 0.01;
      scale -= 0.003;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${scale})`;
      particle.style.opacity = Math.max(0, opacity).toString();
      
      if (opacity > 0 && y < window.innerHeight + 150 && scale > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animate);
  };

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
