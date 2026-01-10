/**
 * 질문 생성기 - 현실적인 콘텍스트 + 균등한 기대값
 *
 * 핵심 원칙:
 * - 소비(지출) 시나리오: 기대값이 음수 (돈이 나감)
 * - 수익(투자) 시나리오: 기대값이 양수 (돈이 들어옴)
 * - 균형잡힌 배분으로 현실적 경제 감각 테스트
 *
 * 데이터 소스:
 * - 우선순위 1: Supabase DB에서 가져오기
 * - 폴백: 로컬 템플릿 사용
 */

import type { Question, Option } from '@domain/entities';
import { formatMoney } from '@lib/formatUtils';
import { shuffle } from '@lib/arrayUtils';

// 기본 스케일 (금액의 기준 단위)
// 템플릿의 값은 천원 단위로 작성, 실제 금액은 value * 1,000원
// 예: value: 8 → 8,000원, value: -150 → -150,000원
const BASE_SCALE = 1_000; // 천원 → 원 변환

// 카테고리 타입
type QuestionCategory = 'spending' | 'income' | 'mixed';

// 기대값 계산
const calculateEV = (option: Option): number => {
  return option.outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);
};

// 옵션의 금액을 스케일링
const scaleOption = (option: Option, scale: number): Option => {
  return {
    ...option,
    outcomes: option.outcomes.map(o => ({
      ...o,
      value: Math.round(o.value * scale),
    })),
  };
};

// description 업데이트
const updateDescription = (opt: Option): Option => {
  const outcomes = opt.outcomes;
  if (outcomes.length === 1) {
    const v = outcomes[0].value;
    if (v === 0) return opt;
    return {
      ...opt,
      description: `확정 ${formatMoney(v)}원`,
    };
  } else if (outcomes.length === 2) {
    const [o1, o2] = outcomes;
    return {
      ...opt,
      description: `${Math.round(o1.probability * 100)}%로 ${formatMoney(o1.value)}원, ${Math.round(o2.probability * 100)}%로 ${formatMoney(o2.value)}원`,
    };
  }
  return opt;
};

// 질문 템플릿 인터페이스
interface QuestionTemplate {
  situation: string;
  category: QuestionCategory;
  optionA: Option;
  optionB: Option;
}

/**
 * 질문 템플릿 정의
 *
 * 카테고리별 EV 설계:
 * - spending: 소비 상황, 양쪽 모두 음수 EV (지출 최소화가 합리적)
 * - income: 수익 상황, 양쪽 모두 양수 EV (수익 최대화가 합리적)
 * - mixed: 투자 상황, 음/양 혼합 EV (기대값 계산 필요)
 */
