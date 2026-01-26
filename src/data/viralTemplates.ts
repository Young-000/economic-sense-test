/**
 * 바이럴 공유 문구 템플릿
 * SNS 공유 시 사용되는 텍스트 템플릿
 */
import type { InvestorType } from '@domain/entities';

export interface ShareTemplate {
  /** 기본 공유 문구 */
  text: string;
  /** 카카오톡용 (짧은 버전) */
  kakao: string;
  /** 트위터/X용 (해시태그 포함) */
  twitter: string;
  /** 인스타그램 캡션용 */
  instagram: string;
}

// 유형별 바이럴 공유 문구
export const investorShareTemplates: Record<InvestorType, ShareTemplate> = {
  lucky_gambler: {
    text: '나 운빨 도전가래... 🍀\n과감하게 도전했더니 운까지 따라줬어!\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '🍀 운빨 도전가 등극! 과감한 선택에 운까지 따라줬다 ㅋㅋㅋ',
    twitter: '🍀 돈 감각 테스트 결과: 운빨 도전가\n\n과감한 선택에 운까지 따라줬어!\n너의 돈 감각은?\n\n#돈감각테스트 #금손흙손 #재테크 #투자성향',
    instagram: '🍀 나의 투자 유형: 운빨 도전가\n\n과감한 선택에 운까지 따라줬다!\n주사위의 신이 함께하네요 🎲✨\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #투자성향테스트 #금손 #재테크 #MZ재테크',
  },
  unlucky_gambler: {
    text: '나 용감한 도전가래... 😭\n과감했는데 운이 안 따랐어ㅠㅠ\n다음엔 대박 날 거야!\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '😭 용감한 도전가... 과감했는데 운이 안 따랐어ㅠㅠ 다음엔 대박!',
    twitter: '😭 돈 감각 테스트 결과: 용감한 도전가\n\n과감했는데 운이 안 따랐어...\n다음엔 대박 날 거야!\n\n#돈감각테스트 #금손흙손 #다음엔대박',
    instagram: '😭 나의 투자 유형: 용감한 도전가\n\n과감하게 도전했지만 운이 안 따랐어...\n다음엔 분명 대박 날 거야! 💪\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #투자성향테스트 #다음엔대박 #도전정신',
  },
  smart_winner: {
    text: '나 금손 전략가래! 👑\n합리적 선택 + 운까지 완벽!\n버핏이 울고 가겠다 ㅋㅋ\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '👑 금손 전략가 등극! 합리적 선택 + 운까지 완벽 조합 ㅋㅋ',
    twitter: '👑 돈 감각 테스트 결과: 금손 전략가\n\n합리적 선택 + 운까지 완벽!\n버핏이 울고 갈 조합 ㅋㅋ\n\n#돈감각테스트 #금손 #투자천재 #재테크',
    instagram: '👑 나의 투자 유형: 금손 전략가\n\n합리적인 선택에 운까지 따라줬어!\n이게 바로 완벽한 조합 ✨\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #금손인증 #투자천재 #재테크고수 #MZ투자',
  },
  smart_unlucky: {
    text: '나 억울한 전략가래... 🥲\n분석은 완벽했는데 운이 배신함ㅠ\n실력은 인정! 운만 따르면 버핏!\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '🥲 억울한 전략가... 분석 완벽했는데 운이 배신ㅠㅠ 운만 따르면 버핏!',
    twitter: '🥲 돈 감각 테스트 결과: 억울한 전략가\n\n분석은 완벽했는데 운이 배신했어...\n운만 따르면 버핏인데!\n\n#돈감각테스트 #억울 #실력은인정 #운만오면',
    instagram: '🥲 나의 투자 유형: 억울한 전략가\n\n분석은 완벽했는데 주사위가 배신...\n실력은 인정! 운만 따르면 버핏이야 💎\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #억울함주의 #실력자 #운만오면버핏',
  },
  steady_grower: {
    text: '나 안정 추구형이래! 🏦\n안전한 선택에 운까지 좋았어!\n신중함이 빛났다 ✨\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '🏦 안정 추구형! 안전한 선택에 운까지 굿 ㅋㅋ',
    twitter: '🏦 돈 감각 테스트 결과: 안정 추구형\n\n안전한 선택 + 운까지 따라줬어!\n신중함이 빛났다 ✨\n\n#돈감각테스트 #안정추구 #신중한투자자 #재테크',
    instagram: '🏦 나의 투자 유형: 안정 추구형\n\n안전한 선택을 선호하고 운도 따라줬어!\n신중함이 돋보이는 투자자 ✨\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #안정형투자 #신중한선택 #재테크',
  },
  careful_realist: {
    text: '나 돌다리 검증러래! 🐢\n리스크 피하는 신중한 타입!\n가끔은 도전도 해볼까~\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '🐢 돌다리 검증러 ㅋㅋ 리스크 피하는 신중파! 가끔은 도전도?',
    twitter: '🐢 돈 감각 테스트 결과: 돌다리 검증러\n\n리스크를 피하는 신중한 타입!\n가끔은 도전도 해봐야겠다~\n\n#돈감각테스트 #신중파 #안전제일 #재테크',
    instagram: '🐢 나의 투자 유형: 돌다리 검증러\n\n리스크를 피하는 신중한 타입!\n안전제일주의자 🛡️\n\n근데 가끔은 도전도 해봐야지~\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #안전제일 #신중한투자 #돌다리도두드려보고',
  },
  balanced_investor: {
    text: '나 밸런스 장인이래! ⚖️\n공격과 수비의 완벽한 조화!\n상황 판단 능력 甲\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '⚖️ 밸런스 장인! 공격과 수비 완벽한 조화 ㅋㅋ',
    twitter: '⚖️ 돈 감각 테스트 결과: 밸런스 장인\n\n공격과 수비의 완벽한 조화!\n상황 판단 능력 甲\n\n#돈감각테스트 #밸런스 #줏대있는투자 #재테크',
    instagram: '⚖️ 나의 투자 유형: 밸런스 장인\n\n공격과 수비의 완벽한 조화!\n상황 판단 능력이 뛰어난 투자자 🎯\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #밸런스투자 #줏대있는선택 #MZ재테크',
  },
  wild_card: {
    text: '나 YOLO 투자자래! 🎲\n전략? 느낌 가는 대로!\n인생은 모험이니까~ 🚀\n\n내 돈 감각 궁금하면 테스트 해봐!',
    kakao: '🎲 YOLO 투자자 ㅋㅋㅋ 느낌 가는 대로! 인생은 모험이지~',
    twitter: '🎲 돈 감각 테스트 결과: YOLO 투자자\n\n패턴? 전략? 느낌 가는 대로!\n인생은 모험이니까~ 🚀\n\n#돈감각테스트 #YOLO #인생은모험 #재테크',
    instagram: '🎲 나의 투자 유형: YOLO 투자자\n\n패턴? 전략? 그냥 느낌 가는 대로!\n인생은 모험이니까요~ 🚀\n\n프로필 링크에서 테스트해봐!\n\n#돈감각테스트 #YOLO투자 #인생은모험 #느낌대로',
  },
};

