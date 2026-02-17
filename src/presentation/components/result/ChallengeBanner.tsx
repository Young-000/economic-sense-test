import { useState, useEffect } from 'react';
import type { InvestorProfile } from '@domain/entities';
import { investorProfiles } from '@domain/entities';
import {
  getSavedChallenge,
  clearSavedChallenge,
  compareResults,
  type ChallengeData,
} from '@lib/challengeUtils';

export interface ChallengeBannerProps {
  totalReturn: number;
  myProfile: InvestorProfile;
}

export function ChallengeBanner({ totalReturn, myProfile }: ChallengeBannerProps) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    const savedChallenge = getSavedChallenge();
    if (savedChallenge) {
      setChallenge(savedChallenge);
    }
  }, []);

  if (!challenge) return null;

  const comparison = compareResults(totalReturn, challenge.return);
  const challengeProfile = investorProfiles[challenge.type];

  return (
    <div className={`challenge-result-card ${comparison.winner}`}>
      <div className="challenge-result-header">
        <span className="versus-icon">⚔️</span>
        <span className="versus-text">VS 친구</span>
      </div>
      <div className="challenge-comparison">
        <div className="challenge-player me">
          <span className="player-label">나</span>
          <span className="player-emoji">{myProfile.emoji}</span>
          <span className={`player-return ${totalReturn >= 0 ? 'positive' : 'negative'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
        </div>
        <div className="challenge-vs">
          <span className="vs-result">{comparison.message}</span>
        </div>
        <div className="challenge-player friend">
          <span className="player-label">{challenge.name || '친구'}</span>
          <span className="player-emoji">{challengeProfile.emoji}</span>
          <span className={`player-return ${challenge.return >= 0 ? 'positive' : 'negative'}`}>
            {challenge.return >= 0 ? '+' : ''}{challenge.return.toFixed(1)}%
          </span>
        </div>
      </div>
      {comparison.winner === 'me' && (
        <p className="challenge-win-text">🎉 축하해요! 친구 기록을 넘었어요!</p>
      )}
      <button
        className="rematch-btn"
        onClick={() => {
          clearSavedChallenge();
          setChallenge(null);
        }}
      >
        🔄 새로운 도전
      </button>
    </div>
  );
}
