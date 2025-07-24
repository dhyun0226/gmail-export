# 🎨 프론트엔드 리팩토링 가이드

## 개요
프론트엔드 프로젝트를 위한 도메인 기반 리팩토링 가이드입니다.

## 지원 프레임워크
- React (JavaScript/TypeScript)
- Vue 2/3
- Angular
- Next.js
- Nuxt.js

## 리팩토링 전략

### 1. 컴포넌트 도메인 분리
기존의 평면적 구조를 도메인별로 그룹화합니다.

#### Before (평면 구조)
```
src/
├── components/
│   ├── UserList.jsx
│   ├── UserDetail.jsx
│   ├── ProductList.jsx
│   ├── ProductCard.jsx
│   ├── OrderForm.jsx
│   └── OrderHistory.jsx
└── services/
    ├── userService.js
    ├── productService.js
    └── orderService.js
```

#### After (도메인 구조)
```
src/
├── domains/
│   ├── user/
│   │   ├── components/
│   │   │   ├── UserList.jsx
│   │   │   └── UserDetail.jsx
│   │   ├── services/
│   │   │   └── userService.js
│   │   ├── hooks/
│   │   │   └── useUser.js
│   │   └── types/
│   │       └── user.types.ts
│   ├── product/
│   │   ├── components/
│   │   │   ├── ProductList.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── services/
│   │   │   └── productService.js
│   │   └── hooks/
│   │       └── useProduct.js
│   └── order/
│       ├── components/
│       │   ├── OrderForm.jsx
│       │   └── OrderHistory.jsx
│       ├── services/
│       │   └── orderService.js
│       └── hooks/
│           └── useOrder.js
```

### 2. Feature 기반 모듈화
각 기능을 독립적인 모듈로 구성합니다.

```
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   └── index.ts
│   └── shopping-cart/
│       ├── components/
│       │   ├── CartItem.tsx
│       │   └── CartSummary.tsx
│       ├── api/
│       │   └── cart.api.ts
│       ├── hooks/
│       │   └── useCart.ts
│       └── store/
│           └── cartSlice.ts
```

## React 특화 리팩토링

### 1. 컴포넌트 분해
```typescript
// Before: 모놀리식 컴포넌트
const UserDashboard = () => {
  // 200줄의 복잡한 로직...
};

// After: 분리된 컴포넌트
const UserDashboard = () => {
  return (
    <DashboardLayout>
      <UserProfile />
      <UserStats />
      <UserActivity />
    </DashboardLayout>
  );
};
```

### 2. Custom Hook 추출
```typescript
// Before: 컴포넌트 내부 로직
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 데이터 로딩 로직
  }, []);
  
  // 렌더링...
};

// After: Custom Hook으로 분리
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 데이터 로딩 로직
  }, []);
  
  return { users, loading };
};

const UserList = () => {
  const { users, loading } = useUsers();
  // 렌더링만 담당
};
```

## Vue 특화 리팩토링

### 1. Composition API 마이그레이션
```vue
<!-- Before: Options API -->
<script>
export default {
  data() {
    return { users: [] }
  },
  methods: {
    fetchUsers() { /* ... */ }
  }
}
</script>

<!-- After: Composition API -->
<script setup>
import { useUsers } from '@/domains/user/composables/useUsers'

const { users, fetchUsers } = useUsers()
</script>
```

### 2. 컴포저블 분리
```typescript
// domains/user/composables/useUsers.ts
export const useUsers = () => {
  const users = ref([])
  const loading = ref(false)
  
  const fetchUsers = async () => {
    loading.value = true
    users.value = await userApi.getUsers()
    loading.value = false
  }
  
  return { users, loading, fetchUsers }
}
```

## 상태 관리 리팩토링

### Redux → Redux Toolkit
```typescript
// Before: 전통적인 Redux
const ADD_USER = 'ADD_USER';
const userReducer = (state = [], action) => {
  switch(action.type) {
    case ADD_USER:
      return [...state, action.payload];
  }
};

// After: Redux Toolkit
const userSlice = createSlice({
  name: 'user',
  initialState: [],
  reducers: {
    addUser: (state, action) => {
      state.push(action.payload);
    }
  }
});
```

### Vuex → Pinia
```typescript
// Before: Vuex
const userModule = {
  state: { users: [] },
  mutations: {
    SET_USERS(state, users) {
      state.users = users;
    }
  }
};

// After: Pinia
export const useUserStore = defineStore('user', {
  state: () => ({ users: [] }),
  actions: {
    setUsers(users) {
      this.users = users;
    }
  }
});
```

## 파일 구조 마이그레이션 자동화

### 1. 분석 단계
```bash
# 컴포넌트 의존성 분석
- import 문 파싱
- props 흐름 추적
- 상태 공유 패턴 식별
```

### 2. 그룹화 단계
```bash
# 도메인별 자동 그룹화
- 파일명 패턴 분석 (UserList, UserDetail → user 도메인)
- import 관계 분석
- API 엔드포인트 분석
```

### 3. 이동 단계
```bash
# 안전한 파일 이동
- 파일 이동
- import 경로 자동 업데이트
- 상대 경로 → 절대 경로 변환
```

## 리팩토링 체크리스트

### 구조적 개선
- [ ] 평면 구조 → 도메인/Feature 구조
- [ ] 컴포넌트 분해 (100줄 이하)
- [ ] 비즈니스 로직 분리 (hooks/composables)
- [ ] 타입 정의 분리

### 코드 품질
- [ ] 중복 코드 제거
- [ ] 일관된 네이밍 컨벤션
- [ ] 적절한 추상화 수준
- [ ] 테스트 가능한 구조

### 성능 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] 코드 스플리팅 적용
- [ ] Lazy Loading 구현
- [ ] 번들 크기 최적화

## 프론트엔드 project-config.md 예시

```yaml
project:
  name: "e-commerce-frontend"
  type: "frontend"
  framework: "react"
  language: "typescript"
  
structure:
  pattern: "domain-driven"  # or "feature-based"
  domains:
    - user
    - product
    - order
    - payment
    
refactoring:
  targets:
    - components
    - hooks
    - services
    - types
    - utils
    
  rules:
    maxComponentLines: 150
    preferComposition: true
    enforceTypeScript: true
    
paths:
  src: "src"
  domains: "src/domains"
  shared: "src/shared"
  assets: "src/assets"
```

이렇게 프론트엔드 프로젝트도 백엔드와 동일한 도메인 기반 구조로 리팩토링할 수 있습니다!