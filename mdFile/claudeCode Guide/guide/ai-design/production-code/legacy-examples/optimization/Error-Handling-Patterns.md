# 완전한 에러 처리 패턴 가이드
> AI가 화면 이미지로부터 포괄적인 에러 처리 시스템을 자동 생성하는 가이드

## 🎯 목표
AI가 화면 이미지 분석 후 **완전한 에러 처리 시스템**을 자동 생성하여 **견고한 애플리케이션** 구현

## 🛡️ 완전한 에러 처리 아키텍처

### 1. Frontend 에러 처리 (Vue 3)

#### 1.1 Global Error Handler

##### errorHandler.ts
```typescript
import { App } from 'vue';
import { Router } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  status: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private toast = useToast();
  private authStore = useAuthStore();
  private router: Router | null = null;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  setRouter(router: Router) {
    this.router = router;
  }

  // Vue 앱 레벨 에러 핸들러
  handleAppError(error: unknown, instance: any, info: string) {
    const context: ErrorContext = {
      component: instance?.$options?.name || 'Unknown',
      action: info,
      userId: this.authStore.user?.id?.toString(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError(error, context);
    this.showUserFriendlyMessage(error, context);
  }

  // API 에러 핸들러
  handleApiError(error: any): never {
    const apiError: ApiError = this.parseApiError(error);
    
    logger.error('API Error:', {
      code: apiError.code,
      message: apiError.message,
      status: apiError.status,
      path: apiError.path,
      details: apiError.details
    });

    // 상태 코드별 처리
    switch (apiError.status) {
      case 400:
        this.handleValidationError(apiError);
        break;
      case 401:
        this.handleUnauthorizedError(apiError);
        break;
      case 403:
        this.handleForbiddenError(apiError);
        break;
      case 404:
        this.handleNotFoundError(apiError);
        break;
      case 409:
        this.handleConflictError(apiError);
        break;
      case 422:
        this.handleUnprocessableEntityError(apiError);
        break;
      case 429:
        this.handleTooManyRequestsError(apiError);
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        this.handleServerError(apiError);
        break;
      default:
        this.handleUnknownError(apiError);
    }

    throw apiError;
  }

  // 네트워크 에러 핸들러
  handleNetworkError(error: any) {
    const isOffline = !navigator.onLine;
    
    if (isOffline) {
      this.toast.error('인터넷 연결을 확인해주세요.', {
        icon: '🌐',
        timeout: 0,
        closeButton: true
      });
    } else {
      this.toast.error('네트워크 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', {
        icon: '📡',
        timeout: 5000
      });
    }

    logger.error('Network Error:', {
      message: error.message,
      isOffline,
      url: error.config?.url,
      method: error.config?.method
    });
  }

  // 유효성 검증 에러 핸들러
  handleValidationError(apiError: ApiError) {
    if (apiError.details?.validationErrors) {
      const errors: ValidationError[] = apiError.details.validationErrors;
      
      // 필드별 에러 메시지 표시
      errors.forEach(error => {
        this.showFieldError(error.field, error.message);
      });
    } else {
      this.toast.error(apiError.message || '입력 정보를 확인해주세요.', {
        icon: '⚠️'
      });
    }
  }

  // 인증 에러 핸들러
  private handleUnauthorizedError(apiError: ApiError) {
    this.toast.error('로그인이 필요합니다.', {
      icon: '🔒'
    });

    // 토큰 제거 및 로그인 페이지로 이동
    this.authStore.logout();
    this.router?.push('/login');
  }

  // 권한 에러 핸들러
  private handleForbiddenError(apiError: ApiError) {
    this.toast.error('접근 권한이 없습니다.', {
      icon: '🚫'
    });

    // 권한 없음 페이지로 이동
    this.router?.push('/forbidden');
  }

  // 리소스 없음 에러 핸들러
  private handleNotFoundError(apiError: ApiError) {
    this.toast.error('요청한 정보를 찾을 수 없습니다.', {
      icon: '🔍'
    });
  }

  // 충돌 에러 핸들러 (중복 데이터 등)
  private handleConflictError(apiError: ApiError) {
    this.toast.error(apiError.message || '이미 존재하는 데이터입니다.', {
      icon: '⚠️'
    });
  }

  // 처리할 수 없는 엔티티 에러 핸들러
  private handleUnprocessableEntityError(apiError: ApiError) {
    this.toast.error(apiError.message || '처리할 수 없는 요청입니다.', {
      icon: '❌'
    });
  }

  // 요청 한도 초과 에러 핸들러
  private handleTooManyRequestsError(apiError: ApiError) {
    this.toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', {
      icon: '⏱️',
      timeout: 0,
      closeButton: true
    });
  }

  // 서버 에러 핸들러
  private handleServerError(apiError: ApiError) {
    this.toast.error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', {
      icon: '🔧',
      timeout: 0,
      closeButton: true
    });

    // 심각한 서버 에러는 별도 로깅
    logger.error('Server Error:', apiError);
  }

  // 알 수 없는 에러 핸들러
  private handleUnknownError(apiError: ApiError) {
    this.toast.error('예상치 못한 오류가 발생했습니다.', {
      icon: '❓'
    });

    logger.error('Unknown Error:', apiError);
  }

  // API 에러 파싱
  private parseApiError(error: any): ApiError {
    const response = error.response;
    
    return {
      code: response?.data?.code || 'UNKNOWN_ERROR',
      message: response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.',
      details: response?.data?.details,
      timestamp: response?.data?.timestamp || new Date().toISOString(),
      path: response?.data?.path || error.config?.url || '',
      status: response?.status || 0
    };
  }

  // 필드별 에러 메시지 표시
  private showFieldError(field: string, message: string) {
    // DOM에서 해당 필드 찾기
    const fieldElement = document.querySelector(`[name="${field}"]`) || 
                        document.querySelector(`[data-field="${field}"]`);
    
    if (fieldElement) {
      // 기존 에러 메시지 제거
      const existingError = fieldElement.parentElement?.querySelector('.field-error');
      if (existingError) {
        existingError.remove();
      }

      // 새 에러 메시지 추가
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error text-danger small mt-1';
      errorElement.textContent = message;
      
      fieldElement.parentElement?.appendChild(errorElement);
      
      // 필드에 에러 스타일 적용
      fieldElement.classList.add('is-invalid');

      // 3초 후 자동 제거
      setTimeout(() => {
        errorElement.remove();
        fieldElement.classList.remove('is-invalid');
      }, 3000);
    }
  }

  // 사용자 친화적 메시지 표시
  private showUserFriendlyMessage(error: unknown, context: ErrorContext) {
    if (error instanceof Error) {
      // 개발 환경에서는 상세 정보 표시
      if (import.meta.env.DEV) {
        this.toast.error(`[${context.component}] ${error.message}`, {
          timeout: 0,
          closeButton: true
        });
      } else {
        // 프로덕션에서는 일반적인 메시지
        this.toast.error('일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.', {
          icon: '🔄'
        });
      }
    }
  }

  // 에러 로깅
  private logError(error: unknown, context: ErrorContext) {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString()
    };

    // 콘솔 로깅
    console.error('Application Error:', errorInfo);

    // 외부 서비스로 에러 전송 (Sentry, LogRocket 등)
    if (import.meta.env.PROD) {
      this.sendErrorToService(errorInfo);
    }
  }

  // 외부 에러 추적 서비스로 전송
  private async sendErrorToService(errorInfo: any) {
    try {
      // Sentry, LogRocket, 또는 자체 로깅 서비스로 전송
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (e) {
      // 에러 전송 실패 시 무시 (무한 루프 방지)
      console.warn('Failed to send error to logging service:', e);
    }
  }
}

// Vue 앱에 에러 핸들러 설정
export function setupErrorHandling(app: App, router: Router) {
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.setRouter(router);

  // Vue 에러 핸들러 설정
  app.config.errorHandler = (error, instance, info) => {
    errorHandler.handleAppError(error, instance, info);
  };

  // 전역 에러 이벤트 리스너
  window.addEventListener('error', (event) => {
    errorHandler.handleAppError(event.error, null, 'Global Error');
  });

  // Promise rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleAppError(event.reason, null, 'Unhandled Promise Rejection');
    event.preventDefault();
  });
}
```

