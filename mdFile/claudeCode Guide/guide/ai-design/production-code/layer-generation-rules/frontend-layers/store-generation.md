# 🗄️ State Management Store 코드 생성 규칙

> 상태 관리 스토어의 자동 생성을 위한 프레임워크별 상세 가이드

## 📋 Store 레이어 역할

### **핵심 책임**
- 전역 애플리케이션 상태 관리
- 상태 변경 로직 중앙화
- API 데이터 캐싱 및 동기화
- 컴포넌트 간 데이터 공유
- 비동기 작업 상태 관리
- 상태 영속화 (로컬 스토리지 등)

### **포함하지 않을 내용**
- UI 렌더링 로직
- 컴포넌트별 로컬 상태
- 직접적인 DOM 조작
- 라우팅 로직

## 🏗️ 프레임워크별 생성 규칙

### **Pinia (Vue 3) 패턴**

#### 기본 스토어 구조
```yaml
파일_구조:
  - "스토어명: use{Entity}Store.ts"
  - "예시: useProductStore.ts, useUserStore.ts, useAuthStore.ts"
  
스토어_정의:
  - "defineStore() 함수 사용"
  - "Composition API 스타일 권장"
  - "TypeScript 필수"

구성_요소:
  - "state: 상태 데이터"
  - "getters: 계산된 상태"
  - "actions: 상태 변경 메서드"
```