const questionTemplates: QuestionTemplate[] = [
  // ========== 소비 시나리오 (SPENDING) - EV가 음수 ==========
  // 소비는 어떤 선택이든 돈이 나가지만, 합리적 선택으로 손실 최소화
  // 값은 천원 단위 (value * 1,000 = 실제 원화)

  {
    situation: '🍜 점심 메뉴 고민 중',
    category: 'spending',
    // 단골집: -8천원 확정, 신상맛집: EV = -8*0.5 + -15*0.5 = -11.5천원
    optionA: {
      label: '8천원 단골집',
      description: '익숙한 맛, 확실한 만족',
      outcomes: [{ probability: 1, value: -8 }], // -8,000원
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대만족, 50% 실망',
      outcomes: [
        { probability: 0.5, value: -8 },   // 맛있으면 본전 느낌
        { probability: 0.5, value: -15 },  // 실망하면 돈 아까움
      ],
    },
  },
  {
    situation: '☕ 커피 한 잔의 선택',
    category: 'spending',
    // 편의점: -2천원, 카페: EV = -5*0.7 + -7*0.3 = -5.6천원
    optionA: {
      label: '편의점 커피',
      description: '2천원으로 카페인 충전',
      outcomes: [{ probability: 1, value: -2 }], // -2,000원
    },
    optionB: {
      label: '프리미엄 카페',
      description: '70% 만족, 30% 그냥 그럼',
      outcomes: [
        { probability: 0.7, value: -5 },  // -5,000원
        { probability: 0.3, value: -7 },  // -7,000원
      ],
    },
  },
  {
    situation: '📱 핸드폰 케이스가 깨졌다',
    category: 'spending',
    // 저렴이: -1만원, 브랜드: EV = -30*0.6 + -50*0.4 = -38천원
    optionA: {
      label: '1만원 저렴이',
      description: '그냥 보호만 되면 됨',
      outcomes: [{ probability: 1, value: -10 }], // -10,000원
    },
    optionB: {
      label: '5만원 브랜드 케이스',
      description: '60% 오래 씀, 40% 금방 질림',
      outcomes: [
        { probability: 0.6, value: -30 },  // -30,000원
        { probability: 0.4, value: -50 },  // -50,000원
      ],
    },
  },
  {
    situation: '🛒 마트에서 장보기',
    category: 'spending',
    // 필수품만: -5만원, 세일유혹: EV = -40*0.4 + -100*0.6 = -76천원
    optionA: {
      label: '필수품만 구매',
      description: '리스트대로 딱 필요한 것만',
      outcomes: [{ probability: 1, value: -50 }], // -50,000원
    },
    optionB: {
      label: '1+1 세일 유혹',
      description: '40% 득템, 60% 충동구매',
      outcomes: [
        { probability: 0.4, value: -40 },   // -40,000원
        { probability: 0.6, value: -100 },  // -100,000원
      ],
    },
  },
  {
    situation: '✈️ 제주도 비행기 예약',
    category: 'spending',
    // 환불가능: -12만원, 환불불가: EV = -80*0.9 + -200*0.1 = -92천원
    optionA: {
      label: '12만원 환불가능',
      description: '일정 변경시 100% 환불',
      outcomes: [{ probability: 1, value: -120 }], // -120,000원
    },
    optionB: {
      label: '8만원 환불불가',
      description: '90% 절약, 10% 일정 꼬임',
      outcomes: [
        { probability: 0.9, value: -80 },   // -80,000원
        { probability: 0.1, value: -200 },  // -200,000원 재구매
      ],
    },
  },
  {
    situation: '🎮 새 게임이 출시됐다',
    category: 'spending',
    // 기다리기: 0원, 바로구매: EV = -50*0.6 + -70*0.4 = -58천원
    optionA: {
      label: '세일까지 기다리기',
      description: '3개월 후 50% 할인',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '7만원 정가 구매',
      description: '60% 재밌음, 40% 후회',
      outcomes: [
        { probability: 0.6, value: -50 },  // -50,000원 (만족)
        { probability: 0.4, value: -70 },  // -70,000원 (후회)
      ],
    },
  },
  {
    situation: '🚗 차량 정비소 방문',
    category: 'spending',
    // 필수정비: -30만원, 풀옵션: EV = -400*0.7 + -600*0.3 = -460천원
    optionA: {
      label: '필수 항목만 정비',
      description: '당장 필요한 것만 30만원',
      outcomes: [{ probability: 1, value: -300 }], // -300,000원
    },
    optionB: {
      label: '예방정비까지 풀옵션',
      description: '70% 나중에 아낌, 30% 과잉정비',
      outcomes: [
        { probability: 0.7, value: -400 },  // -400,000원
        { probability: 0.3, value: -600 },  // -600,000원
      ],
    },
  },

  // ========== 수익 시나리오 (INCOME) - EV가 양수 ==========
  // 수익 기회, 합리적 선택으로 수익 최대화

  {
    situation: '💰 보너스 300만원 지급!',
    category: 'income',
    // 적금: +12만원 확정 (연 4%), 투자: EV = 600*0.6 + (-150)*0.4 = 300천원
    optionA: {
      label: '적금에 예치',
      description: '연 4% 이자 확정',
      outcomes: [{ probability: 1, value: 120 }], // +120,000원
    },
    optionB: {
      label: '주식에 투자',
      description: '60% 수익 20%, 40% 손실 5%',
      outcomes: [
        { probability: 0.6, value: 600 },   // +600,000원
        { probability: 0.4, value: -150 },  // -150,000원
      ],
    },
  },
  {
    situation: '💼 연봉 협상 기회!',
    category: 'income',
    // 확정인상: +200만원, 성과급: EV = 4000*0.7 + 0*0.3 = 2800천원
    optionA: {
      label: '확정 200만원 인상',
      description: '안전하게 연봉 인상',
      outcomes: [{ probability: 1, value: 2000 }], // +2,000,000원
    },
    optionB: {
      label: '성과급 도전',
      description: '70% 400만원, 30% 무산',
      outcomes: [
        { probability: 0.7, value: 4000 },  // +4,000,000원
        { probability: 0.3, value: 0 },
      ],
    },
  },
  {
    situation: '🥕 당근마켓에서 물건 판매',
    category: 'income',
    // 바로팔기: +8만원, 고수: EV = 100*0.65 + 50*0.35 = 82.5천원
    optionA: {
      label: '20% 할인 바로 팔기',
      description: '8만원에 오늘 거래 완료',
      outcomes: [{ probability: 1, value: 80 }], // +80,000원
    },
    optionB: {
      label: '제값 10만원 고수',
      description: '65% 제값, 35% 한달 후 반값',
      outcomes: [
        { probability: 0.65, value: 100 },  // +100,000원
        { probability: 0.35, value: 50 },   // +50,000원
      ],
    },
  },
  {
    situation: '💻 프리랜서 프로젝트 제안',
    category: 'income',
    // 작은프로젝트: +100만원, 큰프로젝트: EV = 2000*0.8 + (-300)*0.2 = 1540천원
    optionA: {
      label: '작은 프로젝트 수락',
      description: '100만원 확정, 1주 작업',
      outcomes: [{ probability: 1, value: 1000 }], // +1,000,000원
    },
    optionB: {
      label: '큰 프로젝트 도전',
      description: '80% 200만원, 20% 중도포기',
      outcomes: [
        { probability: 0.8, value: 2000 },   // +2,000,000원
        { probability: 0.2, value: -300 },   // -300,000원 시간낭비
      ],
    },
  },
  {
    situation: '🎯 회사 공모전 참가',
    category: 'income',
    // 안참가: 0원, 참가: EV = 1000*0.3 + (-100)*0.7 = 230천원
    optionA: {
      label: '참가 안 함',
      description: '본업에 집중',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '열심히 준비해서 참가',
      description: '30% 상금 100만원, 70% 참가상',
      outcomes: [
        { probability: 0.3, value: 1000 },   // +1,000,000원
        { probability: 0.7, value: -100 },   // -100,000원 시간투자
      ],
    },
  },
  {
    situation: '🏆 재능기부 vs 유료강의',
    category: 'income',
    // 재능기부: 0원, 유료강의: EV = 500*0.5 + 0*0.5 = 250천원
    optionA: {
      label: '무료 재능기부',
      description: '보람은 있지만 수익 없음',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '유료 온라인 강의',
      description: '50% 인기 50만원, 50% 비인기',
      outcomes: [
        { probability: 0.5, value: 500 },  // +500,000원
        { probability: 0.5, value: 0 },
      ],
    },
  },

  // ========== 투자/도박 시나리오 (MIXED) - 양/음 혼합 ==========
  // 진정한 mixed: 한 옵션은 양수 EV, 다른 옵션은 음수 EV

  {
    situation: '📈 친구가 "이 코인 무조건 오른다"',
    category: 'mixed',
    // 무시: 0원, 투자 100만원: EV = 4000*0.2 + (-800)*0.8 = 160천원
    optionA: {
      label: '무시하기',
      description: '내 돈은 안전하게',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '100만원 투자',
      description: '20% 대박 4배, 80% 80% 손실',
      outcomes: [
        { probability: 0.2, value: 4000 },   // +4,000,000원
        { probability: 0.8, value: -800 },   // -800,000원
      ],
    },
  },
  {
    situation: '🎰 월 2만원 로또 vs 적금',
    category: 'mixed',
    // 로또: EV ≈ -20천원 (기대값 마이너스), 저축: EV = +4천원
    optionA: {
      label: '매주 로또 구매',
      description: '월 2만원, 꿈을 산다',
      outcomes: [
        { probability: 0.00001, value: 100000 }, // 1등 1억
        { probability: 0.99999, value: -20 },    // -20,000원
      ],
    },
    optionB: {
      label: '그냥 적금',
      description: '월 2만원 적금, 연 2% 이자',
      outcomes: [{ probability: 1, value: 4 }], // +4,000원 이자
    },
  },
  {
    situation: '🚀 친구 스타트업에 투자 제안',
    category: 'mixed',
    // 거절: 0원, 투자 100만원: EV = 10000*0.1 + (-1000)*0.9 = 100천원
    optionA: {
      label: '정중히 거절',
      description: '우정은 우정, 돈은 돈',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '100만원 투자',
      description: '10% 대박 10배, 90% 전액 손실',
      outcomes: [
        { probability: 0.1, value: 10000 },  // +10,000,000원
        { probability: 0.9, value: -1000 },  // -1,000,000원
      ],
    },
  },
  {
    situation: '🎲 친구들과 내기 포커',
    category: 'mixed',
    // 구경: 0원, 참여 5만원: EV = 150*0.4 + (-50)*0.6 = 30천원
    optionA: {
      label: '구경만 하기',
      description: '리스크 없이 친목만',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '5만원 참여',
      description: '40% 승리 3배, 60% 패배',
      outcomes: [
        { probability: 0.4, value: 150 },   // +150,000원
        { probability: 0.6, value: -50 },   // -50,000원
      ],
    },
  },
  {
    situation: '📉 내 주식이 -30% 됐다...',
    category: 'mixed',
    // 손절: -30만원 확정, 존버: EV = 500*0.4 + (-500)*0.6 = -100천원
    optionA: {
      label: '손절하기',
      description: '30만원 확정 손실',
      outcomes: [{ probability: 1, value: -300 }], // -300,000원
    },
    optionB: {
      label: '존버하기',
      description: '40% 반등 50%, 60% 추가 하락',
      outcomes: [
        { probability: 0.4, value: 500 },   // +500,000원 반등
        { probability: 0.6, value: -500 },  // -500,000원 추가손실
      ],
    },
  },
  {
    situation: '🛒 블프 세일 물건 발견',
    category: 'mixed',
    // 패스: 0원, 구매 5만원: EV = 30*0.4 + (-50)*0.6 = -18천원
    optionA: {
      label: '세일 패스',
      description: '어차피 필요 없는 물건',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '50% 세일 5만원 구매',
      description: '40% 실제로 씀, 60% 장롱행',
      outcomes: [
        { probability: 0.4, value: 30 },   // +30,000원 (나중에 필요)
        { probability: 0.6, value: -50 },  // -50,000원 (충동구매)
      ],
    },
  },
  {
    situation: '🏠 전세 vs 월세 선택 (연 기준)',
    category: 'mixed',
    // 월세: -1200천원/년, 전세대출: EV = -500*0.95 + (-5000)*0.05 = -725천원
    optionA: {
      label: '월세 10만원',
      description: '매달 10만원, 연 120만원',
      outcomes: [{ probability: 1, value: -1200 }], // -1,200,000원/년
    },
    optionB: {
      label: '전세 대출',
      description: '95% 이자 50만원, 5% 문제 발생',
      outcomes: [
        { probability: 0.95, value: -500 },   // -500,000원 이자
        { probability: 0.05, value: -5000 },  // -5,000,000원 문제
      ],
    },
  },
  {
    situation: '💳 신용카드 리볼빙 제안',
    category: 'mixed',
    // 일시불: -100만원, 리볼빙: EV = -1050*0.6 + (-1800)*0.4 = -1350천원
    optionA: {
      label: '일시불 결제',
      description: '이번 달 빡세지만 이자 없음',
      outcomes: [{ probability: 1, value: -1000 }], // -1,000,000원
    },
    optionB: {
      label: '리볼빙 신청',
      description: '60% 다음달 완납, 40% 이자 늪',
      outcomes: [
        { probability: 0.6, value: -1050 },  // -1,050,000원
        { probability: 0.4, value: -1800 },  // -1,800,000원
      ],
    },
  },
];

