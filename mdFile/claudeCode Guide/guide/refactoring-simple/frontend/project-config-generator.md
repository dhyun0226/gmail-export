# 🎨 프론트엔드 프로젝트 자동 설정 생성 가이드

## 📁 참조 파일 경로
```
FRONTEND_TEMPLATE = "/mnt/c/guide/refactoring-simple/frontend/project-config-template.md"
GUIDE_ROOT = "/mnt/c/guide/refactoring-simple"
```

## 개요
React/Vue/Angular 프론트엔드 프로젝트를 자동으로 분석하여 `project-config.md`를 생성합니다.

## 자동 감지 항목

### 1. 프레임워크 감지
```json
// package.json 분석
{
  "dependencies": {
    "react": "^18.2.0",        // React
    "vue": "^3.3.0",          // Vue 3
    "@angular/core": "^16.0.0", // Angular
    "next": "^13.0.0",        // Next.js
    "nuxt": "^3.0.0"          // Nuxt
  }
}
```

### 2. 언어 감지
```bash
# TypeScript 사용 여부
- tsconfig.json 존재
- .tsx, .ts 파일 존재
- package.json에 typescript 의존성

# JavaScript
- .jsx, .js 파일만 존재
```

### 3. 번들러/빌드 도구
```bash
# Vite
- vite.config.js/ts

# Webpack  
- webpack.config.js

# Create React App
- react-scripts in package.json

# Angular CLI
- angular.json
```

### 4. 상태 관리 라이브러리
```json
{
  "dependencies": {
    // React
    "redux": "^4.0.0",
    "@reduxjs/toolkit": "^1.9.0",
    "zustand": "^4.0.0",
    "mobx": "^6.0.0",
    "recoil": "^0.7.0",
    
    // Vue
    "vuex": "^4.0.0",
    "pinia": "^2.0.0"
  }
}
```

## 분석 프로세스

### Phase 1: 프로젝트 타입 확인
```bash
# 프레임워크 우선순위
1. Next.js (next 패키지)
2. Nuxt (nuxt 패키지)
3. Angular (angular.json)
4. Vue (vue 패키지)
5. React (react 패키지)
```

### Phase 2: 디렉토리 구조 분석
```bash
# React/Next.js 구조
src/
├── components/     # 컴포넌트
├── pages/         # 페이지 (Next.js) 또는 라우트
├── hooks/         # 커스텀 훅
├── services/      # API 서비스
├── store/         # 상태 관리
└── utils/         # 유틸리티

# Vue/Nuxt 구조
src/
├── components/    # 컴포넌트
├── views/        # 페이지/뷰
├── composables/  # 컴포저블
├── stores/       # Pinia 스토어
└── api/          # API 레이어
```

### Phase 3: 컴포넌트 패턴 감지
```typescript
// React 함수형 컴포넌트
export const Button = () => { }
export default function Button() { }

// Vue SFC
<template>...</template>
<script setup>...</script>

// Angular 컴포넌트
@Component({
  selector: 'app-button'
})
```

### Phase 4: 도메인 추론
```bash
# 파일명 패턴으로 도메인 추론
UserList.tsx, UserDetail.tsx → user 도메인
ProductCard.vue, ProductList.vue → product 도메인
OrderForm.tsx, OrderHistory.tsx → order 도메인

# 디렉토리 구조로 추론
features/user/
features/product/
```

## 생성 예시

### 입력: React 프로젝트
```
my-react-app/
├── package.json
├── src/
│   ├── components/
│   │   ├── UserList.tsx
│   │   ├── UserCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── common/
│   │       └── Button.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── UserPage.tsx
│   ├── hooks/
│   │   ├── useUser.ts
│   │   └── useProduct.ts
│   ├── services/
│   │   ├── userService.ts
│   │   └── productService.ts
│   └── store/
│       ├── userSlice.ts
│       └── productSlice.ts
└── tsconfig.json
```

