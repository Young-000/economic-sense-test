import type { CharacterType, CharacterCode } from '@domain/entities';

/**
 * 16가지 경제 캐릭터 유형
 *
 * 코드 구조:
 * - 1번째: C(Cautious, 신중) / R(Risk-taker, 모험)
 * - 2번째: S(Sensitive, 손실민감) / T(Tolerant, 손실담담)
 * - 3번째: P(Present, 현재중시) / F(Future, 미래지향)
 * - 4번째: O(Optimistic, 낙관) / L(Logical, 현실)
 */
export const characters: Record<CharacterCode, CharacterType> = {
  // === C + S (신중 + 손실민감) ===
  CSPO: {
    code: 'CSPO',
    name: '조심스러운 로또러',
    description: '안전을 최우선으로 하면서도 가끔 대박을 꿈꾸는 타입. 손실에 민감하지만 로또 정도는 사볼 수 있어요.',
    strengths: ['신중한 판단력', '손실 관리 능력', '현실적 기대치'],
    weaknesses: ['과도한 안전 추구', '기회 놓침', '작은 투자에도 불안'],
    advice: '가끔은 계산된 리스크를 감수해보세요. 모든 투자가 위험한 건 아닙니다.',
  },
  CSPL: {
    code: 'CSPL',
    name: '철벽 수비수',
    description: '리스크 제로를 추구하는 완벽주의자. 손실이 두렵고, 확률도 냉정하게 판단해요.',
    strengths: ['뛰어난 리스크 관리', '냉철한 판단', '안정적인 재정'],
    weaknesses: ['지나친 보수성', '성장 기회 놓침', '낮은 수익률 감수'],
    advice: '안전이 최고지만, 인플레이션도 손실입니다. 적정 리스크를 찾아보세요.',
  },
  CSFO: {
    code: 'CSFO',
    name: '낙관적 저축러',
    description: '미래를 위해 저축하면서도 좋은 일이 생길 거라 믿는 타입. 장기 투자에 적합해요.',
    strengths: ['장기적 시야', '희망적 마인드', '꾸준한 저축 습관'],
    weaknesses: ['현실 인식 부족', '급한 상황 대처 어려움', '비현실적 기대'],
    advice: '낙관도 좋지만 구체적인 숫자로 계획을 세워보세요.',
  },
  CSFL: {
    code: 'CSFL',
    name: '완벽한 플래너',
    description: '모든 것을 계획대로 진행하는 타입. 신중하고, 손실을 싫어하며, 미래를 위해 현실적으로 준비해요.',
    strengths: ['체계적인 재정 관리', '장기 계획 능력', '현실적 목표 설정'],
    weaknesses: ['유연성 부족', '예상치 못한 상황에 취약', '즐거움 놓침'],
    advice: '계획도 좋지만 가끔은 즉흥적인 즐거움도 허락해주세요.',
  },

  // === C + T (신중 + 손실담담) ===
  CTPO: {
    code: 'CTPO',
    name: '느긋한 한탕주의',
    description: '안전하게 가되, 손실은 게임의 일부라고 생각해요. 당장의 기회를 노리며 대박을 기다려요.',
    strengths: ['심리적 안정감', '손실 수용력', '기회 포착 능력'],
    weaknesses: ['비현실적 기대', '장기 계획 부족', '충동적 결정'],
    advice: '대박보다는 작은 성공을 꾸준히 쌓아보세요.',
  },
  CTPL: {
    code: 'CTPL',
    name: '합리적 보수파',
    description: '신중하면서도 손실에 담담한 균형잡힌 타입. 현실적이고 합리적인 판단을 해요.',
    strengths: ['균형 잡힌 시각', '감정에 흔들리지 않음', '합리적 의사결정'],
    weaknesses: ['가끔 너무 신중함', '공격적 기회 놓침', '평범한 수익률'],
    advice: '균형이 좋지만, 가끔은 확신이 있을 때 더 크게 베팅해도 좋아요.',
  },
  CTFO: {
    code: 'CTFO',
    name: '여유로운 낙관론자',
    description: '미래를 믿고 느긋하게 기다리는 타입. 손실도 과정이라 생각하고, 결국엔 잘 될 거라 믿어요.',
    strengths: ['긴 호흡의 투자', '스트레스 관리', '긍정적 마인드'],
    weaknesses: ['위험 과소평가', '구체적 계획 부족', '현실 회피 가능성'],
    advice: '낙관적인 건 좋지만, 구체적인 목표와 기한을 정해보세요.',
  },
  CTFL: {
    code: 'CTFL',
    name: '워렌 버핏 견습생',
    description: '장기 투자, 냉철한 분석, 손실에 담담한 이상적인 투자자 성향. 가치 투자에 적합해요.',
    strengths: ['장기적 관점', '감정 통제력', '냉철한 분석력'],
    weaknesses: ['지나친 인내심', '단기 기회 놓침', '재미없을 수 있음'],
    advice: '훌륭한 투자 성향이에요. 본인을 믿고 꾸준히 가세요.',
  },

  // === R + S (모험 + 손실민감) ===
  RSPO: {
    code: 'RSPO',
    name: '지금 아니면 안 돼',
    description: '리스크를 감수하지만 손실은 싫어하는 모순적 타입. 당장 베팅하고, 대박을 기대해요.',
    strengths: ['과감한 실행력', '기회 포착', '행동력'],
    weaknesses: ['손실 시 크게 흔들림', '일관성 부족', '감정적 결정'],
    advice: '베팅 전에 손실 시 감정을 미리 준비하세요. 손절 라인을 정해두세요.',
  },
  RSPL: {
    code: 'RSPL',
    name: '계산된 승부사',
    description: '리스크를 감수하지만 확률은 냉정하게 계산하는 타입. 손실에 민감해서 철저히 준비해요.',
    strengths: ['분석적 리스크 테이킹', '준비된 도전', '데이터 기반 결정'],
    weaknesses: ['분석 마비', '손실 시 스트레스', '완벽주의 함정'],
    advice: '분석도 좋지만 때로는 직관도 믿어보세요.',
  },
  RSFO: {
    code: 'RSFO',
    name: '미래의 큰 손',
    description: '장기적으로 큰 리스크를 감수하는 타입. 손실이 두렵지만 미래의 대박을 믿어요.',
    strengths: ['비전 있는 투자', '장기 성장 추구', '큰 그림 보기'],
    weaknesses: ['긴 손실 기간 버티기 어려움', '불안 관리 필요', '인내심 한계'],
    advice: '장기 투자 좋지만, 심리적 안전장치도 마련해두세요.',
  },
  RSFL: {
    code: 'RSFL',
    name: '프로 트레이더',
    description: '리스크를 감수하고, 장기적 시야와 현실적 판단을 갖춘 타입. 손실에 민감해 철저히 관리해요.',
    strengths: ['전문가적 접근', '리스크 관리', '현실적 기대치'],
    weaknesses: ['과도한 분석', '감정 소모', '완벽 추구 스트레스'],
    advice: '잘하고 있어요. 가끔은 쉬면서 큰 그림을 보세요.',
  },

  // === R + T (모험 + 손실담담) ===
  RTPO: {
    code: 'RTPO',
    name: '올인 도박사',
    description: '리스크도 OK, 손실도 OK, 지금 당장 베팅하고 대박을 노리는 타입. 가장 공격적인 성향이에요.',
    strengths: ['극강의 실행력', '두려움 없는 도전', '큰 기회 포착'],
    weaknesses: ['높은 파산 위험', '무모한 결정', '장기 계획 부재'],
    advice: '열정은 좋지만, 전 재산을 걸지는 마세요. 생존 자금은 남겨두세요.',
  },
  RTPL: {
    code: 'RTPL',
    name: '냉혈 투기꾼',
    description: '감정 없이 베팅하는 타입. 리스크도, 손실도, 확률도 냉정하게 판단해요.',
    strengths: ['감정 배제', '확률 기반 결정', '일관된 전략'],
    weaknesses: ['인간미 부족', '관계에서 갈등', '지나친 냉정함'],
    advice: '냉정함도 좋지만, 때로는 직감과 감정의 신호도 들어보세요.',
  },
  RTFO: {
    code: 'RTFO',
    name: '미래에 베팅하는 자',
    description: '장기적으로 큰 리스크를 감수하며 낙관적으로 미래를 믿는 타입. 스타트업 투자자 성향이에요.',
    strengths: ['비전 투자', '큰 그림 사고', '낙관적 인내'],
    weaknesses: ['현실 감각 부족', '긴 손실 기간', '지나친 낙관'],
    advice: '비전도 좋지만 현금 흐름도 챙기세요.',
  },
  RTFL: {
    code: 'RTFL',
    name: '냉철한 큰 그림',
    description: '리스크 OK, 손실 OK, 장기적이고 현실적. 가장 성숙한 투자자 성향이에요.',
    strengths: ['완벽한 균형', '장기 성과', '감정 통제'],
    weaknesses: ['지나친 자신감', '다른 의견 무시', '고집'],
    advice: '훌륭해요. 다만 다른 사람 의견도 가끔 들어보세요.',
  },
};

/**
 * 코드로 캐릭터 정보 가져오기
 */
export function getCharacter(code: CharacterCode): CharacterType {
  return characters[code];
}
