import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { getGameConfig, type Outcome, type GameMode } from '@domain/entities';
import { calculateExpectedValue } from '@domain/usecases/gameEngine';
import { AssetProgressChart } from '@presentation/components';
import { triggerHapticFeedback, trackClick } from '@lib/appsInToss';
import { formatBalance } from '@lib/formatUtils';
import { getReactionMessage, getLuckText } from '@data/reactions';

// 컴포넌트 외부에 정의하여 리렌더링 시 재생성 방지
const formatMoney = (value: number, showSign = true): string => {
  const absValue = Math.abs(value);
  const sign = showSign ? (value >= 0 ? '+' : '-') : '';
  if (absValue >= 100_000_000) {
    return `${sign}${(absValue / 100_000_000).toFixed(1)}억`;
  }
  const inMan = Math.round(absValue / 10_000);
  if (inMan === 0) return `${sign}0만`;
  return `${sign}${inMan.toLocaleString()}만`;
};

const renderOutcomes = (outcomes: Outcome[]): JSX.Element[] => {
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

export function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as GameMode) || 'normal';
  const gameConfig = getGameConfig(mode);

  const {
    gameState,
    currentQuestion,
    lastResult,
    makeChoice,
    nextRound,
    isWaitingResult,
    questions,
  } = useGame({ mode });

  useEffect(() => {
    if (gameState.isComplete) {
      // URL 길이 제한 문제 해결: sessionStorage 사용
      sessionStorage.setItem('gameResults', JSON.stringify(gameState.results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
      navigate('/result', { replace: true });
    }
  }, [gameState.isComplete, gameState.results, questions, navigate]);

  // 라운드별 결과 요약 (미니 차트용)
  const roundSummary = useMemo(() => {
    return gameState.results.map((r) => r.actualOutcome >= 0);
  }, [gameState.results]);

  // 연속 수익/손실 스트릭 계산
  const currentStreak = useMemo(() => {
    if (gameState.results.length === 0) return { count: 0, type: null };

    const lastResult = gameState.results[gameState.results.length - 1];
    const isPositive = lastResult.actualOutcome >= 0;
    let count = 1;

    for (let i = gameState.results.length - 2; i >= 0; i--) {
      const prevIsPositive = gameState.results[i].actualOutcome >= 0;
      if (prevIsPositive === isPositive) {
        count++;
      } else {
        break;
      }
    }

    return { count, type: isPositive ? 'win' : 'lose' };
  }, [gameState.results]);

  // 선택 시 햅틱 피드백 + 애널리틱스
  const handleChoice = useCallback((choice: 'A' | 'B') => {
    triggerHapticFeedback('light');
    trackClick(`choice_${choice}`, { round: gameState.currentRound + 1 });
    makeChoice(choice);
  }, [makeChoice, gameState.currentRound]);

  // 다음 라운드 진행 시 햅틱 피드백
  const handleNextRound = useCallback(() => {
    triggerHapticFeedback('medium');
    nextRound();
  }, [nextRound]);

  if (gameState.isComplete || !currentQuestion) return null;

  return (
    <div className="game-page">
      {/* 상단 헤더 */}
      <div className="game-header">
        <div className="round-badge">
          <span>{gameState.currentRound + 1}/{gameConfig.TOTAL_ROUNDS}</span>
          <div
            className="progress-bar-wrapper"
            role="progressbar"
            aria-valuenow={gameState.currentRound + 1}
            aria-valuemin={1}
            aria-valuemax={gameConfig.TOTAL_ROUNDS}
            aria-label="게임 진행률"
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${((gameState.currentRound + 1) / gameConfig.TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
        <div className="balance-display">
          <span className="balance-amount">{formatBalance(gameState.balance)}</span>
        </div>
      </div>

      {/* 라운드별 결과 도트 + 미니 차트 */}
      {roundSummary.length > 0 && (
        <div className="round-progress-section">
          <div className="round-summary">
            {roundSummary.map((isPositive, i) => (
              <div
                key={i}
                className={`round-dot ${isPositive ? 'positive' : 'negative'}`}
              />
            ))}
            {/* 남은 라운드 표시 */}
            {Array.from({ length: gameConfig.TOTAL_ROUNDS - roundSummary.length }).map((_, i) => (
              <div
                key={`remaining-${i}`}
                className={`round-dot ${i === 0 ? 'current' : ''}`}
              />
            ))}
          </div>
          {/* 미니 자산 변화 차트 */}
          <AssetProgressChart
            results={gameState.results}
            currentBalance={gameState.balance}
            height={80}
            animate={false}
            compact={true}
          />
        </div>
      )}

      {/* 결과 오버레이 */}
      {isWaitingResult && lastResult ? (
        <div className="result-overlay">
          <div className="result-popup">
            <div className={`result-amount ${lastResult.actualOutcome >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(lastResult.actualOutcome)}
            </div>
            <div className="result-luck">
              {getLuckText(lastResult.actualOutcome, lastResult.expectedValue)}
            </div>
            {/* 상황별 리액션 메시지 */}
            <div className="result-reaction">
              {getReactionMessage({
                outcome: lastResult.actualOutcome,
                expectedValue: lastResult.expectedValue,
                winStreak: currentStreak.type === 'win' ? currentStreak.count : 0,
                loseStreak: currentStreak.type === 'lose' ? currentStreak.count : 0,
                roundNumber: gameState.currentRound,
                totalRounds: gameConfig.TOTAL_ROUNDS,
                currentBalance: gameState.balance,
                initialBalance: gameConfig.INITIAL_BALANCE,
              })}
            </div>
            {/* 연속 스트릭 표시 */}
            {currentStreak.count >= 3 && (
              <div className={`streak-badge ${currentStreak.type}`}>
                {currentStreak.type === 'win' ? '🔥' : '💧'} {currentStreak.count}연속 {currentStreak.type === 'win' ? '수익!' : '손실'}
              </div>
            )}
            <button className="next-btn" onClick={handleNextRound}>
              {gameState.currentRound + 1 >= gameConfig.TOTAL_ROUNDS ? '결과 보기 →' : '다음 →'}
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
          <div className="choices" role="group" aria-label="투자 선택지">
            <button
              className="choice-card"
              onClick={() => handleChoice('A')}
              aria-label={`${currentQuestion.optionA.label}, 기대수익 ${formatMoney(calculateExpectedValue(currentQuestion.optionA))}`}
            >
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionA.label}</span>
                <span className={`expected-value ${calculateExpectedValue(currentQuestion.optionA) >= 0 ? 'positive' : 'negative'}`}>
                  기대수익 {formatMoney(calculateExpectedValue(currentQuestion.optionA))}
                </span>
              </div>
              <div className="outcomes-list" aria-hidden="true">
                {renderOutcomes(currentQuestion.optionA.outcomes)}
              </div>
            </button>

            <div className="vs-badge" aria-hidden="true">VS</div>

            <button
              className="choice-card"
              onClick={() => handleChoice('B')}
              aria-label={`${currentQuestion.optionB.label}, 기대수익 ${formatMoney(calculateExpectedValue(currentQuestion.optionB))}`}
            >
              <div className="choice-header">
                <span className="choice-label">{currentQuestion.optionB.label}</span>
                <span className={`expected-value ${calculateExpectedValue(currentQuestion.optionB) >= 0 ? 'positive' : 'negative'}`}>
                  기대수익 {formatMoney(calculateExpectedValue(currentQuestion.optionB))}
                </span>
              </div>
              <div className="outcomes-list" aria-hidden="true">
                {renderOutcomes(currentQuestion.optionB.outcomes)}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
