# 🏗️ 코드 생성 구조 가이드

> AI가 **어디에** 어떤 파일을 생성할지 명확히 정의하는 완전 가이드

## 📌 개요

이 문서는 AI가 이미지 분석 후 **실제 파일을 어느 위치에 어떤 이름으로 생성할지**를 정의합니다.

### 🎯 **두 가지 생성 모드**
- **신규 프로젝트**: `generated-project/` 폴더에 완전한 프로젝트 생성
- **기존 프로젝트**: 현재 디렉토리에 파일 추가/수정

## 🆕 신규 프로젝트 생성 구조

### **1. 전체 프로젝트 구조**
```
generated-project/
├── README.md                       # 프로젝트 실행 가이드
├── .gitignore                      # Git 무시 파일
├── docker-compose.yml              # 개발환경 통합 실행
├── package.json                    # 루트 워크스페이스 설정
├── frontend/                       # 🎨 프론트엔드 애플리케이션
└── backend/                        # ⚙️ 백엔드 애플리케이션
```

### **2. Frontend 구조 (Vue 3 + TypeScript 기준)**
```
frontend/
├── package.json                    # 프론트엔드 의존성
├── vite.config.ts                  # Vite 빌드 설정
├── tsconfig.json                   # TypeScript 설정
├── index.html                      # HTML 엔트리포인트
├── .env                            # 환경변수
├── src/
│   ├── main.ts                     # Vue 앱 초기화
│   ├── App.vue                     # 루트 컴포넌트
│   ├── components/                 # 🔧 재사용 컴포넌트
│   │   ├── common/                   # 공통 컴포넌트
│   │   │   ├── OwButton.vue
│   │   │   ├── OwDataGrid.vue
│   │   │   └── OwModal.vue
│   │   └── {domain}/                 # 도메인별 컴포넌트
│   │       ├── ProductCard.vue
│   │       └── ProductFilter.vue
│   ├── views/                      # 📄 페이지 컴포넌트 (라우트별)
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   └── {domain}/                 # 도메인별 페이지
│   │       ├── ProductList.vue         # 상품 목록
│   │       ├── ProductDetail.vue       # 상품 상세
│   │       ├── ProductForm.vue         # 상품 등록/수정
│   │       └── ProductSearch.vue       # 상품 검색
│   ├── stores/                     # 🗄️ Pinia 상태 관리
│   │   ├── index.ts                  # 스토어 설정
│   │   ├── auth.ts                   # 인증 스토어
│   │   ├── ui.ts                     # UI 상태 스토어
│   │   └── {domain}.ts               # 도메인별 스토어
│   │       └── product.ts              # useProductStore
│   ├── api/                        # 🌐 API 클라이언트
│   │   ├── client.ts                 # 기본 HTTP 클라이언트 (axios/fetch)
│   │   ├── auth.ts                   # 인증 API
│   │   └── {domain}.ts               # 도메인별 API
│   │       └── product.ts              # productApi
│   ├── router/                     # 🛤️ Vue Router
│   │   ├── index.ts                  # 라우터 설정
│   │   ├── guards.ts                 # 라우트 가드 (인증 등)
│   │   └── {domain}.ts               # 도메인별 라우트
│   │       └── product.ts              # 상품 관련 라우트
│   ├── types/                      # 📝 TypeScript 타입 정의
│   │   ├── common.ts                 # 공통 타입
│   │   ├── api.ts                    # API 응답 타입
│   │   └── {domain}.ts               # 도메인별 타입
│   │       └── product.ts              # Product, ProductCreateRequest 등
│   ├── utils/                      # 🔧 유틸리티 함수
│   │   ├── format.ts                 # 포맷팅 함수
│   │   ├── validation.ts             # 검증 함수
│   │   └── constants.ts              # 상수 정의
│   ├── composables/                # 🎯 Vue Composables
│   │   ├── useAuth.ts                # 인증 관련
│   │   ├── useApi.ts                 # API 호출 관련
│   │   └── use{Domain}.ts            # 도메인별 Composable
│   ├── assets/                     # 🖼️ 정적 자원
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── main.css              # 메인 스타일
│   │       ├── variables.css         # CSS 변수
│   │       └── components.css        # 컴포넌트 스타일
│   └── __tests__/                  # 🧪 테스트 파일
│       ├── components/
│       ├── views/
│       └── stores/
├── public/                         # 정적 파일
│   └── favicon.ico
└── dist/                          # 빌드 결과물 (자동 생성)
```

