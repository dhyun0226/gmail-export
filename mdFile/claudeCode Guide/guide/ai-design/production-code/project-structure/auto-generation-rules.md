# ⚙️ 프로젝트 구조 자동 생성 규칙

> AI가 메타데이터를 바탕으로 **자동으로** 프로젝트 구조를 결정하고 파일을 생성하는 규칙

## 📌 개요

이 문서는 AI가 프로젝트 메타데이터와 현재 환경을 분석하여 **최적의 프로젝트 구조를 자동으로 결정**하는 규칙을 정의합니다.

## 🔍 **1단계: 프로젝트 환경 감지**

### **현재 디렉토리 분석 규칙**
```yaml
환경_감지_순서:
  1. 주요_설정파일_존재_확인:
     - "package.json → Frontend 프로젝트"
     - "pom.xml → Backend 프로젝트" 
     - "gradle.build → Backend 프로젝트"
     - "requirements.txt → Python 프로젝트"
     - "go.mod → Go 프로젝트"
     
  2. 폴더_구조_분석:
     - "src/ 폴더 존재 → 기존 프로젝트"
     - "node_modules/ 폴더 존재 → 기존 프로젝트"
     - "target/ 또는 build/ → 기존 프로젝트"
     
  3. 프로젝트_타입_결정:
     - "빈 디렉토리 → 신규 프로젝트 모드"
     - "설정파일만 존재 → 초기 프로젝트"
     - "소스코드 존재 → 기존 프로젝트"
```

### **프로젝트 타입별 처리 방식**
```yaml
신규_프로젝트:
  조건: "주요 설정파일이 없는 빈 디렉토리"
  생성위치: "./generated-project/"
  생성방식: "완전한 프로젝트 스캐폴딩"
  
기존_프로젝트:
  조건: "package.json 또는 pom.xml 존재"
  생성위치: "현재 디렉토리"
  생성방식: "기존 구조에 파일 추가"
  
초기_프로젝트:
  조건: "설정파일만 있고 src/ 폴더 없음"
  생성위치: "현재 디렉토리"
  생성방식: "기본 구조 + 새 파일 생성"
```

## 🏗️ **2단계: 메타데이터 기반 구조 결정**

### **Frontend 구조 결정 규칙**
```yaml
Vue_프로젝트:
  감지조건:
    - "package.json에 vue 의존성"
    - "메타데이터: frontend.framework = Vue"
  생성구조: "Vue 3 + Composition API + TypeScript"
  폴더구조:
    - "src/components/"
    - "src/views/"
    - "src/stores/"
    - "src/router/"

React_프로젝트:
  감지조건:
    - "package.json에 react 의존성"
    - "메타데이터: frontend.framework = React"
  생성구조: "React 18 + Hooks + TypeScript"
  폴더구조:
    - "src/components/"
    - "src/pages/"
    - "src/hooks/"
    - "src/context/"

Angular_프로젝트:
  감지조건:
    - "package.json에 @angular 의존성"
    - "메타데이터: frontend.framework = Angular"
  생성구조: "Angular 17 + TypeScript"
  폴더구조:
    - "src/app/components/"
    - "src/app/pages/"
    - "src/app/services/"
    - "src/app/guards/"
```

### **Backend 구조 결정 규칙**
```yaml
Spring_Boot:
  감지조건:
    - "pom.xml에 spring-boot-starter"
    - "메타데이터: backend.framework = Spring Boot"
  생성구조: "Spring Boot 3.x + JPA + PostgreSQL"
  패키지구조:
    domain_based: "com.company.app.{domain}.{layer}"
    layer_based: "com.company.app.{layer}.{domain}"
    
Express_js:
  감지조건:
    - "package.json에 express 의존성"
    - "메타데이터: backend.framework = Express"
  생성구조: "Express.js + TypeScript + Prisma"
  폴더구조:
    - "src/controllers/"
    - "src/services/"
    - "src/models/"
    - "src/routes/"

Django:
  감지조건:
    - "requirements.txt에 Django"
    - "메타데이터: backend.framework = Django"
  생성구조: "Django 4.x + DRF + PostgreSQL"
  폴더구조:
    - "apps/{domain}/"
    - "core/models/"
    - "core/serializers/"
    - "core/views/"
```

