# ✅ 프론트엔드 리팩토링 검증 가이드

## 1. 빌드 검증

### 1.1 TypeScript 컴파일 확인
```bash
# TypeScript 컴파일 체크
tsc --noEmit

# 예상 결과: 에러 없음
# 에러 발생 시 타입 정의 및 import 경로 확인
```

### 1.2 개발 서버 실행
```bash
# React
npm run dev
# 또는
yarn dev

# Vue3
npm run serve
# 또는
vite

# 정상 실행 확인
# - 포트 번호 확인 (보통 3000, 5173 등)
# - 콘솔 에러 없음
```

### 1.3 프로덕션 빌드
```bash
# 빌드 실행
npm run build

# 빌드 결과 확인
# - dist/ 또는 build/ 폴더 생성
# - 빌드 에러 없음
# - 번들 사이즈 확인
```

## 2. 기능 검증

### 2.1 라우팅 검증
```typescript
// 라우팅 테스트 체크리스트
const routingChecklist = [
  { path: '/', expected: 'HomePage', status: '✅' },
  { path: '/login', expected: 'LoginPage', status: '✅' },
  { path: '/user/profile', expected: 'UserProfile', status: '✅' },
  { path: '/products', expected: 'ProductList', status: '✅' },
  { path: '/products/:id', expected: 'ProductDetail', status: '✅' },
  { path: '/cart', expected: 'CartPage', status: '❌' },
  { path: '/404', expected: 'NotFoundPage', status: '✅' }
];

// 각 라우트 접근 및 렌더링 확인
routingChecklist.forEach(route => {
  console.log(`${route.path}: ${route.status}`);
});
```

### 2.2 상태 관리 검증
```typescript
// Redux DevTools 확인
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('✅ Redux DevTools 연결됨');
  // State 구조 확인
  // Action dispatch 확인
  // State 변경 확인
}

// Vue DevTools 확인
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ Vue DevTools 연결됨');
  // Component 트리 확인
  // Pinia store 확인
}
```

### 2.3 API 통신 검증
```typescript
// Network 탭에서 확인할 사항
const apiChecklist = {
  auth: {
    login: { method: 'POST', endpoint: '/api/auth/login', status: 200 },
    logout: { method: 'POST', endpoint: '/api/auth/logout', status: 200 },
    refresh: { method: 'POST', endpoint: '/api/auth/refresh', status: 200 }
  },
  user: {
    getProfile: { method: 'GET', endpoint: '/api/users/:id', status: 200 },
    updateProfile: { method: 'PUT', endpoint: '/api/users/:id', status: 200 }
  },
  product: {
    getList: { method: 'GET', endpoint: '/api/products', status: 200 },
    getDetail: { method: 'GET', endpoint: '/api/products/:id', status: 200 }
  }
};
```

## 3. UI/UX 검증

### 3.1 컴포넌트 렌더링 확인
```typescript
// 컴포넌트 체크리스트
interface ComponentCheck {
  name: string;
  domain: string;
  renders: boolean;
  interactive: boolean;
  styles: boolean;
  responsive: boolean;
}

const componentChecklist: ComponentCheck[] = [
  {
    name: 'UserProfile',
    domain: 'user',
    renders: true,
    interactive: true,
    styles: true,
    responsive: true
  },
  // ... 더 많은 컴포넌트
];

// 자동 검증 스크립트
componentChecklist.forEach(comp => {
  const allPassed = comp.renders && comp.interactive && 
                    comp.styles && comp.responsive;
  console.log(`${comp.name}: ${allPassed ? '✅' : '❌'}`);
});
```

### 3.2 스타일 검증
```typescript
// CSS 로드 확인
const styleSheets = Array.from(document.styleSheets);
console.log(`로드된 스타일시트: ${styleSheets.length}개`);

// CSS Modules 확인
const cssModulesLoaded = document.querySelector('[class*="_"]');
console.log(`CSS Modules: ${cssModulesLoaded ? '✅' : '❌'}`);

// Tailwind 확인 (사용하는 경우)
const tailwindLoaded = document.querySelector('[class*="flex"]');
console.log(`Tailwind CSS: ${tailwindLoaded ? '✅' : '❌'}`);
```

### 3.3 반응형 디자인 검증
```javascript
// 반응형 브레이크포인트 테스트
const breakpoints = [
  { name: 'Mobile', width: 375 },
  { name: 'Tablet', width: 768 },
  { name: 'Desktop', width: 1024 },
  { name: 'Wide', width: 1440 }
];

breakpoints.forEach(bp => {
  window.resizeTo(bp.width, 800);
  console.log(`${bp.name} (${bp.width}px): 레이아웃 확인`);
});
```

## 4. 성능 검증

### 4.1 번들 사이즈 분석
```bash
# 번들 분석 도구 실행
npm run analyze
# 또는
npx webpack-bundle-analyzer stats.json

# 확인 사항:
# - 총 번들 사이즈
# - 청크별 사이즈
# - 중복 패키지
# - Tree shaking 효과
```

### 4.2 Lighthouse 성능 측정
```typescript
// Lighthouse 메트릭스 목표
const performanceTargets = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 90,
  pwa: 80
};

// Chrome DevTools > Lighthouse 실행
// 결과 기록 및 개선사항 도출
```

### 4.3 초기 로딩 시간 측정
```typescript
// Performance API 활용
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('페이지 로드 시간:', {
    DNS: perfData.domainLookupEnd - perfData.domainLookupStart,
    TCP: perfData.connectEnd - perfData.connectStart,
    Request: perfData.responseStart - perfData.requestStart,
    Response: perfData.responseEnd - perfData.responseStart,
    DOM: perfData.domComplete - perfData.domLoading,
    Total: perfData.loadEventEnd - perfData.fetchStart
  });
});
```