### **3. Backend 구조 (Spring Boot + JPA 기준)**
```
backend/
├── pom.xml                         # Maven 의존성 설정
├── .env                            # 환경변수
├── Dockerfile                      # Docker 이미지 빌드
├── src/main/java/com/company/app/
│   ├── Application.java            # Spring Boot 메인 클래스
│   ├── config/                     # ⚙️ 설정 클래스
│   │   ├── SecurityConfig.java       # Spring Security 설정
│   │   ├── DatabaseConfig.java       # 데이터베이스 설정
│   │   ├── WebConfig.java            # 웹 설정 (CORS 등)
│   │   ├── SwaggerConfig.java        # API 문서 설정
│   │   └── CacheConfig.java          # 캐시 설정
│   ├── common/                     # 🔧 공통 모듈
│   │   ├── exception/                # 예외 처리
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── BusinessException.java
│   │   │   └── ErrorCode.java
│   │   ├── response/                 # 공통 응답 형식
│   │   │   ├── ApiResponse.java
│   │   │   ├── PageResponse.java
│   │   │   └── ErrorResponse.java
│   │   ├── util/                     # 유틸리티
│   │   │   ├── DateUtil.java
│   │   │   ├── StringUtil.java
│   │   │   └── SecurityUtil.java
│   │   ├── audit/                    # 감사 기능
│   │   │   ├── AuditConfig.java
│   │   │   └── AuditEntity.java
│   │   └── validation/               # 검증 어노테이션
│   │       ├── UniqueValidator.java
│   │       └── Unique.java
│   └── {domain}/                   # 📦 도메인별 패키지
│       ├── controller/               # 🎛️ REST API 컨트롤러
│       │   └── ProductController.java  # 상품 API
│       ├── service/                  # ⚙️ 비즈니스 로직
│       │   ├── ProductService.java     # 서비스 인터페이스
│       │   └── ProductServiceImpl.java # 서비스 구현체
│       ├── repository/               # 💾 데이터 접근 계층
│       │   ├── ProductRepository.java  # JPA Repository
│       │   └── ProductRepositoryCustom.java # 커스텀 쿼리
│       ├── entity/                   # 🏢 JPA 엔티티
│       │   ├── Product.java            # 상품 엔티티
│       │   ├── Category.java           # 카테고리 엔티티
│       │   └── ProductCategory.java    # 연관관계 엔티티
│       └── dto/                      # 📋 데이터 전송 객체
│           ├── request/                # 요청 DTO
│           │   ├── ProductCreateRequest.java
│           │   ├── ProductUpdateRequest.java
│           │   └── ProductSearchCriteria.java
│           └── response/               # 응답 DTO
│               ├── ProductResponse.java
│               ├── ProductListResponse.java
│               └── ProductDetailResponse.java
├── src/main/resources/
│   ├── application.yml             # 메인 설정 파일
│   ├── application-dev.yml         # 개발환경 설정
│   ├── application-prod.yml        # 운영환경 설정
│   ├── static/                     # 정적 파일
│   ├── templates/                  # 템플릿 파일 (Thymeleaf 등)
│   └── db/migration/               # 📊 데이터베이스 마이그레이션
│       ├── V1__Create_product_table.sql
│       └── V2__Add_category_table.sql
├── src/test/java/                  # 🧪 테스트 코드
│   ├── integration/                  # 통합 테스트
│   │   └── ProductControllerTest.java
│   ├── unit/                         # 단위 테스트
│   │   ├── service/
│   │   │   └── ProductServiceTest.java
│   │   └── repository/
│   │       └── ProductRepositoryTest.java
│   └── fixtures/                     # 테스트 데이터
│       └── ProductFixture.java
└── target/                         # 빌드 결과물 (자동 생성)
```

## 🔄 기존 프로젝트 통합 구조

### **기존 프로젝트 감지 규칙**
```yaml
프로젝트_타입_감지:
  frontend_only:
    감지: "package.json 존재 && pom.xml 없음"
    생성위치: "현재 디렉토리 기준"
    
  backend_only:
    감지: "pom.xml 존재 && package.json 없음"
    생성위치: "현재 디렉토리 기준"
    
  fullstack:
    감지: "package.json && pom.xml 모두 존재"
    생성위치: "기존 구조 유지"
    
  empty_directory:
    감지: "주요 설정파일 없음"
    생성위치: "신규 프로젝트 모드로 전환"
```

### **기존 프로젝트 파일 추가 규칙**

#### **Frontend 기존 프로젝트**
```yaml
기존_파일_위치:
  - "src/components/{domain}/" → 새 컴포넌트 추가
  - "src/views/{domain}/" → 새 페이지 추가
  - "src/stores/{domain}.ts" → 새 스토어 추가
  - "src/api/{domain}.ts" → 새 API 추가
  
기존_파일_수정:
  - "src/router/index.ts" → 새 라우트 추가
  - "src/main.ts" → 새 스토어 등록
  - "package.json" → 필요한 의존성 추가
```

#### **Backend 기존 프로젝트**
```yaml
기존_패키지_구조_분석:
  layer_based: "controller/, service/, repository/ 패키지"
  domain_based: "{domain}/ 패키지 내 하위 구조"
  
새_파일_생성_위치:
  layer_based:
    - "controller/{Entity}Controller.java"
    - "service/{Entity}Service.java"
    - "repository/{Entity}Repository.java"
    
  domain_based:
    - "{domain}/controller/{Entity}Controller.java"
    - "{domain}/service/{Entity}Service.java" 
    - "{domain}/repository/{Entity}Repository.java"
```

