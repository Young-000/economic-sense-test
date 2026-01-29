/**
 * 시즌/이벤트 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  getCurrentSeason,
  getSpecialEvent,
  getCurrentTheme,
  formatSeasonInfo,
  getDaysUntilNextEvent,
} from '../seasonUtils';
import { SEASON_THEMES, SPECIAL_EVENT_THEMES } from '@domain/entities';

describe('seasonUtils', () => {
  describe('getCurrentSeason', () => {
    it('3월은 봄', () => {
      expect(getCurrentSeason(new Date(2025, 2, 15))).toBe('spring');
    });

    it('4월은 봄', () => {
      expect(getCurrentSeason(new Date(2025, 3, 1))).toBe('spring');
    });

    it('5월은 봄', () => {
      expect(getCurrentSeason(new Date(2025, 4, 31))).toBe('spring');
    });

    it('6월은 여름', () => {
      expect(getCurrentSeason(new Date(2025, 5, 1))).toBe('summer');
    });

    it('7월은 여름', () => {
      expect(getCurrentSeason(new Date(2025, 6, 15))).toBe('summer');
    });

    it('8월은 여름', () => {
      expect(getCurrentSeason(new Date(2025, 7, 31))).toBe('summer');
    });

    it('9월은 가을', () => {
      expect(getCurrentSeason(new Date(2025, 8, 1))).toBe('autumn');
    });

    it('10월은 가을', () => {
      expect(getCurrentSeason(new Date(2025, 9, 15))).toBe('autumn');
    });

    it('11월은 가을', () => {
      expect(getCurrentSeason(new Date(2025, 10, 30))).toBe('autumn');
    });

    it('12월은 겨울', () => {
      expect(getCurrentSeason(new Date(2025, 11, 25))).toBe('winter');
    });

    it('1월은 겨울', () => {
      expect(getCurrentSeason(new Date(2025, 0, 15))).toBe('winter');
    });

    it('2월은 겨울', () => {
      expect(getCurrentSeason(new Date(2025, 1, 28))).toBe('winter');
    });
  });

  describe('getSpecialEvent', () => {
    it('2월 14일은 발렌타인', () => {
      expect(getSpecialEvent(new Date(2025, 1, 14))).toBe('valentines');
    });

    it('2월 13일도 발렌타인', () => {
      expect(getSpecialEvent(new Date(2025, 1, 13))).toBe('valentines');
    });

    it('3월 14일은 화이트데이', () => {
      expect(getSpecialEvent(new Date(2025, 2, 14))).toBe('white_day');
    });

    it('10월 31일은 할로윈', () => {
      expect(getSpecialEvent(new Date(2025, 9, 31))).toBe('halloween');
    });

    it('10월 28일도 할로윈', () => {
      expect(getSpecialEvent(new Date(2025, 9, 28))).toBe('halloween');
    });

    it('12월 25일은 크리스마스', () => {
      expect(getSpecialEvent(new Date(2025, 11, 25))).toBe('christmas');
    });

    it('12월 24일도 크리스마스', () => {
      expect(getSpecialEvent(new Date(2025, 11, 24))).toBe('christmas');
    });

    it('12월 31일은 연말', () => {
      expect(getSpecialEvent(new Date(2025, 11, 31))).toBe('year_end');
    });

    it('12월 26일은 연말', () => {
      expect(getSpecialEvent(new Date(2025, 11, 26))).toBe('year_end');
    });

    it('일반 날짜는 null', () => {
      expect(getSpecialEvent(new Date(2025, 3, 15))).toBeNull(); // 4월 15일
      expect(getSpecialEvent(new Date(2025, 5, 10))).toBeNull(); // 6월 10일
      expect(getSpecialEvent(new Date(2025, 7, 20))).toBeNull(); // 8월 20일
    });

    it('1월 말은 설날', () => {
      expect(getSpecialEvent(new Date(2025, 0, 25))).toBe('new_year');
    });

    it('2월 초는 설날', () => {
      expect(getSpecialEvent(new Date(2025, 1, 3))).toBe('new_year');
    });

    it('9월 중순은 추석', () => {
      expect(getSpecialEvent(new Date(2025, 8, 15))).toBe('chuseok');
    });
  });

  describe('getCurrentTheme', () => {
    it('특별 이벤트가 있으면 이벤트 테마 반환', () => {
      const theme = getCurrentTheme(new Date(2025, 11, 25)); // 크리스마스
      expect(theme.id).toBe('christmas');
      expect(theme.emoji).toBe('🎄');
    });

    it('특별 이벤트 없으면 시즌 테마 반환', () => {
      const theme = getCurrentTheme(new Date(2025, 3, 15)); // 4월 15일 (봄)
      expect(theme.id).toBe('spring');
      expect(theme.emoji).toBe('🌸');
    });

    it('할로윈 테마 확인', () => {
      const theme = getCurrentTheme(new Date(2025, 9, 31));
      expect(theme.id).toBe('halloween');
      expect(theme.name).toBe('할로윈 이벤트');
    });

    it('여름 시즌 테마 확인', () => {
      const theme = getCurrentTheme(new Date(2025, 6, 15));
      expect(theme.id).toBe('summer');
      expect(theme.name).toBe('여름 시즌');
    });
  });

  describe('formatSeasonInfo', () => {
    it('시즌 테마 포맷', () => {
      const info = formatSeasonInfo(SEASON_THEMES.spring);
      expect(info.badge).toBe('🌸 봄 시즌');
      expect(info.message).toBe('🌸 봄맞이 투자 시즌!');
      expect(info.isSpecialEvent).toBe(false);
    });

    it('이벤트 테마 포맷', () => {
      const info = formatSeasonInfo(SPECIAL_EVENT_THEMES.christmas);
      expect(info.badge).toBe('🎄 크리스마스 이벤트');
      expect(info.message).toBe('🎄 크리스마스 스페셜!');
      expect(info.isSpecialEvent).toBe(true);
    });

    it('할로윈 이벤트는 특별 이벤트로 표시', () => {
      const info = formatSeasonInfo(SPECIAL_EVENT_THEMES.halloween);
      expect(info.isSpecialEvent).toBe(true);
    });

    it('겨울 시즌은 특별 이벤트가 아님', () => {
      const info = formatSeasonInfo(SEASON_THEMES.winter);
      expect(info.isSpecialEvent).toBe(false);
    });
  });

  describe('getDaysUntilNextEvent', () => {
    it('다음 이벤트까지 남은 일수 계산', () => {
      const result = getDaysUntilNextEvent(new Date(2025, 1, 10)); // 2월 10일
      expect(result).not.toBeNull();
      expect(result?.event).toBe('valentines');
      expect(result?.daysLeft).toBe(4); // 2월 14일까지 4일
    });

    it('올해 이벤트 끝나면 내년 이벤트 반환', () => {
      const result = getDaysUntilNextEvent(new Date(2025, 11, 31)); // 12월 31일
      expect(result).not.toBeNull();
      expect(result?.event).toBe('valentines'); // 내년 발렌타인
    });

    it('할로윈 전에는 할로윈까지 일수', () => {
      const result = getDaysUntilNextEvent(new Date(2025, 9, 20)); // 10월 20일
      expect(result).not.toBeNull();
      expect(result?.event).toBe('halloween');
      expect(result?.daysLeft).toBe(11); // 10월 31일까지 11일
    });
  });

  describe('테마 데이터 일관성', () => {
    it('모든 시즌 테마에 필수 필드 존재', () => {
      Object.values(SEASON_THEMES).forEach(theme => {
        expect(theme.id).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.emoji).toBeDefined();
        expect(theme.bannerMessage).toBeDefined();
        expect(theme.accentColor).toBeDefined();
      });
    });

    it('모든 특별 이벤트 테마에 필수 필드 존재', () => {
      Object.values(SPECIAL_EVENT_THEMES).forEach(theme => {
        expect(theme.id).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.emoji).toBeDefined();
        expect(theme.bannerMessage).toBeDefined();
        expect(theme.accentColor).toBeDefined();
      });
    });

    it('시즌 테마는 4개', () => {
      expect(Object.keys(SEASON_THEMES)).toHaveLength(4);
    });

    it('특별 이벤트 테마는 8개', () => {
      expect(Object.keys(SPECIAL_EVENT_THEMES)).toHaveLength(8);
    });
  });
});
