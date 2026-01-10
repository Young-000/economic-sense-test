import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'economic-sense-test',
  brand: {
    displayName: '돈 감각 테스트',
    primaryColor: '#10B981', // 돈/성장을 나타내는 초록색
    icon: 'https://economic-sense-test.vercel.app/app-icon.svg',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc && vite build',
    },
  },
  // 게임용 WebView 설정
  webViewProps: {
    type: 'game',
  },
  // 게임 기능 사용
  features: {
    gameCenter: true,
    ads: true,
  },
});
