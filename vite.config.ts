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
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@constants': resolve(__dirname, './src/constants'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase (큰 라이브러리)
          'vendor-supabase': ['@supabase/supabase-js'],
          // html2canvas (ResultPage에서만 사용)
          'vendor-html2canvas': ['html2canvas'],
        },
      },
    },
    // 청크 크기 경고 임계값 (KB)
    chunkSizeWarningLimit: 300,
  },
});
