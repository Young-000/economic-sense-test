import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appId: 'economic-sense-test',
  appName: '경제감각 시뮬레이션',
  icon: 'https://economic-sense-test.vercel.app/og-image.svg',
  description: '가상의 1,000만원으로 10번의 투자 결정! 나의 투자 성향과 운을 분석해보세요.',
  category: 'game', // 게임 카테고리
  web: {
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  // 게임 기능 사용
  features: {
    gameCenter: true,
    ads: true,
  },
});
