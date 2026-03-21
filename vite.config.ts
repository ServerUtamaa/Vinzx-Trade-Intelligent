
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Vinzx Trade Intelligent',
          short_name: 'Vinzx',
          description: 'AI Trading Assistant with SMC Analysis & Realtime Signals',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || env.VITE_API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      port: 3000,
      proxy: {
        '/api/calendar': {
          target: 'https://economic-calendar.tradingview.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/calendar/, '/events'),
          headers: {
            'Origin': 'https://www.tradingview.com',
            'Referer': 'https://www.tradingview.com/'
          }
        },
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
  };
});
