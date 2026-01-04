import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@domain': resolve(__dirname, './src/domain'),
      '@data': resolve(__dirname, './src/data'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@lib': resolve(__dirname, './src/lib'),
    },
  },
});
