# 🚀 프론트엔드 최적화 및 문서화 가이드

## 1. 번들 최적화

### 1.1 코드 스플리팅
```typescript
// React - Lazy Loading
// domains/user/routes/userRoutes.tsx
import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';

// 동적 import로 번들 분리
const UserProfile = lazy(() => 
  import('../components/UserProfile')
);
const UserSettings = lazy(() => 
  import('../components/UserSettings')
);

export const userRoutes = [
  <Route 
    path="/user/profile" 
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    } 
  />,
  <Route 
    path="/user/settings" 
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <UserSettings />
      </Suspense>
    } 
  />
];
```

### 1.2 Vue3 - 동적 컴포넌트
```typescript
// domains/user/routes/userRoutes.ts
export const userRoutes = [
  {
    path: '/user/profile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/settings',
    component: () => import('../views/UserSettings.vue'),
    meta: { requiresAuth: true }
  }
];
```

### 1.3 Webpack 최적화 설정
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 벤더 번들
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // 공통 컴포넌트 번들
        common: {
          test: /[\\/]common[\\/]/,
          name: 'common',
          priority: 5,
          minChunks: 2
        },
        // 도메인별 번들
        domains: {
          test: /[\\/]domains[\\/]/,
          name(module) {
            const match = module.context.match(/[\\/]domains[\\/](.*?)[\\/]/);
            return match ? `domain-${match[1]}` : 'domain-shared';
          },
          priority: 3
        }
      }
    },
    // Tree shaking
    usedExports: true,
    // 모듈 연결
    concatenateModules: true,
    // 압축
    minimize: true
  }
};
```

### 1.4 Vite 최적화 설정
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 상태 관리
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // UI 라이브러리
          'ui-vendor': ['antd', '@ant-design/icons'],
          // 유틸리티
          'utils': ['lodash-es', 'date-fns', 'axios']
        }
      }
    },
    // 청크 크기 경고
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    // 번들 분석
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

## 2. 성능 최적화

### 2.1 이미지 최적화
```typescript
// common/components/OptimizedImage.tsx
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder = '/images/placeholder.jpg'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);

  useEffect(() => {
    if (!lazy || isInView) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
    }
  }, [src, lazy, isInView]);

  useEffect(() => {
    if (lazy) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        },
        { threshold: 0.1 }
      );

      const element = document.getElementById(`img-${src}`);
      if (element) observer.observe(element);

      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [src, lazy]);

  return (
    <div id={`img-${src}`} className="image-container">
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        className={isLoading ? 'loading' : 'loaded'}
      />
    </div>
  );
};
```

### 2.2 리스트 가상화
```typescript
// domains/product/components/VirtualProductList.tsx
import { FixedSizeList as List } from 'react-window';
import { ProductCard } from './ProductCard';

interface VirtualProductListProps {
  products: Product[];
  itemHeight: number;
  windowHeight: number;
}

