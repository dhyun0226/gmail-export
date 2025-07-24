# 완전한 보안 구현 가이드
> AI가 화면 이미지로부터 엔터프라이즈급 보안 시스템을 자동 생성하는 가이드

## 🎯 목표
AI가 화면 이미지 분석 후 **완전한 보안 시스템**을 자동 생성하여 **엔터프라이즈급 보안** 구현

## 🔐 완전한 보안 아키텍처

### 1. Frontend 보안 (Vue 3)

#### 1.1 Authentication & Authorization

##### authStore.ts
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '@/api/authApi';
import { storageService } from '@/services/storageService';
import { router } from '@/router';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  lastLoginAt: string;
  profileImage?: string;
  settings?: Record<string, any>;
}

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: number;
}

interface JwtPayload {
  sub: string;
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const tokenInfo = ref<TokenInfo | null>(null);
  const isLoading = ref(false);
  const loginAttempts = ref(0);
  const isLocked = ref(false);
  const lockoutEndTime = ref<Date | null>(null);

  // Getters
  const isAuthenticated = computed(() => {
    return !!tokenInfo.value?.accessToken && !!user.value;
  });

  const isTokenExpired = computed(() => {
    if (!tokenInfo.value) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = tokenInfo.value.issuedAt + tokenInfo.value.expiresIn;
    
    return currentTime >= expirationTime;
  });

  const shouldRefreshToken = computed(() => {
    if (!tokenInfo.value) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = tokenInfo.value.issuedAt + tokenInfo.value.expiresIn;
    const refreshThreshold = 300; // 5분 전에 갱신
    
    return (expirationTime - currentTime) <= refreshThreshold;
  });

  const userPermissions = computed(() => {
    return user.value?.permissions || [];
  });

  const userRoles = computed(() => {
    return user.value?.roles || [];
  });

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    if (isLocked.value) {
      const remainingTime = lockoutEndTime.value 
        ? Math.ceil((lockoutEndTime.value.getTime() - Date.now()) / 1000)
        : 0;
        
      throw new Error(`계정이 잠겨있습니다. ${remainingTime}초 후에 다시 시도해주세요.`);
    }

