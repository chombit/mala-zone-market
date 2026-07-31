import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/malazone-m-emblem.webp', 'assets/**/*.webp', '**/*.svg'],
      injectRegister: 'auto',
      minify: true,
      manifest: {
        name: 'malazone Verified Ledger Directory',
        short_name: 'malazone',
        description: 'Zero-Commission Digital Marketplace for Hawassa, Ethiopia',
        theme_color: '#0B132B',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        id: '/',
        categories: ['business', 'shopping', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        icons: [
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '64x64',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '128x128',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '256x256',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '384x384',
            type: 'image/webp',
            purpose: 'any maskable',
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '1280x720',
            type: 'image/webp',
            form_factor: 'wide',
            label: 'Malazone Homepage'
          },
          {
            src: 'assets/malazone-m-emblem.webp',
            sizes: '750x1334',
            type: 'image/webp',
            form_factor: 'narrow',
            label: 'Malazone Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'Browse Listings',
            short_name: 'Browse',
            description: 'View all marketplace listings',
            url: '/',
            icons: [{ src: 'assets/malazone-m-emblem.webp', sizes: '96x96' }]
          },
          {
            name: 'Contact Us',
            short_name: 'Contact',
            description: 'Get in touch with support',
            url: '/',
            icons: [{ src: 'assets/malazone-m-emblem.webp', sizes: '96x96' }]
          },
          {
            name: 'About Us',
            short_name: 'About',
            description: 'Learn more about malazone',
            url: '/',
            icons: [{ src: 'assets/malazone-m-emblem.webp', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{html,js,css,woff2,png,jpg,jpeg,svg,webp}'],
        globIgnores: ['**/*.map'],
        swDest: 'dist/sw.js',
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4003',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4003',
        changeOrigin: true,
      },
    },
  },
})
