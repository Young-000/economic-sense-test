import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_MODE_CONFIG, type GameMode } from '@domain/entities';
import { trackPageView, trackClick, triggerHapticFeedback } from '@lib/appsInToss';

export function IntroPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');

  const currentConfig = GAME_MODE_CONFIG[selectedMode];

  // 페이지 진입 시 애널리틱스 추적
  useEffect(() => {
    trackPageView('intro_page');
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

  return (
    <main className="intro-page" role="main" aria-labelledby="intro-title">
      <div className="intro-content">
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

        <button
          className={`start-button ${selectedMode === 'extreme' ? 'extreme' : ''}`}
          onClick={handleStart}
          aria-label={`${currentConfig.name}로 게임 시작하기`}
        >
          {selectedMode === 'extreme' ? '🔥 극한 도전!' : '돈 불려보기'}
        </button>

        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>
      </div>
    </main>
  );
}