## 📁 **3단계: 도메인별 폴더 구조 자동 생성**

### **도메인 감지 및 폴더 생성 규칙**
```yaml
ecommerce_도메인:
  메타데이터: "domain = ecommerce"
  생성_엔티티:
    - "product (상품)"
    - "category (카테고리)"
    - "order (주문)"
    - "cart (장바구니)"
    - "payment (결제)"
  
  Frontend_폴더:
    - "src/views/ecommerce/product/"
    - "src/views/ecommerce/order/"
    - "src/views/ecommerce/cart/"
    - "src/stores/product.ts"
    - "src/stores/order.ts"
    
  Backend_폴더:
    - "com.company.app.ecommerce.product.controller"
    - "com.company.app.ecommerce.product.service"
    - "com.company.app.ecommerce.product.repository"
    - "com.company.app.ecommerce.product.entity"

financial_도메인:
  메타데이터: "domain = financial"
  생성_엔티티:
    - "account (계좌)"
    - "transaction (거래)"
    - "investment (투자)"
    - "loan (대출)"
  
  Frontend_폴더:
    - "src/views/financial/account/"
    - "src/views/financial/transaction/"
    - "src/stores/account.ts"
    - "src/stores/transaction.ts"
    
  Backend_폴더:
    - "com.company.app.financial.account.controller"
    - "com.company.app.financial.account.service"

healthcare_도메인:
  메타데이터: "domain = healthcare"
  생성_엔티티:
    - "patient (환자)"
    - "doctor (의사)"
    - "appointment (예약)"
    - "medical_record (진료기록)"
  
  보안_강화:
    - "데이터 암호화 자동 적용"
    - "HIPAA 준수 설정 자동 생성"
    - "접근 로그 자동 설정"

general_도메인:
  메타데이터: "domain = general"
  생성_엔티티:
    - "user (사용자)"
    - "role (역할)"
    - "menu (메뉴)"
    - "code (공통코드)"
  
  기본_구조:
    - "표준 CRUD 구조"
    - "기본 권한 관리"
    - "일반적인 보안 설정"
```

## 📝 **4단계: 파일 네이밍 및 생성 규칙**

### **Frontend 파일 네이밍 규칙**
```yaml
Vue_컴포넌트:
  페이지_컴포넌트: "{Entity}List.vue, {Entity}Detail.vue, {Entity}Form.vue"
  재사용_컴포넌트: "{Entity}Card.vue, {Entity}Filter.vue"
  
  예시:
    - "ProductList.vue (상품 목록)"
    - "ProductDetail.vue (상품 상세)"
    - "ProductForm.vue (상품 등록/수정)"
    - "ProductCard.vue (상품 카드)"

스토어_파일:
  파일명: "use{Entity}Store.ts"
  예시: "useProductStore.ts, useOrderStore.ts"
  
API_파일:
  파일명: "{entity}Api.ts"
  예시: "productApi.ts, orderApi.ts"

타입_파일:
  파일명: "{entity}.ts"
  예시: "product.ts, order.ts"
```

### **Backend 파일 네이밍 규칙**
```yaml
Controller:
  클래스명: "{Entity}Controller"
  파일명: "{Entity}Controller.java"
  패키지: "controller.{entity} 또는 {entity}.controller"
  
Service:
  인터페이스: "{Entity}Service"
  구현체: "{Entity}ServiceImpl"
  파일명: "{Entity}Service.java, {Entity}ServiceImpl.java"
  
Repository:
  클래스명: "{Entity}Repository"
  파일명: "{Entity}Repository.java"
  
Entity:
  클래스명: "{Entity}"
  파일명: "{Entity}.java"
  테이블명: "{entity_lower_case}"

DTO:
  요청: "{Entity}CreateRequest, {Entity}UpdateRequest"
  응답: "{Entity}Response, {Entity}ListResponse"
  검색: "{Entity}SearchCriteria"
```

## ⚙️ **5단계: 설정 파일 자동 생성**

