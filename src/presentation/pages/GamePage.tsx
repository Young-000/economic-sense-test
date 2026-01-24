import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { getGameConfig, type Outcome, type GameMode } from '@domain/entities';
import { calculateExpectedValue } from '@domain/usecases/gameEngine';
import { AssetProgressChart } from '@presentation/components';
import { triggerHapticFeedback, trackClick } from '@lib/appsInToss';
import { formatBalance, formatMoney } from '@lib/formatUtils';
import { getReactionMessage, getLuckText } from '@data/reactions';

// formatMoney는 이제 @lib/formatUtils에서 import
// 작은 금액도 '천' 단위로 정확히 표시됨 (예: -8000원 → -8천)

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
  const rawMode = searchParams.get('mode');
  const mode: GameMode = rawMode === 'extreme' ? 'extreme' : 'normal';
  const gameConfig = getGameConfig(mode);

  const {
    gameState,
    currentQuestion,
    lastResult,
    makeChoice,
    nextRound,
    isWaitingResult,
    isLoadingQuestions,
    questions,
    topPlayerData,
  } = useGame({ mode });

  useEffect(() => {
    if (gameState.isComplete) {
      // URL 길이 제한 문제 해결: sessionStorage 사용
      sessionStorage.setItem('gameResults', JSON.stringify(gameState.results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
      sessionStorage.setItem('gameMode', mode);
      navigate('/result', { replace: true });
    }
  }, [gameState.isComplete, gameState.results, questions, navigate, mode]);

  // 라운드별 결과 요약 (미니 차트용)
  const roundSummary = useMemo(() => {
    return gameState.results.map((r) => r.actualOutcome >= 0);
  }, [gameState.results]);

  // 연속 수익/손실 스트릭 계산 (결과 대기 중일 때 현재 결과도 포함)
  const currentStreak = useMemo(() => {
    // 결과 대기 중이면 lastResult를 포함해서 계산
    const allResults = isWaitingResult && lastResult
      ? [...gameState.results, lastResult]
      : gameState.results;

    if (allResults.length === 0) return { count: 0, type: null };

    const latestResult = allResults[allResults.length - 1];
    const isPositive = latestResult.actualOutcome >= 0;
    let count = 1;

    for (let i = allResults.length - 2; i >= 0; i--) {
      const prevIsPositive = allResults[i].actualOutcome >= 0;
      if (prevIsPositive === isPositive) {
        count++;
      } else {
        break;
      }
    }

    return { count, type: isPositive ? 'win' : 'lose' };
  }, [gameState.results, isWaitingResult, lastResult]);

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

  // 로딩 상태 표시
  if (isLoadingQuestions && !currentQuestion) {
    return (
      <div className="game-page">
        <div className="loading-state">
          <span className="loading-emoji">🎲</span>
          <p>질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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

      {/* 라운드별 결과 도트 + 1등 그래프 비교 차트 */}
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
        {/* 1등 그래프 비교 차트 - 항상 표시 */}
        <div className="top-player-chart-wrapper">
          {topPlayerData && (
            <div className="top-player-indicator">
              <span className="top-icon">🏆</span>
              <span className="top-label">1등 기록</span>
            </div>
          )}
          <AssetProgressChart
            results={gameState.results}
            currentBalance={gameState.balance}
            bestPerformance={topPlayerData ?? undefined}
            height={100}
            animate={false}
            compact={true}
            initialBalance={gameConfig.INITIAL_BALANCE}
          />
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
