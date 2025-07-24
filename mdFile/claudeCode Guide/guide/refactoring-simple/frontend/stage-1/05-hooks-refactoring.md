# 🪝 Hooks/Composables 리팩토링 가이드

## 1. Custom Hooks/Composables 분석

### 1.1 React Hooks 스캔
```typescript
// Hook 패턴 식별
const hookPatterns = [
  '**/hooks/*.ts',
  '**/hooks/*.js',
  '**/use*.ts',
  '**/use*.js'
];

// Hook 분류
interface HookAnalysis {
  name: string;
  path: string;
  type: 'state' | 'effect' | 'memo' | 'callback' | 'custom';
  dependencies: string[];
  domain: string;
  usage: string[]; // 사용하는 컴포넌트 목록
}
```

### 1.2 Vue3 Composables 스캔
```typescript
// Composable 패턴 식별
const composablePatterns = [
  '**/composables/*.ts',
  '**/composables/*.js',
  '**/use*.ts',
  '**/use*.js'
];

// Composable 분류
interface ComposableAnalysis {
  name: string;
  path: string;
  returnType: 'reactive' | 'ref' | 'computed' | 'mixed';
  dependencies: string[];
  domain: string;
}
```

## 2. 도메인별 Hooks 분리

### 2.1 User 도메인 Hooks
```typescript
// domains/user/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, fetchUser } from '../store/userSlice';
import { userApi } from '../services/userApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const user = await userApi.login(credentials);
      dispatch(setCurrentUser(user));
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await userApi.logout();
    dispatch(clearCurrentUser());
  }, [dispatch]);

  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    logout
  };
};
```

### 2.2 User 프로필 Hook
```typescript
// domains/user/hooks/useUserProfile.ts
export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.getProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return;
    
    try {
      const updated = await userApi.updateProfile(userId, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [userId]);

  return { profile, loading, error, updateProfile };
};
```

## 3. Vue3 Composables 리팩토링

### 3.1 Auth Composable
```typescript
// domains/user/composables/useAuth.ts
import { ref, computed, readonly } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import type { LoginCredentials, User } from '../types/models';

export const useAuth = () => {
  const userStore = useUserStore();
  const router = useRouter();
  
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => 
    !!userStore.currentUser
  );

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      await userStore.login(credentials);
      router.push('/dashboard');
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    await userStore.logout();
    router.push('/login');
  };

  return {
    user: readonly(computed(() => userStore.currentUser)),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),
    error: readonly(error),
    login,
    logout
  };
};
```

### 3.2 User Profile Composable
```typescript
// domains/user/composables/useUserProfile.ts
import { ref, watch, computed } from 'vue';
import { userApi } from '../services/userApi';
import type { UserProfile } from '../types/models';

export const useUserProfile = (userId: Ref<string | undefined>) => {
  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchProfile = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      profile.value = await userApi.getProfile(id);
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  watch(userId, (newId) => {
    if (newId) {
      fetchProfile(newId);
    } else {
      profile.value = null;
    }
  }, { immediate: true });

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId.value) return;
    
    try {
      profile.value = await userApi.updateProfile(
        userId.value, 
        updates
      );
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  return {
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
    updateProfile
  };
};
```

## 4. 공통 Hooks/Composables

### 4.1 Form Handling Hook
```typescript
// common/hooks/useForm.ts
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as string] && validate) {
      const newErrors = validate({ ...values, [name]: value });
      setErrors(newErrors);
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const newErrors = validate(values);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();
    
    if (validate) {
      const newErrors = validate(values);
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
};
```

### 4.2 API Request Hook
```typescript
// common/hooks/useApi.ts
interface UseApiOptions<T> {
  request: () => Promise<T>;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export const useApi = <T>({
  request,
  immediate = false,
  onSuccess,
  onError
}: UseApiOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await request();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [request, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { data, loading, error, execute, refetch: execute };
};
```

## 5. 특화된 도메인 Hooks

### 5.1 Product 도메인 Hooks
```typescript
// domains/product/hooks/useProducts.ts
export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setProducts(response.data);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const nextPage = () => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const prevPage = () => {
    setPagination(prev => ({ 
      ...prev, 
      page: Math.max(1, prev.page - 1) 
    }));
  };

  return {
    products,
    loading,
    pagination,
    nextPage,
    prevPage,
    refetch: fetchProducts
  };
};
```

