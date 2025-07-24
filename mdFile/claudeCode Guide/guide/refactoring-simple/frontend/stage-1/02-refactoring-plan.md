# 📋 프론트엔드 리팩토링 계획 수립 가이드

## 1. 분석 결과 기반 계획 수립

### 1.1 도메인별 우선순위 결정
```typescript
interface DomainPriority {
  domain: string;
  priority: number;
  reason: string;
  dependencies: string[];
  estimatedHours: number;
}

// 우선순위 결정 기준
1. 의존성이 적은 도메인부터
2. 비즈니스 중요도가 높은 도메인
3. 컴포넌트 수가 적은 도메인 (빠른 성과)
4. 기술 부채가 많은 도메인
```

### 1.2 리팩토링 전략 선택
- **Big Bang**: 전체 한 번에 (권장하지 않음)
- **Incremental**: 도메인별 순차적 (권장)
- **Parallel**: 독립적 도메인 동시 진행
- **Hybrid**: 핵심 도메인 우선, 나머지 병렬

## 2. 도메인별 상세 계획

### 2.1 User 도메인 리팩토링 계획
```yaml
domain: user
components:
  move:
    - from: src/components/UserProfile.tsx
      to: domains/user/components/UserProfile.tsx
    - from: src/components/LoginForm.tsx
      to: domains/user/components/LoginForm.tsx
hooks:
  create:
    - name: useAuth
      path: domains/user/hooks/useAuth.ts
    - name: useUser
      path: domains/user/hooks/useUser.ts
services:
  move:
    - from: src/api/userApi.ts
      to: domains/user/services/userApi.ts
state:
  move:
    - from: src/store/userSlice.ts
      to: domains/user/store/userSlice.ts
```

### 2.2 Product 도메인 리팩토링 계획
```yaml
domain: product
components:
  move:
    - from: src/pages/ProductList.tsx
      to: domains/product/components/ProductList.tsx
    - from: src/components/ProductCard.tsx
      to: domains/product/components/ProductCard.tsx
hooks:
  create:
    - name: useProducts
      path: domains/product/hooks/useProducts.ts
    - name: useProductSearch
      path: domains/product/hooks/useProductSearch.ts
```

## 3. 공통 모듈 분리 계획

### 3.1 공통 컴포넌트 식별
```typescript
// 2개 이상 도메인에서 사용하는 컴포넌트
const commonComponents = [
  "Button",
  "Modal",
  "Table",
  "Form",
  "Loading",
  "ErrorBoundary"
];

// 이동 계획
commonComponents.forEach(comp => {
  move({
    from: `src/components/${comp}`,
    to: `common/components/${comp}`
  });
});
```

### 3.2 공통 유틸리티 분리
```typescript
const commonUtils = [
  "formatDate",
  "formatCurrency", 
  "validation",
  "storage",
  "api-client"
];
```

## 4. 의존성 업데이트 계획

### 4.1 Import 경로 매핑
```typescript
// 기존 import
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

// 새로운 import
import { UserProfile } from '@/domains/user/components/UserProfile';
import { useAuth } from '@/domains/user/hooks/useAuth';
```

### 4.2 Path Alias 설정
```json
// tsconfig.json / jsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/domains/*": ["src/domains/*"],
      "@/common/*": ["src/common/*"],
      "@/store": ["src/store"],
      "@/types": ["src/types"]
    }
  }
}
```

## 5. 상태 관리 마이그레이션 계획

### 5.1 Redux/Redux Toolkit
```typescript
// 기존 구조
store/
├── index.ts
├── userSlice.ts
├── productSlice.ts
└── orderSlice.ts

// 새로운 구조
domains/
├── user/
│   └── store/
│       └── userSlice.ts
├── product/
│   └── store/
│       └── productSlice.ts
└── order/
    └── store/
        └── orderSlice.ts

// Root store 업데이트
import { userSlice } from '@/domains/user/store/userSlice';
import { productSlice } from '@/domains/product/store/productSlice';
```

### 5.2 Pinia (Vue3)
```typescript
// 기존 구조
stores/
├── user.ts
├── product.ts
└── cart.ts

// 새로운 구조
domains/
├── user/
│   └── stores/
│       └── userStore.ts
├── product/
│   └── stores/
│       └── productStore.ts
```

