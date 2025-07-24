# Frontend 신규 프로젝트 초기화 가이드

신규 Frontend 프로젝트를 기본 설정으로 초기화하고 front-config.md 파일을 생성합니다.

## 기본 기술 스택
- **Framework**: Vue 3.5
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.4
- **UI Library**: Bootstrap 5.3
- **State Management**: Pinia 2.2
- **Package Manager**: npm

## 초기화 절차

### 1. 기본 폴더 구조 생성

**Vue 3.5 + Vite 표준 구조:**

```bash
# Frontend 프로젝트 루트 폴더로 이동
cd [지정된 front-path]

# 기본 폴더 구조 생성
mkdir -p src/{components,views,stores,api,types,utils,assets,styles}
mkdir -p public
mkdir -p tests

# 세부 폴더 구조 생성
mkdir -p src/components/{common,layout,forms}
mkdir -p src/views/{auth,dashboard,settings}
mkdir -p src/stores/{modules}
mkdir -p src/api/{endpoints}
mkdir -p src/types/{api,components}
mkdir -p src/utils/{helpers,validators}
mkdir -p src/assets/{images,icons,fonts}
mkdir -p src/styles/{components,pages,variables}
```

**생성되는 최종 폴더 구조:**

```
frontend-project/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # 재사용 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   └── forms/          # 폼 컴포넌트
│   ├── views/              # 페이지 컴포넌트
│   │   ├── auth/           # 인증 관련 페이지
│   │   ├── dashboard/      # 대시보드 페이지
│   │   └── settings/       # 설정 페이지
│   ├── stores/             # Pinia 스토어
│   │   └── modules/        # 스토어 모듈
│   ├── api/               # API 클라이언트
│   │   └── endpoints/      # API 엔드포인트별 분리
│   ├── types/             # TypeScript 타입
│   │   ├── api/           # API 관련 타입
│   │   └── components/    # 컴포넌트 타입
│   ├── utils/             # 유틸리티
│   │   ├── helpers/       # 헬퍼 함수
│   │   └── validators/    # 유효성 검사
│   ├── assets/            # 정적 자산
│   │   ├── images/        # 이미지 파일
│   │   ├── icons/         # 아이콘 파일
│   │   └── fonts/         # 폰트 파일
│   ├── styles/            # 스타일 파일
│   │   ├── components/    # 컴포넌트별 스타일
│   │   ├── pages/         # 페이지별 스타일
│   │   └── variables/     # CSS 변수
│   ├── App.vue            # 루트 컴포넌트
│   └── main.ts            # 애플리케이션 진입점
├── tests/                 # 테스트 파일
├── index.html             # HTML 템플릿
├── package.json           # 패키지 설정
├── tsconfig.json          # TypeScript 설정
├── vite.config.ts         # Vite 설정
└── README.md              # 프로젝트 설명
```

### 2. package.json 생성
```json
{
  "name": "frontend-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "pinia": "^2.2.0",
    "bootstrap": "^5.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.3.0",
    "vue-tsc": "^2.1.0",
    "vite": "^5.4.0"
  }
}
```

### 3. TypeScript 설정 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. Vite 설정 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
})
```

### 5. 메인 애플리케이션 파일 (src/main.ts)
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 6. App.vue 컴포넌트
```vue
<template>
  <div id="app" class="container">
    <h1>{{ title }}</h1>
    <p>Vue 3.5 + TypeScript + Bootstrap 프로젝트가 성공적으로 초기화되었습니다!</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Frontend Project')
</script>
```

### 7. index.html
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frontend Project</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

## 의존성 설치
```bash
cd [프론트엔드 경로]
npm install
```

## front-config.md 생성
초기화 완료 후 다음 내용으로 front-config.md 생성:

```markdown
# Frontend Configuration

## 기술 스택(Technology Stack)
- **Framework**: Vue 3.5+
- **UI Library**: Bootstrap 5.3+
- **State Management**: Pinia 2.2+
- **Build Tool**: Vite 5.4+
- **Language**: TypeScript 5.3+

## 프로젝트 구조(Project Structure)
\`\`\`
src/
├── views/          # 페이지 컴포넌트
├── components/     # 재사용 컴포넌트
├── stores/         # Pinia 스토어
├── api/           # API 클라이언트
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
├── assets/        # 정적 자산
└── main.ts        # 애플리케이션 진입점
\`\`\`

## 코딩 컨벤션(Coding Conventions)
- **컴포넌트명**: PascalCase
- **파일명**: kebab-case
- **변수/함수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE

## 개발 명령어(Development Commands)
\`\`\`bash
npm run dev     # 개발 서버 실행
npm run build   # 프로덕션 빌드
npm run preview # 빌드 미리보기
\`\`\`

## 환경 설정(Environment Configuration)
- **Node.js 버전**: 18.0.0 이상 권장
- **패키지 매니저**: npm
- **개발 포트**: 3000 (기본값)
```

## 초기화 완료 메시지
```
✅ Frontend 프로젝트 초기화 완료!
📦 npm install 실행 완료
📝 front-config.md 생성 완료

🚀 개발 서버 실행: npm run dev
```