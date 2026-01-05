/**
 * 질문 카테고리 및 금액 범위 관리
 *
 * 향후 DB 마이그레이션 시 이 구조를 테이블로 변환 가능
 */

// ============ 카테고리 정의 ============

export type QuestionType = 'earning' | 'spending';

export type EarningCategory =
  | 'salary'      // 월급/연봉
  | 'investment'  // 투자 및 저축
  | 'side_income' // 소소한 사이드 (당근, 알바 등)

export type SpendingCategory =
  | 'food'        // 식비
  | 'travel'      // 여행
  | 'health'      // 병원/건강
  | 'hobby'       // 취미/여가
  | 'subscription'// 구독/고정지출
  | 'shopping'    // 쇼핑

export type QuestionCategory = EarningCategory | SpendingCategory;

// ============ 카테고리별 금액 범위 ============

export interface AmountRange {
  min: number;
  max: number;
  typical: number;  // 대표적인 금액
}

export const EARNING_AMOUNTS: Record<EarningCategory, AmountRange> = {
  salary: {
    min: 100_000,
    max: 500_000,
    typical: 200_000,  // 월 10~50만원 인상
  },
  investment: {
    min: 50_000,
    max: 5_000_000,
    typical: 500_000,  // 5~500만원 투자
  },
  side_income: {
    min: 30_000,
    max: 300_000,
    typical: 100_000,  // 3~30만원 부수입
  },
};

export const SPENDING_AMOUNTS: Record<SpendingCategory, AmountRange> = {
  food: {
    min: 5_000,
    max: 50_000,
    typical: 15_000,   // 0.5~5만원 식비
  },
  travel: {
    min: 50_000,
    max: 500_000,
    typical: 150_000,  // 5~50만원 여행
  },
  health: {
    min: 10_000,
    max: 1_000_000,
    typical: 100_000,  // 1~100만원 의료비
  },
  hobby: {
    min: 10_000,
    max: 200_000,
    typical: 50_000,   // 1~20만원 취미
  },
  subscription: {
    min: 5_000,
    max: 50_000,
    typical: 15_000,   // 0.5~5만원 구독
  },
  shopping: {
    min: 30_000,
    max: 500_000,
    typical: 100_000,  // 3~50만원 쇼핑
  },
};

// ============ 카테고리 메타데이터 ============

export interface CategoryMeta {
  type: QuestionType;
  category: QuestionCategory;
  label: string;
  emoji: string;
  amountRange: AmountRange;
}

export const CATEGORY_META: Record<QuestionCategory, CategoryMeta> = {
  // 벌기
  salary: {
    type: 'earning',
    category: 'salary',
    label: '월급/연봉',
    emoji: '💼',
    amountRange: EARNING_AMOUNTS.salary,
  },
  investment: {
    type: 'earning',
    category: 'investment',
    label: '투자/저축',
    emoji: '📈',
    amountRange: EARNING_AMOUNTS.investment,
  },
  side_income: {
    type: 'earning',
    category: 'side_income',
    label: '부수입',
    emoji: '🥕',
    amountRange: EARNING_AMOUNTS.side_income,
  },
  // 쓰기
  food: {
    type: 'spending',
    category: 'food',
    label: '식비',
    emoji: '🍜',
    amountRange: SPENDING_AMOUNTS.food,
  },
  travel: {
    type: 'spending',
    category: 'travel',
    label: '여행',
    emoji: '✈️',
    amountRange: SPENDING_AMOUNTS.travel,
  },
  health: {
    type: 'spending',
    category: 'health',
    label: '건강/의료',
    emoji: '🏥',
    amountRange: SPENDING_AMOUNTS.health,
  },
  hobby: {
    type: 'spending',
    category: 'hobby',
    label: '취미/여가',
    emoji: '🎮',
    amountRange: SPENDING_AMOUNTS.hobby,
  },
  subscription: {
    type: 'spending',
    category: 'subscription',
    label: '구독/고정',
    emoji: '📺',
    amountRange: SPENDING_AMOUNTS.subscription,
  },
  shopping: {
    type: 'spending',
    category: 'shopping',
    label: '쇼핑',
    emoji: '🛒',
    amountRange: SPENDING_AMOUNTS.shopping,
  },
};

// ============ 헬퍼 함수 ============

export function getEarningCategories(): CategoryMeta[] {
  return Object.values(CATEGORY_META).filter(c => c.type === 'earning');
}

export function getSpendingCategories(): CategoryMeta[] {
  return Object.values(CATEGORY_META).filter(c => c.type === 'spending');
}

export function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 10_000) {
    return `${Math.round(amount / 10_000)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}