export const VirtualProductList: React.FC<VirtualProductListProps> = ({
  products,
  itemHeight = 280,
  windowHeight = 600
}) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );

  return (
    <List
      height={windowHeight}
      itemCount={products.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 2.3 메모이제이션 최적화
```typescript
// domains/user/components/UserList.tsx
import { useMemo, useCallback, memo } from 'react';

// Props 비교 함수
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.users.length === nextProps.users.length &&
    prevProps.filter === nextProps.filter
  );
};

// 메모이제이션된 컴포넌트
export const UserList = memo(({ users, filter, onUserClick }) => {
  // 필터링된 사용자 목록 메모이제이션
  const filteredUsers = useMemo(() => {
    if (!filter) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  // 클릭 핸들러 메모이제이션
  const handleClick = useCallback((userId: string) => {
    onUserClick(userId);
  }, [onUserClick]);

  return (
    <div className="user-list">
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => handleClick(user.id)}
        />
      ))}
    </div>
  );
}, areEqual);
```

## 3. 런타임 성능 최적화

### 3.1 디바운싱/쓰로틀링
```typescript
// common/hooks/useOptimizedCallback.ts
import { useCallback, useRef } from 'react';

export const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export const useThrottle = (callback: Function, delay: number) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// 사용 예시
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce((term: string) => {
    // API 호출
    searchApi.search(term);
  }, 300);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return <input value={searchTerm} onChange={handleChange} />;
};
```

### 3.2 Web Workers 활용
```typescript
// common/workers/dataProcessor.worker.ts
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'PROCESS_LARGE_DATA':
      const processed = processLargeDataSet(data);
      self.postMessage({ type: 'PROCESSED', data: processed });
      break;
    
    case 'CALCULATE_STATISTICS':
      const stats = calculateStatistics(data);
      self.postMessage({ type: 'STATISTICS', data: stats });
      break;
  }
});

function processLargeDataSet(data: any[]) {
  // 무거운 데이터 처리
  return data.map(item => ({
    ...item,
    processed: true,
    score: calculateScore(item)
  }));
}

// Hook으로 래핑
export const useWebWorker = () => {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/dataProcessor.worker.ts', import.meta.url)
    );
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processData = useCallback((data: any[]) => {
    return new Promise((resolve) => {
      workerRef.current?.postMessage({ type: 'PROCESS_LARGE_DATA', data });
      
      workerRef.current?.addEventListener('message', (event) => {
        if (event.data.type === 'PROCESSED') {
          resolve(event.data.data);
        }
      });
    });
  }, []);

  return { processData };
};
```

## 4. 캐싱 전략

### 4.1 Service Worker 캐싱
```javascript
// public/service-worker.js
const CACHE_NAME = 'app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/images/logo.png'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 네트워크 우선, 캐시 폴백
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 응답 복제 후 캐시 저장
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request);
      })
  );
});
```

### 4.2 React Query 캐싱
```typescript
// common/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 캐시 시간: 5분
      staleTime: 5 * 60 * 1000,
      // 캐시 유지 시간: 10분
      cacheTime: 10 * 60 * 1000,
      // 백그라운드 리페치
      refetchOnWindowFocus: false,
      // 재시도
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

// 도메인별 캐시 설정
export const cacheConfig = {
  user: {
    profile: {
      staleTime: 10 * 60 * 1000, // 10분
      cacheTime: 30 * 60 * 1000  // 30분
    },
    list: {
      staleTime: 1 * 60 * 1000,  // 1분
      cacheTime: 5 * 60 * 1000   // 5분
    }
  },
  product: {
    detail: {
      staleTime: 30 * 60 * 1000, // 30분
      cacheTime: 60 * 60 * 1000  // 1시간
    }
  }
};
```

## 5. SEO 최적화

### 5.1 메타 태그 관리
```typescript
// common/hooks/useMetaTags.ts
import { useEffect } from 'react';

interface MetaTags {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

export const useMetaTags = (tags: MetaTags) => {
  useEffect(() => {
    // Title
    document.title = tags.title;

    // Meta tags
    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Property tags (Open Graph)
    const setPropertyTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (tags.description) setMetaTag('description', tags.description);
    if (tags.keywords) setMetaTag('keywords', tags.keywords);
    if (tags.ogTitle) setPropertyTag('og:title', tags.ogTitle);
    if (tags.ogDescription) setPropertyTag('og:description', tags.ogDescription);
    if (tags.ogImage) setPropertyTag('og:image', tags.ogImage);
    if (tags.twitterCard) setMetaTag('twitter:card', tags.twitterCard);
  }, [tags]);
};

// 사용 예시
const ProductDetailPage = ({ product }) => {
  useMetaTags({
    title: `${product.name} - My Store`,
    description: product.description,
    ogTitle: product.name,
    ogDescription: product.description,
    ogImage: product.imageUrl
  });

  return <ProductDetail product={product} />;
};
```

### 5.2 구조화된 데이터
```typescript
// common/components/StructuredData.tsx
interface StructuredDataProps {
  type: 'Product' | 'Article' | 'Organization';
  data: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images,
          brand: {
            '@type': 'Brand',
            name: data.brand
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: data.currency,
            availability: data.inStock ? 'InStock' : 'OutOfStock'
          }
        };
      // 다른 타입들...
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
    />
  );
};
```

## 6. 모니터링 및 분석

### 6.1 성능 모니터링
```typescript
// common/utils/performance.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark) || 0;
    const end = endMark ? (this.marks.get(endMark) || performance.now()) : performance.now();
    
    const duration = end - start;
    
    // 분석 도구로 전송
    this.sendMetric({
      name,
      duration,
      timestamp: new Date().toISOString()
    });

    return duration;
  }

  private sendMetric(metric: any) {
    // Google Analytics, Sentry 등으로 전송
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: metric.name,
        value: Math.round(metric.duration)
      });
    }
  }
}

// 사용 예시
const perfMonitor = new PerformanceMonitor();

// 컴포넌트 렌더링 시간 측정
export const measureComponentPerformance = (ComponentName: string) => {
  return (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
      useEffect(() => {
        perfMonitor.mark(`${ComponentName}-mount-start`);
        
        return () => {
          perfMonitor.measure(
            `${ComponentName}-render`,
            `${ComponentName}-mount-start`
          );
        };
      }, []);

      return <WrappedComponent {...props} />;
    };
  };
};
```

## 7. 문서화

### 7.1 도메인별 README
```markdown
# User Domain

## 개요
사용자 관련 모든 기능을 담당하는 도메인입니다.

## 구조
```
user/
├── components/      # UI 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── store/          # 상태 관리
├── types/          # 타입 정의
└── utils/          # 유틸리티
```

## 주요 컴포넌트

### UserProfile
사용자 프로필을 표시하는 컴포넌트

**Props:**
- `userId: string` - 사용자 ID
- `editable?: boolean` - 편집 가능 여부

**사용 예시:**
```tsx
<UserProfile userId="123" editable={true} />
```

## API 서비스

### userApi
- `login(credentials)` - 로그인
- `logout()` - 로그아웃
- `getProfile(userId)` - 프로필 조회
- `updateProfile(userId, data)` - 프로필 수정

## 상태 관리

### userSlice
- `currentUser` - 현재 로그인한 사용자
- `users` - 사용자 목록
- `loading` - 로딩 상태
```

### 7.2 Storybook 문서
```typescript
// domains/user/components/UserProfile.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Domains/User/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '사용자 프로필을 표시하는 컴포넌트입니다.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      description: '사용자 정보 객체'
    },
    editable: {
      description: '편집 가능 여부',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://via.placeholder.com/150'
    }
  }
};

export const Editable: Story = {
  args: {
    ...Default.args,
    editable: true
  }
};

export const Loading: Story = {
  args: {
    user: null,
    loading: true
  }
};
```

## 8. 최종 체크리스트

### 8.1 최적화 완료 항목
```markdown
## 성능 최적화 체크리스트

### 번들 최적화
- [x] 코드 스플리팅 적용
- [x] Tree shaking 확인
- [x] 동적 import 사용
- [x] 번들 분석 완료

### 런타임 최적화
- [x] 컴포넌트 메모이제이션
- [x] 리스트 가상화
- [x] 이미지 lazy loading
- [x] 디바운싱/쓰로틀링

### 네트워크 최적화
- [x] HTTP 캐싱 헤더
- [x] Service Worker 캐싱
- [x] API 응답 캐싱
- [x] CDN 활용

### SEO/접근성
- [x] 메타 태그 최적화
- [x] 구조화된 데이터
- [x] 시맨틱 HTML
- [x] ARIA 레이블
```

### 8.2 배포 준비
```bash
# 최종 빌드
npm run build

# 빌드 분석
npm run analyze

# 배포 전 체크
- [ ] 환경 변수 설정
- [ ] 에러 추적 설정 (Sentry)
- [ ] 분석 도구 설정 (GA)
- [ ] 성능 모니터링 설정
```

## 9. 리팩토링 완료

### 9.1 최종 결과
- 도메인 기반 구조 완성
- 성능 목표 달성
- 코드 품질 개선
- 문서화 완료

### 9.2 향후 계획
- 지속적인 모니터링
- 점진적 개선
- 새로운 기능 추가 시 구조 준수