import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * 경제 상식 테스트 앱의 E2E 테스트 설정입니다.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* 테스트 실행 전 최대 대기 시간 */
  timeout: 30 * 1000,

  /* 각 테스트 재시도 횟수 (CI에서 flaky 테스트 대응) */
  retries: process.env.CI ? 2 : 0,

  /* 병렬 실행 워커 수 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  /* 모든 테스트에 적용되는 공통 설정 */
  use: {
    /* 개발 서버 기본 URL */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    /* 실패 시 스크린샷 캡처 */
    screenshot: 'only-on-failure',

    /* 실패 시 트레이스 수집 */
    trace: 'on-first-retry',

    /* 비디오 녹화 */
    video: 'on-first-retry',
  },

  /* 테스트할 브라우저/디바이스 프로젝트 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* 개발 서버 자동 실행 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
