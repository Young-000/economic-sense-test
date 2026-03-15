/**
 * CoinParticle - 코인 획득 시 파티클 애니메이션
 */

import React, { useEffect, useState } from 'react';

interface CoinParticleProps {
  amount: number;
  isGold?: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export function CoinParticle({ amount, isGold = false, onComplete }: CoinParticleProps): JSX.Element | null {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 50,
      dx: (Math.random() - 0.5) * 60,
      dy: -(Math.random() * 40 + 20),
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setShowText(false);
      setParticles([]);
      onComplete?.();
    }, 1200);

    return () => clearTimeout(timer);
  }, [amount, onComplete]);

  if (!showText && particles.length === 0) return null;

  return (
    <div className={`coin-particle-container ${isGold ? 'gold' : ''}`}>
      {showText && (
        <div className="coin-particle-text">
          +{amount}
        </div>
      )}
      {particles.map(p => (
        <div
          key={p.id}
          className="coin-particle-dot"
          style={{
            '--start-x': `${p.x}%`,
            '--start-y': `${p.y}%`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