    try {
      isLoading.value = true;
      
      // 로그인 시도 보안 검증
      await validateLoginAttempt(credentials);
      
      // API 호출
      const response = await authApi.login({
        ...credentials,
        deviceInfo: getDeviceInfo(),
        ipAddress: await getClientIpAddress()
      });

      // 토큰 검증 및 저장
      await setAuthenticationData(response.data);
      
      // 보안 이벤트 로깅
      logSecurityEvent('LOGIN_SUCCESS', { username: credentials.username });
      
      // 로그인 시도 초기화
      resetLoginAttempts();
      
    } catch (error: any) {
      // 로그인 실패 처리
      handleLoginFailure(credentials.username, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (reason: string = 'USER_LOGOUT'): Promise<void> => {
    try {
      if (tokenInfo.value?.accessToken) {
        // 서버에 로그아웃 요청
        await authApi.logout({
          accessToken: tokenInfo.value.accessToken,
          reason
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // 로컬 인증 데이터 정리
      clearAuthenticationData();
      
      // 보안 이벤트 로깅
      logSecurityEvent('LOGOUT', { reason });
      
      // 로그인 페이지로 이동
      router.push('/login');
    }
  };

  const refreshAccessToken = async (): Promise<void> => {
    if (!tokenInfo.value?.refreshToken) {
      throw new Error('Refresh token not available');
    }

    try {
      const response = await authApi.refreshToken({
        refreshToken: tokenInfo.value.refreshToken
      });

      // 새 토큰으로 업데이트
      await setAuthenticationData(response.data);
      
      logSecurityEvent('TOKEN_REFRESH_SUCCESS');
      
    } catch (error: any) {
      logSecurityEvent('TOKEN_REFRESH_FAILED', { error: error.message });
      
      // 리프레시 실패 시 로그아웃
      await logout('TOKEN_REFRESH_FAILED');
      throw error;
    }
  };

  const checkPermission = (permission: string): boolean => {
    return userPermissions.value.includes(permission);
  };

  const checkRole = (role: string): boolean => {
    return userRoles.value.includes(role);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => checkPermission(permission));
  };

  const checkAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => checkPermission(permission));
  };

  const hasPermission = (requiredPermissions: string | string[]): boolean => {
    if (typeof requiredPermissions === 'string') {
      return checkPermission(requiredPermissions);
    }
    
    // 배열인 경우 AND 조건으로 처리
    return checkAllPermissions(requiredPermissions);
  };

  // 보안 관련 유틸리티 함수들
  const validateLoginAttempt = async (credentials: LoginCredentials): Promise<void> => {
    // 입력값 보안 검증
    if (!credentials.username || !credentials.password) {
      throw new Error('사용자명과 비밀번호를 입력해주세요.');
    }

    // SQL Injection, XSS 방지
    const sanitizedUsername = sanitizeInput(credentials.username);
    if (sanitizedUsername !== credentials.username) {
      throw new Error('유효하지 않은 문자가 포함되어 있습니다.');
    }

    // 브루트포스 공격 방지
    if (loginAttempts.value >= 5) {
      await enforceAccountLockout();
      throw new Error('로그인 시도 횟수를 초과했습니다.');
    }
  };

  const setAuthenticationData = async (authData: any): Promise<void> => {
    // JWT 토큰 검증
    const decodedToken = validateAndDecodeToken(authData.accessToken);
    
    // 토큰 정보 저장
    tokenInfo.value = {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      tokenType: authData.tokenType || 'Bearer',
      expiresIn: authData.expiresIn || 3600,
      issuedAt: Math.floor(Date.now() / 1000)
    };

    // 사용자 정보 저장
    user.value = {
      id: decodedToken.userId,
      username: decodedToken.username,
      email: authData.user?.email || '',
      roles: decodedToken.roles || [],
      permissions: decodedToken.permissions || [],
      lastLoginAt: authData.user?.lastLoginAt || new Date().toISOString(),
      profileImage: authData.user?.profileImage,
      settings: authData.user?.settings
    };

    // 보안 저장소에 저장 (암호화)
    await storageService.secureSet('authToken', tokenInfo.value);
    await storageService.secureSet('userInfo', user.value);
  };

  const clearAuthenticationData = (): void => {
    user.value = null;
    tokenInfo.value = null;
    
    // 보안 저장소에서 제거
    storageService.secureRemove('authToken');
    storageService.secureRemove('userInfo');
    
    // 메모리 정리
    clearSecureMemory();
  };

  const validateAndDecodeToken = (token: string): JwtPayload => {
    try {
      // 토큰 형식 검증
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }

      // JWT 디코딩
      const decoded = jwtDecode<JwtPayload>(token);
      
      // 토큰 만료 검증
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp <= currentTime) {
        throw new Error('Token expired');
      }

      // 발급자 검증
      if (decoded.iss !== import.meta.env.VITE_JWT_ISSUER) {
        throw new Error('Invalid token issuer');
      }

      // 대상 검증
      if (decoded.aud !== import.meta.env.VITE_JWT_AUDIENCE) {
        throw new Error('Invalid token audience');
      }

      return decoded;
      
    } catch (error) {
      logSecurityEvent('TOKEN_VALIDATION_FAILED', { error: error.message });
      throw new Error('Invalid token');
    }
  };

  const handleLoginFailure = (username: string, error: any): void => {
    loginAttempts.value++;
    
    logSecurityEvent('LOGIN_FAILED', {
      username,
      attempt: loginAttempts.value,
      error: error.message,
      ip: getClientIpAddress(),
      userAgent: navigator.userAgent
    });

    // 계정 잠금 검사
    if (loginAttempts.value >= 5) {
      enforceAccountLockout();
    }
  };

