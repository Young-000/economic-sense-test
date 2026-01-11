import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**/*'],
    },
  },
  resolve: {
    alias: {
      '@domain': resolve(__dirname, './src/domain'),
      '@data': resolve(__dirname, './src/data'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@lib': resolve(__dirname, './src/lib'),
    },
  },
});
