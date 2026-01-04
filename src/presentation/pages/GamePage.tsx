import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { GAME_CONFIG } from '@domain/entities';

export function GamePage() {
  const navigate = useNavigate();
  const {
    gameState,
    currentQuestion,
    lastResult,
    makeChoice,
    nextRound,
    isWaitingResult,
  } = useGame();

  // 게임 완료 시 결과 페이지로
  if (gameState.isComplete) {
    const resultsParam = encodeURIComponent(JSON.stringify(gameState.results));
    navigate(`/result?data=${resultsParam}`);
    return null;
  }

  if (!currentQuestion) return null;

  const formatMoney = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 100_000_000) {
      return `${value >= 0 ? '+' : '-'}${(absValue / 100_000_000).toFixed(1)}억`;
    }
    if (absValue >= 10_000) {
      return `${value >= 0 ? '+' : '-'}${Math.round(absValue / 10_000)}만원`;
    }
    return `${value >= 0 ? '+' : '-'}${absValue.toLocaleString()}원`;
  };

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(2)}억`;
    }
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  return (
    <div className="game-page">
      {/* 상단 정보 */}
      <div className="game-header">
        <div className="round-info">
          <span className="round-label">ROUND</span>
          <span className="round-number">{gameState.currentRound + 1}/{GAME_CONFIG.TOTAL_ROUNDS}</span>
        </div>
        <div className="balance-info">
          <span className="balance-label">내 자산</span>
          <span className="balance-amount">{formatBalance(gameState.balance)}</span>
        </div>
      </div>

      {/* 결과 표시 (선택 후) */}
      {isWaitingResult && lastResult ? (
        <div className="result-overlay">
          <div className="result-card">
            <div className={`result-value ${lastResult.actualOutcome >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(lastResult.actualOutcome)}
            </div>
            <p className="result-message">
              {lastResult.actualOutcome >= 0 ? '수익 발생!' : '손실 발생...'}
            </p>
            <p className="result-expected">
              기대값: {formatMoney(lastResult.expectedValue)}
              {lastResult.actualOutcome > lastResult.expectedValue && ' (운 좋음! 🍀)'}
              {lastResult.actualOutcome < lastResult.expectedValue && ' (운 나쁨 😢)'}
            </p>
            <button className="next-button" onClick={nextRound}>
              {gameState.currentRound + 1 >= GAME_CONFIG.TOTAL_ROUNDS ? '결과 보기' : '다음 라운드'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 상황 설명 */}
          <div className="situation-card">
            <h2 className="situation-text">{currentQuestion.situation}</h2>
          </div>

          {/* 선택지 */}
          <div className="choices-container">
            <button
              className="choice-button"
              onClick={() => makeChoice('A')}
            >
              <span className="choice-label">{currentQuestion.optionA.label}</span>
              <span className="choice-description">{currentQuestion.optionA.description}</span>
            </button>

            <div className="vs-divider">VS</div>

            <button
              className="choice-button"
              onClick={() => makeChoice('B')}
            >
              <span className="choice-label">{currentQuestion.optionB.label}</span>
              <span className="choice-description">{currentQuestion.optionB.description}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