### 출력: project-config.md
```yaml
# 자동 생성된 프론트엔드 프로젝트 설정
# 생성 시간: 2024-03-15 10:30:00

project:
  name: "my-react-app"
  type: "frontend"
  framework: "react"
  language: "typescript"
  version: "18.2.0"

tech_stack:
  bundler: "vite"
  package_manager: "npm"
  css_framework: "tailwind"  # tailwind.config.js 감지
  state_management: "redux-toolkit"
  testing: "jest"

paths:
  baseProjectPath: "/path/to/my-react-app"
  srcPath: "src"
  publicPath: "public"
  buildPath: "dist"

structure:
  pattern: "layer-based"  # 현재 구조 분석 결과
  directories:
    components: "src/components"
    pages: "src/pages"
    hooks: "src/hooks"
    services: "src/services"
    store: "src/store"
    
  # 감지된 도메인
  detected_domains:
    - user
    - product

components:
  naming: "PascalCase"
  fileExtension: ".tsx"
  exportPattern: "named"  # export const 패턴 감지

# 감지된 패턴
patterns:
  - "함수형 컴포넌트 사용"
  - "TypeScript 사용"
  - "Redux Toolkit 상태 관리"
  - "도메인별 훅 분리"

# 리팩토링 제안
suggestions:
  - "layer-based → domain-driven 구조로 전환 권장"
  - "컴포넌트를 도메인별로 그룹화"
  - "공통 컴포넌트는 shared 폴더로 분리"
```

### 입력: Vue 3 프로젝트
```
my-vue-app/
├── package.json
├── src/
│   ├── components/
│   │   ├── UserList.vue
│   │   └── ProductCard.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── UserView.vue
│   ├── composables/
│   │   ├── useUser.ts
│   │   └── useProduct.ts
│   ├── stores/
│   │   ├── user.ts
│   │   └── product.ts
│   └── api/
│       ├── userApi.ts
│       └── productApi.ts
└── vite.config.ts
```

### 출력: Vue project-config.md
```yaml
project:
  name: "my-vue-app"
  type: "frontend"
  framework: "vue"
  language: "typescript"
  version: "3.3.0"

tech_stack:
  bundler: "vite"
  state_management: "pinia"
  router: "vue-router"
  
structure:
  pattern: "layer-based"
  useCompositionApi: true
  
  directories:
    components: "src/components"
    views: "src/views"
    composables: "src/composables"
    stores: "src/stores"
    api: "src/api"

components:
  naming: "PascalCase"
  fileExtension: ".vue"
  scriptSetup: true  # <script setup> 사용 감지
```

## 특수 케이스 처리

### 1. 모노레포 구조
```
monorepo/
├── packages/
│   ├── web/        # React 앱
│   ├── mobile/     # React Native
│   └── shared/     # 공통 컴포넌트
└── package.json    # workspace 설정
```
→ 패키지 선택 옵션 제공

### 2. 마이크로 프론트엔드
```
micro-frontends/
├── shell/          # 메인 앱
├── auth/          # 인증 모듈
└── dashboard/     # 대시보드 모듈
```
→ 모듈별 개별 설정 생성

### 3. 하이브리드 구조
```
src/
├── features/      # 일부는 feature 기반
├── components/    # 일부는 layer 기반
└── pages/
```
→ 혼합 구조로 감지 및 마이그레이션 제안

## 스타일 시스템 감지

### CSS 프레임워크
```bash
# Tailwind CSS
- tailwind.config.js
- @tailwind directives in CSS

# Styled Components
- styled-components in package.json
- styled.div`` 패턴

# CSS Modules
- *.module.css 파일들
- styles.module.scss
```

## 검증 및 최적화 제안

### 자동 검증
1. 각 디렉토리 존재 확인
2. 주요 의존성 버전 호환성
3. 빌드 스크립트 존재

### 최적화 제안
```
📊 분석 결과:
- 현재 구조: Layer-based
- 컴포넌트 수: 23개
- 평균 컴포넌트 크기: 150줄

💡 제안사항:
1. 도메인 기반 구조로 전환 권장
2. 큰 컴포넌트 3개 분할 필요
3. 공통 훅 추출 가능: 5개

project-config.md가 생성되었습니다!
```