import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'economic-sense-test',
  brand: {
    displayName: '경제 센스 테스트',
    primaryColor: '#10B981',
    icon: '/app-icon-600.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc && vite build',
    },
  },
  webViewProps: {
    type: 'partner',
    bounces: false,
    pullToRefreshEnabled: false,
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  permissions: [],
  outdir: 'dist',
});
