import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@supabase/supabase-js',
      'date-fns',
    ],
  },
  build: {
    target: 'es2022',
    sourcemap: mode === 'production' ? 'hidden' : true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        sourcemapExcludeSources: mode === 'production',
        manualChunks: {
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-markdown': [
            'highlight.js',
            'katex',
            'react-markdown',
            'rehype-highlight',
            'rehype-katex',
            'rehype-raw',
            'remark-gfm',
            'remark-math',
          ],
        },
      },
    },
  },
}));