### 5.2 Cart Hook
```typescript
// domains/cart/hooks/useCart.ts
export const useCart = () => {
  const cartStore = useCartStore();
  const { items, total } = cartStore;

  const addToCart = useCallback((product: Product, quantity = 1) => {
    cartStore.addItem({
      productId: product.id,
      quantity,
      price: product.price
    });
    
    // 토스트 알림
    toast.success(`${product.name}이(가) 장바구니에 추가되었습니다.`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    cartStore.removeItem(productId);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      cartStore.updateQuantity(productId, quantity);
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    cartStore.clearCart();
  }, []);

  return {
    items,
    total,
    itemCount: items.length,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};
```

## 6. Hook 조합 패턴

### 6.1 복합 Hook
```typescript
// domains/user/hooks/useUserDashboard.ts
export const useUserDashboard = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.id);
  const { orders } = useUserOrders(user?.id);
  const { notifications } = useNotifications();

  const stats = useMemo(() => {
    if (!orders) return null;
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0)
    };
  }, [orders]);

  return {
    user,
    profile,
    orders,
    notifications,
    stats
  };
};
```

### 6.2 Hook Factory 패턴
```typescript
// common/hooks/useDataTable.ts
export const createDataTableHook = <T>(
  fetchData: (params: any) => Promise<{ data: T[]; total: number }>
) => {
  return (initialParams = {}) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState(initialParams);
    const [total, setTotal] = useState(0);

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const result = await fetchData(params);
        setData(result.data);
        setTotal(result.total);
      } finally {
        setLoading(false);
      }
    }, [params]);

    useEffect(() => {
      load();
    }, [load]);

    return {
      data,
      loading,
      total,
      params,
      setParams,
      refresh: load
    };
  };
};

// 사용 예시
export const useProductTable = createDataTableHook(productApi.getProducts);
export const useUserTable = createDataTableHook(userApi.getUsers);
```

## 7. 테스트 작성

### 7.1 Hook 테스트
```typescript
// domains/user/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import { userApi } from '../../services/userApi';

jest.mock('../../services/userApi');

describe('useAuth', () => {
  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (userApi.login as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password'
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## 8. Hook 문서화

### 8.1 JSDoc 작성
```typescript
/**
 * 사용자 인증 관련 기능을 제공하는 Hook
 * 
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   try {
 *     await login({ email, password });
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * ```
 * 
 * @returns {Object} Auth 관련 상태와 메서드
 * @returns {User | null} user - 현재 로그인한 사용자
 * @returns {boolean} isAuthenticated - 인증 여부
 * @returns {Function} login - 로그인 함수
 * @returns {Function} logout - 로그아웃 함수
 */
export const useAuth = () => {
  // ...
};
```

## 9. 성능 최적화

### 9.1 메모이제이션
```typescript
// 불필요한 재계산 방지
export const useExpensiveCalculation = (data: any[]) => {
  const result = useMemo(() => {
    // 비용이 큰 계산
    return data.reduce((acc, item) => {
      // 복잡한 연산
      return acc + complexCalculation(item);
    }, 0);
  }, [data]);

  return result;
};
```

### 9.2 디바운싱/쓰로틀링
```typescript
// common/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 사용 예시
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data: results } = useApi({
    request: () => searchApi.search(debouncedSearch),
    immediate: false
  });

  useEffect(() => {
    if (debouncedSearch) {
      // 검색 실행
    }
  }, [debouncedSearch]);

  return { searchTerm, setSearchTerm, results };
};
```

## 10. 진행 상황 업데이트

### 10.1 체크포인트 기록
```json
{
  "checkpoints": {
    "CP-H001": "완료 - Hook 분석 및 분류",
    "CP-H002": "완료 - User 도메인 Hooks 이동",
    "CP-H003": "진행중 - Product 도메인 Hooks 이동",
    "CP-H004": "대기 - 공통 Hooks 정리"
  },
  "statistics": {
    "totalHooks": 32,
    "migratedHooks": 12,
    "remainingHooks": 20,
    "newHooks": 5
  }
}
```

### 10.2 다음 단계 준비
- Hook 마이그레이션 완료 확인
- 컴포넌트에서 Hook 사용 확인
- 테스트 작성 및 실행
- 06-service-refactoring.md로 이동