## 5. 코드 품질 검증

### 5.1 ESLint 검사
```bash
# ESLint 실행
npm run lint
# 또는
eslint . --ext .ts,.tsx,.js,.jsx,.vue

# 자동 수정
npm run lint:fix

# 예상 결과: 0 errors, 0 warnings
```

### 5.2 Prettier 포맷팅
```bash
# Prettier 검사
npx prettier --check .

# 자동 포맷팅
npx prettier --write .
```

### 5.3 타입 커버리지
```bash
# TypeScript 타입 커버리지 확인
npx type-coverage

# 목표: 90% 이상
# any 타입 사용 최소화
```

## 6. 테스트 실행

### 6.1 단위 테스트
```bash
# Jest 실행
npm test

# 커버리지 포함
npm test -- --coverage

# 감시 모드
npm test -- --watch
```

### 6.2 컴포넌트 테스트
```typescript
// React Testing Library 예시
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/domains/user/components/UserProfile';

test('UserProfile renders correctly', () => {
  const user = { id: '1', name: 'Test User', email: 'test@example.com' };
  render(<UserProfile user={user} />);
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
});
```

### 6.3 E2E 테스트
```typescript
// Cypress 예시
describe('User Flow', () => {
  it('should complete login flow', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });
});
```

## 7. 보안 검증

### 7.1 의존성 취약점 검사
```bash
# npm audit
npm audit

# 자동 수정
npm audit fix

# Yarn
yarn audit
```

### 7.2 환경 변수 확인
```typescript
// 환경 변수 노출 확인
const envCheck = {
  apiUrl: import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL,
  publicKey: import.meta.env.VITE_PUBLIC_KEY,
  // 비밀 키는 절대 포함하지 않음
  secretKey: import.meta.env.VITE_SECRET_KEY // ❌ 이런 것은 없어야 함
};

console.log('환경 변수 체크:', envCheck);
```

## 8. 접근성 검증

### 8.1 키보드 네비게이션
```typescript
// 키보드 접근성 체크리스트
const a11yChecklist = [
  'Tab 키로 모든 인터랙티브 요소 접근 가능',
  'Enter/Space 키로 버튼 동작',
  'Escape 키로 모달/팝업 닫기',
  'Arrow 키로 메뉴 네비게이션',
  'Focus 표시가 명확함'
];
```

### 8.2 스크린 리더 호환성
```html
<!-- ARIA 레이블 확인 -->
<button aria-label="사용자 프로필 열기">
  <UserIcon />
</button>

<!-- 시맨틱 HTML 사용 -->
<nav aria-label="주 메뉴">
  <ul>
    <li><a href="/home">홈</a></li>
  </ul>
</nav>
```

## 9. 검증 결과 문서화

### 9.1 verification-report.json
```json
{
  "timestamp": "2024-01-15T10:00:00Z",
  "summary": {
    "totalChecks": 50,
    "passed": 48,
    "failed": 2,
    "warnings": 5
  },
  "details": {
    "build": {
      "typescript": "✅ Pass",
      "development": "✅ Pass",
      "production": "✅ Pass"
    },
    "functionality": {
      "routing": "✅ Pass",
      "stateManagement": "✅ Pass",
      "apiCommunication": "⚠️ Warning - 일부 엔드포인트 느림"
    },
    "performance": {
      "bundleSize": "✅ 2.1MB (목표: < 3MB)",
      "lighthouse": {
        "performance": 92,
        "accessibility": 98,
        "bestPractices": 95,
        "seo": 88
      }
    },
    "codeQuality": {
      "eslint": "✅ 0 errors, 3 warnings",
      "prettier": "✅ Formatted",
      "typesCoverage": "✅ 94%"
    },
    "testing": {
      "unit": "✅ 156/156 passed",
      "integration": "✅ 23/23 passed",
      "e2e": "❌ 2/15 failed"
    }
  },
  "issues": [
    {
      "severity": "high",
      "category": "e2e",
      "description": "로그인 플로우 E2E 테스트 실패",
      "action": "API 응답 시간 개선 필요"
    },
    {
      "severity": "medium",
      "category": "performance",
      "description": "일부 API 호출 지연",
      "action": "API 캐싱 전략 검토"
    }
  ]
}
```

### 9.2 체크리스트 최종 확인
```markdown
## 리팩토링 완료 체크리스트

### 구조적 변경
- [x] 도메인별 폴더 구조 완성
- [x] 컴포넌트 이동 완료
- [x] 상태 관리 분리 완료
- [x] 서비스 레이어 구성 완료
- [x] 공통 모듈 추출 완료

### 기능 검증
- [x] 모든 페이지 정상 렌더링
- [x] 사용자 인터랙션 정상 동작
- [x] API 통신 정상
- [x] 상태 관리 정상
- [ ] 실시간 기능 검증 (WebSocket)

### 품질 보증
- [x] TypeScript 에러 없음
- [x] ESLint 통과
- [x] 테스트 커버리지 80% 이상
- [x] 번들 사이즈 최적화
- [x] 성능 목표 달성
```

## 10. 다음 단계

### 10.1 이슈 해결
- 실패한 E2E 테스트 수정
- API 성능 개선
- 경고 메시지 해결

### 10.2 최적화 진행
- 08-optimization.md로 이동
- 추가 성능 개선
- 코드 스플리팅 적용
- 이미지 최적화