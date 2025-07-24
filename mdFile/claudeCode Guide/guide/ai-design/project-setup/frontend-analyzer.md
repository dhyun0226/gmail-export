# Frontend 기존 프로젝트 분석 가이드

기존 Frontend 프로젝트의 기술 스택과 구조를 분석하여 front-config.md 파일을 생성합니다.

## 분석 대상 파일
1. `package.json` - 프레임워크 및 의존성 분석
2. `tsconfig.json` - TypeScript 설정 확인
3. `vite.config.js/ts` - 빌드 도구 확인 (기본 빌드 도구)
4. `.eslintrc.*` - 코드 스타일 확인
5. `src/` 폴더 구조 분석

**주의**: 프로젝트 기본 설정은 Vue 3.5 + Vite입니다.

## 프레임워크 감지
### package.json에서 Vue 3.x 확인:
```javascript
// Vue 프로젝트 (기본 지원)
"vue": "^3.5.x" → Vue 3.5 (권장)
"vue": "^3.x.x" → Vue 3.x (지원)

// 지원하지 않는 프레임워크
"vue": "^2.x.x" → Vue 2.x (지원 안함 - Vue 3.5로 업그레이드 필요)
```

## UI 라이브러리 감지
```javascript
// Bootstrap
"bootstrap": "^5.x.x" → Bootstrap 5.x

// Element Plus (Vue용)
"element-plus": "^2.x.x" → Element Plus

// Ant Design Vue
"ant-design-vue": "^4.x.x" → Ant Design Vue
```

## 빌드 도구 감지
```javascript
// Vite (기본 빌드 도구)
"vite": "^5.x.x" → Vite 5.x (권장)
"vite": "^4.x.x" → Vite 4.x (지원)

// 지원하지 않는 빌드 도구
"webpack": "^5.x.x" → Webpack (지원 안함 - Vite로 변경 필요)
```

## 상태 관리 라이브러리 감지
```javascript
// Vue 상태 관리 (기본 지원)
"pinia": "^2.x.x" → Pinia (권장)
"vuex": "^4.x.x" → Vuex (지원)
```

## 프로젝트 구조 분석
### Vue 3.5 표준 폴더 구조 확인:
```
src/
├── components/     # Vue 컴포넌트
├── views/         # 페이지 컴포넌트 (Vue 전용)
├── stores/        # Pinia 스토어
├── api/           # API 클라이언트
├── types/         # TypeScript 타입
├── utils/         # 유틸리티
├── assets/        # 정적 자산
└── styles/        # 스타일
```

## front-config.md 생성
분석된 정보를 바탕으로 다음 형식으로 생성:

```markdown
# Frontend Configuration

## 기술 스택(Technology Stack)
- **Framework**: [감지된 프레임워크] [버전]
- **UI Library**: [감지된 UI 라이브러리] [버전]
- **State Management**: [감지된 상태 관리] [버전]
- **Build Tool**: [감지된 빌드 도구] [버전]
- **Language**: TypeScript/JavaScript

## 프로젝트 구조(Project Structure)
[실제 프로젝트 구조 표시]

## 코딩 컨벤션(Coding Conventions)
- 컴포넌트명: PascalCase
- 파일명: kebab-case
- 변수/함수명: camelCase

## 개발 명령어(Development Commands)
[package.json scripts 기반]

## 주요 의존성(Main Dependencies)
[package.json dependencies 목록]
```

## 기본값 설정
분석되지 않는 항목은 다음 기본값 사용:
- Language: TypeScript
- 컴포넌트명: PascalCase
- 파일명: kebab-case
- 변수/함수명: camelCase