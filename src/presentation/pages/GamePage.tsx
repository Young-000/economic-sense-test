import { useEffect } from 'react';
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

  useEffect(() => {
    if (gameState.isComplete) {
      const resultsParam = encodeURIComponent(JSON.stringify(gameState.results));
      navigate(`/result?data=${resultsParam}`, { replace: true });
    }
  }, [gameState.isComplete, gameState.results, navigate]);

  if (gameState.isComplete || !currentQuestion) return null;

  const formatMoney = (value: number, showSign = true) => {
    const absValue = Math.abs(value);
    const sign = showSign ? (value >= 0 ? '+' : '-') : '';
    if (absValue >= 100_000_000) {
      return `${sign}${(absValue / 100_000_000).toFixed(1)}억`;
    }
    if (absValue >= 10_000) {
      return `${sign}${Math.round(absValue / 10_000)}만`;
    }
    return `${sign}${absValue.toLocaleString()}`;
  };

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(2)}억`;
    }
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  const renderOutcomes = (outcomes: typeof currentQuestion.optionA.outcomes) => {
    return outcomes.map((outcome, idx) => (
      <div key={idx} className="outcome-row">
        <span className={`outcome-value ${outcome.value >= 0 ? 'positive' : 'negative'}`}>
          {formatMoney(outcome.value)}
        </span>
        <div className="probability-bar-container">
          <div
            className={`probability-bar ${outcome.value >= 0 ? 'positive' : 'negative'}`}
            style={{ width: `${outcome.probability * 100}%` }}
          />
        </div>
        <span className="probability-text">{Math.round(outcome.probability * 100)}%</span>
      </div>
    ));
  };

  return (
    <div className="game-page">
      {/* 상단 헤더 */}
      <div className="game-header">
        <div className="round-badge">
          {gameState.currentRound + 1}/{GAME_CONFIG.TOTAL_ROUNDS}
        </div>
        <div className="balance-display">
          <span className="balance-amount">{formatBalance(gameState.balance)}</span>
        </div>
      </div>

      {/* 결과 오버레이 */}
      {isWaitingResult && lastResult ? (
        <div className="result-overlay">
          <div className="result-popup">
            <div className={`result-amount ${lastResult.actualOutcome >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(lastResult.actualOutcome)}
            </div>
            <div className="result-luck">
              {lastResult.actualOutcome > lastResult.expectedValue && '🍀 Lucky!'}
              {lastResult.actualOutcome < lastResult.expectedValue && '😢 Unlucky'}
              {lastResult.actualOutcome === lastResult.expectedValue && '📊 Expected'}
            </div>
            <button className="next-btn" onClick={nextRound}>
              {gameState.currentRound + 1 >= GAME_CONFIG.TOTAL_ROUNDS ? '결과 보기 →' : '다음 →'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 상황 카드 */}
          <div className="situation-card">
            <span className="situation-text">{currentQuestion.situation}</span>
          </div>

          {/* 선택지 카드들 */}
          <div className="choices">
            <button className="choice-card" onClick={() => makeChoice('A')}>
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionA.label}</span>
              </div>
              <div className="outcomes-list">
                {renderOutcomes(currentQuestion.optionA.outcomes)}
              </div>
            </button>

            <div className="vs-badge">VS</div>

            <button className="choice-card" onClick={() => makeChoice('B')}>
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionB.label}</span>
              </div>
              <div className="outcomes-list">
                {renderOutcomes(currentQuestion.optionB.outcomes)}
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
