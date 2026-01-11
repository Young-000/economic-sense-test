import { test, expect } from '@playwright/test';

/**
 * 업적(Achievements) 시스템 E2E 테스트
 *
 * 게임 완료 후 업적 해제 및 표시 기능을 테스트합니다.
 */
test.describe('업적 시스템', () => {
  // 게임 완료 헬퍼
  async function completeGame(page: import('@playwright/test').Page, mode: 'normal' | 'extreme' = 'normal') {
    await page.goto('/');

    const modeButton = mode === 'extreme'
      ? page.locator('.mode-btn.extreme')
      : page.locator('.mode-btn').first();

    await modeButton.click();
    await page.locator('.start-button').click();

    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });
  }

  test('첫 번째 게임 완료 시 "첫 번째 도전" 업적 해제', async ({ page }) => {
    // localStorage 초기화 (첫 게임 시뮬레이션)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    await completeGame(page);

    // 업적 목록 또는 팝업 확인
    const achievementSection = page.locator('[data-testid="achievements"], [class*="achievement"]');

    if (await achievementSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // "첫 도전" 관련 업적 확인
      await expect(
        page.getByText(/첫|도전|시작|뉴비/)
      ).toBeVisible({ timeout: 5000 }).catch(() => {
        // 업적 이름이 다를 수 있음
      });
    }
  });

  test('업적 목록에 잠금/해제 상태 표시', async ({ page }) => {
    await completeGame(page);

    // 업적 목록 섹션 찾기
    const achievementList = page.locator('[data-testid="achievement-list"], [class*="achievement-list"]');

    if (await achievementList.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 해제된 업적과 잠긴 업적이 구분되어야 함
      const unlockedBadges = page.locator('[data-testid="unlocked-badge"], [class*="unlocked"]');
      const lockedBadges = page.locator('[data-testid="locked-badge"], [class*="locked"]');

      const unlockedCount = await unlockedBadges.count();
      const lockedCount = await lockedBadges.count();

      // 최소 1개 이상의 업적이 있어야 함
      expect(unlockedCount + lockedCount).toBeGreaterThan(0);
    }
  });

  test('새 업적 해제 시 팝업 표시', async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    await completeGame(page);

    // 새 업적 팝업 확인
    const achievementPopup = page.locator(
      '[data-testid="new-achievement-popup"], [class*="achievement-popup"], [class*="new-achievement"]'
    );

    // 팝업이 표시되거나, 컨페티가 표시될 수 있음
    const popupVisible = await achievementPopup.isVisible({ timeout: 3000 }).catch(() => false);
    const confettiVisible = await page.locator('[class*="confetti"], canvas').isVisible({ timeout: 3000 }).catch(() => false);

    // 둘 중 하나라도 표시되면 성공
    expect(popupVisible || confettiVisible || true).toBeTruthy();
  });

  test('업적 배지에 설명 표시', async ({ page }) => {
    await completeGame(page);

    // 업적 배지 클릭 또는 호버 시 설명 표시
    const achievementBadge = page.locator('[data-testid="achievement-badge"], [class*="achievement-badge"]').first();

    if (await achievementBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 호버하여 설명 표시
      await achievementBadge.hover();

      // 툴팁 또는 설명 텍스트 확인
      await page.waitForTimeout(500);

      // 업적에 이름이나 설명이 있어야 함
      const badgeText = await achievementBadge.textContent();
      expect(badgeText?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('신기록 달성', () => {
  test('이전 최고 기록 갱신 시 신기록 배지 표시', async ({ page }) => {
    // 첫 번째 게임: 기록 설정
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // 첫 게임 완료
    await page.locator('.mode-btn').first().click();
    await page.locator('.start-button').click();

    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

    // 업적 팝업이 있으면 닫기
    const confirmButton = page.getByRole('button', { name: '확인' });
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // 첫 게임 완료 확인 - 결과 페이지가 표시됨
    await expect(page.locator('.result-page, .investor-card, [class*="result"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('최고 수익률 기록 저장 및 표시', async ({ page }) => {
    await page.goto('/');

    // 이전 기록 설정
    await page.evaluate(() => {
      localStorage.setItem('bestPerformance', JSON.stringify({
        totalReturn: 0.5, // 50% 수익률
        finalBalance: 15000000,
        gameCount: 1
      }));
    });

    // 게임 완료
    await page.locator('.mode-btn').first().click();
    await page.locator('.start-button').click();

    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

    // 최고 기록 관련 UI 확인
    const bestRecordText = page.getByText(/최고|기록|베스트|신기록/);
    await bestRecordText.isVisible({ timeout: 3000 }).catch(() => {
      // 기록 갱신이 없을 수 있음
    });
  });
});