// 수익률별 추가 문구
export const returnRateMessages = {
  great: (rate: number) => `수익률 +${rate.toFixed(1)}% 달성! 🔥`,
  good: (rate: number) => `수익률 +${rate.toFixed(1)}%! 나쁘지 않아 📈`,
  breakeven: '본전 사수! 다음엔 더 잘할 거야 ✨',
  loss: (rate: number) => `수익률 ${rate.toFixed(1)}%... 다음엔 대박! 💪`,
  bigLoss: (rate: number) => `수익률 ${rate.toFixed(1)}%... 풀빵됨ㅠ 😭`,
};

/**
 * 전체 공유 문구 생성
 */
export function generateShareText(
  investorType: InvestorType,
  totalReturn: number,
  platform: 'default' | 'kakao' | 'twitter' | 'instagram' = 'default'
): string {
  const template = investorShareTemplates[investorType];

  // 수익률 문구 추가
  let returnMessage = '';
  if (totalReturn >= 50) {
    returnMessage = returnRateMessages.great(totalReturn);
  } else if (totalReturn >= 0) {
    returnMessage = returnRateMessages.good(totalReturn);
  } else if (totalReturn >= -10) {
    returnMessage = returnRateMessages.breakeven;
  } else if (totalReturn >= -50) {
    returnMessage = returnRateMessages.loss(totalReturn);
  } else {
    returnMessage = returnRateMessages.bigLoss(totalReturn);
  }

  const baseUrl = 'https://economic-sense-test.vercel.app';

  switch (platform) {
    case 'kakao':
      return `${template.kakao}\n\n${returnMessage}\n\n${baseUrl}`;
    case 'twitter':
      return `${template.twitter}\n\n${returnMessage}\n\n${baseUrl}`;
    case 'instagram':
      return template.instagram;
    default:
      return `${template.text}\n\n${returnMessage}\n\n${baseUrl}`;
  }
}

/**
 * 클립보드 복사용 간단 문구
 */
export function generateClipboardText(
  profileName: string,
  profileEmoji: string,
  totalReturn: number
): string {
  const returnStr = totalReturn >= 0 ? `+${totalReturn.toFixed(1)}%` : `${totalReturn.toFixed(1)}%`;
  return `${profileEmoji} 나의 돈 감각: ${profileName} (${returnStr})\n\n🤔 당신은 금손? 흙손?\n👉 https://economic-sense-test.vercel.app`;
}
