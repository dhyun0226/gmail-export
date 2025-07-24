# 🔄 상태 관리 리팩토링 가이드

## 1. 상태 관리 현황 분석

### 1.1 Redux/Redux Toolkit 분석
```typescript
// 현재 상태 구조 파악
interface CurrentReduxStructure {
  store: {
    path: string;
    slices: Array<{
      name: string;
      domain: string;
      actions: string[];
      selectors: string[];
    }>;
  };
  middleware: string[];
  devTools: boolean;
}

// Slice 분석
const analyzeSlice = (slicePath: string) => {
  // Actions 추출
  // Reducers 추출
  // Selectors 추출
  // Thunks/AsyncThunks 추출
};
```

### 1.2 Zustand 분석
```typescript
// Zustand Store 구조
interface ZustandStore {
  name: string;
  path: string;
  domain: string;
  state: Record<string, any>;
  actions: string[];
  selectors: string[];
  persist: boolean;
}
```

### 1.3 Pinia (Vue3) 분석
```typescript
// Pinia Store 분석
interface PiniaStore {
  id: string;
  path: string;
  domain: string;
  state: () => Record<string, any>;
  getters: Record<string, any>;
  actions: Record<string, Function>;
}
```

## 2. 도메인별 상태 분리 전략

### 2.1 상태 분류
```typescript
// 상태 타입별 분류
enum StateType {
  DOMAIN = 'domain',      // 특정 도메인 전용
  SHARED = 'shared',      // 여러 도메인 공유
  GLOBAL = 'global',      // 전역 상태 (auth, theme)
  UI = 'ui'              // UI 상태 (modal, loading)
}

// 상태 매핑
const stateMapping = {
  user: StateType.DOMAIN,
  auth: StateType.GLOBAL,
  products: StateType.DOMAIN,
  cart: StateType.SHARED,
  theme: StateType.GLOBAL,
  modal: StateType.UI
};
```

### 2.2 분리 원칙
1. **도메인 상태**: 해당 도메인 폴더로 이동
2. **공유 상태**: common/store로 이동
3. **전역 상태**: store/global로 유지
4. **UI 상태**: common/store/ui로 이동

## 3. Redux/Redux Toolkit 리팩토링

### 3.1 User 도메인 Slice 이동
```typescript
// 기존: src/store/userSlice.ts
// 신규: domains/user/store/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserState } from '../types/models';

const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  }
});

// Actions export
export const { setCurrentUser, clearCurrentUser } = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => 
  state.user.currentUser;
export const selectUserLoading = (state: RootState) => 
  state.user.loading;
```

### 3.2 AsyncThunks 마이그레이션
```typescript
// domains/user/store/userThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../services/userApi';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await userApi.getUser(userId);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: Partial<User>) => {
    const response = await userApi.updateUser(userData);
    return response.data;
  }
);
```

### 3.3 Root Store 재구성
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';

// 도메인별 Slice import
import { userSlice } from '@/domains/user/store/userSlice';
import { productSlice } from '@/domains/product/store/productSlice';
import { orderSlice } from '@/domains/order/store/orderSlice';

// 전역 Slice
import { authSlice } from './global/authSlice';
import { uiSlice } from './ui/uiSlice';

