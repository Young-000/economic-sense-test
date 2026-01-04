import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { GAME_CONFIG } from '@domain/entities';
import { calculateExpectedValue } from '@domain/usecases/gameEngine';

export function GamePage() {
  const navigate = useNavigate();
  const {
    gameState,
    currentQuestion,
    lastResult,
    makeChoice,
    nextRound,
    isWaitingResult,
    questions,
  } = useGame();

  useEffect(() => {
    if (gameState.isComplete) {
      // URL 길이 제한 문제 해결: sessionStorage 사용
      sessionStorage.setItem('gameResults', JSON.stringify(gameState.results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
      navigate('/result', { replace: true });
    }
  }, [gameState.isComplete, gameState.results, questions, navigate]);

  if (gameState.isComplete || !currentQuestion) return null;

  const formatMoney = (value: number, showSign = true) => {
    const absValue = Math.abs(value);
    const sign = showSign ? (value >= 0 ? '+' : '-') : '';
    if (absValue >= 100_000_000) {
      return `${sign}${(absValue / 100_000_000).toFixed(1)}억`;
    }
    // 모든 수치를 만원 단위로 표시
    const inMan = Math.round(absValue / 10_000);
    if (inMan === 0) return `${sign}0만`;
    return `${sign}${inMan.toLocaleString()}만`;
  };

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(1)}억원`;
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
          <span>{gameState.currentRound + 1}/{GAME_CONFIG.TOTAL_ROUNDS}</span>
          <div className="progress-dots">
            {Array.from({ length: GAME_CONFIG.TOTAL_ROUNDS }, (_, i) => (
              <div
                key={i}
                className={`progress-dot ${
                  i < gameState.currentRound ? 'completed' :
                  i === gameState.currentRound ? 'current' : ''
                }`}
              />
            ))}
          </div>
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
        <div key={currentQuestion.id} className="question-container">
          {/* 상황 카드 */}
          <div className="situation-card">
            <span className="situation-text">{currentQuestion.situation}</span>
          </div>

          {/* 선택지 카드들 */}
          <div className="choices">
            <button className="choice-card" onClick={() => makeChoice('A')}>
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionA.label}</span>
                <span className={`expected-value ${calculateExpectedValue(currentQuestion.optionA) >= 0 ? 'positive' : 'negative'}`}>
                  기대수익 {formatMoney(calculateExpectedValue(currentQuestion.optionA))}
                </span>
              </div>
              <div className="outcomes-list">
                {renderOutcomes(currentQuestion.optionA.outcomes)}
              </div>
            </button>

            <div className="vs-badge">VS</div>

            <button className="choice-card" onClick={() => makeChoice('B')}>
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionB.label}</span>
                <span className={`expected-value ${calculateExpectedValue(currentQuestion.optionB) >= 0 ? 'positive' : 'negative'}`}>
                  기대수익 {formatMoney(calculateExpectedValue(currentQuestion.optionB))}
                </span>
              </div>
              <div className="outcomes-list">
                {renderOutcomes(currentQuestion.optionB.outcomes)}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
