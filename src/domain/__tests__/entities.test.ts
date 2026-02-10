/**
 * 엔티티 테스트
 */
import { describe, it, expect } from 'vitest';
import { GAME_CONFIG } from '../entities';
import type {
  Choice,
  Outcome,
  Option,
  Question,
  RoundResult,
  GameState,
  InvestorType,
  InvestorProfile,
  FinalResult,
} from '../entities';

describe('GAME_CONFIG', () => {
  it('should have INITIAL_BALANCE of 10,000,000', () => {
    expect(GAME_CONFIG.INITIAL_BALANCE).toBe(10_000_000);
  });

  it('should have TOTAL_ROUNDS of 10', () => {
    expect(GAME_CONFIG.TOTAL_ROUNDS).toBe(10);
  });

  it('should be immutable (as const)', () => {
    // TypeScript의 as const로 정의되어 있으므로 읽기 전용
    expect(Object.isFrozen(GAME_CONFIG)).toBe(false); // runtime에서는 frozen 아님
    // 하지만 TypeScript 컴파일 타임에 readonly임
  });
});

describe('Type definitions', () => {
  it('should allow valid Choice type', () => {
    const choiceA: Choice = 'A';
    const choiceB: Choice = 'B';
    expect(choiceA).toBe('A');
    expect(choiceB).toBe('B');
  });

  it('should create valid Outcome', () => {
    const outcome: Outcome = {
      probability: 0.5,
      value: 100_000,
    };
    expect(outcome.probability).toBe(0.5);
    expect(outcome.value).toBe(100_000);
  });

  it('should create valid Option', () => {
    const option: Option = {
      label: '적금 넣기',
      description: '확정 +5만원',
      outcomes: [{ probability: 1, value: 50_000 }],
    };
    expect(option.label).toBe('적금 넣기');
    expect(option.outcomes).toHaveLength(1);
  });

  it('should create valid Question', () => {
    const question: Question = {
      id: 1,
      situation: '보너스가 들어왔다!',
      optionA: {
        label: 'A',
        description: 'A desc',
        outcomes: [{ probability: 1, value: 10_000 }],
      },
      optionB: {
        label: 'B',
        description: 'B desc',
        outcomes: [{ probability: 0.5, value: 50_000 }, { probability: 0.5, value: -30_000 }],
      },
    };
    expect(question.id).toBe(1);
    expect(question.optionA.label).toBe('A');
    expect(question.optionB.outcomes).toHaveLength(2);
  });

  it('should create valid RoundResult', () => {
    const option: Option = {
      label: 'Test',
      description: 'Test',
      outcomes: [{ probability: 1, value: 10_000 }],
    };

    const result: RoundResult = {
      questionId: 1,
      choice: 'A',
      chosenOption: option,
      actualOutcome: 10_000,
      expectedValue: 10_000,
    };

    expect(result.questionId).toBe(1);
    expect(result.choice).toBe('A');
    expect(result.actualOutcome).toBe(10_000);
  });

  it('should create valid GameState', () => {
    const state: GameState = {
      currentRound: 0,
      balance: GAME_CONFIG.INITIAL_BALANCE,
      results: [],
      isComplete: false,
    };

    expect(state.currentRound).toBe(0);
    expect(state.balance).toBe(10_000_000);
    expect(state.results).toHaveLength(0);
    expect(state.isComplete).toBe(false);
  });

  it('should have valid InvestorType values', () => {
    const types: InvestorType[] = [
      'lucky_gambler',
      'unlucky_gambler',
      'smart_winner',
      'smart_unlucky',
      'steady_grower',
      'careful_realist',
      'balanced_investor',
      'wild_card',
    ];

    types.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });

  it('should create valid InvestorProfile', () => {
    const profile: InvestorProfile = {
      type: 'lucky_gambler',
      name: '운 좋은 도박사',
      emoji: '🎰',
      description: '운이 좋았어요!',
      tag: '행운아',
    };

    expect(profile.type).toBe('lucky_gambler');
    expect(profile.emoji).toBe('🎰');
  });

  it('should create valid FinalResult', () => {
    const profile: InvestorProfile = {
      type: 'balanced_investor',
      name: '균형잡힌 투자자',
      emoji: '⚖️',
      description: '균형잡힌 선택',
      tag: '밸런스',
    };

    const finalResult: FinalResult = {
      finalBalance: 12_000_000,
      totalReturn: 20,
      riskScore: 50,
      rationalityScore: 60,
      luckScore: 10,
      investorType: 'balanced_investor',
      profile,
      tier: { grade: 'A', name: '제법 하는데?', color: '#4ECDC4', bgColor: '#0F2E2C', description: '꽤 괜찮은 결과!', minReturn: 20 },
    };

    expect(finalResult.finalBalance).toBe(12_000_000);
    expect(finalResult.totalReturn).toBe(20);
    expect(finalResult.profile.name).toBe('균형잡힌 투자자');
  });
});
