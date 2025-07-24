# 프론트엔드 기본 설정 템플릿

## 프로젝트 메타데이터

### 프로젝트 식별 정보
- **Project ID**: [프로젝트 고유 ID] (예: PROJ-2025-001)
- **Project Name**: [프로젝트명]
- **Version**: 1.0.0
- **Description**: [프로젝트 설명]
- **Author**: [개발자/팀명]
- **Copyright**: © 2025 [회사명]. All rights reserved.
- **License**: [라이선스] (예: MIT, Apache 2.0, Proprietary)
- **Created Date**: 2025-01-01
- **Last Modified**: 2025-07-04

### 팀 정보
- **Lead Developer**: [리드 개발자명]
- **Contributors**: [기여자 목록]
- **Contact Email**: [연락처 이메일]
- **Team/Department**: [팀/부서명]

### 프로젝트 관리
- **Repository URL**: [Git 저장소 URL]
- **Documentation**: [문서화 사이트 URL]
- **Issue Tracker**: [이슈 트래커 URL]
- **CI/CD Pipeline**: [CI/CD 도구 및 URL]

### 비즈니스 정보
- **Client/Customer**: [고객사명]
- **Business Domain**: [비즈니스 도메인]
- **Project Scope**: [프로젝트 범위]
- **Target Users**: [대상 사용자]

## 프로젝트 기본 정보

### 기술 스택
- **프레임워크**: Vue 3.5+ (Composition API)
- **상태 관리**: Pinia 2.2+
- **UI 프레임워크**: Bootstrap 5.3+
- **빌드 도구**: Vite 5.0+
- **언어**: TypeScript 5.3+
- **패키지 매니저**: npm 10+

### 추가 라이브러리
- **라우터**: Vue Router 4.4+
- **HTTP 클라이언트**: Axios 1.6+
- **날짜 처리**: Day.js 1.11+
- **아이콘**: Bootstrap Icons 1.11+
- **폼 검증**: VeeValidate 4.12+
- **국제화**: Vue I18n 9.9+

## 프로젝트 구조

```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │       ├── main.scss
│   │       ├── variables.scss
│   │       └── bootstrap-custom.scss
│   ├── components/
│   │   ├── common/
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   └── BaseModal.vue
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   └── AppSidebar.vue
│   │   └── ui/
│   │       ├── LoadingSpinner.vue
│   │       └── ErrorAlert.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useToast.ts
│   ├── layouts/
│   │   ├── DefaultLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── BlankLayout.vue
│   ├── locales/
│   │   ├── ko.json
│   │   └── en.json
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.vue
│   │   │   └── RegisterPage.vue
│   │   ├── home/
│   │   │   └── HomePage.vue
│   │   └── error/
│   │       ├── NotFound.vue
│   │       └── ServerError.vue
│   ├── router/
│   │   ├── index.ts
│   │   ├── guards.ts
│   │   └── routes.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   └── base.service.ts
│   │   └── utils/
│   │       ├── storage.ts
│   │       └── validators.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── user.store.ts
│   │   └── app.store.ts
│   ├── types/
│   │   ├── api.d.ts
│   │   ├── models.d.ts
│   │   └── vue-shim.d.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── formatters.ts
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── .env
├── .env.development
├── .env.production
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 설정 파일 내용

### package.json
```json
{
  "name": "project-frontend",
  "version": "1.0.0",
  "description": "[프로젝트 설명]",
  "author": "[개발자/팀명]",
  "license": "[라이선스]",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "cypress open",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "bootstrap": "^5.3.3",
    "bootstrap-icons": "^1.11.3",
    "dayjs": "^1.11.10",
    "pinia": "^2.2.0",
    "vee-validate": "^4.12.5",
    "vue": "^3.5.0",
    "vue-i18n": "^9.9.1",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@rushstack/eslint-patch": "^1.7.2",
    "@tsconfig/node20": "^20.1.2",
    "@types/bootstrap": "^5.2.10",
    "@types/node": "^20.11.19",
    "@vitejs/plugin-vue": "^5.0.4",
    "@vue/eslint-config-prettier": "^9.0.0",
    "@vue/eslint-config-typescript": "^12.0.0",
    "@vue/test-utils": "^2.4.4",
    "@vue/tsconfig": "^0.5.1",
    "cypress": "^13.6.4",
    "eslint": "^8.57.0",
    "eslint-plugin-cypress": "^2.15.1",
    "eslint-plugin-vue": "^9.22.0",
    "jsdom": "^24.0.0",
    "prettier": "^3.2.5",
    "sass": "^1.71.1",
    "typescript": "~5.3.3",
    "vite": "^5.1.4",
    "vitest": "^1.3.1",
    "vue-tsc": "^2.0.1"
  }
}
```

### vite.config.ts
```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
          @import "bootstrap/scss/functions";
          @import "bootstrap/scss/variables";
          @import "bootstrap/scss/mixins";
        `
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### tsconfig.json
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### .eslintrc.js
```javascript
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:cypress/recommended']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

### .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

## 환경 변수 설정

### .env
```env
# 공통 환경 변수
VITE_APP_PROJECT_ID=[프로젝트 ID]
VITE_APP_TITLE=My Application
VITE_APP_VERSION=1.0.0
VITE_APP_AUTHOR=[개발자/팀명]
VITE_APP_COPYRIGHT=© 2025 [회사명]. All rights reserved.
```

### .env.development
```env
# 개발 환경 변수
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_ENV=development
```

### .env.production
```env
# 운영 환경 변수
VITE_API_BASE_URL=https://api.myapp.com
VITE_APP_ENV=production
```

## 초기 코드 예시

### src/main.ts
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Custom styles
import '@/assets/styles/main.scss'

// i18n messages
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

const app = createApp(App)

// i18n
const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'en',
  messages: { ko, en }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
```

### src/stores/auth.store.ts
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/models'
import { authService } from '@/services/api/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await authService.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
```

## 사용 가이드

### 1. 프로젝트 초기화
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```

### 4. 테스트 실행
```bash
npm run test
```

## 주요 특징

1. **TypeScript 기반**: 타입 안정성과 개발 생산성 향상
2. **Composition API**: Vue 3의 최신 API 활용
3. **Pinia 상태 관리**: 간단하고 타입 안전한 상태 관리
4. **Bootstrap 5**: 반응형 UI 구현
5. **모듈화된 구조**: 확장 가능하고 유지보수가 쉬운 구조
6. **환경별 설정**: 개발/운영 환경 분리
7. **국제화 지원**: 다국어 지원 기본 설정
8. **ESLint & Prettier**: 코드 품질 관리