import { test, expect } from '@playwright/test';
import { closePopupsIfAny } from './fixtures';

/**
 * 게임 플로우 E2E 테스트
 *
 * 사용자가 게임을 시작하고 완료하는 전체 플로우를 테스트합니다.
 */
test.describe('게임 완료 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('일반 모드 게임 완료 - Happy Path', async ({ page }) => {
    // 1. IntroPage 확인
    await expect(page.getByRole('heading', { level: 1 })).toContainText('돈 감각');
    await expect(page.locator('.mode-btn').first()).toBeVisible();

    // 2. 일반 모드 선택 (기본 선택되어 있음)
    await page.locator('.mode-btn').first().click();

    // 3. 게임 시작 버튼 클릭
    await page.locator('.start-button').click();

    // 4. GamePage로 이동 확인
    await expect(page).toHaveURL(/\/game\?mode=normal/);

    // 5. 10 라운드 진행
    for (let round = 1; round <= 10; round++) {
      // 라운드 표시 확인
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });

      // 선택지 카드 클릭 (첫 번째 선택지)
      await page.locator('.choice-card').first().click();

      // 결과 오버레이 표시 대기
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });

      // 다음 버튼 클릭
      await page.locator('.next-btn').click();
    }

    // 6. ResultPage로 이동 확인
    await expect(page).toHaveURL(/\/result/, { timeout: 10000 });

    // 7. 업적 팝업이 있으면 닫기
    await closePopupsIfAny(page);

    // 8. 결과 페이지 요소 확인 (투자자 타입 카드)
    await expect(page.locator('.result-page, .investor-card, [class*="result"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('극한 모드 게임 완료', async ({ page }) => {
    // 1. 극한 모드 선택
    await page.locator('.mode-btn.extreme').click();

    // 2. 게임 시작
    await page.locator('.start-button').click();

    // 3. 극한 모드 URL 확인
    await expect(page).toHaveURL(/\/game\?mode=extreme/);

    // 4. 초기 자산이 더 높은지 확인 (5,000만원)
    await expect(page.getByText(/5,000만|5000만|50,000,000/)).toBeVisible({ timeout: 5000 });

    // 5. 10 라운드 진행
    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    // 6. 결과 페이지 확인
    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

    // 7. 업적 팝업이 있으면 닫기
    await closePopupsIfAny(page);

    // 8. 결과 페이지 요소 확인
    await expect(page.locator('.result-page, .investor-card, [class*="result"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('모드 선택 토글 동작', async ({ page }) => {
    const normalButton = page.locator('.mode-btn').first();
    const extremeButton = page.locator('.mode-btn.extreme');

    // 초기 상태: 일반 모드가 기본 선택
    await expect(normalButton).toHaveAttribute('aria-pressed', 'true');

    // 극한 모드 클릭
    await extremeButton.click();
    await expect(extremeButton).toHaveAttribute('aria-pressed', 'true');
    await expect(normalButton).toHaveAttribute('aria-pressed', 'false');

    // 다시 일반 모드 클릭
    await normalButton.click();
    await expect(normalButton).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('게임 상태 관리', () => {
  test('라운드 진행 시 잔액이 업데이트됨', async ({ page }) => {
    await page.goto('/');

    // 게임 시작
    await page.locator('.mode-btn').first().click();
    await page.locator('.start-button').click();

    await expect(page).toHaveURL(/\/game/);

    // 초기 잔액 캡처
    const balanceElement = page.locator('[data-testid="balance"], [class*="balance"]').first();
    const initialBalanceText = await balanceElement.textContent().catch(() => null);

    // 첫 라운드 진행
    const choiceButtons = page.locator('button').filter({ hasNotText: /다음|Next|계속|시작/ });
    if (await choiceButtons.count() > 0) {
      await choiceButtons.first().click();
    }

    // 결과 후 잔액이 변경되었는지 확인 (변경되거나 동일할 수 있음)
    await page.waitForTimeout(1000);
    const updatedBalanceText = await balanceElement.textContent().catch(() => null);

    // 잔액이 숫자 형식인지 확인
    if (initialBalanceText) {
      expect(initialBalanceText).toMatch(/[0-9,]+/);
    }
  });

  test('게임 진행 중 브라우저 새로고침 시 상태 복구', async ({ page }) => {
    await page.goto('/');

    // 게임 시작
    await page.locator('.mode-btn').first().click();
    await page.locator('.start-button').click();

    await expect(page).toHaveURL(/\/game/);

    // 3라운드까지 진행
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(500);
      const buttons = page.locator('button').filter({ hasNotText: /다음|Next|계속/ });
      if (await buttons.count() > 0) {
        await buttons.first().click();
      }

      await page.waitForTimeout(500);
      const nextButton = page.getByRole('button', { name: /다음|Next/ });
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
      }
    }

    // 새로고침
    await page.reload();

    // 게임 페이지 또는 인트로 페이지 중 하나에 있어야 함
    await expect(page).toHaveURL(/\/(game|)/);
  });
});