#### 1.2 API Client Error Interceptor

##### apiClient.ts
```typescript
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ErrorHandler } from './errorHandler';

// Request 타입 정의
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retry: RetryConfig;
}

class ApiClient {
  private instance: AxiosInstance;
  private errorHandler: ErrorHandler;
  private pendingRequests = new Map<string, AbortController>();

  constructor(config: ApiClientConfig) {
    this.errorHandler = ErrorHandler.getInstance();
    
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
    this.setupRetryLogic(config.retry);
  }

  private setupInterceptors() {
    // Request 인터셉터
    this.instance.interceptors.request.use(
      (config) => {
        // 로딩 상태 시작
        this.startLoading(config);
        
        // 중복 요청 방지
        this.cancelDuplicateRequest(config);
        
        // 인증 토큰 추가
        this.addAuthToken(config);
        
        // 요청 로깅
        this.logRequest(config);
        
        return config;
      },
      (error) => {
        this.stopLoading();
        return Promise.reject(error);
      }
    );

    // Response 인터셉터
    this.instance.interceptors.response.use(
      (response) => {
        // 로딩 상태 종료
        this.stopLoading();
        
        // 응답 로깅
        this.logResponse(response);
        
        return response;
      },
      (error: AxiosError) => {
        // 로딩 상태 종료
        this.stopLoading();
        
        // 에러 로깅
        this.logError(error);
        
        // 에러 타입별 처리
        return this.handleError(error);
      }
    );
  }

  private setupRetryLogic(retryConfig: RetryConfig) {
    this.instance.defaults.adapter = async (config) => {
      let attempt = 0;
      const maxAttempts = retryConfig.retries + 1;

      while (attempt < maxAttempts) {
        try {
          return await axios.defaults.adapter!(config);
        } catch (error) {
          attempt++;
          
          const axiosError = error as AxiosError;
          
          // 재시도 조건 확인
          if (attempt >= maxAttempts || !retryConfig.retryCondition(axiosError)) {
            throw error;
          }

          // 재시도 지연
          await this.delay(retryConfig.retryDelay * attempt);
          
          console.warn(`API request retry attempt ${attempt}/${retryConfig.retries}:`, config.url);
        }
      }
    };
  }

  private handleError(error: AxiosError): Promise<never> {
    // 요청 취소된 경우 무시
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(error);
    }

    // 네트워크 에러
    if (!error.response) {
      this.errorHandler.handleNetworkError(error);
      return Promise.reject(error);
    }

    // API 에러
    return this.errorHandler.handleApiError(error);
  }

  private startLoading(config: any) {
    // 전역 로딩 상태 관리
    const loadingStore = useLoadingStore();
    loadingStore.addRequest(config.url);
  }

  private stopLoading() {
    const loadingStore = useLoadingStore();
    loadingStore.removeRequest();
  }

  private cancelDuplicateRequest(config: any) {
    const requestKey = `${config.method}:${config.url}`;
    
    // 기존 요청 취소
    const existingController = this.pendingRequests.get(requestKey);
    if (existingController) {
      existingController.abort('Duplicate request canceled');
    }

    // 새 요청 등록
    const controller = new AbortController();
    config.signal = controller.signal;
    this.pendingRequests.set(requestKey, controller);

    // 요청 완료 후 정리
    config.metadata = { requestKey, controller };
  }

  private addAuthToken(config: any) {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  private logRequest(config: any) {
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });
    }
  }

  private logResponse(response: AxiosResponse) {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
        headers: response.headers
      });
    }

    // 요청 정리
    this.cleanupRequest(response.config);
  }

  private logError(error: AxiosError) {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // 요청 정리
    if (error.config) {
      this.cleanupRequest(error.config);
    }
  }

  private cleanupRequest(config: any) {
    if (config.metadata?.requestKey) {
      this.pendingRequests.delete(config.metadata.requestKey);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 공개 메서드들
  get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      // 5xx 서버 에러 또는 네트워크 에러일 때만 재시도
      return !error.response || (error.response.status >= 500);
    }
  }
});
```