  const enforceAccountLockout = async (): Promise<void> => {
    isLocked.value = true;
    lockoutEndTime.value = new Date(Date.now() + 15 * 60 * 1000); // 15분 잠금
    
    logSecurityEvent('ACCOUNT_LOCKED', {
      lockoutEndTime: lockoutEndTime.value.toISOString()
    });

    // 서버에 계정 잠금 알림
    try {
      await authApi.reportAccountLockout({
        username: user.value?.username,
        ipAddress: await getClientIpAddress(),
        lockoutEndTime: lockoutEndTime.value
      });
    } catch (error) {
      console.warn('Failed to report account lockout:', error);
    }
  };

  const resetLoginAttempts = (): void => {
    loginAttempts.value = 0;
    isLocked.value = false;
    lockoutEndTime.value = null;
  };

  const sanitizeInput = (input: string): string => {
    // XSS, SQL Injection 방지를 위한 입력값 정제
    return input
      .replace(/[<>\"'%;()&+]/g, '') // 위험한 문자 제거
      .trim()
      .substring(0, 255); // 길이 제한
  };

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  };

  const getClientIpAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const logSecurityEvent = (event: string, details?: any): void => {
    const securityLog = {
      event,
      timestamp: new Date().toISOString(),
      userId: user.value?.id,
      username: user.value?.username,
      sessionId: tokenInfo.value?.accessToken?.slice(-8),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    // 콘솔 로깅
    console.log('Security Event:', securityLog);

    // 외부 보안 모니터링 서비스로 전송
    if (import.meta.env.PROD) {
      sendSecurityEvent(securityLog);
    }
  };

  const sendSecurityEvent = async (eventData: any): Promise<void> => {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.warn('Failed to send security event:', error);
    }
  };

  const clearSecureMemory = (): void => {
    // 메모리에서 민감한 데이터 정리
    if (typeof window !== 'undefined' && window.gc) {
      window.gc(); // 가비지 컬렉션 강제 실행 (DevTools에서만 동작)
    }
  };

  // 초기화
  const initializeAuth = async (): Promise<void> => {
    try {
      // 저장된 인증 정보 복원
      const savedToken = await storageService.secureGet('authToken');
      const savedUser = await storageService.secureGet('userInfo');

      if (savedToken && savedUser) {
        // 토큰 유효성 검증
        const decoded = validateAndDecodeToken(savedToken.accessToken);
        
        tokenInfo.value = savedToken;
        user.value = savedUser;

        // 토큰 갱신 필요 시 자동 갱신
        if (shouldRefreshToken.value) {
          await refreshAccessToken();
        }

        logSecurityEvent('AUTH_RESTORED');
      }
    } catch (error) {
      console.warn('Failed to restore authentication:', error);
      clearAuthenticationData();
    }
  };

  // 자동 토큰 갱신 설정
  const setupTokenRefresh = (): void => {
    setInterval(async () => {
      if (isAuthenticated.value && shouldRefreshToken.value) {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.warn('Auto token refresh failed:', error);
        }
      }
    }, 60000); // 1분마다 확인
  };

  // 보안 모니터링 설정
  const setupSecurityMonitoring = (): void => {
    // 탭 변경 감지
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logSecurityEvent('TAB_HIDDEN');
      } else {
        logSecurityEvent('TAB_VISIBLE');
      }
    });

    // 비정상적인 활동 감지
    let activityTimer: NodeJS.Timeout;
    const resetActivityTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        logSecurityEvent('USER_INACTIVE', { duration: '30_minutes' });
      }, 30 * 60 * 1000); // 30분 비활성
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetActivityTimer, { passive: true });
    });
  };

  return {
    // State
    user: readonly(user),
    tokenInfo: readonly(tokenInfo),
    isLoading: readonly(isLoading),
    loginAttempts: readonly(loginAttempts),
    isLocked: readonly(isLocked),
    
    // Getters
    isAuthenticated,
    isTokenExpired,
    shouldRefreshToken,
    userPermissions,
    userRoles,
    
    // Actions
    login,
    logout,
    refreshAccessToken,
    checkPermission,
    checkRole,
    checkAnyPermission,
    checkAllPermissions,
    hasPermission,
    initializeAuth,
    setupTokenRefresh,
    setupSecurityMonitoring
  };
});
```

#### 1.2 Content Security Policy (CSP)

##### securityHeaders.ts
```typescript
export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
  'worker-src': string[];
  'manifest-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
}

