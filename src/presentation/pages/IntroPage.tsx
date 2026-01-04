import { useNavigate } from 'react-router-dom';
import { GAME_CONFIG } from '@domain/entities';

export function IntroPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/game');
  };

  const formatBalance = (value: number) => {
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1 className="intro-title">💰 경제감각 시뮬레이션</h1>
        <p className="intro-subtitle">
          가상의 {formatBalance(GAME_CONFIG.INITIAL_BALANCE)}으로<br />
          {GAME_CONFIG.TOTAL_ROUNDS}번의 선택을 해보세요!
        </p>

        <div className="intro-features">
          <div className="feature">
            <span className="feature-icon">🎮</span>
            <span className="feature-text">실제 확률 기반 시뮬레이션</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span className="feature-text">투자 성향 + 운 분석</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <span className="feature-text">친구와 수익률 비교</span>
          </div>
        </div>

        <button className="start-button" onClick={handleStart}>
          시뮬레이션 시작
        </button>
      </div>
    </div>
  );
}
