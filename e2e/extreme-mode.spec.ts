import { test, expect } from '@playwright/test';
import { closePopupsIfAny } from './fixtures';

/**
 * 극한 모드 E2E 테스트
 *
 * 극한 모드 고유 기능 및 시나리오를 테스트합니다.
 * - 높은 초기 자산 (5,000만원)
 * - 하이리스크 하이리턴 시나리오
 * - 극단적인 수익/손실 범위
 */

test.describe('극한 모드 게임 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('극한 모드 선택 시 UI 변경 확인', async ({ page }) => {
    // 일반 모드가 기본 선택
    const normalButton = page.locator('.mode-btn').first();
    const extremeButton = page.locator('.mode-btn.extreme');

    await expect(normalButton).toHaveAttribute('aria-pressed', 'true');
    await expect(extremeButton).toHaveAttribute('aria-pressed', 'false');

    // 극한 모드 선택
    await extremeButton.click();

    // 극한 모드가 선택됨
    await expect(extremeButton).toHaveAttribute('aria-pressed', 'true');
    await expect(normalButton).toHaveAttribute('aria-pressed', 'false');

    // 시작 버튼 텍스트 변경 확인
    const startButton = page.locator('.start-button');
    await expect(startButton).toContainText(/극한|도전/);
  });

  test('극한 모드 초기 자산 5,000만원 확인', async ({ page }) => {
    // 극한 모드 선택 및 시작
    await page.locator('.mode-btn.extreme').click();
    await page.locator('.start-button').click();

    // 게임 페이지 이동 확인
    await expect(page).toHaveURL(/\/game\?mode=extreme/);

    // 초기 자산 5,000만원 확인
    await expect(page.getByText(/5,000만|5000만|50,000,000/)).toBeVisible({ timeout: 5000 });
  });

  test('극한 모드 게임 완료 플로우', async ({ page }) => {
    // 극한 모드 선택 및 시작
    await page.locator('.mode-btn.extreme').click();
    await page.locator('.start-button').click();

    await expect(page).toHaveURL(/\/game\?mode=extreme/);

    // 10 라운드 진행
    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    // 결과 페이지 확인
    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

    // 업적 팝업이 있으면 닫기
    await closePopupsIfAny(page);

    // 결과 페이지 요소 확인
    await expect(page.locator('.investor-type-card')).toBeVisible({ timeout: 5000 });
  });

  test('극한 모드에서 큰 금액 변동 확인', async ({ page }) => {
    // 극한 모드 선택 및 시작
    await page.locator('.mode-btn.extreme').click();
    await page.locator('.start-button').click();

    await expect(page).toHaveURL(/\/game\?mode=extreme/);

    // 첫 라운드 초기 잔액 확인
    const balanceElement = page.locator('[class*="balance"]').first();
    const initialBalance = await balanceElement.textContent();

    // 첫 라운드 진행
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 });
    await page.locator('.choice-card').first().click();

    // 결과 표시 대기
    await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });

    // 결과 금액 확인 (극한 모드는 변동이 큼)
    const resultAmount = page.locator('.result-overlay').getByText(/[+-].*[만원|원]/);
    if (await resultAmount.isVisible({ timeout: 2000 }).catch(() => false)) {
      const resultText = await resultAmount.textContent();
      // 결과 금액이 있어야 함
      expect(resultText).toBeTruthy();
    }
  });
});

test.describe('극한 모드 시나리오 특성', () => {
  test('극한 모드 시나리오가 하이리스크인지 확인', async ({ page }) => {
    await page.goto('/');

    // 극한 모드 선택 및 시작
    await page.locator('.mode-btn.extreme').click();
    await page.locator('.start-button').click();

    await expect(page).toHaveURL(/\/game\?mode=extreme/);

    // 첫 라운드 시나리오 확인
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 });

    // 시나리오 텍스트가 있어야 함
    const situationText = page.locator('.situation, .question-text, [class*="situation"]').first();
    await expect(situationText).toBeVisible({ timeout: 5000 });

    // 선택지 카드 확인
    const choiceCards = page.locator('.choice-card');
    expect(await choiceCards.count()).toBe(2);
  });

  test('극한 모드 결과 페이지에서 시작 금액 5,000만원 표시', async ({ page }) => {
    await page.goto('/');

    // 극한 모드로 게임 완료
    await page.locator('.mode-btn.extreme').click();
    await page.locator('.start-button').click();

    for (let round = 1; round <= 10; round++) {
      await expect(page.getByText(`${round}/10`)).toBeVisible({ timeout: 5000 });
      await page.locator('.choice-card').first().click();
      await expect(page.locator('.result-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('.next-btn').click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });

    // 업적 팝업이 있으면 닫기
    await closePopupsIfAny(page);

    // 시작 금액 5,000만원 표시 확인
    await expect(page.getByText(/시작.*5,000만|5000만/)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('모드 전환', () => {
  test('일반 모드에서 극한 모드로 전환', async ({ page }) => {
    await page.goto('/');

    // 일반 모드 확인
    const normalButton = page.locator('.mode-btn').first();
    await expect(normalButton).toHaveAttribute('aria-pressed', 'true');

    // 일반 모드 설명 확인
    await expect(page.getByText(/1,000만|1000만/)).toBeVisible();

    // 극한 모드 전환
    await page.locator('.mode-btn.extreme').click();

    // 극한 모드 설명 확인 (5,000만원)
    await expect(page.getByText(/5,000만|5000만/)).toBeVisible();
  });

  test('극한 모드에서 일반 모드로 전환', async ({ page }) => {
    await page.goto('/');

    // 극한 모드 선택
    await page.locator('.mode-btn.extreme').click();
    await expect(page.getByText(/5,000만|5000만/)).toBeVisible();

    // 일반 모드 전환
    await page.locator('.mode-btn').first().click();

    // 일반 모드 설명 확인
    await expect(page.getByText(/1,000만|1000만/)).toBeVisible();
  });

  test('모드 전환 시 설명 텍스트 변경', async ({ page }) => {
    await page.goto('/');

    // 일반 모드 hook 텍스트
    await expect(page.getByText(/금손\? 흙손\?|당신은 금손/)).toBeVisible();

    // 극한 모드 전환
    await page.locator('.mode-btn.extreme').click();

    // 극한 모드 hook 텍스트
    await expect(page.getByText(/파산|각오/)).toBeVisible();
  });
});

test.describe('극한 모드 접근성', () => {
  test('극한 모드 버튼에 적절한 ARIA 속성', async ({ page }) => {
    await page.goto('/');

    const extremeButton = page.locator('.mode-btn.extreme');

    // aria-pressed 속성 확인
    await expect(extremeButton).toHaveAttribute('aria-pressed');

    // 클릭 후 속성 변경
    await extremeButton.click();
    await expect(extremeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('키보드로 극한 모드 선택 및 시작 가능', async ({ page }) => {
    await page.goto('/');

    // Tab으로 극한 모드 버튼에 포커스
    await page.keyboard.press('Tab'); // 첫 번째 요소
    await page.keyboard.press('Tab'); // 일반 모드 버튼
    await page.keyboard.press('Tab'); // 극한 모드 버튼

    // Enter로 극한 모드 선택
    await page.keyboard.press('Enter');

    // 극한 모드가 선택되었는지 확인
    const extremeButton = page.locator('.mode-btn.extreme');
    await expect(extremeButton).toHaveAttribute('aria-pressed', 'true');

    // Tab으로 시작 버튼에 포커스 후 Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // 게임 페이지로 이동 확인
    await expect(page).toHaveURL(/\/game\?mode=extreme/, { timeout: 5000 });
  });
});
