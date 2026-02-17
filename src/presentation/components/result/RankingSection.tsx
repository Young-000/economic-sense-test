import { useState, useEffect } from 'react';
import type { InvestorType, RoundResult } from '@domain/entities';
import { submitRanking, getTopRankings, type RankingEntry } from '@data/rankingService';
import { formatBalance } from '@lib/formatUtils';

// 닉네임 유효성 검사 상수 및 함수
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_\s]+$/;
const MAX_NICKNAME_LENGTH = 20;

interface NicknameValidationResult {
  valid: boolean;
  error?: string;
}

function validateNickname(name: string): NicknameValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: '닉네임을 입력해주세요' };
  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return { valid: false, error: `${MAX_NICKNAME_LENGTH}자 이하로 입력해주세요` };
  }
  if (!NICKNAME_REGEX.test(trimmed)) {
    return { valid: false, error: '한글, 영문, 숫자만 사용 가능해요' };
  }
  return { valid: true };
}

export interface RankingSectionProps {
  finalBalance: number;
  totalReturn: number;
  investorType: InvestorType;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
  gameResults: RoundResult[];
  initialBalance: number;
  nickname: string;
  onNicknameChange: (name: string) => void;
}

export function RankingSection({
  finalBalance,
  totalReturn,
  investorType,
  riskScore,
  rationalityScore,
  luckScore,
  gameResults,
  initialBalance,
  nickname,
  onNicknameChange,
}: RankingSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [topRankings, setTopRankings] = useState<RankingEntry[]>([]);
  const [showRankings, setShowRankings] = useState(false);

  // 랭킹 로드
  useEffect(() => {
    let isMounted = true;

    getTopRankings(10)
      .then((rankings) => {
        if (isMounted) setTopRankings(rankings);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const nicknameValidation = validateNickname(nickname);

  const handleSubmitRanking = async (): Promise<void> => {
    if (!nicknameValidation.valid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let runningBalance = initialBalance;
      const roundResults = gameResults.map((result, index) => {
        runningBalance += result.actualOutcome;
        return {
          round: index + 1,
          balance: runningBalance,
          outcome: result.actualOutcome,
        };
      });

      const result = await submitRanking({
        nickname: nickname.trim(),
        finalBalance,
        totalReturn,
        investorType,
        riskScore,
        rationalityScore,
        luckScore,
        roundResults,
      });

      if (result.success) {
        setSubmitted(true);
        setMyRank(result.rank ?? null);
        const newRankings = await getTopRankings(10);
        setTopRankings(newRankings);
      } else {
        alert('랭킹 등록에 실패했어요.');
      }
    } catch {
      alert('오류가 발생했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ranking-section">
      {!submitted ? (
        <>
          <h2 className="section-title">🏆 랭킹 등록</h2>
          <div className="ranking-form">
            <div className="nickname-input-wrapper">
              <input
                type="text"
                className={`nickname-input ${nickname && !nicknameValidation.valid ? 'invalid' : ''}`}
                placeholder="닉네임 입력 (한글/영문/숫자)"
                maxLength={MAX_NICKNAME_LENGTH}
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nicknameValidation.valid && handleSubmitRanking()}
                aria-invalid={nickname && !nicknameValidation.valid ? 'true' : 'false'}
                aria-describedby={nickname && !nicknameValidation.valid ? 'nickname-error' : undefined}
              />
              {nickname && !nicknameValidation.valid && (
                <span id="nickname-error" className="nickname-error" role="alert">
                  {nicknameValidation.error}
                </span>
              )}
            </div>
            <button
              className="submit-ranking-btn"
              onClick={handleSubmitRanking}
              disabled={!nicknameValidation.valid || isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </>
      ) : (
        <div className="ranking-result">
          <h2 className="section-title">🎉 랭킹 등록 완료!</h2>
          {myRank && <p className="my-rank">현재 순위: <strong>{myRank}위</strong></p>}
        </div>
      )}

      {/* TOP 랭킹 보기 토글 */}
      <button
        className="toggle-rankings-btn"
        onClick={() => setShowRankings(!showRankings)}
      >
        {showRankings ? '랭킹 숨기기 ▲' : 'TOP 10 랭킹 보기 ▼'}
      </button>

      {showRankings && topRankings.length > 0 && (
        <div className="rankings-list">
          {topRankings[0] && (
            <div className="top-player-highlight">
              <span className="crown-icon">👑</span>
              <span className="top-player-label">현재 1위</span>
              <span className="top-player-name">{topRankings[0].nickname}</span>
              <span className="top-player-return">
                +{topRankings[0].total_return.toFixed(1)}%
              </span>
            </div>
          )}
          {topRankings.map((entry, index) => (
            <div key={entry.id} className={`ranking-item ${index < 3 ? 'top-three' : ''}`}>
              <span className="ranking-position">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <span className="ranking-nickname">{entry.nickname}</span>
              <span className={`ranking-return ${entry.total_return >= 0 ? 'positive' : 'negative'}`}>
                {entry.total_return >= 0 ? '+' : ''}{entry.total_return.toFixed(1)}%
              </span>
              <span className={`ranking-balance ${entry.final_balance >= initialBalance ? 'positive' : 'negative'}`}>
                {formatBalance(entry.final_balance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