/**
 * 카테고리별 균형잡힌 선택
 * - spending: 3개
 * - income: 3개
 * - mixed: 4개 (투자/도박 상황이 더 중요)
 */
function selectBalancedTemplates(): QuestionTemplate[] {
  const spending = questionTemplates.filter(t => t.category === 'spending');
  const income = questionTemplates.filter(t => t.category === 'income');
  const mixed = questionTemplates.filter(t => t.category === 'mixed');

  const shuffledSpending = shuffle(spending);
  const shuffledIncome = shuffle(income);
  const shuffledMixed = shuffle(mixed);

  // 균형잡힌 선택: 소비 3, 수익 3, 혼합 4
  const selected = [
    ...shuffledSpending.slice(0, 3),
    ...shuffledIncome.slice(0, 3),
    ...shuffledMixed.slice(0, 4),
  ];

  return shuffle(selected);
}

/**
 * 랜덤화된 10개 질문 생성 (로컬 폴백)
 *
 * 스케일링 규칙:
 * - 값들은 만원 단위로 표시 (value * 10000 = 실제 금액)
 * - 예: value: -8 → -8만원
 */
export function generateQuestionsLocal(): Question[] {
  const selected = selectBalancedTemplates();

  return selected.map((template, index) => {
    // 만원 단위를 원 단위로 스케일링
    const scaledA = scaleOption(template.optionA, BASE_SCALE);
    const scaledB = scaleOption(template.optionB, BASE_SCALE);

    return {
      id: index + 1,
      situation: template.situation,
      optionA: updateDescription(scaledA),
      optionB: updateDescription(scaledB),
    };
  });
}

