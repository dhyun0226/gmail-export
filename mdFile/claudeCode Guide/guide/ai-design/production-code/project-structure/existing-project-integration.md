# 🔄 기존 프로젝트 통합 가이드

> 기존 프로젝트에 새로운 기능을 **안전하고 일관되게** 추가하는 완전 가이드

## 📌 개요

이 문서는 AI가 **이미 개발된 프로젝트**에 새로운 기능을 추가할 때, 기존 코드와 충돌 없이 완벽하게 통합하는 방법을 정의합니다.

## 🔍 **1단계: 기존 프로젝트 분석**

### **프로젝트 구조 자동 분석**
```yaml
폴더구조_분석:
  Frontend:
    Vue감지: "src/components/, src/views/, src/stores/ 존재"
    React감지: "src/components/, src/pages/, src/hooks/ 존재"
    Angular감지: "src/app/ 구조"
    
  Backend:
    SpringBoot감지: "src/main/java/ 구조 + pom.xml"
    Express감지: "src/ + package.json + express 의존성"
    Django감지: "manage.py + apps/ 구조"

코딩스타일_분석:
  네이밍컨벤션: "기존 파일명 패턴 분석"
  들여쓰기: "기존 코드의 space/tab 패턴"
  구조패턴: "폴더 구조 일관성 확인"
```

### **기존 코드 패턴 추출**
```yaml
컴포넌트_패턴:
  Vue: "Composition API vs Options API"
  React: "Functional vs Class Component"
  스타일링: "Styled Components vs CSS Modules vs SCSS"
  
API_패턴:
  호출방식: "axios vs fetch vs custom client"
  에러처리: "try-catch vs .catch() vs custom handler"
  상태관리: "Redux vs Zustand vs Context API"

백엔드_패턴:
  패키지구조: "domain-based vs layer-based"
  네이밍: "camelCase vs snake_case"
  어노테이션: "@RestController vs @Controller"
```

## 🛠️ **2단계: 안전한 파일 추가 전략**

### **신규 파일 생성 규칙**
```yaml
Frontend_신규파일:
  컴포넌트:
    위치결정: "기존 폴더 구조 패턴 따름"
    예시: "src/views/product/ → src/views/order/ 추가"
    
  스토어:
    위치결정: "기존 스토어 파일과 동일한 폴더"
    예시: "src/stores/user.ts → src/stores/product.ts 추가"
    
  API:
    위치결정: "기존 API 파일과 동일한 구조"
    예시: "src/api/auth.ts → src/api/product.ts 추가"

Backend_신규파일:
  Controller:
    패키지결정: "기존 Controller 패키지 구조 따름"
    예시: "com.company.controller → com.company.controller.ProductController"
    
  Service:
    패키지결정: "기존 Service 패키지 구조 따름"
    인터페이스분리: "기존에 인터페이스가 있으면 동일하게 적용"
    
  Repository:
    패키지결정: "기존 Repository 패키지 구조 따름"
    상속구조: "기존에 BaseRepository가 있으면 동일하게 상속"
```

### **파일명 충돌 방지**
```yaml
중복파일_처리:
  확인절차: "생성 전 동일한 파일명 존재 여부 확인"
  
  충돌시_처리:
    백업생성: "기존파일.backup.{timestamp}"
    새파일생성: "사용자 확인 후 덮어쓰기 or 이름변경"
    
  안전한_네이밍:
    도메인접두사: "Product → EcommerceProduct"
    버전접두사: "UserService → UserServiceV2"
    기능접두사: "LoginForm → AdminLoginForm"
```

## 🔧 **3단계: 기존 파일 수정 및 통합**

### **설정 파일 자동 통합**