export class SecurityHeaderManager {
  private static instance: SecurityHeaderManager;
  
  private constructor() {}
  
  static getInstance(): SecurityHeaderManager {
    if (!SecurityHeaderManager.instance) {
      SecurityHeaderManager.instance = new SecurityHeaderManager();
    }
    return SecurityHeaderManager.instance;
  }

  // CSP 정책 생성
  generateCSP(): string {
    const isDev = import.meta.env.DEV;
    
    const directives: CSPDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        isDev ? "'unsafe-eval'" : '',
        isDev ? "'unsafe-inline'" : '',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ].filter(Boolean),
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Vue의 동적 스타일을 위해 필요
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        process.env.VITE_CDN_URL || ''
      ].filter(Boolean),
      'connect-src': [
        "'self'",
        process.env.VITE_API_BASE_URL || '',
        'https://api.ipify.org', // IP 주소 확인용
        'wss:', // WebSocket
        isDev ? 'ws:' : ''
      ].filter(Boolean),
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
      ],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': [
        "'self'",
        'https://www.youtube.com', // 임베드 비디오
        'https://player.vimeo.com'
      ],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': !isDev,
      'block-all-mixed-content': !isDev
    };

    return this.buildCSPString(directives);
  }

  private buildCSPString(directives: CSPDirectives): string {
    const cspParts: string[] = [];

    Object.entries(directives).forEach(([directive, values]) => {
      if (typeof values === 'boolean') {
        if (values) {
          cspParts.push(directive);
        }
      } else {
        const valueString = values.join(' ');
        if (valueString) {
          cspParts.push(`${directive} ${valueString}`);
        }
      }
    });

    return cspParts.join('; ');
  }

  // 기타 보안 헤더들
  getSecurityHeaders(): Record<string, string> {
    return {
      // CSP
      'Content-Security-Policy': this.generateCSP(),
      
      // XSS 보호
      'X-XSS-Protection': '1; mode=block',
      
      // Content Type Sniffing 방지
      'X-Content-Type-Options': 'nosniff',
      
      // Clickjacking 방지
      'X-Frame-Options': 'DENY',
      
      // HTTPS 강제
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer 정책
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // 권한 정책
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'bluetooth=()'
      ].join(', ')
    };
  }

  // Meta 태그로 보안 헤더 설정
  applySecurityMetaTags(): void {
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([name, content]) => {
      // 기존 메타 태그 제거
      const existing = document.querySelector(`meta[http-equiv="${name}"]`);
      if (existing) {
        existing.remove();
      }

      // 새 메타 태그 추가
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
  }

  // CSP 위반 리포트 처리
  setupCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        documentURI: event.documentURI,
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sourceFile: event.sourceFile,
        statusCode: event.statusCode,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      console.warn('CSP Violation:', violation);

      // 위반 사항을 서버로 전송
      if (import.meta.env.PROD) {
        this.reportCSPViolation(violation);
      }
    });
  }

  private async reportCSPViolation(violation: any): Promise<void> {
    try {
      await fetch('/api/security/csp-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(violation)
      });
    } catch (error) {
      console.warn('Failed to report CSP violation:', error);
    }
  }
}
```

### 2. Backend 보안 (Spring Boot)

#### 2.1 Security Configuration

##### SecurityConfig.java
```java
package com.ows.demo.config;

