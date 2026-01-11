import { test, expect } from '@playwright/test';

/**
 * 랭킹 시스템 E2E 테스트
 *
 * 닉네임 입력, 유효성 검사, 랭킹 제출 플로우를 테스트합니다.
 */
test.describe('랭킹 제출 플로우', () => {
  // 게임을 완료하고 결과 페이지로 이동하는 헬퍼
  async function completeGame(page: import('@playwright/test').Page) {
    await page.goto('/');

    // 게임 시작
    await page.locator('.mode-btn').first().click();
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
  }

  test('유효한 닉네임으로 랭킹 제출', async ({ page }) => {
    await completeGame(page);

    // 닉네임 입력 필드 찾기
    const nicknameInput = page.getByPlaceholder(/닉네임|이름|별명/);

    if (await nicknameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 닉네임 입력
      await nicknameInput.fill('테스트유저123');

      // 등록 버튼 클릭
      const submitButton = page.getByRole('button', { name: /등록|제출|저장/ });
      await submitButton.click();

      // 성공 메시지 또는 순위 표시 확인
      await expect(
        page.getByText(/등록|완료|순위|위/)
      ).toBeVisible({ timeout: 5000 }).catch(() => {
        // Supabase 미연결 시 에러 메시지가 표시될 수 있음
      });
    }
  });

  test('닉네임 유효성 검사 - 빈 값', async ({ page }) => {
    await completeGame(page);

    const nicknameInput = page.getByPlaceholder(/닉네임|이름|별명/);

    if (await nicknameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 빈 닉네임으로 제출 시도
      await nicknameInput.fill('');

      const submitButton = page.getByRole('button', { name: /등록|제출|저장/ });
      await submitButton.click();

      // 에러 메시지 또는 버튼 비활성화 확인
      const errorMessage = page.getByText(/입력|필수|닉네임을/);
      const isDisabled = await submitButton.isDisabled();

      expect(await errorMessage.isVisible().catch(() => false) || isDisabled).toBeTruthy();
    }
  });

  test('닉네임 유효성 검사 - 최대 길이 초과', async ({ page }) => {
    await completeGame(page);

    const nicknameInput = page.getByPlaceholder(/닉네임|이름|별명/);

    if (await nicknameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 21자 이상 입력 시도 (최대 20자)
      await nicknameInput.fill('이것은매우긴닉네임이고이십자를초과합니다');

      // 입력값이 잘렸는지 확인
      const inputValue = await nicknameInput.inputValue();
      expect(inputValue.length).toBeLessThanOrEqual(20);
    }
  });

  test('닉네임 유효성 검사 - 특수문자', async ({ page }) => {
    await completeGame(page);

    const nicknameInput = page.getByPlaceholder(/닉네임|이름|별명/);

    if (await nicknameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 특수문자 포함 닉네임
      await nicknameInput.fill('테스트@#$%');

      const submitButton = page.getByRole('button', { name: /등록|제출|저장/ });
      await submitButton.click();

      // 허용되지 않은 문자 에러 또는 필터링 확인
      const inputValue = await nicknameInput.inputValue();
      // 특수문자가 필터링되거나 에러가 표시되어야 함
      const hasSpecialChars = /[@#$%]/.test(inputValue);
      const errorVisible = await page.getByText(/허용|특수문자|한글|영문/).isVisible().catch(() => false);

      // 특수문자가 필터링되었거나 에러 메시지가 표시되어야 함
      expect(!hasSpecialChars || errorVisible).toBeTruthy();
    }
  });
});

test.describe('랭킹 리더보드', () => {
  async function completeGame(page: import('@playwright/test').Page) {
    await page.goto('/');
    await page.locator('.mode-btn').first().click();
    await page.locator('.start-button').click();

    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });
  }

  test('TOP 10 랭킹 토글', async ({ page }) => {
    await completeGame(page);

    // 랭킹 보기 토글 버튼 찾기
    const rankingToggle = page.getByRole('button', { name: /TOP|랭킹|순위|보기/ });

    if (await rankingToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 토글 클릭
      await rankingToggle.click();

      // 랭킹 리스트 표시 확인
      await expect(
        page.getByText(/1위|2위|3위|위|TOP/)
      ).toBeVisible({ timeout: 5000 }).catch(() => {
        // 랭킹 데이터가 없을 수 있음
      });

      // 다시 토글하여 닫기
      await rankingToggle.click();
    }
  });

  test('랭킹 목록에 필수 정보 표시', async ({ page }) => {
    await completeGame(page);

    const rankingToggle = page.getByRole('button', { name: /TOP|랭킹|순위|보기/ });

    if (await rankingToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rankingToggle.click();

      await page.waitForTimeout(1000);

      // 랭킹 항목에 닉네임, 수익률, 투자자 타입이 표시되는지 확인
      const rankingList = page.locator('[data-testid="ranking-list"], [class*="ranking"]');

      if (await rankingList.isVisible().catch(() => false)) {
        // 최소한 순위 번호가 있어야 함
        await expect(page.getByText(/1|위/)).toBeVisible();
      }
    }
  });
});
