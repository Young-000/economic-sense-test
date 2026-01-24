/**
 * 라운드별 자산 변화 그래프 컴포넌트
 * - 현재 플레이어의 자산 변화 라인
 * - 최고 성적 플레이어의 자산 변화 오버레이
 * - SVG 기반 순수 구현 (외부 라이브러리 없음)
 */
import { useMemo } from 'react';
import type { RoundResult } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';

export interface AssetDataPoint {
  round: number;
  balance: number;
}

export interface AssetProgressChartProps {
  /** 현재 게임의 라운드 결과들 */
  results: RoundResult[];
  /** 현재 잔액 */
  currentBalance: number;
  /** 최고 성적 데이터 (라운드별 잔액) - 옵션 */
  bestPerformance?: AssetDataPoint[];
  /** 차트 높이 (px) */
  height?: number;
  /** 애니메이션 활성화 */
  animate?: boolean;
  /** 컴팩트 모드 (GamePage용) */
  compact?: boolean;
}

export function AssetProgressChart({
  results,
  currentBalance,
  bestPerformance,
  height = 160,
  animate = true,
  compact = false,
}: AssetProgressChartProps) {
  const INITIAL_BALANCE = GAME_CONFIG.INITIAL_BALANCE;
  const TOTAL_ROUNDS = GAME_CONFIG.TOTAL_ROUNDS;

  // 현재 플레이어의 라운드별 자산 계산
  const currentData = useMemo<AssetDataPoint[]>(() => {
    const data: AssetDataPoint[] = [{ round: 0, balance: INITIAL_BALANCE }];
    let runningBalance = INITIAL_BALANCE;

    results.forEach((result, index) => {
      runningBalance += result.actualOutcome;
      data.push({ round: index + 1, balance: runningBalance });
    });

    return data;
  }, [results, INITIAL_BALANCE]);

  // 차트 범위 계산 - INITIAL_BALANCE를 항상 포함하여 기준선 비교 가능
  const { minBalance, maxBalance } = useMemo(() => {
    const allBalances = [
      INITIAL_BALANCE, // 항상 시작 잔액을 포함하여 기준선 표시
      ...currentData.map((d) => d.balance),
      ...(bestPerformance?.map((d) => d.balance) || []),
    ];

    const min = Math.min(...allBalances);
    const max = Math.max(...allBalances);

    // 최소 범위 설정: 시작 잔액의 20%는 항상 보이도록
    const dataRange = max - min;
    const minRange = INITIAL_BALANCE * 0.2;
    const effectiveRange = Math.max(dataRange, minRange);

    // 패딩 추가 (범위의 15%)
    const padding = effectiveRange * 0.15;

    return {
      minBalance: min - padding,
      maxBalance: max + padding,
    };
  }, [currentData, bestPerformance, INITIAL_BALANCE]);

  // SVG 좌표 계산
  const chartWidth = compact ? 200 : 320;
  const chartHeight = height;
  const paddingLeft = compact ? 10 : 50;
  const paddingRight = compact ? 10 : 20;
  const paddingTop = 20;
  const paddingBottom = compact ? 10 : 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const scaleX = (round: number) => paddingLeft + (round / TOTAL_ROUNDS) * graphWidth;
  const scaleY = (balance: number) =>
    chartHeight - paddingBottom - ((balance - minBalance) / (maxBalance - minBalance)) * graphHeight;

  // 라인 path 생성
  const createLinePath = (data: AssetDataPoint[]) => {
    if (data.length === 0) return '';
    return data
      .map((point, i) => {
        const x = scaleX(point.round);
        const y = scaleY(point.balance);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // 그라데이션 영역 path 생성
  const createAreaPath = (data: AssetDataPoint[]) => {
    if (data.length === 0) return '';
    const linePath = createLinePath(data);
    const lastX = scaleX(data[data.length - 1].round);
    const firstX = scaleX(0);
    const bottomY = chartHeight - paddingBottom;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const currentPath = createLinePath(currentData);
  const currentAreaPath = createAreaPath(currentData);
  const bestPath = bestPerformance ? createLinePath(bestPerformance) : '';

  // 수익률 계산
  const currentReturn = ((currentBalance - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;
  const isPositive = currentReturn >= 0;

  // Y축 눈금 계산
  const yTicks = useMemo(() => {
    const tickCount = compact ? 3 : 5;
    const ticks: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      const balance = minBalance + ((maxBalance - minBalance) * i) / (tickCount - 1);
      ticks.push(balance);
    }
    return ticks;
  }, [minBalance, maxBalance, compact]);

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(1)}억`;
    }
    return `${Math.round(value / 10_000)}만`;
  };

  return (
    <div className={`asset-chart ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="chart-header">
          <span className="chart-title">자산 변화</span>
          <span className={`current-return ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}
            {currentReturn.toFixed(1)}%
          </span>
        </div>
      )}

      <svg
        width={chartWidth}
        height={chartHeight}
        className="asset-chart-svg"
        role="img"
        aria-label="라운드별 자산 변화 그래프"
      >
        <defs>
          {/* 현재 플레이어 그라데이션 */}
          <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.05" />
          </linearGradient>

          {/* 최고 성적 그라데이션 */}
          <linearGradient id="bestGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 그리드 라인 */}
        {!compact &&
          yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={scaleY(tick)}
                x2={chartWidth - paddingRight}
                y2={scaleY(tick)}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 8}
                y={scaleY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="chart-label"
                fontSize="10"
                fill="#9CA3AF"
              >
                {formatBalance(tick)}
              </text>
            </g>
          ))}

        {/* 시작점 기준선 */}
        <line
          x1={paddingLeft}
          y1={scaleY(INITIAL_BALANCE)}
          x2={chartWidth - paddingRight}
          y2={scaleY(INITIAL_BALANCE)}
          stroke="#9CA3AF"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.5"
        />

        {/* 최고 성적 영역 (배경) */}
        {bestPerformance && bestPath && (
          <>
            <path
              d={createAreaPath(bestPerformance)}
              fill="url(#bestGradient)"
              className={animate ? 'chart-area-animate' : ''}
            />
            <path
              d={bestPath}
              fill="none"
              stroke="#FBBF24"
              strokeWidth={compact ? 2.5 : 2}
              strokeDasharray={compact ? '4,3' : '6,4'}
              opacity={compact ? 0.9 : 0.7}
              className={animate ? 'chart-line-animate' : ''}
            />
            {/* 1등 최종 포인트 마커 (compact 모드) */}
            {compact && bestPerformance.length > 0 && (
              <circle
                cx={scaleX(bestPerformance[bestPerformance.length - 1].round)}
                cy={scaleY(bestPerformance[bestPerformance.length - 1].balance)}
                r={4}
                fill="#FBBF24"
                stroke="white"
                strokeWidth="1.5"
                opacity={0.9}
              />
            )}
          </>
        )}

        {/* 현재 플레이어 영역 */}
        <path
          d={currentAreaPath}
          fill="url(#currentGradient)"
          className={animate ? 'chart-area-animate' : ''}
        />

        {/* 현재 플레이어 라인 */}
        <path
          d={currentPath}
          fill="none"
          stroke={isPositive ? '#10B981' : '#EF4444'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? 'chart-line-animate' : ''}
        />

        {/* 데이터 포인트 */}
        {currentData.map((point, i) => (
          <circle
            key={i}
            cx={scaleX(point.round)}
            cy={scaleY(point.balance)}
            r={compact ? 3 : 4}
            fill={isPositive ? '#10B981' : '#EF4444'}
            stroke="white"
            strokeWidth="2"
            className={animate ? 'chart-point-animate' : ''}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* X축 라운드 라벨 */}
        {!compact &&
          [0, Math.floor(TOTAL_ROUNDS / 2), TOTAL_ROUNDS].map((round) => (
            <text
              key={round}
              x={scaleX(round)}
              y={chartHeight - 8}
              textAnchor="middle"
              className="chart-label"
              fontSize="10"
              fill="#9CA3AF"
            >
              {round === 0 ? '시작' : round === TOTAL_ROUNDS ? '종료' : `${round}R`}
            </text>
          ))}
      </svg>

      {/* 범례 */}
      {!compact && bestPerformance && (
        <div className="chart-legend">
          <div className="legend-item">
            <span
              className="legend-line"
              style={{ background: isPositive ? '#10B981' : '#EF4444' }}
            />
            <span>내 자산</span>
          </div>
          <div className="legend-item">
            <span
              className="legend-line dashed"
              style={{ background: '#FBBF24' }}
            />
            <span>최고 성적</span>
          </div>
        </div>
      )}
    </div>
  );
}
