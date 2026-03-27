import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function createManualChunks(id: string) {
  if (!id.includes('node_modules')) {
    return;
  }

  if (id.includes('react-router')) {
    return 'vendor-router';
  }

  if (id.includes('@supabase')) {
    return 'vendor-supabase';
  }

  if (
    id.includes('react-dom') ||
    id.includes('/react/') ||
    id.includes('/scheduler/') ||
    id.includes('/use-sync-external-store/')
  ) {
    return 'vendor-react';
  }

  if (id.includes('lucide-react') || id.includes('/motion/')) {
    return 'vendor-ui';
  }

  if (id.includes('highlight.js') || id.includes('rehype-highlight')) {
    return 'vendor-markdown-highlight';
  }

  if (
    id.includes('katex') ||
    id.includes('rehype-katex') ||
    id.includes('remark-math') ||
    id.includes('micromark-extension-math') ||
    id.includes('mdast-util-math')
  ) {
    return 'vendor-markdown-math';
  }

  if (id.includes('rehype-raw') || id.includes('hast-util-raw') || id.includes('parse5')) {
    return 'vendor-markdown-raw';
  }

  if (
    id.includes('react-markdown') ||
    id.includes('remark-gfm') ||
    id.includes('remark-parse') ||
    id.includes('remark-rehype') ||
    id.includes('remark-') ||
    id.includes('rehype-') ||
    id.includes('/hast') ||
    id.includes('/mdast') ||
    id.includes('/micromark') ||
    id.includes('/unified/') ||
    id.includes('/property-information/') ||
    id.includes('/vfile/') ||
    id.includes('/trough/')
  ) {
    return 'vendor-markdown';
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: true,
    },
    warmup: {
      clientFiles: ['./src/main.tsx', './src/app.tsx'],
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
    cssCodeSplit: true,
    reportCompressedSize: true,
    sourcemap: mode === 'analyze' ? true : mode === 'production' ? 'hidden' : true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        sourcemapExcludeSources: mode === 'production',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: createManualChunks,
      },
    },
  },
}));
