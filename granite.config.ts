import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appId: 'economic-sense-test',
  appName: '경제감각 테스트',
  icon: '',
  web: {
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
});
