import { test as base, expect } from '@playwright/test';

/**
 * E2E 테스트 공통 fixture
 *
 * 팝업 닫기 등 공통 유틸리티를 제공합니다.
 */

// 팝업 닫기 헬퍼
export async function closePopupsIfAny(page: import('@playwright/test').Page) {
  // 먼저 결과 페이지가 완전히 로드될 때까지 대기
  await page.waitForTimeout(1000);

  // 팝업이 있으면 닫기 (최대 10회 시도)
  for (let i = 0; i < 10; i++) {
    const popup = page.locator('.new-achievements-popup');
    if (await popup.isVisible({ timeout: 500 }).catch(() => false)) {
      const closeBtn = page.locator('.popup-close-btn');
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(800);
      } else {
        // ESC 키로 닫기 시도
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } else {
      break;
    }
  }

  // 팝업이 완전히 사라질 때까지 대기
  await page.locator('.new-achievements-popup').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

// 게임 완료 헬퍼
export async function completeGame(page: import('@playwright/test').Page, mode: 'normal' | 'extreme' = 'normal') {
  await page.goto('/');

  // 모드 선택
  const modeButton = mode === 'extreme'
    ? page.locator('.mode-btn.extreme')
    : page.locator('.mode-btn').first();

  await modeButton.click();
  await page.locator('.start-button').click();

  // 10 라운드 진행
  for (let round = 1; round <= 10; round++) {
    await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
    await page.locator('.choice-card').first().click();
    await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
    await page.locator('.next-btn').click();
  }

  // 결과 페이지 대기
  await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

  // 팝업 닫기
  await closePopupsIfAny(page);
}

// 확장된 테스트 fixture
export const test = base.extend({
  // 필요 시 추가 fixture
});

export { expect };