#### Pinia Composition API 패턴
```yaml
상태_정의:
  - "ref(): 원시값 상태"
  - "reactive(): 객체 상태"
  - "computed(): 계산된 상태"

액션_정의:
  - "async function: 비동기 액션"
  - "function: 동기 액션"
  - "에러 처리 로직 포함"

스토어_구성:
  ```typescript
  export const use{Entity}Store = defineStore('{entity}', () => {
    // State
    const {entity}List = ref<{Entity}[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    
    // Getters
    const {entity}Count = computed(() => {entity}List.value.length)
    
    // Actions
    async function fetch{Entity}List() {
      // 구현 로직
    }
    
    return {
      {entity}List,
      isLoading,
      error,
      {entity}Count,
      fetch{Entity}List
    }
  })
  ```
```

### **Redux Toolkit (React) 패턴**

#### 슬라이스 구조
```yaml
파일_구조:
  - "슬라이스명: {entity}Slice.ts"
  - "예시: productSlice.ts, userSlice.ts, authSlice.ts"

슬라이스_정의:
  - "createSlice() 함수 사용"
  - "이뮤터블 업데이트 자동 처리"
  - "TypeScript 타입 안전성"

구성_요소:
  - "name: 슬라이스 이름"
  - "initialState: 초기 상태"
  - "reducers: 동기 리듀서"
  - "extraReducers: 비동기 액션 처리"
```

#### RTK Query 패턴
```yaml
API_슬라이스:
  - "createApi() 함수 사용"
  - "자동 캐싱 및 무효화"
  - "낙관적 업데이트 지원"

엔드포인트_정의:
  - "query: 읽기 작업"
  - "mutation: 쓰기 작업"
  - "태그 기반 캐시 관리"
```

### **Zustand (React) 패턴**

#### 간단한 스토어 구조
```yaml
파일_구조:
  - "스토어명: use{Entity}Store.ts"
  - "최소한의 보일러플레이트"

스토어_정의:
  - "create() 함수 사용"
  - "상태와 액션 단일 객체"
  - "이뮤터블 업데이트 수동 처리"
```

## 🎯 스토어 타입별 생성 규칙

### **1. Entity Store (도메인별 데이터 관리)**

#### 기본 상태 구조
```yaml
데이터_상태:
  - "list: {Entity}[] - 엔티티 목록"
  - "current: {Entity} | null - 현재 선택된 엔티티"
  - "cache: Map<id, {Entity}> - 캐시된 엔티티"

UI_상태:
  - "isLoading: boolean - 로딩 상태"
  - "error: string | null - 에러 메시지"
  - "lastFetchTime: Date | null - 마지막 조회 시간"

페이징_상태:
  - "currentPage: number - 현재 페이지"
  - "pageSize: number - 페이지 크기"
  - "totalCount: number - 전체 개수"
  - "hasNextPage: boolean - 다음 페이지 존재 여부"
```

#### CRUD 액션 패턴
```yaml
CREATE_액션:
  - "create{Entity}(data: {Entity}CreateRequest)"
  - "낙관적 업데이트 지원"
  - "에러 시 롤백"

READ_액션:
  - "fetch{Entity}List(params?: SearchParams)"
  - "fetch{Entity}ById(id: string)"
  - "캐시 우선 전략"

UPDATE_액션:
  - "update{Entity}(id: string, data: {Entity}UpdateRequest)"
  - "부분 업데이트 지원"
  - "실시간 동기화"

DELETE_액션:
  - "delete{Entity}(id: string)"
  - "소프트 삭제 지원"
  - "연관 데이터 정리"
```

### **2. Authentication Store**

#### 인증 상태 관리
```yaml
사용자_상태:
  - "user: User | null - 현재 사용자"
  - "isAuthenticated: boolean - 인증 상태"
  - "permissions: string[] - 권한 목록"
  - "roles: Role[] - 역할 목록"

토큰_관리:
  - "accessToken: string | null"
  - "refreshToken: string | null"
  - "tokenExpiry: Date | null"

인증_액션:
  - "login(credentials: LoginRequest)"
  - "logout()"
  - "refreshToken()"
  - "checkAuthStatus()"
```

#### 보안 고려사항
```yaml
토큰_보안:
  - "메모리 저장 우선"
  - "자동 토큰 갱신"
  - "만료시 자동 로그아웃"

권한_검증:
  - "hasPermission(permission: string)"
  - "hasRole(role: string)"
  - "canAccess(resource: string)"
```

### **3. UI State Store**

#### 전역 UI 상태
```yaml
레이아웃_상태:
  - "sidebarOpen: boolean - 사이드바 열림 상태"
  - "theme: 'light' | 'dark' - 테마 설정"
  - "language: string - 언어 설정"

모달_상태:
  - "modals: Map<string, ModalState> - 모달 상태"
  - "notifications: Notification[] - 알림 목록"
  - "loading: Map<string, boolean> - 로딩 상태"

설정_상태:
  - "userPreferences: UserPreferences"
  - "appSettings: AppSettings"
```

### **4. Form State Store**

#### 폼 데이터 관리
```yaml
폼_상태:
  - "formData: Record<string, any> - 폼 데이터"
  - "errors: Record<string, string[]> - 검증 오류"
  - "touched: Record<string, boolean> - 터치된 필드"
  - "isSubmitting: boolean - 제출 상태"

검증_액션:
  - "validateField(field: string, value: any)"
  - "validateForm()"
  - "setFieldError(field: string, error: string)"
  - "clearErrors()"
```

## 🔄 비동기 작업 처리 규칙

### **Pinia 비동기 패턴**
```yaml
액션_구조:
  ```typescript
  async function fetch{Entity}List(params?: SearchParams) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await {entity}Api.getList(params)
      {entity}List.value = response.data
      totalCount.value = response.total
    } catch (err) {
      error.value = handleApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  ```

에러_처리:
  - "try-catch-finally 패턴"
  - "의미있는 에러 메시지"
  - "재시도 메커니즘"
```

### **Redux Toolkit 비동기 패턴**
```yaml
createAsyncThunk_사용:
  ```typescript
  export const fetch{Entity}List = createAsyncThunk(
    '{entity}/fetchList',
    async (params: SearchParams, { rejectWithValue }) => {
      try {
        const response = await {entity}Api.getList(params)
        return response.data
      } catch (error) {
        return rejectWithValue(handleApiError(error))
      }
    }
  )
  ```

extraReducers_처리:
  - "pending: 로딩 상태 설정"
  - "fulfilled: 성공 상태 처리"
  - "rejected: 에러 상태 처리"
```

## 🚀 성능 최적화 규칙

### **캐싱 전략**
```yaml
메모리_캐싱:
  - "조회된 데이터 캐시"
  - "TTL 기반 캐시 무효화"
  - "LRU 캐시 정책"

선택적_업데이트:
  - "변경된 필드만 업데이트"
  - "Deep equality 체크"
  - "불필요한 리렌더링 방지"

지연_로딩:
  - "필요시 데이터 조회"
  - "무한 스크롤 지원"
  - "페이지네이션 캐싱"
```

### **상태 정규화**
```yaml
정규화_구조:
  - "byId: Record<string, {Entity}> - ID 기반 매핑"
  - "allIds: string[] - ID 목록"
  - "관계형 데이터 정규화"

선택자_최적화:
  - "메모이제이션된 선택자"
  - "파생 상태 계산"
  - "리렌더링 최소화"
```

## 🔍 도메인별 특화 스토어

### **전자상거래 도메인**

#### 장바구니 스토어
```yaml
상태_구조:
  - "items: CartItem[] - 장바구니 아이템"
  - "totalAmount: number - 총 금액"
  - "discountAmount: number - 할인 금액"

액션:
  - "addToCart(product: Product, quantity: number)"
  - "updateQuantity(itemId: string, quantity: number)"
  - "removeFromCart(itemId: string)"
  - "clearCart()"
  - "applyDiscount(couponCode: string)"
```

#### 주문 스토어
```yaml
주문_상태:
  - "currentOrder: Order | null"
  - "orderHistory: Order[]"
  - "paymentStatus: PaymentStatus"

주문_프로세스:
  - "createOrder(orderData: OrderRequest)"
  - "processPayment(paymentData: PaymentRequest)"
  - "trackOrder(orderId: string)"
  - "cancelOrder(orderId: string)"
```

### **금융 도메인**

#### 계좌 스토어
```yaml
계좌_상태:
  - "accounts: Account[]"
  - "selectedAccount: Account | null"
  - "balance: number"
  - "transactions: Transaction[]"

보안_액션:
  - "validateTransaction(transaction: TransactionRequest)"
  - "authorizePayment(authData: AuthRequest)"
  - "logSecurityEvent(event: SecurityEvent)"
```

## 🧪 테스트 생성 규칙

### **스토어 테스트**
```yaml
단위_테스트:
  - "초기 상태 테스트"
  - "액션 실행 테스트"
  - "상태 변화 검증"
  - "에러 처리 테스트"

통합_테스트:
  - "API 연동 테스트"
  - "복합 액션 시나리오"
  - "상태 영속화 테스트"
```

### **Mock 및 Fixture**
```yaml
Mock_데이터:
  - "API 응답 모킹"
  - "에러 시나리오 모킹"
  - "타이밍 제어"

테스트_유틸리티:
  - "스토어 팩토리 함수"
  - "상태 초기화 헬퍼"
  - "액션 테스트 헬퍼"
```

## 🔧 생성 시 고려사항

### **타입 안전성**
```yaml
TypeScript_활용:
  - "엄격한 타입 정의"
  - "제네릭 활용"
  - "타입 가드 함수"

인터페이스_정의:
  - "State 인터페이스"
  - "Action 타입 정의"
  - "API 응답 타입"
```

### **개발자 경험**
```yaml
디버깅_지원:
  - "Redux DevTools 연동"
  - "Pinia DevTools 지원"
  - "상태 변화 로깅"

코드_분할:
  - "스토어 모듈화"
  - "지연 로딩 지원"
  - "번들 크기 최적화"
```

### **마이그레이션 지원**
```yaml
상태_마이그레이션:
  - "스키마 버전 관리"
  - "하위 호환성 유지"
  - "점진적 업그레이드"

데이터_변환:
  - "레거시 데이터 처리"
  - "API 응답 변환"
  - "정규화/비정규화"
```

이 규칙을 바탕으로 AI가 프레임워크와 도메인에 맞는 최적화된 상태 관리 스토어 코드를 자동 생성합니다.