### 2. Backend 에러 처리 (Spring Boot)

#### 2.1 Global Exception Handler

##### GlobalExceptionHandler.java
```java
package com.ows.demo.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 비즈니스 로직 에러
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {
        
        log.warn("Business exception occurred: {}", ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(ex.getCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(errorResponse);
    }

    // 리소스 없음 에러
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(
            NotFoundException ex, HttpServletRequest request) {
        
        log.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("RESOURCE_NOT_FOUND")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse);
    }

    // 유효성 검증 에러 (RequestBody)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        log.warn("Validation failed for request: {}", request.getRequestURI());
        
        List<ValidationError> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::createValidationError)
                .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("VALIDATION_FAILED")
                .message("입력 정보를 확인해주세요.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(ValidationErrorDetails.builder()
                        .validationErrors(validationErrors)
                        .build())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 유효성 검증 에러 (ModelAttribute)
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(
            BindException ex, HttpServletRequest request) {
        
        log.warn("Binding failed for request: {}", request.getRequestURI());
        
        List<ValidationError> validationErrors = ex.getFieldErrors()
                .stream()
                .map(this::createValidationError)
                .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("BINDING_FAILED")
                .message("요청 파라미터를 확인해주세요.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(ValidationErrorDetails.builder()
                        .validationErrors(validationErrors)
                        .build())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 제약 조건 위반 에러
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        log.warn("Constraint violation: {}", ex.getMessage());
        
        List<ValidationError> validationErrors = ex.getConstraintViolations()
                .stream()
                .map(this::createValidationError)
                .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("CONSTRAINT_VIOLATION")
                .message("입력 값이 제약 조건을 위반했습니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(ValidationErrorDetails.builder()
                        .validationErrors(validationErrors)
                        .build())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 인증 에러
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("AUTHENTICATION_FAILED")
                .message("인증이 필요합니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }

    // 권한 에러
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        log.warn("Access denied for request: {} by user: {}", 
                request.getRequestURI(), SecurityUtils.getCurrentUsername());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("ACCESS_DENIED")
                .message("접근 권한이 없습니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);
    }

    // 잘못된 자격 증명
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {
        
        log.warn("Bad credentials for request: {}", request.getRequestURI());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INVALID_CREDENTIALS")
                .message("사용자명 또는 비밀번호가 올바르지 않습니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }

    // 데이터 무결성 위반
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        
        log.error("Data integrity violation: {}", ex.getMessage(), ex);
        
        String message = "데이터 무결성 제약 조건에 위반됩니다.";
        String code = "DATA_INTEGRITY_VIOLATION";
        
        // 구체적인 제약 조건 위반 분석
        String cause = ex.getMostSpecificCause().getMessage().toLowerCase();
        if (cause.contains("unique") || cause.contains("duplicate")) {
            message = "이미 존재하는 데이터입니다.";
            code = "DUPLICATE_DATA";
        } else if (cause.contains("foreign key") || cause.contains("constraint")) {
            message = "참조 무결성 제약 조건에 위반됩니다.";
            code = "REFERENCE_CONSTRAINT_VIOLATION";
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(code)
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse);
    }

    // 낙관적 락 실패
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLockingFailureException(
            OptimisticLockingFailureException ex, HttpServletRequest request) {
        
        log.warn("Optimistic locking failure: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("OPTIMISTIC_LOCK_FAILURE")
                .message("다른 사용자에 의해 수정되었습니다. 새로고침 후 다시 시도해주세요.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse);
    }

    // HTTP 메서드 미지원
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        log.warn("Method not supported: {} for {}", ex.getMethod(), request.getRequestURI());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("METHOD_NOT_SUPPORTED")
                .message(String.format("HTTP %s 메서드는 지원되지 않습니다.", ex.getMethod()))
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(MethodNotSupportedDetails.builder()
                        .method(ex.getMethod())
                        .supportedMethods(ex.getSupportedMethods())
                        .build())
                .build();

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(errorResponse);
    }

    // 미디어 타입 미지원
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupportedException(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        
        log.warn("Media type not supported: {}", ex.getContentType());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("MEDIA_TYPE_NOT_SUPPORTED")
                .message("지원되지 않는 미디어 타입입니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(errorResponse);
    }

    // 필수 파라미터 누락
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        log.warn("Missing required parameter: {}", ex.getParameterName());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("MISSING_PARAMETER")
                .message(String.format("필수 파라미터가 누락되었습니다: %s", ex.getParameterName()))
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 파라미터 타입 불일치
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        log.warn("Type mismatch for parameter: {} with value: {}", 
                ex.getName(), ex.getValue());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("TYPE_MISMATCH")
                .message(String.format("파라미터 '%s'의 값이 올바르지 않습니다.", ex.getName()))
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // JSON 파싱 에러
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        log.warn("Message not readable: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("MESSAGE_NOT_READABLE")
                .message("요청 본문을 읽을 수 없습니다. JSON 형식을 확인해주세요.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 파일 크기 초과
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        
        log.warn("Upload size exceeded: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("UPLOAD_SIZE_EXCEEDED")
                .message("업로드 파일 크기가 제한을 초과했습니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorResponse);
    }

    // 핸들러 없음 (404)
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFoundException(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        log.warn("No handler found for: {} {}", ex.getHttpMethod(), ex.getRequestURL());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("ENDPOINT_NOT_FOUND")
                .message("요청한 엔드포인트를 찾을 수 없습니다.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse);
    }

    // 일반적인 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        
        log.error("Unexpected error occurred", ex);
        
        // 개발 환경에서는 상세 정보 제공
        String message = "내부 서버 오류가 발생했습니다.";
        String code = "INTERNAL_SERVER_ERROR";
        
        if (isDevMode()) {
            message = ex.getMessage();
            code = ex.getClass().getSimpleName();
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(code)
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    // 유틸리티 메서드들
    private ValidationError createValidationError(FieldError fieldError) {
        return ValidationError.builder()
                .field(fieldError.getField())
                .rejectedValue(fieldError.getRejectedValue())
                .message(fieldError.getDefaultMessage())
                .code(fieldError.getCode())
                .build();
    }

    private ValidationError createValidationError(ConstraintViolation<?> violation) {
        String fieldName = violation.getPropertyPath().toString();
        return ValidationError.builder()
                .field(fieldName)
                .rejectedValue(violation.getInvalidValue())
                .message(violation.getMessage())
                .code(violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName())
                .build();
    }

    private boolean isDevMode() {
        // 프로파일 또는 환경 변수로 개발 모드 확인
        return Arrays.asList(environment.getActiveProfiles()).contains("dev");
    }
}
```