### **Frontend 설정 파일 생성 규칙**
```yaml
package.json:
  생성조건: "신규 프로젝트 또는 package.json 없음"
  내용: "메타데이터 기반 의존성 + 스크립트"
  
vite.config.ts:
  생성조건: "Vue 프로젝트"
  내용: "프록시 설정, path alias, 번들 최적화"
  
tsconfig.json:
  생성조건: "TypeScript 프로젝트"
  내용: "엄격한 타입 체크 + path mapping"
  
.env:
  생성조건: "항상 생성"
  내용: "API_URL, 환경별 설정"
```

### **Backend 설정 파일 생성 규칙**
```yaml
pom.xml:
  생성조건: "Spring Boot 프로젝트"
  내용: "메타데이터 기반 의존성"
  버전관리: "자동으로 최신 안정 버전"
  
application.yml:
  생성조건: "Spring Boot 프로젝트"
  내용: "다중 환경 설정, DB 연결, 보안"
  
SecurityConfig.java:
  생성조건: "보안 요구사항 있음"
  내용: "메타데이터 기반 보안 설정"
  
DatabaseConfig.java:
  생성조건: "데이터베이스 사용"
  내용: "DB 연결 풀, 트랜잭션 설정"
```

## 🔄 **6단계: 기존 파일 수정 및 통합 규칙**

### **라우터 파일 자동 업데이트**
```yaml
Vue_Router:
  파일위치: "src/router/index.ts"
  추가내용: "새로운 도메인 라우트"
  예시:
    ```typescript
    // 자동으로 추가되는 라우트
    {
      path: '/products',
      name: 'ProductList',
      component: () => import('@/views/ecommerce/ProductList.vue')
    }
    ```

React_Router:
  파일위치: "src/App.tsx 또는 src/router/index.tsx"
  추가내용: "새로운 Route 컴포넌트"
```

### **메인 파일 자동 업데이트**
```yaml
Vue_main.ts:
  파일위치: "src/main.ts"
  추가내용: "새로운 스토어 등록"
  
Spring_Boot_Application:
  파일위치: "Application.java"
  추가내용: "새로운 패키지 스캔 경로"
```

## 🛡️ **7단계: 충돌 방지 및 백업 규칙**

### **파일 충돌 처리**
```yaml
기존_파일_존재시:
  동작: "백업 후 새 파일 생성"
  백업_위치: "./{filename}.backup.{timestamp}"
  
중요_파일_보호:
  보호대상: "package.json, pom.xml, application.yml"
  동작: "기존 내용 유지하고 필요한 부분만 추가"
  
충돌_해결_순서:
  1. "기존 파일 백업"
  2. "새 내용과 기존 내용 병합"
  3. "사용자에게 변경사항 알림"
```

### **Git 연동 규칙**
```yaml
gitignore_자동생성:
  생성조건: ".gitignore 파일 없음"
  내용: "기술스택별 표준 gitignore"
  
git_초기화:
  생성조건: ".git 폴더 없음 && 신규 프로젝트"
  동작: "git init + 초기 커밋"
```

## 📊 **8단계: 생성 완료 후 검증**

### **생성 결과 검증 규칙**
```yaml
파일_생성_확인:
  - "모든 필수 파일 생성 완료"
  - "설정 파일 문법 검증"
  - "import/export 경로 검증"
  
실행_가능성_검증:
  Frontend: "npm install && npm run dev 성공"
  Backend: "mvn clean compile 성공"
  
테스트_파일_생성:
  - "기본 테스트 파일 자동 생성"
  - "테스트 실행 환경 설정"
```

### **생성 완료 보고서**
```yaml
생성_보고서_형식:
  생성된_파일_목록: "새로 생성된 파일들"
  수정된_파일_목록: "기존 파일 중 수정된 파일들"
  실행_명령어: "프로젝트 실행 방법"
  다음_단계: "개발자가 해야 할 작업"
```

---

이 규칙을 따르면 AI가 어떤 상황에서도 **일관되고 예측 가능한 방식**으로 프로젝트 구조를 생성합니다.