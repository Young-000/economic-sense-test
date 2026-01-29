import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { RoundResult, Question, GameMode } from '@domain/entities';
import { getGameConfig, investorProfiles } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import { submitRanking, getTopRankings, getPlayersAboveReturn, type RankingEntry } from '@data/rankingService';
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
import { AssetProgressChart, Confetti, NewAchievementsPopup, AchievementList, ShareImageCard, AdBanner } from '@presentation/components';
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
import {
  elementToBlob,
  shareImage,
  downloadBlob,
  canShareFiles,
} from '@lib/shareUtils';
import {
  generateShareText,
  generateClipboardText,
} from '@data/viralTemplates';
import {
  getSavedChallenge,
  clearSavedChallenge,
  createChallengeUrl,
  compareResults,
  type ChallengeData,
} from '@lib/challengeUtils';
import { investorDetails } from '@data/investorDetails';

// 닉네임 유효성 검사 상수 및 함수 (컴포넌트 외부에 정의하여 리렌더링 시 재생성 방지)
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null); // 상위 N%
  const [challenge, setChallenge] = useState<ChallengeData | null>(null); // 친구 도전
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adSlotIdRef = useRef<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // 모든 게임 데이터를 한 번에 파싱 (sessionStorage 접근 최소화)
  const {
    finalResult,
    gameResults,
    assetHistory,
    bestPerformance,
    initialBalance,
    gameMode,
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
          bestPerformance: getBestPerformance(mode),
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
          bestPerformance: getBestPerformance(mode),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      if (results.length !== config.TOTAL_ROUNDS || questions.length !== config.TOTAL_ROUNDS) {
        return {
          finalResult: null,
          gameResults: results,
          assetHistory: createAssetHistory(results, config.INITIAL_BALANCE),
          bestPerformance: getBestPerformance(mode),
          gameMode: mode,
          initialBalance: config.INITIAL_BALANCE,
        };
      }

      return {
        finalResult: calculateFinalResult(results, questions, config.INITIAL_BALANCE),
        gameResults: results,
        assetHistory: createAssetHistory(results, config.INITIAL_BALANCE),
        bestPerformance: getBestPerformance(mode),
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
        bestPerformance: getBestPerformance(mode),
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
        finalResult.investorType,
        gameMode
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
  }, [finalResult, assetHistory, gameResults, initialBalance, gameMode]);

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

  // 상위 N% 계산
  useEffect(() => {
    if (!finalResult) return;

    const calculatePercentile = async () => {
      const { above, total } = await getPlayersAboveReturn(finalResult.totalReturn);
      if (total > 0) {
        // 상위 퍼센트 계산 (나보다 높은 사람 수 / 전체 * 100)
        const pct = Math.max(1, Math.round(((above + 1) / (total + 1)) * 100));
        setPercentile(pct);
      } else {
        // 첫 번째 플레이어인 경우
        setPercentile(1);
      }
    };

    calculatePercentile();
  }, [finalResult]);

  // 친구 도전 데이터 로드
  useEffect(() => {
    const savedChallenge = getSavedChallenge();
    if (savedChallenge) {
      setChallenge(savedChallenge);
    }
  }, []);

  // 공유 텍스트 생성 함수 (플랫폼별 바이럴 최적화)
  const getShareText = useCallback((platform: 'default' | 'kakao' | 'twitter' | 'instagram' = 'default') => {
    if (!finalResult) return '';
    return generateShareText(finalResult.investorType, finalResult.totalReturn, platform);
  }, [finalResult]);

  // 클립보드용 간단 공유 텍스트
  const getClipboardText = useCallback(() => {
    if (!finalResult) return '';
    return generateClipboardText(
      finalResult.profile.name,
      finalResult.profile.emoji,
      finalResult.totalReturn
    );
  }, [finalResult]);

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

  const nicknameValidation = validateNickname(nickname);

  const handleSubmitRanking = async () => {
    if (!nicknameValidation.valid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 라운드별 결과 데이터 생성 (1등 그래프용)
      let runningBalance = initialBalance;
      const roundResults = gameResults.map((result, index) => {
        runningBalance += result.actualOutcome;
        return {
          round: index + 1,
          balance: runningBalance,
          outcome: result.actualOutcome,
        };
      });

      // Supabase 랭킹 등록
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

  // 텍스트 전용 공유 (기존 기능)
  const handleShareText = async () => {
    triggerHapticFeedback('light');
    trackClick('share_result_text');
    const shareText = getShareText('default');

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

    // 클립보드 복사용 텍스트 (더 짧은 버전)
    const clipboardText = getClipboardText();
    if (inTossApp) {
      const success = await setClipboardText(clipboardText);
      if (success) {
        alert('결과가 복사되었습니다!');
        return;
      }
    }

    // 웹 기본 클립보드 API
    try {
      await navigator.clipboard.writeText(clipboardText);
      alert('결과가 복사되었습니다!');
    } catch {
      alert(clipboardText);
    }
  };

  // 카카오톡 공유
  const handleShareKakao = async () => {
    triggerHapticFeedback('light');
    trackClick('share_kakao');
    const shareText = getShareText('kakao');

    try {
      await navigator.clipboard.writeText(shareText);
      alert('카카오톡용 문구가 복사되었습니다!\n카카오톡에 붙여넣기 해주세요 📱');
    } catch {
      alert(shareText);
    }
  };

  // 트위터/X 공유
  const handleShareTwitter = async () => {
    triggerHapticFeedback('light');
    trackClick('share_twitter');
    const shareText = getShareText('twitter');
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // 인스타그램 공유 (캡션 복사)
  const handleShareInstagram = async () => {
    triggerHapticFeedback('light');
    trackClick('share_instagram');
    const shareText = getShareText('instagram');

    try {
      await navigator.clipboard.writeText(shareText);
      alert('인스타그램 캡션이 복사되었습니다!\n스토리나 피드에 이미지와 함께 붙여넣기 해주세요 📸');
    } catch {
      alert(shareText);
    }
  };

  // 공유 이미지 생성
  const handleGenerateShareImage = async () => {
    if (!shareCardRef.current || isGeneratingImage) return;

    setIsGeneratingImage(true);
    triggerHapticFeedback('light');
    trackClick('share_image_generate');

    try {
      const blob = await elementToBlob(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0a',
      });

      setShareImageBlob(blob);
      const url = URL.createObjectURL(blob);
      setShareImageUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 이미지 공유
  const handleShareImageAction = async () => {
    if (!shareImageBlob) return;

    triggerHapticFeedback('light');
    trackClick('share_image_share');

    try {
      const shared = await shareImage(shareImageBlob, {
        title: '돈 감각 테스트 결과',
        text: getShareText(),
      });

      if (shared) {
        setShowShareModal(false);
      } else {
        // 공유 실패 시 다운로드로 폴백
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
    }
  };

  // 이미지 다운로드
  const handleDownloadImage = () => {
    if (!shareImageBlob) return;

    triggerHapticFeedback('light');
    trackClick('share_image_download');

    const filename = `돈감각테스트_${profile.name.replace(/\s/g, '_')}.png`;
    downloadBlob(shareImageBlob, filename);
    alert('이미지가 저장되었습니다!');
  };

  // 모달 닫기 시 URL 정리
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl);
      setShareImageUrl(null);
    }
  };

  // 기존 handleShare는 이미지 공유 모달을 여는 것으로 변경
  const handleShare = async () => {
    await handleGenerateShareImage();
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

        {/* 친구 도전 비교 결과 */}
        {challenge && (() => {
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
                  <span className="player-emoji">{profile.emoji}</span>
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
        })()}

        {/* 상위 N% 배지 + 친구 도전 CTA */}
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
            {challenge
              ? (compareResults(totalReturn, challenge.return).winner === 'me'
                  ? '🔥 이 기록으로 다른 친구에게도 도전!'
                  : '😤 설욕전! 친구에게 다시 도전장을 보내세요')
              : percentile !== null && percentile <= 30
                ? '🔥 대단해요! 친구들에게 자랑해보세요'
                : '🤔 친구들은 몇 %일까요?'}
          </p>
          <button
            className="challenge-btn pulse-animation"
            onClick={async () => {
              triggerHapticFeedback('light');
              trackClick('share_challenge_url');
              const challengeUrl = createChallengeUrl(
                finalResult?.investorType ?? 'balanced_investor',
                totalReturn,
                nickname || undefined
              );
              try {
                await navigator.clipboard.writeText(
                  `💸 돈 감각 테스트에서 ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}% 달성!\n\n이 기록 이길 수 있어? 😏\n\n👉 ${challengeUrl}`
                );
                alert('도전장 링크가 복사되었습니다!\n친구에게 보내보세요 🔥');
              } catch {
                alert(`도전장 링크:\n${challengeUrl}`);
              }
            }}
          >
            📋 도전장 링크 복사하기
          </button>
          <button
            className="challenge-btn-secondary"
            onClick={handleShare}
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? '이미지 생성 중...' : '🖼️ 결과 이미지로 공유'}
          </button>
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
              {/* 1위 하이라이트 */}
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

        {/* 자산 변화 그래프 */}
        <AssetProgressChart
          results={gameResults}
          currentBalance={finalBalance}
          bestPerformance={bestPerformance?.history}
          height={180}
          animate={true}
          initialBalance={initialBalance}
        />

        {/* 유형 상세 설명 */}
        {(() => {
          const detail = investorDetails[finalResult?.investorType ?? 'balanced_investor'];
          return (
            <div className="investor-detail-card">
              <div className="detail-header">
                <span className="detail-emoji">{profile.emoji}</span>
                <div className="detail-title-area">
                  <h3 className="detail-type-name">{profile.name}</h3>
                  <p className="detail-summary">{detail.summary}</p>
                </div>
              </div>

              <div className="detail-quote">
                <span className="quote-icon">&ldquo;</span>
                <p>{detail.quote}</p>
              </div>

              <div className="detail-style">
                <h4>💡 투자 스타일</h4>
                <p>{detail.style}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-section strengths">
                  <h4>✅ 강점</h4>
                  <ul>
                    {detail.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="detail-section weaknesses">
                  <h4>⚠️ 주의점</h4>
                  <ul>
                    {detail.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="detail-examples">
                <h4>🌟 이런 투자자들</h4>
                <div className="example-tags">
                  {detail.examples.map((e, i) => (
                    <span key={i} className="example-tag">{e}</span>
                  ))}
                </div>
              </div>

              <div className="detail-investments">
                <h4>💰 어울리는 투자 (재미용)</h4>
                <div className="investment-tags">
                  {detail.investments.map((inv, i) => (
                    <span key={i} className="investment-tag">{inv}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

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
          <div className="share-buttons">
            <button
              className="share-image-button"
              onClick={handleShare}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                '생성 중...'
              ) : (
                <>
                  <span className="button-icon">📸</span>
                  이미지로 공유
                </>
              )}
            </button>
          </div>
          <button className="share-button" onClick={handleShareText}>
            텍스트로 공유하기
          </button>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 도전하기
          </button>
        </div>

        {/* TossAds 배너 광고 (Apps in Toss 환경에서만) */}
        {inTossApp && (
          <div className="toss-ads-container" ref={adContainerRef} />
        )}

        {/* Google AdSense 배너 (일반 웹 환경에서만) */}
        {!inTossApp && (
          <AdBanner className="result-ad" />
        )}
      </div>

      {/* 공유용 이미지 카드 (오프스크린 렌더링) */}
      <div className="share-image-wrapper">
        <ShareImageCard
          ref={shareCardRef}
          profile={profile}
          finalBalance={finalBalance}
          initialBalance={initialBalance}
          totalReturn={totalReturn}
          riskScore={riskScore}
          rationalityScore={rationalityScore}
          luckScore={luckScore}
        />
      </div>

      {/* 공유 이미지 모달 */}
      {showShareModal && shareImageUrl && (
        <div className="share-modal-overlay" onClick={handleCloseShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="share-modal-title">공유 이미지 미리보기</h2>
            <div className="share-modal-preview">
              <img src={shareImageUrl} alt="공유 이미지" />
            </div>

            {/* 메인 공유 버튼 */}
            <div className="share-modal-buttons">
              {canShareFiles() && (
                <button
                  className="share-modal-btn primary"
                  onClick={handleShareImageAction}
                >
                  📤 공유하기
                </button>
              )}
              <button
                className="share-modal-btn secondary"
                onClick={handleDownloadImage}
              >
                💾 이미지 저장
              </button>
            </div>

            {/* 플랫폼별 공유 문구 복사 */}
            <div className="share-platform-section">
              <p className="share-platform-title">📝 플랫폼별 공유 문구</p>
              <div className="share-platform-buttons">
                <button
                  className="share-platform-btn kakao"
                  onClick={handleShareKakao}
                >
                  💬 카카오톡
                </button>
                <button
                  className="share-platform-btn twitter"
                  onClick={handleShareTwitter}
                >
                  𝕏 트위터
                </button>
                <button
                  className="share-platform-btn instagram"
                  onClick={handleShareInstagram}
                >
                  📷 인스타
                </button>
              </div>
            </div>

            <button
              className="share-modal-close"
              onClick={handleCloseShareModal}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
