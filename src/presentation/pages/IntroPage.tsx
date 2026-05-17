import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_MODE_CONFIG, type GameMode, investorProfiles } from '@domain/entities';
import { getTotalPlayers } from '@data/rankingService';
import { extractAndSaveChallenge, type ChallengeData } from '@lib/challengeUtils';
import { getCurrentTheme, formatSeasonInfo } from '@lib/seasonUtils';
import { initializeUserIdentity, getCachedUserId } from '@infrastructure/userIdentity';
import { hasConsented, saveConsent, LEGAL_URLS } from '@infrastructure/consent';
import { updateStreak, checkMissions, type MissionCompletionResult } from '@domain/services/missionService';
import { NotificationToggle } from '@presentation/components/notification-toggle';
import { rewardDailyLogin, rewardStreakBonus, COIN_REWARDS } from '@domain/services/coinService';
import { MissionPanel, MissionToast, CoinBalance, CoinParticle, AdBanner } from '@presentation/components';
import { getBestRecord, type BestRecord } from '@domain/services/bestRecordService';

type ModeFeedback = { message: string; mode: GameMode } | null;

export function IntroPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [modeFeedback, setModeFeedback] = useState<ModeFeedback>(null);
  const [pulsingMode, setPulsingMode] = useState<GameMode | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [missionCompletions, setMissionCompletions] = useState<MissionCompletionResult[]>([]);
  const [dailyLoginReward, setDailyLoginReward] = useState<number | null>(null);
  const [streakBonusReward, setStreakBonusReward] = useState<number | null>(null);
  const [challenge] = useState<ChallengeData | null>(() => extractAndSaveChallenge());
  const [bestRecord] = useState<BestRecord | null>(() => getBestRecord());
  const [termsChecked, setTermsChecked] = useState<boolean>(() => hasConsented());
  const [privacyChecked, setPrivacyChecked] = useState<boolean>(() => hasConsented());
  const [consentError, setConsentError] = useState<string>('');
  const bothConsented = termsChecked && privacyChecked;

  const currentConfig = GAME_MODE_CONFIG[selectedMode];

  const seasonTheme = useMemo(() => getCurrentTheme(), []);
  const seasonInfo = useMemo(() => formatSeasonInfo(seasonTheme), [seasonTheme]);

  // 참여자 수 데이터 로드
  useEffect(() => {
    const loadSocialProof = async (): Promise<void> => {
      const players = await getTotalPlayers();
      setTotalPlayers(players);
    };
    loadSocialProof();
  }, []);

  // 일일 출석 + 스트릭 업데이트 + 미션 체크 (앱 진입 시)
  useEffect(() => {
    // 일일 출석 보상
    const loginResult = rewardDailyLogin();
    if (loginResult !== null) {
      setDailyLoginReward(COIN_REWARDS.DAILY_LOGIN);
    }

    // 스트릭 업데이트 + 스트릭 보너스
    const currentStreak = updateStreak();
    const streakResult = rewardStreakBonus(currentStreak);
    if (streakResult !== null) {
      setTimeout(() => {
        if (currentStreak >= 30) setStreakBonusReward(COIN_REWARDS.STREAK_30);
        else if (currentStreak >= 14) setStreakBonusReward(COIN_REWARDS.STREAK_14);
        else if (currentStreak >= 7) setStreakBonusReward(COIN_REWARDS.STREAK_7);
        else if (currentStreak >= 3) setStreakBonusReward(COIN_REWARDS.STREAK_3);
      }, 1200);
    }

    // 미션 체크
    const results = checkMissions();
    if (results.length > 0) {
      setMissionCompletions(results);
    }
  }, []);

  const handleModeChange = (mode: GameMode): void => {
    if (mode === selectedMode) return;

    setSelectedMode(mode);

    // Pulse animation: apply class briefly then remove
    setPulsingMode(mode);
    setTimeout(() => setPulsingMode(null), 80);

    // Inline feedback message with auto-dismiss after 1200ms
    const message = mode === 'extreme' ? '극한 모드 선택됨' : '일반 모드 선택됨';
    setModeFeedback({ message, mode });
    setTimeout(() => setModeFeedback(null), 1200);
  };

  const handleStart = useCallback(async (): Promise<void> => {
    if (isAuthLoading) return;

    if (!bothConsented) {
      setConsentError('이용약관과 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    setConsentError('');
    saveConsent();

    if (!isAuthReady) {
      setIsAuthLoading(true);
      try {
        await initializeUserIdentity();
        setIsAuthReady(true);
      } catch {
        // 로그인 실패해도 게임은 진행 가능
        setIsAuthReady(true);
      } finally {
        setIsAuthLoading(false);
      }
    }

    navigate(`/game?mode=${selectedMode}`);
  }, [isAuthReady, isAuthLoading, selectedMode, navigate, bothConsented]);

  const handleDismissMissionToast = useCallback((): void => {
    setMissionCompletions([]);
  }, []);

  const formatBalance = (value: number): string => {
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  const formatPlayerCount = (count: number): string => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    if (count > 0) return count.toLocaleString();
    return '';
  };

  const challengeProfile = challenge ? investorProfiles[challenge.type] : null;

  return (
    <main className="intro-page" role="main" aria-labelledby="intro-title">
      {/* Notification toggle */}
      <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 100 }}>
        <NotificationToggle appId="economic-sense-test" userKey={getCachedUserId()} />
      </div>

      {missionCompletions.length > 0 && (
        <MissionToast
          completions={missionCompletions}
          onDismiss={handleDismissMissionToast}
        />
      )}

      <div className="intro-content">

        {/* 코인 잔액 + 일일 보상 */}
        <div className="intro-coin-section">
          <CoinBalance className="intro-coin-balance" showExchangeInfo />
          {dailyLoginReward !== null && (
            <CoinParticle
              amount={dailyLoginReward}
              onComplete={() => setDailyLoginReward(null)}
            />
          )}
          {streakBonusReward !== null && (
            <CoinParticle
              amount={streakBonusReward}
              isGold
              onComplete={() => setStreakBonusReward(null)}
            />
          )}
        </div>

        {/* 이전 최고 기록 */}
        {bestRecord !== null && (
          <div className="best-record-card" aria-label="이전 최고 기록">
            <div className="best-record-left">
              <span className="best-record-grade" style={{ color: bestRecord.tierColor }}>
                {bestRecord.grade}
              </span>
              <span className="best-record-tier-name">{bestRecord.tierName}</span>
            </div>
            <div className="best-record-right">
              <span className={`best-record-return ${bestRecord.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                {bestRecord.totalReturn >= 0 ? '+' : ''}{bestRecord.totalReturn.toFixed(1)}%
              </span>
              <span className="best-record-label">이 기록을 넘어보세요!</span>
            </div>
          </div>
        )}

        {/* 친구 도전 배너 */}
        {challenge && challengeProfile && (
          <div className="challenge-banner">
            <div className="challenge-header">
              <span className="challenge-icon">vs</span>
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
            <p className="challenge-prompt">이 기록을 이길 수 있을까요?</p>
          </div>
        )}

        {/* 시즌 배너 */}
        {seasonInfo.isSpecialEvent && (
          <div
            className="season-banner special-event"
            style={{ '--season-color': seasonTheme.accentColor } as React.CSSProperties}
          >
            <span className="season-emoji">{seasonTheme.emoji}</span>
            <span className="season-message">{seasonTheme.bannerMessage}</span>
            <span className="event-badge">EVENT</span>
          </div>
        )}

        {/* Hero */}
        <h1 id="intro-title" className="intro-title">경제 센스 테스트</h1>
        <p className="intro-subtitle">
          {formatBalance(currentConfig.initialBalance)} 받았다.<br />
          <strong>{currentConfig.totalRounds}번 선택</strong> 후 얼마 남을까?
        </p>

        {/* 약관 동의 영역 (체크박스 게이트) */}
        <div
          className="intro-consent"
          style={{
            margin: '12px auto',
            padding: '14px 16px',
            background: '#FFFFFF',
            border: '1px solid #E5E8EB',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 360,
            width: '100%',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#191F28' }}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              aria-label="이용약관 동의"
              style={{ width: 18, height: 18 }}
            />
            <span>
              <a href={LEGAL_URLS.terms} target="_blank" rel="noopener noreferrer" style={{ color: '#10B981', textDecoration: 'underline' }}>
                이용약관
              </a>
              에 동의합니다 (필수)
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#191F28' }}>
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              aria-label="개인정보 처리방침 동의"
              style={{ width: 18, height: 18 }}
            />
            <span>
              <a href={LEGAL_URLS.privacy} target="_blank" rel="noopener noreferrer" style={{ color: '#10B981', textDecoration: 'underline' }}>
                개인정보 처리방침
              </a>
              에 동의합니다 (필수)
            </span>
          </label>
        </div>

        {/* CTA 버튼 */}
        <button
          className={`start-button ${selectedMode === 'extreme' ? 'extreme' : ''}`}
          onClick={handleStart}
          disabled={isAuthLoading || !bothConsented}
          aria-label={`${currentConfig.name}로 게임 시작하기`}
          style={!bothConsented && !isAuthLoading ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          {isAuthLoading ? '준비 중...' : '토스 로그인으로 시작하기'}
        </button>

        {consentError && (
          <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginTop: 6 }}>{consentError}</p>
        )}

        {/* 훅 문구 */}
        <div className="intro-hook">
          <span className="hook-text">
            {selectedMode === 'extreme' ? '파산 각오됐어?' : '당신은 금손? 흙손?'}
          </span>
        </div>

        {/* 모드 선택 */}
        <div className="mode-selector" role="group" aria-label="게임 모드 선택">
          <button
            className={`mode-btn ${selectedMode === 'normal' ? 'active' : ''} ${pulsingMode === 'normal' ? 'mode-btn--pulse' : ''}`}
            onClick={() => handleModeChange('normal')}
            aria-pressed={selectedMode === 'normal'}
          >
            <span className="mode-emoji">{GAME_MODE_CONFIG.normal.emoji}</span>
            <span className="mode-name">{GAME_MODE_CONFIG.normal.name}</span>
            <span className="mode-desc">{GAME_MODE_CONFIG.normal.description}</span>
          </button>
          <button
            className={`mode-btn extreme ${selectedMode === 'extreme' ? 'active' : ''} ${pulsingMode === 'extreme' ? 'mode-btn--pulse' : ''}`}
            onClick={() => handleModeChange('extreme')}
            aria-pressed={selectedMode === 'extreme'}
          >
            <span className="mode-emoji">{GAME_MODE_CONFIG.extreme.emoji}</span>
            <span className="mode-name">{GAME_MODE_CONFIG.extreme.name}</span>
            <span className="mode-desc">{GAME_MODE_CONFIG.extreme.description}</span>
          </button>
        </div>
        {modeFeedback && (
          <p
            className={`mode-feedback mode-feedback--${modeFeedback.mode}`}
            aria-live="polite"
          >
            {modeFeedback.message}
          </p>
        )}

        {/* 미션 패널 */}
        <MissionPanel />

        {/* 특징 리스트 */}
        <ul className="intro-features" aria-label="게임 특징">
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">{'🎲'}</span>
            <span className="feature-text">진짜 확률로 결과 결정</span>
          </li>
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">{'🧠'}</span>
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

        {/* 참여자 수 (100명 미만이면 비노출) */}
        {totalPlayers >= 100 && (
          <p className="intro-participant-count" aria-live="polite">
            <strong>{formatPlayerCount(totalPlayers)}</strong>명이 참여했어요
          </p>
        )}

        {/* 면책 고지 */}
        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>

        {/* 하단 배너 광고 */}
        <AdBanner className="intro-banner" />
      </div>
    </main>
  );
}
