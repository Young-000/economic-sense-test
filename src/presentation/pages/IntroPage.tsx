import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_MODE_CONFIG, type GameMode, investorProfiles } from '@domain/entities';
import { getTotalPlayers } from '@data/rankingService';
import { extractAndSaveChallenge, type ChallengeData } from '@lib/challengeUtils';
import { getCurrentTheme, formatSeasonInfo } from '@lib/seasonUtils';
import { initializeUserIdentity } from '@infrastructure/userIdentity';
import { updateStreak, checkMissions, type MissionCompletionResult } from '@domain/services/missionService';
import { MissionPanel, MissionToast, CoinBalance } from '@presentation/components';

export function IntroPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [missionCompletions, setMissionCompletions] = useState<MissionCompletionResult[]>([]);
  const [challenge] = useState<ChallengeData | null>(() => extractAndSaveChallenge());

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

  // 스트릭 업데이트 + 미션 체크 (앱 진입 시)
  useEffect(() => {
    updateStreak();
    const results = checkMissions();
    if (results.length > 0) {
      setMissionCompletions(results);
    }
  }, []);

  const handleModeChange = (mode: GameMode): void => {
    setSelectedMode(mode);
  };

  const handleStart = useCallback(async (): Promise<void> => {
    if (isAuthLoading) return;

    if (!isAuthReady) {
      setIsAuthLoading(true);
      try {
        await initializeUserIdentity();
        setIsAuthReady(true);
      } catch (err) {
        console.warn('[IntroPage] Auth failed, proceeding as guest:', err);
        setIsAuthReady(true);
      } finally {
        setIsAuthLoading(false);
      }
    }

    navigate(`/game?mode=${selectedMode}`);
  }, [isAuthReady, isAuthLoading, selectedMode, navigate]);

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
      {missionCompletions.length > 0 && (
        <MissionToast
          completions={missionCompletions}
          onDismiss={handleDismissMissionToast}
        />
      )}

      <div className="intro-content">

        {/* 코인 잔액 */}
        <CoinBalance className="intro-coin-balance" showExchangeInfo />

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

        {/* CTA 버튼 */}
        <button
          className={`start-button ${selectedMode === 'extreme' ? 'extreme' : ''}`}
          onClick={handleStart}
          disabled={isAuthLoading}
          aria-label={`${currentConfig.name}로 게임 시작하기`}
        >
          {isAuthLoading ? '준비 중...' : selectedMode === 'extreme' ? '극한 도전!' : '시작하기'}
        </button>

        {/* 훅 문구 */}
        <div className="intro-hook" aria-hidden="true">
          <span className="hook-text">
            {selectedMode === 'extreme' ? '파산 각오됐어?' : '당신은 금손? 흙손?'}
          </span>
        </div>

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

        {/* 미션 패널 */}
        <MissionPanel />

        {/* 특징 리스트 */}
        <ul className="intro-features" aria-label="게임 특징">
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">dice</span>
            <span className="feature-text">진짜 확률로 결과 결정</span>
          </li>
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">brain</span>
            <span className="feature-text">투자 성향 + 운빨 분석</span>
          </li>
          <li className="feature">
            <span className="feature-icon" aria-hidden="true">
              {selectedMode === 'extreme' ? 'skull' : 'fire'}
            </span>
            <span className="feature-text">
              {selectedMode === 'extreme' ? '극한의 하이리스크' : '친구랑 수익률 배틀'}
            </span>
          </li>
        </ul>

        {/* 참여자 수 */}
        {totalPlayers > 0 && (
          <p className="intro-participant-count" aria-live="polite">
            <strong>{formatPlayerCount(totalPlayers)}</strong>명이 참여했어요
          </p>
        )}

        {/* 면책 고지 */}
        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>
      </div>
    </main>
  );
}