export const store = configureStore({
  reducer: {
    // 도메인 상태
    user: userSlice.reducer,
    product: productSlice.reducer,
    order: orderSlice.reducer,
    
    // 전역 상태
    auth: authSlice.reducer,
    ui: uiSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 4. Zustand 리팩토링

### 4.1 도메인별 Store 분리
```typescript
// domains/user/store/userStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '../types/models';

interface UserStore {
  // State
  currentUser: User | null;
  users: User[];
  loading: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentUser: null,
        users: [],
        loading: false,
        
        // Actions
        setCurrentUser: (user) => set({ currentUser: user }),
        clearCurrentUser: () => set({ currentUser: null }),
        fetchUsers: async () => {
          set({ loading: true });
          try {
            const users = await userApi.getUsers();
            set({ users, loading: false });
          } catch (error) {
            set({ loading: false });
          }
        }
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ currentUser: state.currentUser })
      }
    )
  )
);
```

### 4.2 Store Selectors
```typescript
// domains/user/store/userSelectors.ts
import { useUserStore } from './userStore';

// Selector hooks
export const useCurrentUser = () => 
  useUserStore(state => state.currentUser);

export const useUsers = () => 
  useUserStore(state => state.users);

export const useUserById = (id: string) => 
  useUserStore(state => 
    state.users.find(user => user.id === id)
  );
```

## 5. Pinia (Vue3) 리팩토링

### 5.1 도메인 Store 생성
```typescript
// domains/user/stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types/models';
import { userApi } from '../services/userApi';

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null);
  const users = ref<User[]>([]);
  const loading = ref(false);
  
  // Getters
  const isAuthenticated = computed(() => 
    currentUser.value !== null
  );
  
  const userById = computed(() => (id: string) =>
    users.value.find(user => user.id === id)
  );
  
  // Actions
  async function fetchCurrentUser() {
    loading.value = true;
    try {
      const user = await userApi.getCurrentUser();
      currentUser.value = user;
    } finally {
      loading.value = false;
    }
  }
  
  function logout() {
    currentUser.value = null;
    users.value = [];
  }
  
  return {
    // State
    currentUser,
    users,
    loading,
    
    // Getters
    isAuthenticated,
    userById,
    
    // Actions
    fetchCurrentUser,
    logout
  };
});
```

### 5.2 Composable에서 Store 사용
```typescript
// domains/user/composables/useAuth.ts
import { useUserStore } from '../stores/userStore';
import { storeToRefs } from 'pinia';

export function useAuth() {
  const userStore = useUserStore();
  const { currentUser, isAuthenticated, loading } = 
    storeToRefs(userStore);
  
  return {
    user: currentUser,
    isAuthenticated,
    loading,
    login: userStore.fetchCurrentUser,
    logout: userStore.logout
  };
}
```

## 6. 공통 상태 관리

### 6.1 UI Store (공통)
```typescript
// common/store/ui/uiStore.ts
interface UIState {
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
  sidebarOpen: boolean;
}

// Redux Toolkit 버전
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    modals: {},
    toasts: [],
    sidebarOpen: true
  },
  reducers: {
    openModal: (state, action) => {
      state.modals[action.payload.name] = {
        isOpen: true,
        data: action.payload.data
      };
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = { isOpen: false };
    }
  }
});
```

### 6.2 Cart Store (공유 상태)
```typescript
// common/store/cart/cartStore.ts
// Product와 Order 도메인에서 공유
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}
```

## 7. 마이그레이션 검증

### 7.1 Store 연결 확인
```typescript
// React: Provider 설정 확인
// App.tsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* ... */}
      </Router>
    </Provider>
  );
}

// Vue3: Pinia 설정 확인
// main.ts
import { createPinia } from 'pinia';

const pinia = createPinia();
app.use(pinia);
```

### 7.2 컴포넌트 연결 확인
```typescript
// React 컴포넌트
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/domains/user/store/userSlice';

// Vue3 컴포넌트
import { useUserStore } from '@/domains/user/stores/userStore';
```

## 8. 타입 안정성 확보

### 8.1 Redux TypeScript 설정
```typescript
// store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 8.2 Store 타입 정의
```typescript
// domains/user/types/store.ts
export interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface UserActions {
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
  fetchUsers: () => Promise<void>;
}
```

## 9. 성능 최적화

### 9.1 Selector 메모이제이션
```typescript
// Redux: createSelector 사용
import { createSelector } from '@reduxjs/toolkit';

export const selectUsersByRole = createSelector(
  [selectUsers, (state, role) => role],
  (users, role) => users.filter(user => user.role === role)
);
```

### 9.2 Store 분할 로딩
```typescript
// Lazy load domain stores
const userSlice = lazy(() => 
  import('@/domains/user/store/userSlice')
);
```

## 10. 진행 상황 업데이트

### 10.1 체크포인트 기록
```json
{
  "checkpoints": {
    "CP-S001": "완료 - 상태 관리 분석",
    "CP-S002": "완료 - User 도메인 Store 이동",
    "CP-S003": "진행중 - Product 도메인 Store 이동",
    "CP-S004": "대기 - 공통 Store 생성"
  },
  "statistics": {
    "totalStores": 8,
    "migratedStores": 3,
    "remainingStores": 5
  }
}
```

### 10.2 다음 단계 준비
- Store 마이그레이션 완료 확인
- 컴포넌트 연결 확인
- 타입 에러 해결
- 05-hooks-refactoring.md로 이동