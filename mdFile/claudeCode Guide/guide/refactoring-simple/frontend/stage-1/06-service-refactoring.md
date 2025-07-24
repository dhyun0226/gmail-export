# 🌐 서비스/API 레이어 리팩토링 가이드

## 1. API 서비스 현황 분석

### 1.1 현재 API 구조 파악
```typescript
// API 서비스 패턴 분석
interface ApiServiceAnalysis {
  name: string;
  path: string;
  endpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    functionName: string;
  }>;
  domain: string;
  httpClient: 'axios' | 'fetch' | 'custom';
  hasInterceptors: boolean;
  hasErrorHandling: boolean;
}

// 스캔 패턴
const apiPatterns = [
  '**/api/*.ts',
  '**/services/*.ts',
  '**/*Api.ts',
  '**/*Service.ts'
];
```

### 1.2 HTTP 클라이언트 분석
```typescript
// Axios 설정 확인
const axiosConfig = {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Interceptor 확인
const hasAuthInterceptor = true;
const hasErrorInterceptor = true;
```

## 2. 도메인별 서비스 분리

### 2.1 Base API Client 생성
```typescript
// common/services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getAuthToken, refreshToken } from '@/common/utils/auth';

class ApiClient {
  private instance: AxiosInstance;
  
  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // 리프레시 실패 시 로그인 페이지로
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // 서버 응답 에러
      return {
        code: error.response.status,
        message: error.response.data?.message || '서버 오류가 발생했습니다.',
        data: error.response.data
      };
    } else if (error.request) {
      // 네트워크 에러
      return {
        code: 0,
        message: '네트워크 연결을 확인해주세요.',
        data: null
      };
    } else {
      // 기타 에러
      return {
        code: -1,
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        data: null
      };
    }
  }

  // HTTP 메서드
  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.patch<T>(url, data, config);
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();

// 타입 정의
export interface ApiError {
  code: number;
  message: string;
  data: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2.2 User Domain API Service
```typescript
// domains/user/services/userApi.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/common/services/apiClient';
import type { User, UserProfile, LoginCredentials, RegisterData } from '../types/models';

class UserApiService {
  private readonly basePath = '/users';

  // 인증 관련
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/auth/login', 
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/auth/register',
      data
    );
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh'
    );
    return response.data;
  }

  // 사용자 정보
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      `${this.basePath}/${userId}`
    );
    return response.data.data;
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  // 프로필 관련
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      `${this.basePath}/${userId}/profile`
    );
    return response.data.data;
  }

  async updateProfile(
    userId: string, 
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>(
      `${this.basePath}/${userId}/profile`,
      data
    );
    return response.data.data;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `${this.basePath}/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.data.url;
  }

  // 비밀번호 관련
  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> {
    await apiClient.post(
      `${this.basePath}/${userId}/change-password`,
      data
    );
  }

  async resetPassword(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  }
}

// 싱글톤 인스턴스 export
export const userApi = new UserApiService();
```

### 2.3 Product Domain API Service
```typescript
// domains/product/services/productApi.ts
import { apiClient, ApiResponse, PaginatedResponse } from '@/common/services/apiClient';
import type { Product, ProductDetail, Category, ProductFilters } from '../types/models';

class ProductApiService {
  private readonly basePath = '/products';

  // 상품 목록
  async getProducts(
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      this.basePath,
      { params: filters }
    );
    return response.data;
  }

  // 상품 상세
  async getProduct(productId: string): Promise<ProductDetail> {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(
      `${this.basePath}/${productId}`
    );
    return response.data.data;
  }

  // 상품 검색
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${this.basePath}/search`,
      { params: { q: query } }
    );
    return response.data.data;
  }

  // 카테고리
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/categories'
    );
    return response.data.data;
  }

  // 추천 상품
  async getRecommendations(productId: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${this.basePath}/${productId}/recommendations`
    );
    return response.data.data;
  }

  // 리뷰
  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      `${this.basePath}/${productId}/reviews`,
      { params }
    );
    return response.data;
  }

  async createReview(
    productId: string,
    data: { rating: number; comment: string }
  ): Promise<Review> {
    const response = await apiClient.post<ApiResponse<Review>>(
      `${this.basePath}/${productId}/reviews`,
      data
    );
    return response.data.data;
  }
}

export const productApi = new ProductApiService();
```

## 3. GraphQL 서비스 (선택적)

### 3.1 Apollo Client 설정
```typescript
// common/services/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from '@/common/utils/auth';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            }
          }
        }
      }
    }
  })
});
```

### 3.2 GraphQL Queries/Mutations
```typescript
// domains/user/services/userQueries.ts
import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      avatar
      role
      profile {
        bio
        location
        website
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $input: UserProfileInput!) {
    updateUserProfile(id: $id, input: $input) {
      id
      profile {
        bio
        location
        website
      }
    }
  }
`;
```

## 4. 실시간 통신 서비스

### 4.1 WebSocket Service
```typescript
// common/services/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_WS_URL || '', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback as any);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export const wsService = new WebSocketService();
```

### 4.2 도메인별 실시간 서비스
```typescript
// domains/notification/services/notificationService.ts
import { wsService } from '@/common/services/websocket';
import type { Notification } from '../types/models';

class NotificationService {
  private callbacks: Set<(notification: Notification) => void> = new Set();

  initialize() {
    wsService.on('notification', this.handleNotification);
  }

  private handleNotification = (notification: Notification) => {
    this.callbacks.forEach(callback => callback(notification));
  };

  subscribe(callback: (notification: Notification) => void) {
    this.callbacks.add(callback);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  markAsRead(notificationId: string) {
    wsService.emit('notification:read', { id: notificationId });
  }

  cleanup() {
    wsService.off('notification', this.handleNotification);
    this.callbacks.clear();
  }
}

export const notificationService = new NotificationService();
```

## 5. 서비스 타입 정의

### 5.1 API 타입 정의
```typescript
// domains/user/types/api.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdateRequest {
  name?: string;
  bio?: string;
  avatar?: string;
}
```

### 5.2 에러 타입 정의
```typescript
// common/types/errors.ts
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export class CustomApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CustomApiError';
  }
}
```

## 6. 서비스 테스트

### 6.1 API Service 테스트
```typescript
// domains/user/services/__tests__/userApi.test.ts
import { userApi } from '../userApi';
import { apiClient } from '@/common/services/apiClient';