#### **Frontend 설정 통합**
```yaml
package.json_통합:
  새의존성_추가:
    충돌확인: "기존 버전과 호환성 검사"
    안전업데이트: "patch 버전만 자동 업데이트"
    메이저업데이트: "사용자 확인 필요"
    
  스크립트_추가:
    기존스크립트_유지: "기존 npm scripts 보존"
    새스크립트_추가: "새 기능 관련 scripts 추가"

라우터_통합:
  Vue_Router:
    파일위치: "src/router/index.ts 또는 src/router/routes.ts"
    추가방식: "기존 routes 배열에 새 라우트 추가"
    예시:
      ```typescript
      // 기존 라우트 유지하면서 새 라우트 추가
      const routes = [
        // ... 기존 라우트들
        {
          path: '/products',
          name: 'ProductList',
          component: () => import('@/views/product/ProductList.vue')
        }
      ]
      ```
      
  React_Router:
    파일위치: "src/App.tsx 또는 src/router/index.tsx"
    추가방식: "기존 Route 컴포넌트들과 함께 새 Route 추가"

메인파일_통합:
  Vue_main.ts:
    스토어등록: "기존 createApp().use() 체인에 새 스토어 추가"
    플러그인등록: "기존 plugin들과 함께 새 plugin 등록"
    
  React_App.tsx:
    프로바이더추가: "기존 Provider들과 함께 새 Provider 추가"
    컨텍스트등록: "기존 Context들과 함께 새 Context 등록"
```

#### **Backend 설정 통합**
```yaml
pom.xml_통합:
  새의존성_추가:
    충돌해결: "기존 버전과 호환되는 최신 버전 선택"
    스코프관리: "test, provided 등 적절한 scope 적용"
    제외설정: "transitional dependency 충돌 해결"
    
application.yml_통합:
  새설정_추가:
    기존설정_보존: "기존 설정값 변경하지 않음"
    새섹션_추가: "새 기능 관련 설정만 추가"
    환경별_설정: "dev, prod 등 모든 환경에 적용"
    
SpringBoot_설정:
  ComponentScan:
    패키지추가: "새 패키지를 기존 스캔 경로에 추가"
    자동설정: "@SpringBootApplication 위치 기준 자동 스캔"
    
  Bean등록:
    Configuration추가: "새 @Configuration 클래스 생성"
    기존설정_유지: "기존 Bean들과 충돌하지 않도록 주의"
```

### **Import/Export 자동 연결**
```yaml
Frontend_import_연결:
  자동import: "새 컴포넌트/함수 사용 시 자동 import 추가"
  경로관리: "기존 path alias 패턴 따름"
  
  Vue예시:
    ```typescript
    // 기존 import들 유지
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    
    // 새로 추가되는 import
    import { useProductStore } from '@/stores/product'
    import ProductCard from '@/components/product/ProductCard.vue'
    ```

Backend_import_연결:
  자동import: "새 클래스 사용 시 자동 import 추가"
  패키지관리: "기존 패키지 구조 따름"
  
  Spring예시:
    ```java
    // 기존 import들 유지
    import org.springframework.web.bind.annotation.*;
    import org.springframework.http.ResponseEntity;
    
    // 새로 추가되는 import
    import com.company.service.ProductService;
    import com.company.dto.ProductResponse;
    ```
```

## 🔒 **4단계: 데이터베이스 스키마 통합**

### **기존 스키마와의 호환성**
```yaml
테이블_추가:
  네이밍규칙: "기존 테이블 네이밍 컨벤션 따름"
  예시: "user_info → product_info (snake_case 유지)"
  
외래키_관계:
  기존테이블_참조: "기존 user, role 테이블 참조"
  관계설정: "기존 연관관계 패턴 따름"
  
마이그레이션:
  순서관리: "기존 migration 파일 이후 버전으로 생성"
  롤백대비: "rollback script 함께 생성"
```

### **JPA 엔티티 통합**
```yaml
기존엔티티_확장:
  BaseEntity상속: "기존에 BaseEntity가 있으면 동일하게 상속"
  어노테이션패턴: "기존 엔티티와 동일한 어노테이션 스타일"
  
연관관계_설정:
  기존관계_활용: "User, Role 등 기존 엔티티와 연관관계 설정"
  fetch전략: "기존 엔티티와 동일한 fetch 전략 사용"
```

## 🧪 **5단계: 테스트 코드 통합**

### **기존 테스트 패턴 따름**
```yaml
테스트구조_분석:
  Frontend: "Jest + Testing Library vs Vitest + Vue Test Utils"
  Backend: "JUnit + Mockito vs TestNG + MockServer"
  
테스트파일_생성:
  위치: "기존 테스트 파일 구조와 동일한 패턴"
  네이밍: "기존 테스트 파일 네이밍 컨벤션 따름"
  
Mock_패턴:
  기존Mock_재사용: "기존에 만들어진 Mock 객체들 활용"
  Fixture_활용: "기존 테스트 데이터 Fixture 패턴 따름"
```

