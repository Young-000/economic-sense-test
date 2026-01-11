import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useRef } from 'react';
import type { RoundResult, Question, GameMode } from '@domain/entities';
import { getGameConfig } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import { submitRanking, getTopRankings, type RankingEntry } from '@data/rankingService';
import {
  getBestPerformance,
  updateBestPerformance,
  createAssetHistory,
} from '@data/bestPerformanceService';
import {
  checkAndUnlockAchievements,
  getAchievementStatus,
  calculateGameStats,
  type Achievement,
} from '@data/achievementService';
import { AssetProgressChart, Confetti, NewAchievementsPopup, AchievementList } from '@presentation/components';
import {
  isAppsInToss,
  submitToGameLeaderboard,
  openGameLeaderboard,
  initTossAds,
  attachBannerAd,
  removeBannerAd,
  trackPageView,
  trackClick,
  trackImpression,
  triggerHapticFeedback,
  setClipboardText,
} from '@lib/appsInToss';
import { formatBalance } from '@lib/formatUtils';

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
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [showAchievementList, setShowAchievementList] = useState(false);
  const [achievementStatus, setAchievementStatus] = useState(() => getAchievementStatus());
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adSlotIdRef = useRef<string | null>(null);

  // 모든 게임 데이터를 한 번에 파싱 (sessionStorage 접근 최소화)
  const {
    finalResult,
    gameResults,
    assetHistory,
    bestPerformance,
    initialBalance,
  } = useMemo(() => {
    try {
      const storedResults = sessionStorage.getItem('gameResults');
      const storedQuestions = sessionStorage.getItem('gameQuestions');
      const mode = (sessionStorage.getItem('gameMode') as GameMode) || 'normal';
      const config = getGameConfig(mode);

      if (!storedResults || !storedQuestions) {
        return {
          finalResult: null,
          gameResults: [],
          assetHistory: [],
          bestPerformance: getBestPerformance(),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      const results: RoundResult[] = JSON.parse(storedResults);
      const questions: Question[] = JSON.parse(storedQuestions);

      // 유효성 검증
      if (!Array.isArray(results) || !Array.isArray(questions)) {
        return {
          finalResult: null,
          gameResults: [],
          assetHistory: [],
          bestPerformance: getBestPerformance(),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      if (results.length !== config.TOTAL_ROUNDS || questions.length !== config.TOTAL_ROUNDS) {
        return {
          finalResult: null,
          gameResults: results,
          assetHistory: createAssetHistory(results),
          bestPerformance: getBestPerformance(),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      return {
        finalResult: calculateFinalResult(results, questions),
        gameResults: results,
        assetHistory: createAssetHistory(results),
        bestPerformance: getBestPerformance(),
        gameMode: mode,
        initialBalance: config.INITIAL_BALANCE,
      };
    } catch {
      const mode = 'normal' as GameMode;
      const config = getGameConfig(mode);
      return {
        finalResult: null,
        gameResults: [],
        assetHistory: [],
        bestPerformance: getBestPerformance(),
        gameMode: mode,
        initialBalance: config.INITIAL_BALANCE,
      };
    }
  }, []);

  // 랭킹 로드 및 최고 기록 체크
  useEffect(() => {
    let isMounted = true;

    getTopRankings(10)
      .then((rankings) => {
        if (isMounted) setTopRankings(rankings);
      })
      .catch(() => {
        // 랭킹 로드 실패 시 빈 배열 유지 (이미 기본값)
      });

    // 최고 기록 업데이트 확인
    if (finalResult) {
      const wasNewRecord = updateBestPerformance(
        assetHistory,
        finalResult.totalReturn,
        finalResult.investorType
      );
      if (isMounted) setIsNewRecord(wasNewRecord);

      // 업적 체크 (이미 파싱된 gameResults 재사용)
      const totalGamesPlayed = parseInt(localStorage.getItem('economic-sense-total-games') || '0', 10) + 1;
      localStorage.setItem('economic-sense-total-games', String(totalGamesPlayed));

      const gameStats = calculateGameStats(
        gameResults.map((r) => ({ actualOutcome: r.actualOutcome, expectedValue: r.expectedValue })),
        finalResult.riskScore,
        finalResult.rationalityScore,
        finalResult.luckScore,
        totalGamesPlayed,
        initialBalance
      );

      const unlocked = checkAndUnlockAchievements(gameStats);
      if (unlocked.length > 0 && isMounted) {
        setNewAchievements(unlocked);
        setShowAchievementPopup(true);
        setShowAchievementList(true); // 업적 획득 시 목록 자동 펼침
        setAchievementStatus(getAchievementStatus()); // 업적 상태 새로고침
        triggerHapticFeedback('heavy');
        // 업적 노출 추적
        unlocked.forEach((achievement) => {
          trackImpression(`achievement_${achievement.id}`, {
            achievement_name: achievement.name,
          });
        });
      }

      // 페이지뷰 및 결과 추적
      trackPageView('result_page', {
        total_return: finalResult.totalReturn,
        investor_type: finalResult.investorType,
        is_new_record: wasNewRecord,
        new_achievements: unlocked.length,
      });
    }

    return () => {
      isMounted = false;
    };
  }, [finalResult, assetHistory, gameResults, initialBalance]);

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
      onLoad: () => {},
      onError: () => {},
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

  // CSS 클래스 매핑 (공통 유틸 함수는 다른 패턴 사용)
  const returnClassName = (() => {
    if (totalReturn >= 50) return 'return-great';
    if (totalReturn >= 0) return 'return-good';
    if (totalReturn >= -30) return 'return-bad';
    return 'return-terrible';
  })();

  const luckLabel = (() => {
    if (luckScore >= 50) return '대박 행운! 🍀🍀';
    if (luckScore >= 20) return '운 좋았어요 🍀';
    if (luckScore >= -20) return '평균적인 운';
    if (luckScore >= -50) return '운이 없었네요 😢';
    return '극심한 불운 😭';
  })();

  // 닉네임 유효성 검사: 한글, 영문, 숫자, 공백, 언더스코어만 허용
  const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_\s]+$/;
  const MAX_NICKNAME_LENGTH = 20;

  const validateNickname = (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();
    if (!trimmed) return { valid: false, error: '닉네임을 입력해주세요' };
    if (trimmed.length > MAX_NICKNAME_LENGTH) {
      return { valid: false, error: `${MAX_NICKNAME_LENGTH}자 이하로 입력해주세요` };
    }
    if (!NICKNAME_REGEX.test(trimmed)) {
      return { valid: false, error: '한글, 영문, 숫자만 사용 가능해요' };
    }
    return { valid: true };
  };

  const nicknameValidation = validateNickname(nickname);

  const handleSubmitRanking = async () => {
    if (!nicknameValidation.valid || isSubmitting) return;

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
    trackClick('toss_leaderboard');
    await openGameLeaderboard();
  };

  const handleShare = async () => {
    triggerHapticFeedback('light');
    trackClick('share_result');
    const returnEmoji = totalReturn >= 50 ? '🚀' : totalReturn >= 0 ? '📈' : totalReturn >= -30 ? '📉' : '💸';
    const shareText = `💸 돈 감각 테스트 결과\n\n` +
      `${profile.emoji} 나는 "${profile.name}"\n` +
      `${returnEmoji} 수익률: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%\n` +
      `💰 1,000만원 → ${formatBalance(finalBalance)}\n\n` +
      `#${profile.tag}\n` +
      `#돈감각테스트 #금손흙손\n\n` +
      `너의 돈 감각은? 👉`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '돈 감각 테스트',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // 무시
      }
    }

    // Apps in Toss 환경에서는 네이티브 클립보드 API 사용
    const fullShareText = shareText + ' ' + window.location.origin;
    if (inTossApp) {
      const success = await setClipboardText(fullShareText);
      if (success) {
        alert('결과가 복사되었습니다!');
        return;
      }
    }

    // 웹 기본 클립보드 API
    try {
      await navigator.clipboard.writeText(fullShareText);
      alert('결과가 복사되었습니다!');
    } catch {
      alert(shareText);
    }
  };

  return (
    <div className="result-page">
      {/* 컨페티 효과 */}
      <Confetti active={isNewRecord || newAchievements.length > 0} count={60} duration={3500} />

      {/* 업적 달성 팝업 */}
      {showAchievementPopup && (
        <NewAchievementsPopup
          achievements={newAchievements}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}

      <div className="result-content">
        {/* 신기록 배지 */}
        {isNewRecord && (
          <div className="new-record-badge">신기록 달성!</div>
        )}

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
          <span className={`return-value ${returnClassName}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
          <p className="initial-note">
            (시작: {formatBalance(initialBalance)})
          </p>
        </div>

        {/* 랭킹 등록 */}
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
                    onChange={(e) => setNickname(e.target.value)}
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

        {/* 자산 변화 그래프 */}
        <AssetProgressChart
          results={gameResults}
          currentBalance={finalBalance}
          bestPerformance={bestPerformance?.history}
          height={180}
          animate={true}
        />

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
              <span className="stat-value">{luckLabel}</span>
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

        {/* 업적 섹션 */}
        <div className="achievements-section">
          <button
            className="toggle-achievements-btn"
            onClick={() => setShowAchievementList(!showAchievementList)}
          >
            🏅 업적 ({achievementStatus.unlocked}/{achievementStatus.total}) {showAchievementList ? '▲' : '▼'}
          </button>
          {showAchievementList && (
            <AchievementList
              achievements={achievementStatus.achievements}
              showLocked={true}
            />
          )}
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
