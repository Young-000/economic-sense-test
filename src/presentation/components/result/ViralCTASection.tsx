import { useState, useEffect, useCallback } from 'react';
import type { FinalResult } from '@domain/entities';
import { getPlayersAboveReturn } from '@data/rankingService';
import { createChallengeUrl, getSavedChallenge, compareResults } from '@lib/challengeUtils';

export interface ViralCTASectionProps {
  finalResult: FinalResult;
  nickname: string;
  onShareImage: () => void;
  isGeneratingImage: boolean;
}

export function ViralCTASection({
  finalResult,
  nickname,
  onShareImage,
  isGeneratingImage,
}: ViralCTASectionProps) {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const { totalReturn, investorType } = finalResult;

  // 상위 N% 계산
  useEffect(() => {
    const calculatePercentileAsync = async (): Promise<void> => {
      const { above, total } = await getPlayersAboveReturn(totalReturn);
      if (total > 0) {
        const pct = Math.max(1, Math.round(((above + 1) / (total + 1)) * 100));
        setPercentile(pct);
      } else {
        setPercentile(1);
      }
    };

    calculatePercentileAsync();
  }, [totalReturn]);

  // 도전 데이터 읽기 (텍스트 결정용)
  const challenge = getSavedChallenge();
  const challengeText = (() => {
    if (challenge) {
      return compareResults(totalReturn, challenge.return).winner === 'me'
        ? '🔥 이 기록으로 다른 친구에게도 도전!'
        : '😤 설욕전! 친구에게 다시 도전장을 보내세요';
    }
    if (percentile !== null && percentile <= 30) {
      return '🔥 대단해요! 친구들에게 자랑해보세요';
    }
    return '🤔 친구들은 몇 %일까요?';
  })();

  const handleCopyChallenge = async (): Promise<void> => {
    const challengeUrl = createChallengeUrl(
      investorType,
      totalReturn,
      nickname || undefined
    );
    try {
      await navigator.clipboard.writeText(
        `\u{1F4B8} 돈 감각 테스트에서 ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}% 달성!\n\n이 기록 이길 수 있어? \u{1F60F}\n\n\u{1F449} ${challengeUrl}`
      );
      showToast('도전장 링크가 복사되었어요!');
    } catch {
      showToast('복사에 실패했어요.');
    }
  };

  return (
    <div className="viral-cta-section">
      {percentile !== null && (
        <div className="percentile-badge">
          <span className="percentile-icon">
            {percentile <= 10 ? '🏆' : percentile <= 30 ? '🥈' : percentile <= 50 ? '🥉' : '📊'}
          </span>
          <span className="percentile-text">
            상위 <strong>{percentile}%</strong> 성적!
          </span>
        </div>
      )}
      <p className="challenge-text">
        {challengeText}
      </p>
      <button
        className="challenge-btn pulse-animation"
        onClick={handleCopyChallenge}
      >
        📋 도전장 링크 복사하기
      </button>
      <button
        className="challenge-btn-secondary"
        onClick={onShareImage}
        disabled={isGeneratingImage}
      >
        {isGeneratingImage ? '이미지 생성 중...' : '\u{1F5BC}\uFE0F 결과 이미지로 공유'}
      </button>
      {toastMessage && (
        <div className="viral-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