#### 2.2 Custom Exception Classes

##### BusinessException.java
```java
package com.ows.demo.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {
    private final String code;
    private final HttpStatus httpStatus;
    private final Object details;

    public BusinessException(String code, String message) {
        this(code, message, HttpStatus.BAD_REQUEST, null);
    }

    public BusinessException(String code, String message, HttpStatus httpStatus) {
        this(code, message, httpStatus, null);
    }

    public BusinessException(String code, String message, HttpStatus httpStatus, Object details) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
    }

    public BusinessException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.details = null;
    }

    public BusinessException(String code, String message, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = null;
    }
}
```

## 🎯 결론

### ✅ **완전한 에러 처리 시스템**
1. **Frontend 에러 처리** - 전역 핸들러, API 에러, 네트워크 에러
2. **Backend 에러 처리** - 글로벌 예외 핸들러, 커스텀 예외
3. **사용자 친화적 메시지** - 다국어, 상황별 안내
4. **개발자 도구** - 로깅, 디버깅, 모니터링
5. **재시도 메커니즘** - 자동 재시도, 백오프 전략

### 🚀 **AI가 이제 생성 가능한 것**
- **견고한 에러 처리 시스템**
- **사용자 친화적 에러 메시지**
- **완전한 예외 처리 로직**
- **개발자 디버깅 도구**

이제 AI가 **화면 이미지 → 완전한 에러 처리 시스템**을 자동 생성할 수 있습니다! 🎉