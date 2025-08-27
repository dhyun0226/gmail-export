// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // --- 기존 설정 보존 --- 
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css' }
      ],
      script: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js', body: true },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js', body: true }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  pages: true,

  // --- [복구] 기존 runtimeConfig 설정 --- 
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    public: {
      appUrl: process.env.PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  // --- [적용] 새로운 빌드 최적화 설정 ---
  nitro: {
    preset: 'vercel',
    externals: {
      inline: ['xlsx']
    }
  },
  vite: {
    resolve: {
      alias: {
        'xlsx': 'xlsx/xlsx.mjs'
      }
    },
    optimizeDeps: {
      include: ['xlsx']
    },
    ssr: {
      noExternal: ['xlsx']
    }
  }
})
