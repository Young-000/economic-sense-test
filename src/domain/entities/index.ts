/**
 * Domain Entities for Economic Sense Test
 * 핵심 비즈니스 모델 정의 - 외부 의존성 없음
 */

/** 답변 선택지 */
export type AnswerChoice = 'A' | 'B';

/** 질문 유형 */
export type QuestionType = 'risk' | 'loss' | 'time' | 'probability';

/** 질문 엔티티 */
export interface Question {
  id: number;
  type: QuestionType;
  optionA: {
    label: string;
    description: string;
  };
  optionB: {
    label: string;
    description: string;
  };
}

/** 4개 지표 점수 (0-100) */
export interface Scores {
  riskAversion: number;      // 위험회피: 높을수록 안전 선호
  lossAversion: number;      // 손실회피: 높을수록 손실에 민감
  timeDiscount: number;      // 시간할인: 높을수록 현재 선호
  probabilityWeight: number; // 확률가중: 높을수록 낙관적
}

/** 캐릭터 유형 코드 */
export type CharacterCode =
  | 'CSPO' | 'CSPL' | 'CSFO' | 'CSFL'
  | 'CTPO' | 'CTPL' | 'CTFO' | 'CTFL'
  | 'RSPO' | 'RSPL' | 'RSFO' | 'RSFL'
  | 'RTPO' | 'RTPL' | 'RTFO' | 'RTFL';

/** 캐릭터 유형 상세 정보 */
export interface CharacterType {
  code: CharacterCode;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

/** 최종 결과 */
export interface Result {
  scores: Scores;
  character: CharacterType;
  percentiles: Scores;
}
