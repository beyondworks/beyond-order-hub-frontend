import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/beyond-order-hub-frontend/',
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            short_name: 'MyApp',
            name: 'My PWA App',
            icons: [
              {
                src: 'icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ],
            start_url: '.',
            display: 'standalone',
            theme_color: '#1976d2',
            background_color: '#ffffff'
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.API_URL': JSON.stringify('https://beyond-order-hub-backend.onrender.com')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
