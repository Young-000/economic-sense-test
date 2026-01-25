/**
 * AssetProgressChart 컴포넌트 테스트
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetProgressChart } from '../AssetProgressChart';
import type { RoundResult } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';

const createMockResult = (
  questionId: number,
  outcome: number
): RoundResult => ({
  questionId,
  choice: 'A',
  chosenOption: {
    label: 'Test',
    description: 'Test',
    outcomes: [{ probability: 1, value: outcome }],
  },
  actualOutcome: outcome,
  expectedValue: outcome,
});

describe('AssetProgressChart', () => {
  const INITIAL_BALANCE = GAME_CONFIG.INITIAL_BALANCE;

  describe('basic rendering', () => {
    it('should render SVG chart', () => {
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
        />
      );

      expect(screen.getByRole('img', { name: /자산 변화/i })).toBeInTheDocument();
    });

    it('should render chart header with title', () => {
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
        />
      );

      expect(screen.getByText('자산 변화')).toBeInTheDocument();
    });

    it('should show current return percentage', () => {
      // 10% 수익
      const balance = INITIAL_BALANCE * 1.1;
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={balance}
        />
      );

      expect(screen.getByText('+10.0%')).toBeInTheDocument();
    });

    it('should show negative return with minus sign', () => {
      // 5% 손실
      const balance = INITIAL_BALANCE * 0.95;
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={balance}
        />
      );

      expect(screen.getByText('-5.0%')).toBeInTheDocument();
    });
  });

  describe('with results data', () => {
    it('should render data points for each round', () => {
      const results: RoundResult[] = [
        createMockResult(1, 100_000),
        createMockResult(2, -50_000),
        createMockResult(3, 200_000),
      ];

      const { container } = render(
        <AssetProgressChart
          results={results}
          currentBalance={INITIAL_BALANCE + 250_000}
        />
      );

      // 시작점 + 3개 라운드 = 4개 포인트
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(4);
    });

    it('should render line path', () => {
      const results: RoundResult[] = [createMockResult(1, 100_000)];

      const { container } = render(
        <AssetProgressChart
          results={results}
          currentBalance={INITIAL_BALANCE + 100_000}
        />
      );

      const paths = container.querySelectorAll('path[stroke]');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('with best performance data', () => {
    it('should render best performance line when provided', () => {
      const bestPerformance = [
        { round: 0, balance: INITIAL_BALANCE },
        { round: 1, balance: INITIAL_BALANCE + 500_000 },
      ];

      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, 100_000)]}
          currentBalance={INITIAL_BALANCE + 100_000}
          bestPerformance={bestPerformance}
        />
      );

      // 최고 성적 라인(dashed)이 있는지 확인
      const dashedPath = container.querySelector('path[stroke-dasharray="6,4"]');
      expect(dashedPath).toBeInTheDocument();
    });

    it('should show legend when best performance is provided', () => {
      const bestPerformance = [
        { round: 0, balance: INITIAL_BALANCE },
        { round: 1, balance: INITIAL_BALANCE + 500_000 },
      ];

      render(
        <AssetProgressChart
          results={[createMockResult(1, 100_000)]}
          currentBalance={INITIAL_BALANCE + 100_000}
          bestPerformance={bestPerformance}
        />
      );

      expect(screen.getByText('내 자산')).toBeInTheDocument();
      expect(screen.getByText('최고 성적')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should hide header in compact mode', () => {
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
          compact={true}
        />
      );

      expect(screen.queryByText('자산 변화')).not.toBeInTheDocument();
    });

    it('should hide legend in compact mode', () => {
      const bestPerformance = [
        { round: 0, balance: INITIAL_BALANCE },
      ];

      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
          bestPerformance={bestPerformance}
          compact={true}
        />
      );

      expect(screen.queryByText('내 자산')).not.toBeInTheDocument();
    });

    it('should have compact class', () => {
      const { container } = render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
          compact={true}
        />
      );

      expect(container.querySelector('.asset-chart.compact')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should use green color for positive returns', () => {
      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, 500_000)]}
          currentBalance={INITIAL_BALANCE + 500_000}
        />
      );

      const returnEl = container.querySelector('.current-return');
      expect(returnEl).toHaveClass('positive');
    });

    it('should use red color for negative returns', () => {
      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, -500_000)]}
          currentBalance={INITIAL_BALANCE - 500_000}
        />
      );

      const returnEl = container.querySelector('.current-return');
      expect(returnEl).toHaveClass('negative');
    });

    it('should apply animation classes by default', () => {
      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, 100_000)]}
          currentBalance={INITIAL_BALANCE + 100_000}
        />
      );

      const animatedPath = container.querySelector('.chart-line-animate');
      expect(animatedPath).toBeInTheDocument();
    });

    it('should not apply animation classes when animate is false', () => {
      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, 100_000)]}
          currentBalance={INITIAL_BALANCE + 100_000}
          animate={false}
        />
      );

      const animatedPath = container.querySelector('.chart-line-animate');
      expect(animatedPath).not.toBeInTheDocument();
    });
  });

  describe('X-axis labels', () => {
    it('should show start and end labels in normal mode', () => {
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
        />
      );

      expect(screen.getByText('시작')).toBeInTheDocument();
      expect(screen.getByText('종료')).toBeInTheDocument();
    });

    it('should show middle round label', () => {
      render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
        />
      );

      // TOTAL_ROUNDS / 2 = 5
      expect(screen.getByText('5R')).toBeInTheDocument();
    });
  });

  describe('empty data', () => {
    it('should handle empty results gracefully', () => {
      const { container } = render(
        <AssetProgressChart
          results={[]}
          currentBalance={INITIAL_BALANCE}
        />
      );

      // 시작점만 있어야 함
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(1);
    });
  });

  describe('formatBalance helper', () => {
    it('should format large values in 억 units', () => {
      // 극한 모드에서 1억 이상 수익 - initialBalance를 5천만원 이상으로 설정해야 억 단위 축 생성
      const extremeInitial = 50_000_000; // 극한 모드 시작 금액
      const balance = extremeInitial + 100_000_000; // 1.5억
      const { container } = render(
        <AssetProgressChart
          results={[createMockResult(1, 100_000_000)]}
          currentBalance={balance}
          initialBalance={extremeInitial}
        />
      );

      // Y축 라벨에 억 단위가 표시되어야 함
      const labels = container.querySelectorAll('.chart-label');
      const hasOk = Array.from(labels).some((l) => l.textContent?.includes('억'));
      expect(hasOk).toBe(true);
    });
  });
});
