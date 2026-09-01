import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/rosco-filter-advisor/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        id: '/rosco-filter-advisor/',
        name: 'Rosco 色片建议 / Rosco Filter Advisor',
        short_name: 'Rosco Advisor',
        description: 'Rosco 色片建议工具，支持 Mired Shift 计算、色片推荐、桌面安装和离线使用。',
        lang: 'zh-CN',
        theme_color: '#f7f8fb',
        background_color: '#f7f8fb',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/rosco-filter-advisor/',
        start_url: '/rosco-filter-advisor/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
