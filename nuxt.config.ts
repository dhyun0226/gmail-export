// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Vercel 배포를 위한 Nitro 프리셋 설정
  nitro: {
    preset: 'vercel',
    /**
     * `xlsx` 라이브러리를 서버리스 함수 번들에 강제로 포함시킵니다.
     * Vercel의 node-file-tracer가 종속성을 추적하지 못하는 경우를 방지하여 안정성을 높입니다.
     */
    externals: {
      inline: ['xlsx']
    }
  },

  vite: {
    resolve: {
      alias: {
        /**
         * `xlsx`를 임포트할 때 항상 ESM 전용 엔트리포인트(.mjs)를 사용하도록 강제합니다.
         * 이를 통해 CJS 관련 경로와 동적 require() 호출을 근본적으로 회피합니다.
         */
        'xlsx': 'xlsx/xlsx.mjs'
      }
    },
    optimizeDeps: {
      /**
       * Vite 개발 서버에서 `xlsx`를 사전에 번들링하여 개발/프로덕션 환경 간의 동작 차이를 줄입니다.
       */
      include: ['xlsx']
    },
    /**
     * [안전핀] SSR 빌드 시 `xlsx`가 외부 모듈로 처리되는 것을 방지합니다.
     * nitro.externals.inline과 함께 이중으로 처리하여 안정성을 극대화합니다.
     */
    ssr: {
      noExternal: ['xlsx']
    }
  },
  
  // 이하 프로젝트의 다른 설정들
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
})