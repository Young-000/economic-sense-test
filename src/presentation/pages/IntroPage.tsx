import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_CONFIG } from '@domain/entities';
import { trackPageView, trackClick, triggerHapticFeedback } from '@lib/appsInToss';

export function IntroPage() {
  const navigate = useNavigate();

  // 페이지 진입 시 애널리틱스 추적
  useEffect(() => {
    trackPageView('intro_page');
  }, []);

  const handleStart = () => {
    triggerHapticFeedback('medium');
    trackClick('start_game');
    navigate('/game');
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
          {formatBalance(GAME_CONFIG.INITIAL_BALANCE)} 받았다.<br />
          <strong>{GAME_CONFIG.TOTAL_ROUNDS}번 선택</strong> 후 얼마 남을까?
        </p>

        <div className="intro-hook" aria-hidden="true">
          <span className="hook-emoji">🤔</span>
          <span className="hook-text">당신은 금손? 흙손?</span>
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
            <span className="feature-icon" aria-hidden="true">🔥</span>
            <span className="feature-text">친구랑 수익률 배틀</span>
          </li>
        </ul>

        <button
          className="start-button"
          onClick={handleStart}
          aria-label="게임 시작하기"
        >
          돈 불려보기
        </button>

        <p className="intro-disclaimer" role="note">
          * 실제 돈이 아닙니다. 재미로만 즐겨주세요!
        </p>
      </div>
    </main>
  );
}
