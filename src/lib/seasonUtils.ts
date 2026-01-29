/**
 * 시즌/이벤트 감지 유틸리티
 * 현재 날짜 기반으로 적용할 시즌/이벤트 테마 결정
 */
import {
  type SeasonType,
  type SpecialEventType,
  type SeasonTheme,
  SEASON_THEMES,
  SPECIAL_EVENT_THEMES,
} from '@domain/entities';

/** 현재 시즌 가져오기 */
export function getCurrentSeason(date: Date = new Date()): SeasonType {
  const month = date.getMonth() + 1; // 0-indexed → 1-indexed

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter'; // 12, 1, 2월
}

/** 특별 이벤트 감지 (날짜 범위 기반) */
export function getSpecialEvent(date: Date = new Date()): SpecialEventType | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  // 설날 (음력 1월 1일 전후 3일) - 대략적인 양력 날짜 사용
  // 실제로는 음력 계산이 필요하지만, 간단히 1월 말 ~ 2월 초로 설정
  if ((month === 1 && day >= 20) || (month === 2 && day <= 5)) {
    return 'new_year';
  }

  // 발렌타인데이 (2/13-14)
  if (month === 2 && day >= 13 && day <= 14) {
    return 'valentines';
  }

  // 화이트데이 (3/13-14)
  if (month === 3 && day >= 13 && day <= 14) {
    return 'white_day';
  }

  // 추석 (음력 8월 15일 전후) - 대략적으로 9월 중순 ~ 10월 초
  if ((month === 9 && day >= 10) || (month === 10 && day <= 5)) {
    return 'chuseok';
  }

  // 할로윈 (10/28-31)
  if (month === 10 && day >= 28 && day <= 31) {
    return 'halloween';
  }

  // 블랙프라이데이 (11월 넷째 금요일 전후)
  if (month === 11 && day >= 20 && day <= 30) {
    const blackFriday = getBlackFriday(year);
    if (Math.abs(day - blackFriday.getDate()) <= 3) {
      return 'black_friday';
    }
  }

  // 크리스마스 (12/23-25)
  if (month === 12 && day >= 23 && day <= 25) {
    return 'christmas';
  }

  // 연말 (12/26-31)
  if (month === 12 && day >= 26 && day <= 31) {
    return 'year_end';
  }

  return null;
}

/** 블랙프라이데이 날짜 계산 (11월 넷째 금요일) */
function getBlackFriday(year: number): Date {
  const november = new Date(year, 10, 1); // 11월 1일
  const dayOfWeek = november.getDay(); // 0=일, 5=금
  const firstFriday = dayOfWeek <= 5 ? 5 - dayOfWeek + 1 : 12 - dayOfWeek + 1;
  const fourthFriday = firstFriday + 21; // 4번째 금요일
  return new Date(year, 10, fourthFriday);
}

/** 현재 적용할 테마 가져오기 (이벤트 우선) */
export function getCurrentTheme(date: Date = new Date()): SeasonTheme {
  // 특별 이벤트가 있으면 우선 적용
  const specialEvent = getSpecialEvent(date);
  if (specialEvent) {
    return SPECIAL_EVENT_THEMES[specialEvent];
  }

  // 없으면 기본 시즌 테마
  const season = getCurrentSeason(date);
  return SEASON_THEMES[season];
}

/** 시즌 테마 정보 포맷팅 */
export function formatSeasonInfo(theme: SeasonTheme): {
  badge: string;
  message: string;
  isSpecialEvent: boolean;
} {
  const isSpecialEvent = Object.keys(SPECIAL_EVENT_THEMES).includes(theme.id);

  return {
    badge: `${theme.emoji} ${theme.name}`,
    message: theme.bannerMessage,
    isSpecialEvent,
  };
}

/** 다음 이벤트까지 남은 일수 계산 */
export function getDaysUntilNextEvent(date: Date = new Date()): {
  event: SpecialEventType;
  daysLeft: number;
} | null {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // 주요 이벤트 날짜 목록 (대략적)
  const upcomingEvents: { event: SpecialEventType; date: Date }[] = [
    { event: 'valentines', date: new Date(year, 1, 14) },
    { event: 'white_day', date: new Date(year, 2, 14) },
    { event: 'halloween', date: new Date(year, 9, 31) },
    { event: 'christmas', date: new Date(year, 11, 25) },
    { event: 'year_end', date: new Date(year, 11, 31) },
  ];

  // 현재 날짜 이후의 가장 가까운 이벤트 찾기
  const now = new Date(year, month, day);
  const futureEvents = upcomingEvents
    .filter(e => e.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (futureEvents.length === 0) {
    // 올해 남은 이벤트 없으면 내년 발렌타인
    const nextValentines = new Date(year + 1, 1, 14);
    const daysLeft = Math.ceil((nextValentines.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { event: 'valentines', daysLeft };
  }

  const nextEvent = futureEvents[0];
  const daysLeft = Math.ceil((nextEvent.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return { event: nextEvent.event, daysLeft };
}
