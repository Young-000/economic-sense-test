import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_MODE_CONFIG, type GameMode, investorProfiles } from '@domain/entities';
import { getTotalPlayers } from '@data/rankingService';
import { extractAndSaveChallenge, type ChallengeData } from '@lib/challengeUtils';
import { getCurrentTheme, formatSeasonInfo } from '@lib/seasonUtils';
import { AdBanner } from '@presentation/components';

export function IntroPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  // URL 파라미터에서 도전 데이터 추출 (lazy initialization)
  const [challenge] = useState<ChallengeData | null>(() => extractAndSaveChallenge());

  const currentConfig = GAME_MODE_CONFIG[selectedMode];

  // 현재 시즌/이벤트 테마
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

  const handleModeChange = (mode: GameMode): void => {
    setSelectedMode(mode);
  };

  const handleStart = (): void => {
    navigate(`/game?mode=${selectedMode}`);
  };

  const formatBalance = (value: number): string => {
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  // 참여자 수 포맷팅 (1000 이상이면 천 단위로)
  const formatPlayerCount = (count: number): string => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    if (count > 0) return count.toLocaleString();
    return '';
  };

  // 도전자 프로필 정보
  const challengeProfile = challenge ? investorProfiles[challenge.type] : null;

  return (
    <main className="intro-page" role="main" aria-labelledby="intro-title">
      <div className="intro-content">

        {/* === Fold 위: 즉시 보이는 영역 === */}

        {/* 1. 친구 도전 배너 (조건부 — challenge URL only) */}
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
            <p className="challenge-prompt">이 기록을 이길 수 있을까요?</p>
          </div>
        )}

        {/* 2. 시즌 배너 (특별 이벤트 시만) */}
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

        {/* 3. Hero: 이모지 + 제목 + 부제목 */}
        <h1 id="intro-title" className="intro-title">💸 돈 감각 테스트</h1>
        <p className="intro-subtitle">
          {formatBalance(currentConfig.initialBalance)} 받았다.<br />
          <strong>{currentConfig.totalRounds}번 선택</strong> 후 얼마 남을까?
        </p>

        {/* 4. CTA 버튼 — fold 위 보장 */}
        <button
          className={`start-button ${selectedMode === 'extreme' ? 'extreme' : ''}`}
          onClick={handleStart}
          aria-label={`${currentConfig.name}로 게임 시작하기`}
        >
          {selectedMode === 'extreme' ? '🔥 극한 도전!' : '돈 불려보기'}
        </button>

        {/* 5. 훅 문구 */}
        <div className="intro-hook" aria-hidden="true">
          <span className="hook-emoji">🤔</span>
          <span className="hook-text">
            {selectedMode === 'extreme' ? '파산 각오됐어?' : '당신은 금손? 흙손?'}
          </span>
        </div>

        {/* === Fold 아래: 스크롤 후 보이는 영역 === */}

        {/* 6. 모드 선택 (일반/극한) */}
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

        {/* 7. 특징 리스트 (3개, 간소화) */}
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

        {/* 8. 참여자 수 (실제 DB 데이터, 한 줄) */}
        {totalPlayers > 0 && (
          <p className="intro-participant-count" aria-live="polite">
            🔥 <strong>{formatPlayerCount(totalPlayers)}</strong>명이 참여했어요
          </p>
        )}

        {/* 9. 면책 고지 */}
        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>

        {/* 10. AdSense 배너 */}
        <AdBanner className="intro-ad" />
      </div>
    </main>
  );
}