jest.mock('@/common/services/apiClient');

describe('UserApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          }
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userApi.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        { email: 'test@example.com', password: 'password' }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
```

### 6.2 Mock Service 생성
```typescript
// domains/user/services/userApi.mock.ts
import type { User, UserProfile } from '../types/models';

export const mockUserApi = {
  login: jest.fn().mockResolvedValue({
    data: { id: '1', email: 'test@example.com' }
  }),
  
  logout: jest.fn().mockResolvedValue(undefined),
  
  getCurrentUser: jest.fn().mockResolvedValue({
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  }),
  
  getUsers: jest.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
  })
};
```

## 7. 서비스 캐싱

### 7.1 React Query 통합
```typescript
// domains/user/hooks/queries/useUserQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../services/userApi';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Queries
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUsers = (filters?: any) => {
  return useQuery({
    queryKey: userKeys.list(JSON.stringify(filters)),
    queryFn: () => userApi.getUsers(filters),
  });
};

// Mutations
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      userApi.updateProfile(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId)
      });
    },
  });
};
```

## 8. 에러 처리 및 재시도

### 8.1 재시도 로직
```typescript
// common/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }

      onRetry?.(attempt, error);

      const waitTime = backoff ? delay * attempt : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// 사용 예시
export const fetchWithRetry = async (url: string) => {
  return withRetry(
    () => apiClient.get(url),
    {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (attempt) => {
        console.log(`Retry attempt ${attempt} for ${url}`);
      }
    }
  );
};
```

## 9. 서비스 인덱스 파일

### 9.1 도메인 서비스 export
```typescript
// domains/user/services/index.ts
export { userApi } from './userApi';
export { notificationService } from './notificationService';
export * from './userQueries';
export * from '../hooks/queries/useUserQuery';
```

### 9.2 공통 서비스 export
```typescript
// common/services/index.ts
export { apiClient } from './apiClient';
export { wsService } from './websocket';
export { apolloClient } from './apolloClient';
export * from '../types/errors';
```

## 10. 진행 상황 업데이트

### 10.1 체크포인트 기록
```json
{
  "checkpoints": {
    "CP-S001": "완료 - API 서비스 분석",
    "CP-S002": "완료 - Base API Client 생성",
    "CP-S003": "완료 - User 도메인 서비스 이동",
    "CP-S004": "진행중 - Product 도메인 서비스 이동"
  },
  "statistics": {
    "totalServices": 23,
    "migratedServices": 8,
    "remainingServices": 15,
    "newServices": 3
  }
}
```

### 10.2 다음 단계 준비
- 모든 서비스 마이그레이션 완료
- API 호출 테스트
- 에러 처리 확인
- 07-verification.md로 이동