/**
 * 분포 분석을 위한 함수 (테스트용)
 */
export function analyzeDistribution(questions: Question[]): {
  spending: number;
  income: number;
  mixed: number;
  evStats: {
    positiveEV: number;
    negativeEV: number;
    zeroEV: number;
    avgMaxEV: number;
    avgMinEV: number;
  };
} {
  let spending = 0, income = 0, mixed = 0;
  let positiveEV = 0, negativeEV = 0, zeroEV = 0;
  let totalMaxEV = 0, totalMinEV = 0;

  questions.forEach(q => {
    const evA = calculateEV(q.optionA);
    const evB = calculateEV(q.optionB);
    const maxEV = Math.max(evA, evB);
    const minEV = Math.min(evA, evB);

    totalMaxEV += maxEV;
    totalMinEV += minEV;

    // 카테고리 판단 (양쪽 모두 음수면 spending, 양쪽 모두 양수면 income)
    if (evA <= 0 && evB <= 0) {
      spending++;
    } else if (evA >= 0 && evB >= 0) {
      income++;
    } else {
      mixed++;
    }

    // EV 분포
    [evA, evB].forEach(ev => {
      if (ev > 0) positiveEV++;
      else if (ev < 0) negativeEV++;
      else zeroEV++;
    });
  });

  return {
    spending,
    income,
    mixed,
    evStats: {
      positiveEV,
      negativeEV,
      zeroEV,
      avgMaxEV: totalMaxEV / questions.length,
      avgMinEV: totalMinEV / questions.length,
    },
  };
}

/**
 * 질문 생성 - DB 우선, 실패시 로컬 폴백
 */
export async function generateQuestions(): Promise<Question[]> {
  try {
    // 1. DB에서 가져오기 시도 (동적 import로 테스트 호환성 유지)
    const { fetchQuestionsFromDB } = await import('./questionService');
    const dbQuestions = await fetchQuestionsFromDB();

    if (dbQuestions && dbQuestions.length > 0) {
      console.log(`Loaded ${dbQuestions.length} questions from DB`);
      return dbQuestions;
    }
  } catch (error) {
    console.warn('Failed to import questionService:', error);
  }

  // 2. 폴백: 로컬 템플릿 사용
  console.log('Using local question templates as fallback');
  return generateQuestionsLocal();
}

/**
 * 동기 버전 (기존 호환성 유지)
 * @deprecated Use generateQuestions() instead
 */
export function generateQuestionsSync(): Question[] {
  return generateQuestionsLocal();
}