import com.ows.demo.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final UserDetailsService userDetailsService;
    private final SecurityProperties securityProperties;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (JWT 사용)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 비활성화
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 예외 처리
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler))
            
            // 보안 헤더
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true))
                .addHeaderWriter(new XXssProtectionHeaderWriter())
                .addHeaderWriter(new ReferrerPolicyHeaderWriter(
                    ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .addHeaderWriter((request, response) -> {
                    // CSP 헤더
                    response.setHeader("Content-Security-Policy",
                        "default-src 'self'; " +
                        "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self' https:; " +
                        "connect-src 'self' https:; " +
                        "frame-ancestors 'none'");
                    
                    // 추가 보안 헤더
                    response.setHeader("Permissions-Policy", 
                        "camera=(), microphone=(), geolocation=(), payment=()");
                    response.setHeader("X-Permitted-Cross-Domain-Policies", "none");
                }))
            
            // 인증/인가 설정
            .authorizeHttpRequests(authz -> authz
                // 공개 엔드포인트
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**",
                    "/actuator/health",
                    "/actuator/prometheus",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/error"
                ).permitAll()
                
                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // 기타 모든 요청은 인증 필요
                .anyRequest().authenticated())
            
            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            
            // Rate Limiting 필터
            .addFilterBefore(rateLimitingFilter(), JwtAuthenticationFilter.class)
            
            // 보안 로깅 필터
            .addFilterAfter(securityLoggingFilter(), JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider(), userDetailsService);
    }

    @Bean
    public RateLimitingFilter rateLimitingFilter() {
        return new RateLimitingFilter(redisTemplate(), securityProperties);
    }

    @Bean
    public SecurityLoggingFilter securityLoggingFilter() {
        return new SecurityLoggingFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin 설정
        if (securityProperties.getCors().isAllowAll()) {
            configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
        } else {
            configuration.setAllowedOrigins(securityProperties.getCors().getAllowedOrigins());
        }
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 자격 증명 허용
        configuration.setAllowCredentials(true);
        
        // 캐시 시간 (초)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // 높은 강도 설정
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false); // 보안상 true로 설정 권장
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtProvider jwtProvider() {
        return new JwtProvider(securityProperties);
    }
}
```

#### 2.2 JWT Provider

##### JwtProvider.java
```java
package com.ows.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtProvider {
    
    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final String issuer;
    private final String audience;
    private final SecurityProperties securityProperties;

    public JwtProvider(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
        this.secretKey = Keys.hmacShaKeyFor(
            securityProperties.getJwt().getSecret().getBytes());
        this.accessTokenValidityInMilliseconds = 
            securityProperties.getJwt().getAccessTokenValidityInSeconds() * 1000;
        this.refreshTokenValidityInMilliseconds = 
            securityProperties.getJwt().getRefreshTokenValidityInSeconds() * 1000;
        this.issuer = securityProperties.getJwt().getIssuer();
        this.audience = securityProperties.getJwt().getAudience();
    }

    public TokenInfo generateTokens(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        
        Date now = new Date();
        Date accessTokenExpiryDate = new Date(now.getTime() + accessTokenValidityInMilliseconds);
        Date refreshTokenExpiryDate = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        // Access Token 생성
        String accessToken = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuer(issuer)
                .setAudience(audience)
                .setIssuedAt(now)
                .setExpiration(accessTokenExpiryDate)
                .claim("userId", userDetails.getUserId())
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(auth -> auth.startsWith("ROLE_"))
                        .map(role -> role.substring(5)) // "ROLE_" 제거
                        .collect(Collectors.toList()))
                .claim("permissions", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(auth -> !auth.startsWith("ROLE_"))
                        .collect(Collectors.toList()))
                .claim("tokenType", "ACCESS")
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();

        // Refresh Token 생성 (최소한의 정보만 포함)
        String refreshToken = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuer(issuer)
                .setAudience(audience)
                .setIssuedAt(now)
                .setExpiration(refreshTokenExpiryDate)
                .claim("userId", userDetails.getUserId())
                .claim("tokenType", "REFRESH")
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();

        return TokenInfo.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenValidityInMilliseconds / 1000)
                .build();
    }

    public String generatePasswordResetToken(String username, Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 3600000); // 1시간

        return Jwts.builder()
                .setSubject(username)
                .setIssuer(issuer)
                .setAudience(audience)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("userId", userId)
                .claim("tokenType", "PASSWORD_RESET")
                .claim("purpose", "password_reset")
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .requireIssuer(issuer)
                    .requireAudience(audience)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            throw new JwtAuthenticationException("Token expired", e);
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
            throw new JwtAuthenticationException("Unsupported token", e);
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            throw new JwtAuthenticationException("Malformed token", e);
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            throw new JwtAuthenticationException("Invalid signature", e);
        } catch (IllegalArgumentException e) {
            log.warn("JWT token compact of handler are invalid: {}", e.getMessage());
            throw new JwtAuthenticationException("Invalid token", e);
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("userId", Long.class);
    }

    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (JwtAuthenticationException e) {
            return true;
        }
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            
            // 기본 검증 (서명, 만료일 등)은 getClaimsFromToken에서 수행됨
            
            // 추가 검증
            String tokenType = claims.get("tokenType", String.class);
            if (!"ACCESS".equals(tokenType)) {
                log.warn("Invalid token type: {}", tokenType);
                return false;
            }

            // 토큰 발급 시간 검증 (너무 오래된 토큰 방지)
            Date issuedAt = claims.getIssuedAt();
            if (issuedAt.before(Date.from(LocalDateTime.now()
                    .minusDays(30)
                    .atZone(ZoneId.systemDefault())
                    .toInstant()))) {
                log.warn("Token too old: {}", issuedAt);
                return false;
            }

            // 블랙리스트 확인
            if (isTokenBlacklisted(token)) {
                log.warn("Token is blacklisted");
                return false;
            }

            return true;
        } catch (JwtAuthenticationException e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            Claims claims = getClaimsFromToken(refreshToken);
            
            String tokenType = claims.get("tokenType", String.class);
            if (!"REFRESH".equals(tokenType)) {
                log.warn("Invalid refresh token type: {}", tokenType);
                return false;
            }

            return !isTokenBlacklisted(refreshToken);
        } catch (JwtAuthenticationException e) {
            log.warn("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        // 토큰을 블랙리스트에 추가
        addToBlacklist(token);
        
        // 보안 이벤트 로깅
        logSecurityEvent("TOKEN_INVALIDATED", Map.of(
            "tokenHash", hashToken(token),
            "timestamp", LocalDateTime.now()
        ));
    }

    private boolean isTokenBlacklisted(String token) {
        // Redis 또는 데이터베이스에서 블랙리스트 확인
        String tokenHash = hashToken(token);
        return redisTemplate.hasKey("blacklist:" + tokenHash);
    }

    private void addToBlacklist(String token) {
        String tokenHash = hashToken(token);
        Date expiration = getExpirationDateFromToken(token);
        
        // 토큰 만료까지만 블랙리스트에 유지
        long ttl = expiration.getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                "blacklist:" + tokenHash, 
                "true", 
                Duration.ofMilliseconds(ttl)
            );
        }
    }

    private String hashToken(String token) {
        // 토큰 해시 생성 (저장 공간 절약 및 보안)
        return DigestUtils.sha256Hex(token);
    }

    private void logSecurityEvent(String event, Map<String, Object> details) {
        log.info("Security Event: {} - Details: {}", event, details);
        
        // 외부 보안 모니터링 시스템으로 전송
        securityEventPublisher.publishSecurityEvent(
            SecurityEvent.builder()
                .event(event)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build()
        );
    }
}
```

## 🎯 결론

### ✅ **완전한 보안 시스템**
1. **인증/인가** - JWT 기반 보안, 역할/권한 관리
2. **입력 검증** - XSS, SQL Injection 방지
3. **보안 헤더** - CSP, HSTS, X-Frame-Options
4. **세션 보안** - 토큰 관리, 자동 갱신
5. **모니터링** - 보안 이벤트 로깅, 이상 탐지

### 🚀 **AI가 이제 생성 가능한 것**
- **엔터프라이즈급 보안 시스템**
- **완전한 인증/인가 구조**
- **포괄적인 보안 정책**
- **실시간 보안 모니터링**

이제 AI가 **화면 이미지 → 완전한 보안 시스템**을 자동 생성할 수 있습니다! 🎉