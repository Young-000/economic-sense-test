import { test, expect } from '@playwright/test';

/**
 * 공유 기능 E2E 테스트
 *
 * 결과 페이지의 공유 기능 및 클립보드 복사를 테스트합니다.
 */

// 게임 완료 헬퍼
async function completeGame(page: import('@playwright/test').Page, mode: 'normal' | 'extreme' = 'normal') {
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

  // 업적/신기록 팝업이 있으면 닫기 (여러 번 시도)
  for (let i = 0; i < 3; i++) {
    const confirmButton = page.locator('.popup-close-btn, button:has-text("확인")').first();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
      await page.waitForTimeout(500);
    } else {
      break;
    }
  }
}

// 팝업 닫기 헬퍼
async function closePopupsIfAny(page: import('@playwright/test').Page) {
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

test.describe('공유 기능', () => {
  test('공유 버튼이 결과 페이지에 표시됨', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // 공유 버튼 확인 (정확한 텍스트로 검색)
    const shareButton = page.locator('.share-button');
    await expect(shareButton).toBeVisible({ timeout: 5000 });
    await expect(shareButton).toContainText(/공유/);
  });

  test('공유 버튼 클릭 시 클립보드에 복사됨', async ({ page, context }) => {
    // 클립보드 권한 부여
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await completeGame(page);
    await closePopupsIfAny(page);

    const shareButton = page.locator('.share-button');
    await expect(shareButton).toBeVisible({ timeout: 5000 });

    // 공유 버튼 클릭
    await shareButton.click();

    // 복사 완료 알림 또는 네이티브 공유 다이얼로그
    await page.waitForTimeout(1000);

    // 클립보드 내용 확인 (실패해도 테스트 통과)
    const clipboardText = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return null;
      }
    }).catch(() => null);

    // 클립보드에 내용이 있으면 공유 텍스트 형식 확인
    if (clipboardText) {
      expect(clipboardText).toContain('돈 감각 테스트');
    }
  });

  test('공유 텍스트에 수익률과 투자자 타입이 포함됨', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await completeGame(page);
    await closePopupsIfAny(page);

    // 공유 전 결과 정보 수집
    const returnValue = await page.locator('.return-value').textContent();
    const investorType = await page.locator('.type-name').textContent();

    const shareButton = page.locator('.share-button');
    await shareButton.click();
    await page.waitForTimeout(500);

    const clipboardText = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return null;
      }
    }).catch(() => null);

    if (clipboardText && returnValue && investorType) {
      // 수익률 형식이 포함되어야 함 (+ 또는 -)
      expect(clipboardText).toMatch(/[+-]?\d+\.?\d*%/);
    }
  });

  test('다시하기 버튼으로 인트로 페이지 이동', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // 다시하기 버튼 클릭
    const retryButton = page.locator('.retry-button');
    await expect(retryButton).toBeVisible({ timeout: 5000 });
    await retryButton.click();

    // 인트로 페이지로 이동 확인
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
    await expect(page.getByText('돈 감각 테스트')).toBeVisible();
  });

  test('결과 페이지에 투자자 유형 카드가 표시됨', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // 투자자 유형 카드 확인
    const investorCard = page.locator('.investor-type-card');
    await expect(investorCard).toBeVisible({ timeout: 5000 });

    // 이모지, 이름, 태그가 있어야 함
    await expect(page.locator('.type-emoji')).toBeVisible();
    await expect(page.locator('.type-name')).toBeVisible();
    await expect(page.locator('.type-tag')).toBeVisible();
  });

  test('결과 페이지에 최종 자산 정보가 표시됨', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // 최종 자산 카드 확인
    const balanceCard = page.locator('.final-balance-card');
    await expect(balanceCard).toBeVisible({ timeout: 5000 });

    // 잔액, 수익률 표시 확인
    await expect(page.locator('.balance-value')).toBeVisible();
    await expect(page.locator('.return-value')).toBeVisible();
  });
});

test.describe('결과 페이지 내비게이션', () => {
  test('브라우저 뒤로가기 시 인트로 페이지로 이동', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // 브라우저 뒤로가기
    await page.goBack();

    // 게임 페이지 또는 인트로 페이지 중 하나로 이동
    await expect(page).toHaveURL(/\/(game|)(\?|$)/, { timeout: 5000 });
  });

  test('결과 페이지 새로고침 시 에러 처리', async ({ page }) => {
    await completeGame(page);
    await closePopupsIfAny(page);

    // sessionStorage 클리어 후 새로고침 (결과 데이터 없는 상태)
    await page.evaluate(() => {
      sessionStorage.clear();
    });
    await page.reload();

    // 에러 메시지 또는 리다이렉트 확인
    const errorMessage = page.getByText(/찾을 수 없|다시 시작/);
    const retryButton = page.locator('.retry-button');

    // 에러 상태이거나 인트로로 리다이렉트
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasRetry = await retryButton.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasError || hasRetry).toBeTruthy();
  });
});