## 6. 라우팅 재구성 계획

### 6.1 React Router 재구성
```typescript
// 도메인별 라우트 파일
domains/
├── user/
│   └── routes/
│       └── userRoutes.tsx
├── product/
│   └── routes/
│       └── productRoutes.tsx

// 메인 라우터
import { userRoutes } from '@/domains/user/routes/userRoutes';
import { productRoutes } from '@/domains/product/routes/productRoutes';

const routes = [
  ...userRoutes,
  ...productRoutes,
  ...orderRoutes
];
```

### 6.2 Vue Router 재구성
```typescript
// 도메인별 라우트
export const userRoutes = [
  {
    path: '/user',
    component: () => import('@/domains/user/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        component: () => import('@/domains/user/views/UserProfile.vue')
      }
    ]
  }
];
```

## 7. 스타일 마이그레이션 계획

### 7.1 CSS Modules
```typescript
// 컴포넌트와 함께 이동
domains/user/components/
├── UserProfile.tsx
└── UserProfile.module.css
```

### 7.2 Styled Components / Emotion
```typescript
// 도메인별 스타일 파일
domains/user/styles/
├── components.ts
├── theme.ts
└── utils.ts
```

## 8. 테스트 마이그레이션 계획

### 8.1 단위 테스트
```typescript
// 컴포넌트와 함께 이동
domains/user/components/
├── UserProfile.tsx
├── UserProfile.test.tsx
└── UserProfile.stories.tsx
```

### 8.2 통합 테스트
```typescript
domains/user/
└── __tests__/
    ├── integration/
    │   └── userFlow.test.tsx
    └── e2e/
        └── userJourney.e2e.ts
```

## 9. 실행 일정 계획

### 9.1 단계별 일정
| 단계 | 작업 내용 | 예상 시간 | 체크포인트 |
|------|----------|-----------|------------|
| 1 | 프로젝트 설정 및 폴더 구조 생성 | 1시간 | CP-P001 |
| 2 | User 도메인 컴포넌트 이동 | 3시간 | CP-P002 |
| 3 | User 도메인 상태 관리 이동 | 2시간 | CP-P003 |
| 4 | User 도메인 서비스 이동 | 2시간 | CP-P004 |
| 5 | Product 도메인 리팩토링 | 4시간 | CP-P005 |
| 6 | Order 도메인 리팩토링 | 3시간 | CP-P006 |
| 7 | 공통 모듈 정리 | 2시간 | CP-P007 |
| 8 | 라우팅 재구성 | 1시간 | CP-P008 |
| 9 | 최종 검증 및 최적화 | 2시간 | CP-P009 |

### 9.2 위험 요소 및 대응
```yaml
risks:
  - name: "순환 의존성"
    mitigation: "의존성 그래프 분석 후 분리"
  - name: "런타임 에러"
    mitigation: "단계별 테스트 및 롤백 준비"
  - name: "빌드 실패"
    mitigation: "설정 파일 백업 및 점진적 적용"
```

## 10. 생성할 문서 및 산출물

### 10.1 refactoring-plan-final.json
```json
{
  "executionPlan": {
    "strategy": "incremental",
    "totalDomains": 6,
    "estimatedHours": 20,
    "phases": [
      {
        "phase": 1,
        "domain": "user",
        "tasks": ["components", "hooks", "services", "state"],
        "hours": 5
      }
    ]
  },
  "fileMovements": {
    "total": 145,
    "byDomain": {
      "user": 24,
      "product": 31,
      "order": 18
    }
  },
  "dependencies": {
    "updates": 312,
    "newAliases": 15
  }
}
```

### 10.2 migration-checklist.md
```markdown
## 마이그레이션 체크리스트

### Pre-migration
- [ ] 프로젝트 백업
- [ ] 브랜치 생성
- [ ] 의존성 분석 완료

### During migration
- [ ] User 도메인 완료
- [ ] Product 도메인 완료
- [ ] Order 도메인 완료
- [ ] 공통 모듈 완료

### Post-migration
- [ ] 빌드 성공
- [ ] 테스트 통과
- [ ] 린트 통과
```

## 11. 다음 단계
- 계획 검토 및 승인
- 03-component-refactoring.md로 이동하여 실행 시작
- 각 단계별 진행 상황 실시간 업데이트