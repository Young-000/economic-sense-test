/**
 * 게임 엔진 테스트
 */
import { describe, it, expect, vi } from 'vitest';
import {
  calculateExpectedValue,
  calculateVariance,
  rollOutcome,
  processRound,
  calculateRiskScore,
  calculateRationalityScore,
  calculateLuckScore,
  determineInvestorType,
  calculateFinalResult,
} from '../usecases/gameEngine';
import type { Option, RoundResult } from '../entities';

describe('calculateExpectedValue', () => {
  it('should calculate expected value for a single outcome', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [{ probability: 1, value: 100_000 }],
    };
    expect(calculateExpectedValue(option)).toBe(100_000);
  });

  it('should calculate expected value for multiple outcomes', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [
        { probability: 0.5, value: 200_000 },
        { probability: 0.5, value: -100_000 },
      ],
    };
    // 0.5 * 200000 + 0.5 * -100000 = 100000 - 50000 = 50000
    expect(calculateExpectedValue(option)).toBe(50_000);
  });

  it('should return 0 for zero outcomes', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [],
    };
    expect(calculateExpectedValue(option)).toBe(0);
  });
});

describe('calculateVariance', () => {
  it('should return 0 for single certain outcome', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [{ probability: 1, value: 100_000 }],
    };
    expect(calculateVariance(option)).toBe(0);
  });

  it('should calculate variance for 50/50 outcomes', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: -100_000 },
      ],
    };
    // EV = 0, Variance = 0.5 * (100000)^2 + 0.5 * (-100000)^2 = 10000000000
    expect(calculateVariance(option)).toBe(10_000_000_000);
  });
});

describe('rollOutcome', () => {
  it('should return the only outcome for certain option', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [{ probability: 1, value: 50_000 }],
    };
    const result = rollOutcome(option);
    expect(result.value).toBe(50_000);
  });

  it('should return first outcome when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: -50_000 },
      ],
    };

    const result = rollOutcome(option);
    expect(result.value).toBe(100_000);

    vi.restoreAllMocks();
  });

  it('should return second outcome when random is high', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6);

    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: -50_000 },
      ],
    };

    const result = rollOutcome(option);
    expect(result.value).toBe(-50_000);

    vi.restoreAllMocks();
  });

  it('should return last outcome when probabilities do not sum to 1', () => {
    // 확률 합이 1 미만인 경우 (0.3 + 0.3 = 0.6)
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // 0.9 > 0.6이므로 fallback

    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [
        { probability: 0.3, value: 100_000 },
        { probability: 0.3, value: 50_000 },
      ],
    };

    const result = rollOutcome(option);
    // 확률 합이 1이 아닐 때 마지막 outcome 반환
    expect(result.value).toBe(50_000);

    vi.restoreAllMocks();
  });
});

describe('processRound', () => {
  const optionA: Option = {
    label: 'Safe',
    description: 'Safe option',
    outcomes: [{ probability: 1, value: 10_000 }],
  };

  const optionB: Option = {
    label: 'Risky',
    description: 'Risky option',
    outcomes: [
      { probability: 0.5, value: 50_000 },
      { probability: 0.5, value: -30_000 },
    ],
  };

  it('should process round with choice A', () => {
    const result = processRound(1, 'A', optionA, optionB);

    expect(result.questionId).toBe(1);
    expect(result.choice).toBe('A');
    expect(result.chosenOption).toBe(optionA);
    expect(result.actualOutcome).toBe(10_000);
    expect(result.expectedValue).toBe(10_000);
  });

  it('should process round with choice B', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = processRound(2, 'B', optionA, optionB);

    expect(result.questionId).toBe(2);
    expect(result.choice).toBe('B');
    expect(result.chosenOption).toBe(optionB);
    expect(result.actualOutcome).toBe(50_000);
    expect(result.expectedValue).toBe(10_000); // 0.5 * 50000 + 0.5 * -30000 = 10000

    vi.restoreAllMocks();
  });
});

describe('calculateRiskScore', () => {
  const questions = [
    {
      optionA: {
        label: 'Safe',
        description: '',
        outcomes: [{ probability: 1, value: 10_000 }],
      },
      optionB: {
        label: 'Risky',
        description: '',
        outcomes: [
          { probability: 0.5, value: 100_000 },
          { probability: 0.5, value: -80_000 },
        ],
      },
    },
    {
      optionA: {
        label: 'Safe',
        description: '',
        outcomes: [{ probability: 1, value: 5_000 }],
      },
      optionB: {
        label: 'Risky',
        description: '',
        outcomes: [
          { probability: 0.3, value: 50_000 },
          { probability: 0.7, value: -20_000 },
        ],
      },
    },
  ];

  it('should return 0 for all safe choices', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: questions[0].optionA, actualOutcome: 10_000, expectedValue: 10_000 },
      { questionId: 2, choice: 'A', chosenOption: questions[1].optionA, actualOutcome: 5_000, expectedValue: 5_000 },
    ];
    expect(calculateRiskScore(results, questions)).toBe(0);
  });

  it('should return 100 for all risky choices', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'B', chosenOption: questions[0].optionB, actualOutcome: 100_000, expectedValue: 10_000 },
      { questionId: 2, choice: 'B', chosenOption: questions[1].optionB, actualOutcome: 50_000, expectedValue: 1_000 },
    ];
    expect(calculateRiskScore(results, questions)).toBe(100);
  });

  it('should return 50 for empty results', () => {
    expect(calculateRiskScore([], [])).toBe(50);
  });
});

