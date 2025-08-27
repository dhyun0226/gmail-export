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
  },
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    public: {
      appUrl: process.env.PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  // Vite 설정을 통해 xlsx 라이브러리 별칭(alias) 지정
  vite: {
    resolve: {
      alias: {
        /**
         * [핵심] xlsx 라이브러리의 전체 버전 대신 코어 버전을 사용하도록 강제합니다.
         * 코어 버전에는 cpexcel.js 와 같은 코드페이지 관련 기능이 제외되어 있어
         * Vercel 빌드 시 ERR_MODULE_NOT_FOUND 오류를 원천적으로 방지합니다.
         */
        'xlsx': 'xlsx/dist/xlsx.core.min.js'
      }
    }
  }
})