/**
 * 컨페티 효과 컴포넌트
 * 신기록 달성 시 화면에 색종이 터트리기
 */
import { useEffect, useState, useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

interface ConfettiProps {
  /** 컨페티 활성화 여부 */
  active: boolean;
  /** 컨페티 조각 수 */
  count?: number;
  /** 지속 시간 (ms) */
  duration?: number;
  /** 완료 후 콜백 */
  onComplete?: () => void;
}

const COLORS = [
  '#10B981', // green
  '#FBBF24', // yellow
  '#3B82F6', // blue
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F97316', // orange
];

export function Confetti({
  active,
  count = 50,
  duration = 3000,
  onComplete,
}: ConfettiProps) {
  const [isVisible, setIsVisible] = useState(false);

  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, [count]);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
