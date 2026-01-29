import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_MODE_CONFIG, type GameMode, investorProfiles } from '@domain/entities';
import { trackPageView, trackClick, triggerHapticFeedback } from '@lib/appsInToss';
import { getTotalPlayers, getTodayTopPlayer } from '@data/rankingService';
import { extractAndSaveChallenge, type ChallengeData } from '@lib/challengeUtils';
import { getCurrentTheme, formatSeasonInfo } from '@lib/seasonUtils';
import { AdBanner } from '@presentation/components';

// 소셜 증거 메시지 생성
const SOCIAL_PROOF_MESSAGES = [
  '방금 누군가 "금손 전략가" 획득! 👑',
  '지금 3명이 테스트 중... 🎲',
  '오늘 127명이 도전했어요 🔥',
  '방금 +85% 수익률 달성! 💰',
  '"운빨 도전가" 탄생! 🍀',
  '누군가 -50% 풀빵됨 😭',
];

export function IntroPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [todayTop, setTodayTop] = useState<{ nickname: string; totalReturn: number } | null>(null);
  const [socialMessage, setSocialMessage] = useState('');
  // URL 파라미터에서 도전 데이터 추출 (lazy initialization)
  const [challenge] = useState<ChallengeData | null>(() => extractAndSaveChallenge());

  const currentConfig = GAME_MODE_CONFIG[selectedMode];

  // 현재 시즌/이벤트 테마
  const seasonTheme = useMemo(() => getCurrentTheme(), []);
  const seasonInfo = useMemo(() => formatSeasonInfo(seasonTheme), [seasonTheme]);

  // 페이지 진입 시 애널리틱스 추적 및 소셜 증거 로드
  useEffect(() => {
    trackPageView('intro_page', challenge ? { has_challenge: true } : undefined);

    // 소셜 증거 데이터 로드 (비동기)
    const loadSocialProof = async () => {
      const [players, top] = await Promise.all([
        getTotalPlayers(),
        getTodayTopPlayer(),
      ]);
      setTotalPlayers(players);
      setTodayTop(top);
    };
    loadSocialProof();
  }, [challenge]);

  // 소셜 증거 메시지 롤링
  useEffect(() => {
    const updateMessage = () => {
      const randomIndex = Math.floor(Math.random() * SOCIAL_PROOF_MESSAGES.length);
      setSocialMessage(SOCIAL_PROOF_MESSAGES[randomIndex]);
    };
    updateMessage();
    const interval = setInterval(updateMessage, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (mode: GameMode) => {
    triggerHapticFeedback('light');
    trackClick(`select_mode_${mode}`);
    setSelectedMode(mode);
  };

  const handleStart = () => {
    triggerHapticFeedback('medium');
    trackClick('start_game', { mode: selectedMode });
    // 모드를 URL 파라미터로 전달
    navigate(`/game?mode=${selectedMode}`);
  };

  const formatBalance = (value: number) => {
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  // 참여자 수 포맷팅 (1000 이상이면 천 단위로)
  const formatPlayerCount = (count: number): string => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    // 최소 표시값 (소셜 증거 효과)
    return count > 0 ? count.toLocaleString() : '1,234';
  };

  // 도전자 프로필 정보
  const challengeProfile = challenge ? investorProfiles[challenge.type] : null;

  return (
    <main className="intro-page" role="main" aria-labelledby="intro-title">
      <div className="intro-content">
        {/* 시즌/이벤트 배너 */}
        <div
          className={`season-banner ${seasonInfo.isSpecialEvent ? 'special-event' : ''}`}
          style={{ '--season-color': seasonTheme.accentColor } as React.CSSProperties}
        >
          <span className="season-emoji">{seasonTheme.emoji}</span>
          <span className="season-message">{seasonTheme.bannerMessage}</span>
          {seasonInfo.isSpecialEvent && (
            <span className="event-badge">EVENT</span>
          )}
        </div>

        {/* 친구 도전 배너 */}
        {challenge && challengeProfile && (
          <div className="challenge-banner">
            <div className="challenge-header">
              <span className="challenge-icon">⚔️</span>
              <span className="challenge-title">친구의 도전장!</span>
            </div>
            <div className="challenge-content">
              <span className="challenger-emoji">{challengeProfile.emoji}</span>
              <div className="challenger-info">
                <span className="challenger-name">
                  {challenge.name || '친구'}의 기록
                </span>
                <span className="challenger-type">{challengeProfile.name}</span>
              </div>
              <span className={`challenger-return ${challenge.return >= 0 ? 'positive' : 'negative'}`}>
                {challenge.return >= 0 ? '+' : ''}{challenge.return.toFixed(1)}%
              </span>
            </div>
            <p className="challenge-prompt">이 기록을 이길 수 있을까요? 🔥</p>
          </div>
        )}

        {/* 소셜 증거 배너 */}
        <div className="social-proof-banner" aria-live="polite">
          <div className="social-proof-stats">
            <span className="player-count">
              🔥 <strong>{formatPlayerCount(totalPlayers)}</strong>명 참여!
            </span>
            {todayTop && (
              <span className="today-top">
                👑 오늘 1위: {todayTop.nickname} (+{todayTop.totalReturn.toFixed(0)}%)
              </span>
            )}
          </div>
          <div className="social-proof-live">
            <span className="live-dot" aria-hidden="true" />
            <span className="live-message">{socialMessage}</span>
          </div>
        </div>

        <div className="intro-badge" aria-hidden="true">MZ 필수 테스트</div>
        <h1 id="intro-title" className="intro-title">💸 돈 감각 테스트</h1>
        <p className="intro-subtitle">
          {formatBalance(currentConfig.initialBalance)} 받았다.<br />
          <strong>{currentConfig.totalRounds}번 선택</strong> 후 얼마 남을까?
        </p>

        {/* 모드 선택 */}
        <div className="mode-selector" role="group" aria-label="게임 모드 선택">
          <button
            className={`mode-btn ${selectedMode === 'normal' ? 'active' : ''}`}
            onClick={() => handleModeChange('normal')}
            aria-pressed={selectedMode === 'normal'}
          >
            <span className="mode-emoji">{GAME_MODE_CONFIG.normal.emoji}</span>
            <span className="mode-name">{GAME_MODE_CONFIG.normal.name}</span>
            <span className="mode-desc">{GAME_MODE_CONFIG.normal.description}</span>
          </button>
          <button
            className={`mode-btn extreme ${selectedMode === 'extreme' ? 'active' : ''}`}
            onClick={() => handleModeChange('extreme')}
            aria-pressed={selectedMode === 'extreme'}
          >
            <span className="mode-emoji">{GAME_MODE_CONFIG.extreme.emoji}</span>
            <span className="mode-name">{GAME_MODE_CONFIG.extreme.name}</span>
            <span className="mode-desc">{GAME_MODE_CONFIG.extreme.description}</span>
          </button>
        </div>

        {/* 시작 버튼 - 상단으로 이동 */}
        <button
          className={`start-button ${selectedMode === 'extreme' ? 'extreme' : ''}`}
          onClick={handleStart}
          aria-label={`${currentConfig.name}로 게임 시작하기`}
        >
          {selectedMode === 'extreme' ? '🔥 극한 도전!' : '돈 불려보기'}
        </button>

        <div className="intro-hook" aria-hidden="true">
          <span className="hook-emoji">🤔</span>
          <span className="hook-text">
            {selectedMode === 'extreme' ? '파산 각오됐어?' : '당신은 금손? 흙손?'}
          </span>
        </div>

        <ul className="intro-features" aria-label="게임 특징">
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">🎲</span>
            <span className="feature-text">진짜 확률로 결과 결정</span>
          </li>
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">🧠</span>
            <span className="feature-text">투자 성향 + 운빨 분석</span>
          </li>
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">
              {selectedMode === 'extreme' ? '💀' : '🔥'}
            </span>
            <span className="feature-text">
              {selectedMode === 'extreme' ? '극한의 하이리스크' : '친구랑 수익률 배틀'}
            </span>
          </li>
        </ul>

        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>

        {/* Google AdSense 배너 */}
        <AdBanner className="intro-ad" />
      </div>
    </main>
  );
}