## 🚨 **6단계: 충돌 감지 및 해결**

### **코드 충돌 자동 감지**
```yaml
네이밍_충돌:
  클래스명충돌: "동일한 클래스명 존재 시 패키지 접두사 추가"
  메서드명충돌: "오버로딩 가능성 검토"
  
의존성_충돌:
  버전충돌: "기존 라이브러리와 호환되는 버전 선택"
  라이선스충돌: "오픈소스 라이선스 호환성 확인"
  
포트_충돌:
  개발서버포트: "기존 사용 포트 피해서 새 포트 할당"
  DB포트: "기존 DB 포트와 중복되지 않도록 설정"
```

### **충돌 해결 전략**
```yaml
자동해결:
  minor충돌: "자동으로 안전한 방향으로 해결"
  prefix추가: "네이밍 충돌 시 도메인 prefix 자동 추가"
  
수동해결:
  major충돌: "사용자에게 선택권 제공"
  위험요소: "기존 코드 영향 가능한 경우 사용자 확인"
  
백업전략:
  변경전백업: "수정되는 모든 파일 백업"
  복구스크립트: "문제 발생 시 자동 롤백 스크립트 제공"
```

## 📋 **7단계: 통합 완료 검증**

### **자동 검증 프로세스**
```yaml
빌드_검증:
  Frontend: "npm run build 성공 여부"
  Backend: "mvn clean compile 성공 여부"
  
실행_검증:
  개발서버: "npm run dev / mvn spring-boot:run 성공"
  기본기능: "기존 기능 정상 동작 확인"
  신규기능: "새로 추가된 기능 정상 동작 확인"
  
테스트_검증:
  기존테스트: "기존 테스트 모두 통과"
  신규테스트: "새로 추가된 테스트 통과"
```

### **수동 검증 가이드**
```yaml
확인사항:
  - "기존 페이지들이 정상적으로 로드되는가?"
  - "기존 API들이 정상적으로 응답하는가?"
  - "새로 추가된 기능이 정상 동작하는가?"
  - "라우팅이 정상적으로 동작하는가?"
  - "권한 관리가 올바르게 적용되는가?"
```

## 📊 **8단계: 통합 완료 보고서**

### **생성되는 통합 보고서**
```yaml
변경사항_요약:
  신규파일: "새로 생성된 파일 목록"
  수정파일: "기존 파일 중 수정된 파일 목록"
  백업파일: "백업된 파일 위치"
  
실행방법:
  개발환경: "개발 서버 실행 명령어"
  빌드: "프로덕션 빌드 명령어"
  테스트: "테스트 실행 명령어"
  
다음단계:
  개발자작업: "개발자가 추가로 해야 할 작업"
  확인사항: "수동으로 확인해야 할 사항"
  최적화: "성능 최적화 권장사항"
```

## 🎯 **실제 통합 시나리오 예시**

### **시나리오: 기존 Vue 프로젝트에 상품 관리 기능 추가**
```bash
# 현재 상황: 사용자 관리만 있는 Vue + Spring Boot 프로젝트
# 추가 요청: 상품 관리 기능

/ai-design ./product-screen.png full ecommerce

# 결과:
# Frontend 추가됨:
# - src/views/product/ProductList.vue
# - src/views/product/ProductForm.vue  
# - src/stores/product.ts
# - src/api/product.ts

# Backend 추가됨:
# - com.company.controller.ProductController
# - com.company.service.ProductService
# - com.company.repository.ProductRepository
# - com.company.entity.Product

# 자동 통합됨:
# - src/router/index.ts (라우트 추가)
# - src/main.ts (스토어 등록)
# - pom.xml (필요한 의존성 추가)
```

### **통합 성공 확인**
```bash
# 기존 기능 정상 작동 확인
npm run dev
# → 사용자 관리 페이지 정상 작동

# 신규 기능 정상 작동 확인  
# → 상품 관리 페이지 정상 작동
# → 라우팅 정상 작동
# → API 호출 정상 작동
```

---

이 가이드를 따르면 기존 프로젝트에 **완벽하게 통합된** 새 기능을 안전하게 추가할 수 있습니다.