describe('calculateRationalityScore', () => {
  const questions = [
    {
      optionA: {
        label: 'Low EV',
        description: '',
        outcomes: [{ probability: 1, value: 10_000 }],
      },
      optionB: {
        label: 'High EV',
        description: '',
        outcomes: [
          { probability: 0.5, value: 100_000 },
          { probability: 0.5, value: -20_000 },
        ],
        // EV = 40_000
      },
    },
  ];

  it('should return 100 for choosing higher EV', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'B', chosenOption: questions[0].optionB, actualOutcome: 100_000, expectedValue: 40_000 },
    ];
    expect(calculateRationalityScore(results, questions)).toBe(100);
  });

  it('should return 0 for choosing lower EV', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: questions[0].optionA, actualOutcome: 10_000, expectedValue: 10_000 },
    ];
    expect(calculateRationalityScore(results, questions)).toBe(0);
  });
});

describe('calculateLuckScore', () => {
  it('should return 0 for empty results', () => {
    expect(calculateLuckScore([])).toBe(0);
  });

  it('should return positive score when actual > expected', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: {} as Option, actualOutcome: 100_000, expectedValue: 50_000 },
    ];
    expect(calculateLuckScore(results)).toBeGreaterThan(0);
  });

  it('should return negative score when actual < expected', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: {} as Option, actualOutcome: 20_000, expectedValue: 50_000 },
    ];
    expect(calculateLuckScore(results)).toBeLessThan(0);
  });

  it('should return 0 when actual equals expected', () => {
    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: {} as Option, actualOutcome: 50_000, expectedValue: 50_000 },
    ];
    expect(calculateLuckScore(results)).toBe(0);
  });
});

describe('determineInvestorType', () => {
  // Wild card: 극단적 수익률
  it('should return wild_card for extremely high return (>=150%)', () => {
    expect(determineInvestorType(70, 70, 30, 200)).toBe('wild_card');
  });

  it('should return wild_card for extremely low return (<=-80%)', () => {
    expect(determineInvestorType(30, 50, -30, -90)).toBe('wild_card');
  });

  it('should return wild_card at exact boundary (150%)', () => {
    expect(determineInvestorType(50, 50, 0, 150)).toBe('wild_card');
  });

  it('should NOT return wild_card for moderate return', () => {
    expect(determineInvestorType(50, 50, 0, 100)).toBe('balanced_investor');
  });

  // 공격적 투자자 (risk > 60)
  it('should return lucky_gambler for aggressive irrational lucky', () => {
    expect(determineInvestorType(70, 40, 30)).toBe('lucky_gambler');
  });

  it('should return smart_winner for aggressive rational lucky', () => {
    expect(determineInvestorType(70, 70, 30)).toBe('smart_winner');
  });

  it('should return smart_unlucky for aggressive rational unlucky', () => {
    expect(determineInvestorType(70, 70, -30)).toBe('smart_unlucky');
  });

  it('should return unlucky_gambler for aggressive irrational unlucky', () => {
    expect(determineInvestorType(70, 40, -30)).toBe('unlucky_gambler');
  });

  it('should return smart_winner for aggressive rational with neutral luck', () => {
    // 공격적(70) + 합리적(70) + 중간 운(0) = smart_winner
    expect(determineInvestorType(70, 70, 0)).toBe('smart_winner');
  });

  it('should return lucky_gambler for aggressive irrational with neutral luck', () => {
    // 공격적(70) + 비합리적(40) + 중간 운(0) = lucky_gambler
    expect(determineInvestorType(70, 40, 0)).toBe('lucky_gambler');
  });

  // 보수적 투자자 (risk < 40)
  it('should return steady_grower for conservative lucky', () => {
    expect(determineInvestorType(30, 50, 30)).toBe('steady_grower');
  });

  it('should return careful_realist for conservative unlucky', () => {
    expect(determineInvestorType(30, 50, -30)).toBe('careful_realist');
  });

  it('should return careful_realist for conservative with neutral luck (fallback)', () => {
    // 보수적(30) + 중간 운(0) = careful_realist 기본값
    expect(determineInvestorType(30, 50, 0)).toBe('careful_realist');
  });

  // 균형잡힌 투자자 (risk 40-60)
  it('should return balanced_investor for middle scores', () => {
    expect(determineInvestorType(50, 50, 0)).toBe('balanced_investor');
  });

  it('should return balanced_investor at lower boundary (risk=40)', () => {
    expect(determineInvestorType(40, 50, 0)).toBe('balanced_investor');
  });

  it('should return balanced_investor at upper boundary (risk=60)', () => {
    expect(determineInvestorType(60, 50, 0)).toBe('balanced_investor');
  });
});

describe('calculateFinalResult', () => {
  it('should calculate final result correctly', () => {
    const questions = [
      {
        optionA: { label: 'A', description: '', outcomes: [{ probability: 1, value: 10_000 }] },
        optionB: { label: 'B', description: '', outcomes: [{ probability: 1, value: 20_000 }] },
      },
    ];

    const results: RoundResult[] = [
      { questionId: 1, choice: 'A', chosenOption: questions[0].optionA, actualOutcome: 10_000, expectedValue: 10_000 },
    ];

    const finalResult = calculateFinalResult(results, questions);

    expect(finalResult.finalBalance).toBe(10_000_000 + 10_000);
    expect(finalResult.totalReturn).toBeCloseTo(0.1); // 0.1%
    expect(finalResult.profile).toBeDefined();
    expect(finalResult.investorType).toBeDefined();
  });
});
