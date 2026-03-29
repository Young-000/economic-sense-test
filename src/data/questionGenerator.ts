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

import type { Question, Option, GameMode } from '@domain/entities';
import { formatMoney } from '@lib/formatUtils';
import { shuffle } from '@lib/arrayUtils';
import { questions as staticQuestions } from './questions';

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
    // 환불가능: -12만원, 환불불가: EV = -80*0.7 + -280*0.3 = -140천원
    optionA: {
      label: '12만원 환불가능',
      description: '일정 변경시 100% 환불',
      outcomes: [{ probability: 1, value: -120 }], // -120,000원
    },
    optionB: {
      label: '8만원 환불불가',
      description: '70% 절약, 30% 일정 꼬임',
      outcomes: [
        { probability: 0.7, value: -80 },   // -80,000원
        { probability: 0.3, value: -280 },  // -280,000원 재구매+수수료
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
  {
    situation: '📚 자격증 시험 준비',
    category: 'spending',
    // 독학: -5만원, 학원: EV = -300*0.8 + -500*0.2 = -340천원
    optionA: {
      label: '독학으로 준비',
      description: '교재비 5만원만 투자',
      outcomes: [{ probability: 1, value: -50 }], // -50,000원
    },
    optionB: {
      label: '학원 수강 30만원',
      description: '80% 합격, 20% 재수강 필요',
      outcomes: [
        { probability: 0.8, value: -300 },  // -300,000원
        { probability: 0.2, value: -500 },  // -500,000원
      ],
    },
  },
  {
    situation: '💐 부모님 결혼기념일 선물',
    category: 'spending',
    // 소박: -10만원, 성대: EV = -300*0.7 + -400*0.3 = -330천원
    optionA: {
      label: '소박하게 꽃과 케이크',
      description: '10만원으로 정성 표현',
      outcomes: [{ probability: 1, value: -100 }], // -100,000원
    },
    optionB: {
      label: '고급 레스토랑 예약',
      description: '70% 대만족, 30% 취향 아님',
      outcomes: [
        { probability: 0.7, value: -300 },  // -300,000원
        { probability: 0.3, value: -400 },  // -400,000원
      ],
    },
  },
  {
    situation: '💒 친구 결혼식 축의금',
    category: 'spending',
    // 5만원: -50천원, 10만원: EV = -100*0.6 + -150*0.4 = -120천원
    optionA: {
      label: '축의금 5만원',
      description: '부담 없는 금액',
      outcomes: [{ probability: 1, value: -50 }], // -50,000원
    },
    optionB: {
      label: '축의금 10만원+선물',
      description: '60% 관계 돈독, 40% 과한 느낌',
      outcomes: [
        { probability: 0.6, value: -100 },  // -100,000원
        { probability: 0.4, value: -150 },  // -150,000원
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
  {
    situation: '📋 연말정산 시즌!',
    category: 'income',
    // 기본공제: +30만원, 꼼꼼준비: EV = 800*0.7 + 200*0.3 = 620천원
    optionA: {
      label: '기본 공제만 신청',
      description: '30만원 환급 확정',
      outcomes: [{ probability: 1, value: 300 }], // +300,000원
    },
    optionB: {
      label: '공제 항목 꼼꼼히 챙기기',
      description: '70% 80만원, 30% 20만원 환급',
      outcomes: [
        { probability: 0.7, value: 800 },  // +800,000원
        { probability: 0.3, value: 200 },  // +200,000원
      ],
    },
  },
  {
    situation: '💳 적금 만기! 500만원 수령',
    category: 'income',
    // 재예치: +200천원, 투자: EV = 750*0.6 + (-250)*0.4 = 350천원
    optionA: {
      label: '재예치 (연 4%)',
      description: '1년 후 20만원 이자 확정',
      outcomes: [{ probability: 1, value: 200 }], // +200,000원
    },
    optionB: {
      label: '채권 ETF 투자',
      description: '60% 15% 수익, 40% 5% 손실',
      outcomes: [
        { probability: 0.6, value: 750 },  // +750,000원
        { probability: 0.4, value: -250 }, // -250,000원
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
    situation: '🎯 친구들과 볼링 내기',
    category: 'mixed',
    // 구경: 0원, 참여 5만원: EV = 150*0.4 + (-50)*0.6 = 30천원
    optionA: {
      label: '구경만 하기',
      description: '리스크 없이 응원만',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '5만원 내기 참여',
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
  {
    situation: '🏥 실손보험 가입 제안',
    category: 'mixed',
    // 미가입: 0원 (but 리스크), 가입: EV = -120*0.9 + 500*0.1 = -58천원
    optionA: {
      label: '가입 안 함',
      description: '월 보험료 아끼기',
      outcomes: [
        { probability: 0.95, value: 0 },
        { probability: 0.05, value: -2000 },  // 5% 병원비 200만원
      ],
    },
    optionB: {
      label: '월 1만원 가입',
      description: '연 12만원, 병원비 80% 보장',
      outcomes: [
        { probability: 0.9, value: -120 },   // -120,000원 보험료만
        { probability: 0.1, value: 500 },    // +500,000원 보험금 수령
      ],
    },
  },
  {
    situation: '💻 온라인 코딩 부트캠프',
    category: 'mixed',
    // 무료: 0원, 유료: EV = 3000*0.6 + (-500)*0.4 = 1600천원
    optionA: {
      label: '무료 유튜브 독학',
      description: '비용 0원, 시간만 투자',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '500만원 부트캠프',
      description: '60% 취업 성공, 40% 미취업',
      outcomes: [
        { probability: 0.6, value: 3000 },   // +3,000,000원 연봉상승
        { probability: 0.4, value: -500 },   // -500,000원 등록금만
      ],
    },
  },
  {
    situation: '🧾 세금 납부 방법 선택',
    category: 'mixed',
    // 일시납: -500천원, 분할납: EV = -510*0.8 + (-600)*0.2 = -528천원
    optionA: {
      label: '일시납부',
      description: '50만원 한번에 납부',
      outcomes: [{ probability: 1, value: -500 }], // -500,000원
    },
    optionB: {
      label: '분할납부 신청',
      description: '80% 무사히 완납, 20% 가산세',
      outcomes: [
        { probability: 0.8, value: -510 },   // -510,000원
        { probability: 0.2, value: -600 },   // -600,000원 가산세
      ],
    },
  },
];

/**
 * 극한 모드 질문 템플릿
 *
 * 특징:
 * - 높은 금액 (일반 모드의 5~10배)
 * - 극단적 확률 (5% 대박, 95% 손실 등)
 * - 하이리스크 하이리턴 시나리오
 * - 값은 천원 단위 (value * 1,000 = 실제 원화)
 */
const extremeTemplates: QuestionTemplate[] = [
  // ========== 극한 투자 시나리오 ==========
  {
    situation: '🚀 3배 레버리지 ETF 투자',
    category: 'mixed',
    // 안전: +50만원 확정, 레버리지: EV = 3000*0.3 + (-1500)*0.7 = -150천원
    optionA: {
      label: '일반 ETF 투자',
      description: '연 5% 수익 확정',
      outcomes: [{ probability: 1, value: 500 }], // +500,000원
    },
    optionB: {
      label: '3배 레버리지',
      description: '30% 300만원, 70% -150만원',
      outcomes: [
        { probability: 0.3, value: 3000 },   // +3,000,000원
        { probability: 0.7, value: -1500 },  // -1,500,000원
      ],
    },
  },
  {
    situation: '💎 비트코인 100배 선물',
    category: 'mixed',
    // 무시: 0, 선물: EV = 50000*0.05 + (-5000)*0.95 = -2250천원
    optionA: {
      label: '현물 홀드',
      description: '안전하게 보유만',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '100배 롱 포지션',
      description: '5% 청산 면하면 5천만원!',
      outcomes: [
        { probability: 0.05, value: 50000 },  // +50,000,000원 대박
        { probability: 0.95, value: -5000 },  // -5,000,000원 청산
      ],
    },
  },
  {
    situation: '🎲 럭셔리 크루즈 카지노',
    category: 'mixed',
    // 관광: -50만원, 배팅: EV = 10000*0.1 + (-5000)*0.9 = -3500천원
    optionA: {
      label: '뷔페와 공연만 즐기기',
      description: '기본 요금 50만원으로 만족',
      outcomes: [{ probability: 1, value: -500 }], // -500,000원
    },
    optionB: {
      label: '500만원 게임 참여',
      description: '10% 확률로 1천만원!',
      outcomes: [
        { probability: 0.1, value: 10000 },  // +10,000,000원
        { probability: 0.9, value: -5000 },  // -5,000,000원
      ],
    },
  },
  {
    situation: '🏎️ 슈퍼카 렌트 vs 구매',
    category: 'spending',
    // 렌트: -300만원, 구매: EV = -20000*0.4 + -35000*0.6 = -29000천원
    optionA: {
      label: '하루 렌트',
      description: '300만원으로 하루 체험',
      outcomes: [{ probability: 1, value: -3000 }], // -3,000,000원
    },
    optionB: {
      label: '중고 슈퍼카 구매',
      description: '40% 리셀 성공, 60% 폭락',
      outcomes: [
        { probability: 0.4, value: -20000 },  // -20,000,000원 (잘 팔림)
        { probability: 0.6, value: -35000 },  // -35,000,000원 (폭락)
      ],
    },
  },
  {
    situation: '🏢 상가 경매 투자',
    category: 'mixed',
    // 패스: 0, 낙찰: EV = 30000*0.25 + (-20000)*0.75 = -7500천원
    optionA: {
      label: '경매 포기',
      description: '리스크 회피',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '2억으로 낙찰 도전',
      description: '25% 임대 대박, 75% 공실',
      outcomes: [
        { probability: 0.25, value: 30000 },  // +30,000,000원
        { probability: 0.75, value: -20000 }, // -20,000,000원
      ],
    },
  },
  {
    situation: '🎰 해외 카지노 여행',
    category: 'mixed',
    // 관광만: +0원, 배팅: EV = 20000*0.02 + (-10000)*0.98 = -9400천원
    optionA: {
      label: '구경만 하고 쇼핑',
      description: '카지노 구경만, 쇼핑에 100만원',
      outcomes: [{ probability: 1, value: -1000 }], // -1,000,000원
    },
    optionB: {
      label: '1천만원 배팅',
      description: '2% 잭팟 2천만원!',
      outcomes: [
        { probability: 0.02, value: 20000 },  // +20,000,000원
        { probability: 0.98, value: -10000 }, // -10,000,000원
      ],
    },
  },
  {
    situation: '💊 바이오 신약 주식',
    category: 'mixed',
    // 분산투자: +200만원, 올인: EV = 100000*0.08 + (-30000)*0.92 = -19600천원
    optionA: {
      label: '분산 투자',
      description: '안정적 수익 200만원',
      outcomes: [{ probability: 1, value: 2000 }], // +2,000,000원
    },
    optionB: {
      label: '전재산 올인',
      description: '8% FDA 승인시 1억!',
      outcomes: [
        { probability: 0.08, value: 100000 }, // +100,000,000원
        { probability: 0.92, value: -30000 }, // -30,000,000원
      ],
    },
  },
  {
    situation: '🎁 명품 리셀 사업',
    category: 'mixed',
    // 안함: 0, 시작: EV = 15000*0.35 + (-8000)*0.65 = 50천원
    optionA: {
      label: '그냥 직장 다니기',
      description: '안정적인 월급',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '800만원 투자 시작',
      description: '35% 대박, 65% 재고 폭탄',
      outcomes: [
        { probability: 0.35, value: 15000 },  // +15,000,000원
        { probability: 0.65, value: -8000 },  // -8,000,000원
      ],
    },
  },
  {
    situation: '🏠 갭투자 기회',
    category: 'mixed',
    // 포기: 0, 갭투자: EV = 50000*0.2 + (-30000)*0.8 = -14000천원
    optionA: {
      label: '전세로 살기',
      description: '리스크 없이 안전하게',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '대출 풀로 갭투자',
      description: '20% 시세차익 5천만원!',
      outcomes: [
        { probability: 0.2, value: 50000 },   // +50,000,000원
        { probability: 0.8, value: -30000 },  // -30,000,000원
      ],
    },
  },
  {
    situation: '🎵 NFT 음악 투자',
    category: 'mixed',
    // 스킵: 0, 구매: EV = 30000*0.1 + (-5000)*0.9 = -1500천원
    optionA: {
      label: '그냥 음악 스트리밍',
      description: '월 1만원으로 즐기기',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '500만원 NFT 구매',
      description: '10% 바이럴 3천만원!',
      outcomes: [
        { probability: 0.1, value: 30000 },   // +30,000,000원
        { probability: 0.9, value: -5000 },   // -5,000,000원
      ],
    },
  },
  {
    situation: '✈️ 해외여행 비행기 예약',
    category: 'spending',
    // 이코노미: -200만원, 비즈니스 대기: EV = -300*0.4 + -500*0.6 = -420만원
    optionA: {
      label: '이코노미 확정 예약',
      description: '200만원에 좌석 확보',
      outcomes: [{ probability: 1, value: -2000 }], // -2,000,000원
    },
    optionB: {
      label: '비즈니스 업그레이드 대기',
      description: '40% 저렴 업글, 60% 비싼 직전 예약',
      outcomes: [
        { probability: 0.4, value: -3000 },  // -3,000,000원 (저렴 업글 성공)
        { probability: 0.6, value: -5000 },  // -5,000,000원 (비싼 직전 예약)
      ],
    },
  },
  {
    situation: '💰 P2P 투자 고수익',
    category: 'income',
    // 예금: +100만원, P2P: EV = 5000*0.7 + (-10000)*0.3 = 500천원
    optionA: {
      label: '정기예금',
      description: '연 4% 확정',
      outcomes: [{ probability: 1, value: 1000 }], // +1,000,000원
    },
    optionB: {
      label: 'P2P 투자',
      description: '70% 연 20%, 30% 원금 손실',
      outcomes: [
        { probability: 0.7, value: 5000 },    // +5,000,000원
        { probability: 0.3, value: -10000 },  // -10,000,000원
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
function selectBalancedTemplates(mode: GameMode = 'normal'): QuestionTemplate[] {
  // 극한 모드: 모든 템플릿에서 10개 랜덤 선택 (카테고리 무시)
  if (mode === 'extreme') {
    const shuffled = shuffle(extremeTemplates);
    return shuffled.slice(0, 10);
  }

  // 일반 모드: 카테고리별 균형잡힌 선택
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
 * - 값들은 천원 단위로 표시 (value * 1000 = 실제 금액)
 * - 예: value: -8 → -8,000원
 */
export function generateQuestionsLocal(mode: GameMode = 'normal'): Question[] {
  const selected = selectBalancedTemplates(mode);

  return selected.map((template, index) => {
    // 천원 단위를 원 단위로 스케일링
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
 * 로컬 템플릿 + questions.ts 정적 문제를 합쳐서 풀 확장
 * 총 83개 풀에서 10개 선택 → 반복 최소화
 */
function generateFromMergedPool(mode: GameMode): Question[] {
  const templateQuestions = generateQuestionsLocal(mode);
  const merged = shuffle([...templateQuestions, ...staticQuestions]);
  return merged.slice(0, 10);
}

/**
 * 질문 생성 - DB 우선, 실패시 로컬 폴백 (83개+ 풀)
 * @param mode 게임 모드 (normal | extreme)
 */
export async function generateQuestions(mode: GameMode = 'normal'): Promise<Question[]> {
  // 극한 모드는 DB 없이 로컬만 사용 (특별한 시나리오)
  if (mode === 'extreme') {
    return generateQuestionsLocal(mode);
  }

  // 로컬 풀 (템플릿 + 정적)
  const localQuestions = generateFromMergedPool(mode);

  try {
    // DB에서 추가 질문 가져오기
    const { fetchQuestionsFromDB } = await import('./questionService');
    const dbQuestions = await fetchQuestionsFromDB();

    if (dbQuestions && dbQuestions.length > 0) {
      // DB + 로컬 전체 합산 후 10개 선택 (중복 id 제거)
      const seen = new Set<string>();
      const all = [...dbQuestions, ...localQuestions].filter((q) => {
        const key = q.situation;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return shuffle(all).slice(0, 10);
    }
  } catch {
    // DB fetch failed
  }

  return localQuestions;
}

/**
 * 동기 버전 (기존 호환성 유지)
 */
export function generateQuestionsSync(mode: GameMode = 'normal'): Question[] {
  return generateFromMergedPool(mode);
}
