# 🤖 AI 자율 프론트엔드 도메인 리팩토링 실행 가이드

## 🔴 필수 준비 사항

### 프로젝트 설정 파일 읽기
1. **필수 파일 확인**:
   - `../../common/refactoring-framework.md` - 리팩토링 프레임워크
   - `project-config.md` - 프로젝트별 설정 (프로젝트 루트)
2. **설정 확인**: 다음 항목들이 올바르게 설정되었는지 확인
   - 프레임워크 종류 (React/Vue3/Angular)
   - 상태 관리 도구 (Redux/Zustand/Pinia/Vuex)
   - 라우터 설정 (React Router/Vue Router)
   - 번들러 설정 (Webpack/Vite)
   - TypeScript 사용 여부
3. **적용 범위**: 이 설정은 전체 리팩토링 과정에서 지속적으로 적용
4. **확인 출력**: "프로젝트 설정을 읽었으며, 모든 설정을 적용할 준비가 완료되었습니다."

## 📊 프론트엔드 도메인 리팩토링 구조

### 🔰 도메인별 기능 분리 원칙
- **목표**: 비즈니스 도메인별 명확한 기능 분리
- **범위**: Components → Hooks/Composables → Services → State 계층별 순차 진행
- **완료 조건**: UI/UX 100% 보존 + 도메인별 완전 분리
- **결과물**: 도메인 기반 폴더 구조로 재구성된 프론트엔드 코드

### 적용 범위
- **컴포넌트 지정시**: 해당 컴포넌트와 연관된 모든 파일 분석
- **도메인 지정시**: 도메인 전체 컴포넌트와 로직 분석
- **전체 프로젝트**: 모든 도메인을 순차적으로 리팩토링

### 📝 진행 상황 기록 템플릿 (refactoring-status.md)

리팩토링 시작 시 아래 템플릿을 사용하여 refactoring-status.md 파일을 생성합니다:

```markdown
# 프론트엔드 리팩토링 진행 상황

## 프로젝트 정보
- **프레임워크**: [React/Vue3/Angular]
- **타겟 도메인**: [리팩토링할 도메인명 또는 전체]
- **분석 시작 시간**: [YYYY-MM-DD HH:MM]
- **현재 단계**: [현재 진행 중인 단계]

## 전체 진행 상황
- **완료 비율**: 0% (0/9 단계 완료)
- **리팩토링된 컴포넌트 수**: 0개
- **리팩토링된 파일 수**: 0개
- **식별된 도메인**: []

## 체크포인트 현황 (총 9단계)

### 🔰 도메인 기능 분리 리팩토링
- [ ] 01-self-refactoring (진행 중) - AI 자율 리팩토링 가이드 확인
- [ ] 02-structure-analysis (대기) - 프로젝트 구조 분석
- [ ] 03-refactoring-plan (대기) - 리팩토링 계획 수립
- [ ] 04-component-refactoring (대기) - 컴포넌트 계층 리팩토링
- [ ] 05-state-refactoring (대기) - 상태 관리 리팩토링
- [ ] 06-hooks-refactoring (대기) - Hooks/Composables 리팩토링
- [ ] 07-service-refactoring (대기) - 서비스/API 리팩토링
- [ ] 08-verification (대기) - 리팩토링 결과 검증
- [ ] 09-optimization (대기) - 최적화 및 문서화

## 생성된 도메인별 구조

### 도메인 구조 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] domains/user/ (대기) - 사용자 관련 기능
- [ ] domains/product/ (대기) - 상품 관련 기능
- [ ] domains/order/ (대기) - 주문 관련 기능

### 공통 모듈 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] common/components/ (대기) - 공통 컴포넌트
- [ ] common/hooks/ (대기) - 공통 훅
- [ ] common/utils/ (대기) - 유틸리티 함수

## 주요 이슈 및 결정 사항
이 섹션은 리팩토링 중 발생한 주요 이슈나 결정 사항을 기록합니다.

### 해결된 이슈
- 없음

### 미해결 이슈
- 없음

### 주요 결정 사항
- 없음
```

## 🚀 자동 실행 프로세스

### 1. 초기화 단계
- project-config.md 설정 로드
- 프로젝트 구조 파악
- 프레임워크 및 의존성 확인

### 2. 실행 순서
1. **02-structure-analysis.md** - 구조 분석
2. **03-refactoring-plan.md** - 계획 수립
3. **04-component-refactoring.md** - 컴포넌트 리팩토링
4. **05-state-refactoring.md** - 상태 관리 리팩토링
5. **06-hooks-refactoring.md** - Hooks/Composables 리팩토링
6. **07-service-refactoring.md** - 서비스/API 리팩토링
7. **08-verification.md** - 검증
8. **09-optimization.md** - 최적화 및 문서화

### 3. 완료 조건
- 모든 단계 성공적으로 완료
- UI/UX 100% 보존 확인
- 빌드 에러 없음
- 런타임 에러 없음
- 도메인별 명확한 분리 달성

## 📁 결과물 구조

### React 프로젝트 구조
```
{resultPath}/
├── domains/
│   ├── {domainName1}/
│   │   ├── components/
│   │   │   ├── {ComponentName}.tsx
│   │   │   └── {ComponentName}.module.css
│   │   ├── hooks/
│   │   │   └── use{DomainFeature}.ts
│   │   ├── services/
│   │   │   └── {domainName}Api.ts
│   │   ├── store/
│   │   │   └── {domainName}Slice.ts
│   │   └── types/
│   │       └── {domainName}.types.ts
│   └── {domainName2}/
│       └── ...
├── common/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── routes/
    └── {domainName}Routes.tsx
```

### Vue3 프로젝트 구조
```
{resultPath}/
├── domains/
│   ├── {domainName1}/
│   │   ├── components/
│   │   │   └── {ComponentName}.vue
│   │   ├── composables/
│   │   │   └── use{DomainFeature}.ts
│   │   ├── services/
│   │   │   └── {domainName}Api.ts
│   │   ├── stores/
│   │   │   └── {domainName}Store.ts
│   │   └── types/
│   │       └── {domainName}.types.ts
│   └── {domainName2}/
│       └── ...
├── common/
│   ├── components/
│   ├── composables/
│   ├── utils/
│   └── types/
└── router/
    └── {domainName}Routes.ts
```

## 🔥 중요 원칙

### UI/UX 보존 원칙
1. **화면 동작 100% 보존**: 모든 사용자 인터랙션 유지
2. **라우팅 불변**: URL 구조와 네비게이션 유지
3. **스타일 유지**: 모든 디자인과 레이아웃 보존
4. **상태 동작 유지**: 상태 관리 로직 완전 보존

### 도메인 분리 원칙
1. **단일 책임**: 하나의 도메인 = 하나의 비즈니스 기능
2. **의존성 최소화**: 도메인 간 결합도 최소화
3. **재사용성**: 공통 요소는 common으로 분리
4. **명확한 경계**: 각 도메인의 역할과 책임 명확화

### 자동 실행 원칙
1. **무중단 진행**: 사용자 개입 없이 자동 진행
2. **에러 시 중단**: 치명적 오류 시에만 중단
3. **진행 상황 기록**: 각 단계별 상태 자동 업데이트

## 🎯 시작하기

이 가이드가 제공되면 AI는 자동으로 다음을 수행합니다:
1. project-config.md 읽기 및 설정 적용
2. 프로젝트 구조 분석 (02-structure-analysis.md)
3. 순차적으로 모든 단계 실행
4. 최종 결과 검증 및 보고서 생성

**준비가 완료되면 타겟 도메인명 또는 "전체"를 제공해주세요.**