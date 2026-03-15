/**
 * MissionToast - 미션 달성 시 축하 토스트
 */

import { useEffect, useState } from 'react';
import type { MissionCompletionResult } from '@domain/services/missionService';

interface MissionToastProps {
  completions: MissionCompletionResult[];
  onDismiss: () => void;
}

export function MissionToast({ completions, onDismiss }: MissionToastProps): JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (completions.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < completions.length - 1) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setIsVisible(true);
        }, 300);
      } else {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, completions.length, onDismiss]);

  if (completions.length === 0) return null;

  const current = completions[currentIndex];

  return (
    <div className={`mission-toast ${isVisible ? 'visible' : ''}`}>
      <div className="mission-toast-content">
        <span className="mission-toast-emoji">{current.trackEmoji}</span>
        <div className="mission-toast-info">
          <span className="mission-toast-title">
            {current.trackName} Lv.{current.level} 달성!
          </span>
          <span className="mission-toast-reward">
            +{current.reward} coin
          </span>
        </div>
      </div>
    </div>
  );
}
