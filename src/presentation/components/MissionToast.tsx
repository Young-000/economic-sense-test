/**
 * MissionToast - 미션 달성 시 축하 토스트
 *
 * 최대 MAX_VISIBLE(2)개까지만 표시.
 * 3개 이상이면 처음 1개 + "외 N개 달성" 요약으로 합산.
 */

import { useEffect, useState } from 'react';
import type { MissionCompletionResult } from '@domain/services/missionService';

const MAX_VISIBLE = 2;
const TOAST_DURATION_MS = 2500;
const FADE_MS = 300;

interface MissionToastProps {
  completions: MissionCompletionResult[];
  onDismiss: () => void;
}

export function MissionToast({ completions, onDismiss }: MissionToastProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (completions.length === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, FADE_MS);
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [completions.length, onDismiss]);

  if (completions.length === 0) return null;

  // 3개 이상이면 첫 1개 + 요약
  const showSummary = completions.length > MAX_VISIBLE;
  const visibleItems = showSummary ? completions.slice(0, 1) : completions;
  const remainingCount = completions.length - 1;
  const totalReward = completions.reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className={`mission-toast ${isVisible ? 'visible' : ''}`}>
      {visibleItems.map((item, idx) => (
        <div className="mission-toast-content" key={idx}>
          <span className="mission-toast-emoji">{item.trackEmoji}</span>
          <div className="mission-toast-info">
            <span className="mission-toast-title">
              {item.trackName} Lv.{item.level} 달성!
            </span>
            <span className="mission-toast-reward">
              +{item.reward} 코인
            </span>
          </div>
        </div>
      ))}
      {showSummary && (
        <div className="mission-toast-summary">
          외 {remainingCount}개 미션 달성! 총 +{totalReward} 코인
        </div>
      )}
    </div>
  );
}
