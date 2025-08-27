// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  nitro: {
    preset: 'vercel',
    /**
     * [핵심 수정] 서버 빌드를 담당하는 Nitro에 직접 별칭을 설정합니다.
     * Vite 설정을 사용하는 것보다 이 방법이 Vercel 빌드에 더 직접적이고 확실하게 적용됩니다.
     * 이를 통해 xlsx 라이브러리가 코어 버전으로 강제 치환됩니다.
     */
    alias: {
      'xlsx': 'xlsx/dist/xlsx.core.min.js'
    }
  },
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    public: {
      appUrl: process.env.PUBLIC_APP_URL || 'http://localhost:3000'
    }
  }
})