## 📝 도메인별 폴더 구조 예시

### **전자상거래 도메인**
```
# Frontend
src/views/ecommerce/
├── product/
│   ├── ProductList.vue         # 상품 목록
│   ├── ProductDetail.vue       # 상품 상세
│   ├── ProductForm.vue         # 상품 등록/수정
│   └── ProductSearch.vue       # 상품 검색
├── order/
│   ├── OrderList.vue           # 주문 목록
│   ├── OrderDetail.vue         # 주문 상세
│   └── OrderTracking.vue       # 주문 추적
├── cart/
│   └── CartView.vue            # 장바구니
└── payment/
    └── PaymentForm.vue         # 결제

# Backend
{rootPackage}/ecommerce/
├── product/
│   ├── controller/ProductController.java
│   ├── service/ProductService.java
│   ├── repository/ProductRepository.java
│   ├── entity/Product.java
│   └── dto/
├── order/
├── cart/
└── payment/
```

### **금융 도메인**
```
# Frontend  
src/views/financial/
├── account/
│   ├── AccountList.vue         # 계좌 목록
│   ├── AccountDetail.vue       # 계좌 상세
│   └── AccountTransfer.vue     # 계좌 이체
├── transaction/
│   ├── TransactionList.vue     # 거래 내역
│   └── TransactionDetail.vue   # 거래 상세
└── investment/

# Backend
{rootPackage}/financial/
├── account/
├── transaction/
└── investment/
```

## 🛠️ 설정 파일 생성 규칙

### **Frontend 설정 파일들**
```yaml
package.json:
  위치: "frontend/package.json"
  내용: "Vue 3, TypeScript, Vite 기본 설정 + 메타데이터 기반 의존성"

vite.config.ts:
  위치: "frontend/vite.config.ts"
  내용: "프록시 설정, 번들 최적화, path alias 설정"

tsconfig.json:
  위치: "frontend/tsconfig.json" 
  내용: "엄격한 타입 체크 + path mapping"

.env:
  위치: "frontend/.env"
  내용: "API URL, 환경별 설정"
```

### **Backend 설정 파일들**
```yaml
pom.xml:
  위치: "backend/pom.xml"
  내용: "Spring Boot 기본 + 메타데이터 기반 의존성"

application.yml:
  위치: "backend/src/main/resources/application.yml"
  내용: "다중 환경 설정, DB 연결, 보안 설정"

SecurityConfig.java:
  위치: "backend/src/main/java/.../config/SecurityConfig.java"
  내용: "메타데이터 기반 보안 설정"
```

## 🔍 실제 생성 명령어 및 결과

### **명령어 예시**
```bash
# 현재 위치: /my-workspace/
/ai-design ./product-screen.png full ecommerce

# 결과 1: 신규 프로젝트 (빈 디렉토리인 경우)
generated-project/
├── frontend/     # 완전한 Vue 프로젝트
└── backend/      # 완전한 Spring Boot 프로젝트

# 결과 2: 기존 프로젝트 (package.json 존재하는 경우)
src/views/ecommerce/ProductList.vue     # 새 파일 생성
src/stores/product.ts                   # 새 파일 생성
src/router/index.ts                     # 라우트 추가
```

### **생성된 파일 예시**
```typescript
// frontend/src/views/ecommerce/ProductList.vue
<template>
  <div class="product-list">
    <OwDataGrid 
      :data="productStore.productList"
      :loading="productStore.isLoading"
      @row-click="handleRowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { OwDataGrid } from '@/components/common'

const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProductList()
})

const handleRowClick = (product: Product) => {
  // 상품 상세로 이동
}
</script>
```

```java
// backend/src/main/java/.../ecommerce/controller/ProductController.java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "상품 관리 API")
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    @Operation(summary = "상품 목록 조회")
    public ResponseEntity<Page<ProductResponse>> getProductList(
            ProductSearchCriteria criteria,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getProductList(criteria, pageable));
    }
    
    @PostMapping
    @Operation(summary = "상품 등록")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }
}
```

## 📋 체크리스트

AI가 코드 생성 시 반드시 확인해야 할 사항들:

### **프로젝트 구조 체크**
- [ ] 기존 프로젝트 vs 신규 프로젝트 구분
- [ ] 메타데이터 기반 기술스택 확인  
- [ ] 도메인별 폴더 구조 적용
- [ ] 네이밍 컨벤션 일관성 유지

### **파일 생성 체크**
- [ ] 올바른 경로에 파일 생성
- [ ] 기존 파일 충돌 방지/병합
- [ ] import/export 연결 자동 처리
- [ ] 라우터/설정 파일 자동 업데이트

### **코드 품질 체크**
- [ ] TypeScript 타입 안전성
- [ ] ESLint/Prettier 규칙 준수
- [ ] 테스트 파일 함께 생성
- [ ] 실행 가능한 상태로 생성

---

이 가이드를 따르면 AI가 생성한 코드를 **즉시 실행**할 수 있는 완전한 프로젝트가 됩니다.