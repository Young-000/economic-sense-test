import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useRef } from 'react';
import type { RoundResult, Question } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import { submitRanking, getTopRankings, type RankingEntry } from '@data/rankingService';
import {
  isAppsInToss,
  submitToGameLeaderboard,
  openGameLeaderboard,
  initTossAds,
  attachBannerAd,
  removeBannerAd,
} from '@lib/appsInToss';

export function ResultPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [topRankings, setTopRankings] = useState<RankingEntry[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [inTossApp, setInTossApp] = useState(false);
  const [tossLeaderboardSubmitted, setTossLeaderboardSubmitted] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adSlotIdRef = useRef<string | null>(null);

  const finalResult = useMemo(() => {
    try {
      const storedResults = sessionStorage.getItem('gameResults');
      const storedQuestions = sessionStorage.getItem('gameQuestions');
      if (!storedResults || !storedQuestions) return null;

      const results: RoundResult[] = JSON.parse(storedResults);
      const questions: Question[] = JSON.parse(storedQuestions);

      if (!results || results.length !== GAME_CONFIG.TOTAL_ROUNDS) return null;
      if (!questions || questions.length !== GAME_CONFIG.TOTAL_ROUNDS) return null;

      return calculateFinalResult(results, questions);
    } catch {
      return null;
    }
  }, []);

  // 랭킹 로드
  useEffect(() => {
    getTopRankings(10).then(setTopRankings);
  }, []);

  // Apps in Toss 환경 체크 및 광고 초기화
  useEffect(() => {
    const isToss = isAppsInToss();
    setInTossApp(isToss);

    if (isToss) {
      // TossAds 초기화 (테스트 모드는 개발 환경에서만)
      const isTestMode = import.meta.env.DEV;
      initTossAds(isTestMode);
    }
  }, []);

  // 배너 광고 부착
  useEffect(() => {
    if (!inTossApp || !adContainerRef.current) return;

    const slotId = attachBannerAd(adContainerRef.current, {
      onLoad: () => console.log('TossAds loaded'),
      onError: (error) => console.error('TossAds error:', error),
    });

    if (slotId) {
      adSlotIdRef.current = slotId;
    }

    return () => {
      if (adSlotIdRef.current) {
        removeBannerAd(adSlotIdRef.current);
        adSlotIdRef.current = null;
      }
    };
  }, [inTossApp]);

  if (!finalResult) {
    return (
      <div className="result-page">
        <div className="result-error">
          <p>결과를 찾을 수 없습니다.</p>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  const { profile, finalBalance, totalReturn, riskScore, rationalityScore, luckScore, investorType } = finalResult;

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(1)}억원`;
    }
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  const getReturnClass = () => {
    if (totalReturn >= 50) return 'return-great';
    if (totalReturn >= 0) return 'return-good';
    if (totalReturn >= -30) return 'return-bad';
    return 'return-terrible';
  };

  const getLuckLabel = () => {
    if (luckScore >= 50) return '대박 행운! 🍀🍀';
    if (luckScore >= 20) return '운 좋았어요 🍀';
    if (luckScore >= -20) return '평균적인 운';
    if (luckScore >= -50) return '운이 없었네요 😢';
    return '극심한 불운 😭';
  };

  const handleSubmitRanking = async () => {
    if (!nickname.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Supabase 랭킹 등록
      const result = await submitRanking({
        nickname: nickname.trim(),
        finalBalance,
        totalReturn,
        investorType,
        riskScore,
        rationalityScore,
        luckScore,
      });

      if (result.success) {
        setSubmitted(true);
        setMyRank(result.rank ?? null);
        // 랭킹 새로고침
        const newRankings = await getTopRankings(10);
        setTopRankings(newRankings);

        // Apps in Toss 게임 리더보드에도 제출 (수익률 * 100 정수로 변환)
        if (inTossApp) {
          const score = Math.round(totalReturn * 100);
          const tossResult = await submitToGameLeaderboard(score);
          if (tossResult.success) {
            setTossLeaderboardSubmitted(true);
          }
        }
      } else {
        alert('랭킹 등록에 실패했어요.');
      }
    } catch {
      alert('오류가 발생했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTossLeaderboard = async () => {
    const result = await openGameLeaderboard();
    if (!result.success) {
      console.warn('Failed to open Toss leaderboard:', result.error);
    }
  };

  const handleShare = async () => {
    const shareText = `🎯 경제감각 시뮬레이션 결과\n\n` +
      `${profile.emoji} ${profile.name}\n` +
      `💰 최종 자산: ${formatBalance(finalBalance)}\n` +
      `📈 수익률: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%\n` +
      `"${profile.tag}"\n\n` +
      `나도 해보기 👉`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '경제감각 테스트',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // 무시
      }
    }

    try {
      await navigator.clipboard.writeText(shareText + ' ' + window.location.origin);
      alert('결과가 복사되었습니다!');
    } catch {
      alert(shareText);
    }
  };

  return (
    <div className="result-page">
      <div className="result-content">
        {/* 투자자 유형 */}
        <div className="investor-type-card">
          <span className="type-emoji">{profile.emoji}</span>
          <h1 className="type-name">{profile.name}</h1>
          <span className="type-tag">#{profile.tag}</span>
        </div>

        {/* 최종 자산 */}
        <div className="final-balance-card">
          <span className="balance-label">최종 자산</span>
          <span className="balance-value">{formatBalance(finalBalance)}</span>
          <span className={`return-value ${getReturnClass()}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
          <p className="initial-note">
            (시작: {formatBalance(GAME_CONFIG.INITIAL_BALANCE)})
          </p>
        </div>

        {/* 랭킹 등록 */}
        <div className="ranking-section">
          {!submitted ? (
            <>
              <h2 className="section-title">🏆 랭킹 등록</h2>
              <div className="ranking-form">
                <input
                  type="text"
                  className="nickname-input"
                  placeholder="닉네임 입력"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitRanking()}
                />
                <button
                  className="submit-ranking-btn"
                  onClick={handleSubmitRanking}
                  disabled={!nickname.trim() || isSubmitting}
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

          {/* Apps in Toss 게임 리더보드 버튼 */}
          {inTossApp && (
            <button
              className="toss-leaderboard-btn"
              onClick={handleOpenTossLeaderboard}
            >
              {tossLeaderboardSubmitted ? '토스 리더보드 보기' : '토스 앱 전체 랭킹 보기'}
            </button>
          )}

          {showRankings && topRankings.length > 0 && (
            <div className="rankings-list">
              {topRankings.map((entry, index) => (
                <div key={entry.id} className="ranking-item">
                  <span className="ranking-position">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <span className="ranking-nickname">{entry.nickname}</span>
                  <span className={`ranking-return ${entry.total_return >= 0 ? 'positive' : 'negative'}`}>
                    {entry.total_return >= 0 ? '+' : ''}{Number(entry.total_return).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 설명 */}
        <div className="description-card">
          <p>{profile.description}</p>
        </div>

        {/* 상세 분석 */}
        <div className="analysis-section">
          <h2 className="section-title">투자 성향 분석</h2>

          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-label">공격성</span>
              <span className="stat-value">{riskScore}%</span>
            </div>
            <div className="stat-bar">
              <div className="stat-fill risk" style={{ width: `${riskScore}%` }} />
            </div>
            <div className="stat-labels">
              <span>보수적</span>
              <span>공격적</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-label">합리성</span>
              <span className="stat-value">{rationalityScore}%</span>
            </div>
            <div className="stat-bar">
              <div className="stat-fill rational" style={{ width: `${rationalityScore}%` }} />
            </div>
            <div className="stat-labels">
              <span>감정적</span>
              <span>합리적</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-header">
              <span className="stat-label">운</span>
              <span className="stat-value">{getLuckLabel()}</span>
            </div>
            <div className="stat-bar luck-bar">
              <div
                className={`stat-fill luck ${luckScore >= 0 ? 'positive' : 'negative'}`}
                style={{
                  width: `${Math.abs(luckScore) / 2}%`,
                  marginLeft: luckScore >= 0 ? '50%' : `${50 - Math.abs(luckScore) / 2}%`
                }}
              />
              <div className="luck-center" />
            </div>
            <div className="stat-labels">
              <span>불운</span>
              <span>행운</span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="action-buttons">
          <button className="share-button" onClick={handleShare}>
            결과 공유하기
          </button>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 도전하기
          </button>
        </div>

        {/* TossAds 배너 광고 (Apps in Toss 환경에서만) */}
        {inTossApp && (
          <div className="toss-ads-container" ref={adContainerRef} />
        )}
      </div>
    </div>
  );
}
