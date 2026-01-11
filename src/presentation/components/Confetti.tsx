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

// 컴포넌트 외부에서 seed 기반 pseudo-random을 생성하여 pure하게 유지
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const seed1 = i * 1000 + 1;
    const seed2 = i * 1000 + 2;
    const seed3 = i * 1000 + 3;
    const seed4 = i * 1000 + 4;
    const seed5 = i * 1000 + 5;
    const seed6 = i * 1000 + 6;
    return {
      id: i,
      x: seededRandom(seed1) * 100,
      color: COLORS[Math.floor(seededRandom(seed2) * COLORS.length)],
      delay: seededRandom(seed3) * 0.5,
      duration: 2 + seededRandom(seed4) * 1.5,
      size: 8 + seededRandom(seed5) * 8,
      rotation: seededRandom(seed6) * 360,
    };
  });
}

export function Confetti({
  active,
  count = 50,
  duration = 3000,
  onComplete,
}: ConfettiProps) {
  // active가 true가 되면 visible 상태로 시작
  const [isVisible, setIsVisible] = useState(active);

  // count에 따라 미리 계산된 pieces (pure function)
  const pieces = useMemo<ConfettiPiece[]>(() => generatePieces(count), [count]);

  // active 상태 변화에 동기화
  useEffect(() => {
    if (active) {
      setIsVisible(true);
    }
  }, [active]);

  // 타이머로 duration 후 숨김
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  // borderRadius도 seed 기반으로 결정
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
            borderRadius: piece.id % 2 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
