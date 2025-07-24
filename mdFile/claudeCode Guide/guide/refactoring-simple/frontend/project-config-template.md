# 프론트엔드 프로젝트 설정 템플릿

이 파일은 React/Vue/Angular 프론트엔드 프로젝트를 위한 설정 템플릿입니다.
`project-config.md` 파일명으로 프로젝트 루트에 저장하세요.

## 프로젝트 정보

```yaml
project:
  name: "프로젝트명"
  type: "frontend"
  framework: "react"  # react, vue, angular, next, nuxt
  language: "typescript"  # javascript, typescript
  version: "18.2.0"  # 프레임워크 버전
```

## 기술 스택

```yaml
tech_stack:
  bundler: "vite"  # webpack, vite, parcel, rollup
  package_manager: "npm"  # npm, yarn, pnpm
  css_framework: "tailwind"  # tailwind, bootstrap, material-ui, antd
  state_management: "redux"  # redux, zustand, mobx, recoil, pinia, vuex
  testing: "jest"  # jest, vitest, mocha, cypress
```

## 경로 설정

```yaml
paths:
  baseProjectPath: "/path/to/your/project"
  srcPath: "src"
  publicPath: "public"
  buildPath: "dist"  # 또는 build
  assetsPath: "src/assets"
  stylesPath: "src/styles"
```

## 디렉토리 구조

```yaml
structure:
  pattern: "domain-driven"  # domain-driven, feature-based, atomic
  
  # 주요 디렉토리
  directories:
    components: "${srcPath}/components"
    pages: "${srcPath}/pages"       # 또는 views
    hooks: "${srcPath}/hooks"       # React
    composables: "${srcPath}/composables"  # Vue
    services: "${srcPath}/services"
    utils: "${srcPath}/utils"
    types: "${srcPath}/types"
    store: "${srcPath}/store"
    
  # 도메인별 구조 사용시
  domains:
    - user
    - product
    - order
    - payment
```

## 컴포넌트 설정

```yaml
components:
  # 네이밍 규칙
  naming: "PascalCase"  # PascalCase, camelCase, kebab-case
  fileExtension: ".tsx"  # .jsx, .tsx, .vue
  styleExtension: ".module.css"  # .css, .scss, .module.css, .styled.ts
  
  # 컴포넌트 구조
  structure:
    useFolder: true  # 컴포넌트별 폴더 사용
    indexFile: true  # index.ts 사용
    separateStyles: true  # 스타일 파일 분리
    separateTypes: true  # 타입 파일 분리
    
  # 예시 구조
  # Button/
  #   ├── index.ts
  #   ├── Button.tsx
  #   ├── Button.module.css
  #   └── Button.types.ts
```

## 상태 관리 설정

```yaml
stateManagement:
  # Redux/Redux Toolkit
  redux:
    useToolkit: true
    slicesPath: "${srcPath}/store/slices"
    asyncPattern: "createAsyncThunk"  # thunk, saga, observable
    
  # Zustand
  zustand:
    storesPath: "${srcPath}/store"
    
  # Pinia (Vue)
  pinia:
    storesPath: "${srcPath}/stores"
    composition: true  # Composition API 사용
```

## API 설정

```yaml
api:
  baseUrl: "http://localhost:8080/api"
  structure: "domain-based"  # domain-based, centralized
  
  # API 클라이언트
  client: "axios"  # axios, fetch, ky
  
  # API 파일 구조
  organization:
    pattern: "by-domain"  # by-domain, by-method
    location: "${srcPath}/api"  # 또는 services/api
```

## 리팩토링 설정

```yaml
refactoring:
  outputBase: "${baseProjectPath}/refactoring"
  outputPath: "${outputBase}/${domainName}-${todayYYYYMMDD}"
  
  # 리팩토링 전략
  strategy:
    componentSplitting: true  # 큰 컴포넌트 분할
    hookExtraction: true     # 로직을 훅으로 추출
    domainGrouping: true     # 도메인별 그룹화
    
  # 리팩토링 대상
  targets:
    - components
    - hooks
    - services
    - utils
    - types
```

## 코드 스타일

```yaml
codeStyle:
  # 포맷팅
  indentation: "spaces"
  indentSize: 2
  quotes: "single"  # single, double
  semicolons: false  # 세미콜론 사용 여부
  trailingComma: "es5"
  
  # 컴포넌트 스타일
  componentStyle:
    functionComponent: true  # 함수형 컴포넌트 사용
    arrowFunction: true     # 화살표 함수 사용
    defaultExport: true     # default export 사용
```

## 라우팅 설정

```yaml
routing:
  library: "react-router"  # react-router, vue-router, angular-router
  structure: "file-based"  # file-based, config-based
  pagesPath: "${srcPath}/pages"
  
  # 라우트 네이밍
  naming:
    pattern: "kebab-case"  # /user-profile
    dynamic: "[id]"        # [id].tsx, :id
```

## 테스팅 설정

```yaml
testing:
  framework: "jest"  # jest, vitest, mocha
  testLocation: "colocated"  # colocated, separate
  
  # 테스트 파일 네이밍
  naming:
    unit: "*.test.ts"
    integration: "*.spec.ts"
    e2e: "*.e2e.ts"
    
  # 커버리지 목표
  coverage:
    statements: 80
    branches: 70
    functions: 80
    lines: 80
```

## 린팅/포맷팅

```yaml
linting:
  eslint:
    extends:
      - "react-app"  # react-app, airbnb, standard
      - "plugin:@typescript-eslint/recommended"
    
  prettier:
    printWidth: 100
    tabWidth: 2
    singleQuote: true
    jsxSingleQuote: false
```

## 번들링 최적화

```yaml
optimization:
  # 코드 스플리팅
  splitting:
    routes: true      # 라우트별 스플리팅
    vendors: true     # 벤더 분리
    components: true  # 동적 임포트
    
  # 최적화 옵션
  options:
    minify: true
    treeshaking: true
    lazyLoading: true
    prefetching: true
```

## 프로젝트별 특수 설정

```yaml
custom:
  # 특수 설정
  experimentalFeatures:
    - "server-components"
    - "concurrent-mode"
    
  # 제외 패턴
  excludePatterns:
    - "**/*.stories.tsx"
    - "**/*.test.tsx"
    
  # 환경 변수 prefix
  envPrefix: "VITE_"  # VITE_, REACT_APP_, NEXT_PUBLIC_
```