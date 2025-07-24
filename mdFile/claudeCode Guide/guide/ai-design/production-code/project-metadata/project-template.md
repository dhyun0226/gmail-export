# 📋 프로젝트 메타데이터 작성 가이드

> **초간단 3단계**로 AI가 맞춤형 프로덕션 코드를 생성하는 데 필요한 정보를 제공

## 🚀 **빠른 시작 (필수 정보만)**

### **최소 필수 정보 (핵심 정보만!)**
```yaml
# 1️⃣ 프로젝트 식별 정보 (필수)
project_id: "PJ-2025-001"  # 프로젝트 고유 ID
name: "상품 관리 시스템"
version: "1.0.0"          # 프로젝트 버전
domain: "ecommerce"       # ecommerce | financial | healthcare | general

# 2️⃣ 저작권 정보 (필수)
author: "개발팀명/개발자명"
copyright: "© 2025 회사명. All rights reserved."
license: "Proprietary"    # MIT | Apache 2.0 | Proprietary

# 3️⃣ 기술스택 힌트 (선택사항 - 없으면 자동 감지)
# frontend: "Vue"    # 기존 프로젝트면 자동 감지됨
# backend: "Spring"  # 기존 프로젝트면 자동 감지됨
```

**✅ 이것만 있어도 AI가 95% 완성된 코드를 생성합니다!**

## 📝 **실전 사용 예시**

### **시나리오 1: 완전 신규 프로젝트**
```yaml
# 필수 정보 입력
project_id: "SHOP-2025-001"
name: "쇼핑몰 관리 시스템"
version: "1.0.0"
domain: "ecommerce"
author: "홍길동"
copyright: "© 2025 ABC Company. All rights reserved."
license: "Proprietary"

# 결과: generated-project/에 완전한 Vue + Spring Boot 프로젝트 생성
```

### **시나리오 2: 기존 프로젝트에 기능 추가**
```yaml
# 현재 폴더에 package.json이 있는 Vue 프로젝트
project_id: "SHOP-2025-001"  # 기존 프로젝트 ID 유지
name: "상품 관리 기능"
version: "1.1.0"  # 버전 업데이트
domain: "ecommerce"
author: "개발팀"
copyright: "© 2025 ABC Company. All rights reserved."
license: "Proprietary"

# 결과: 기존 프로젝트에 상품 관리 컴포넌트/API 추가
```

### **시나리오 3: 특별한 요구사항이 있는 경우**
```yaml
project_id: "MED-2025-001"
name: "환자 관리 시스템"
version: "1.0.0"
domain: "healthcare"
author: "의료정보팀"
copyright: "© 2025 Medical Corp. All rights reserved."
license: "Proprietary"

# 특별 요구사항 (선택사항)
security:
  compliance: "HIPAA"      # 의료정보보호법 준수
  encryption: "required"   # 데이터 암호화 필수

# 팀 정보 (선택사항)
team:
  lead: "김의사"
  contact: "medical-team@example.com"
```

### **시나리오 4: 기술스택을 직접 지정하고 싶은 경우**
```yaml
project_id: "PORT-2025-001"
name: "포트폴리오 사이트"
version: "1.0.0"
domain: "general"
author: "프론트엔드팀"
copyright: "© 2025 Design Studio. All rights reserved."
license: "MIT"

# 기술스택 강제 지정
frontend:
  framework: "React"       # Vue 대신 React 사용
  ui_library: "Ant Design" # OWS 대신 Ant Design 사용
  
backend:
  framework: "Express"     # Spring Boot 대신 Express 사용
  database: "MongoDB"      # PostgreSQL 대신 MongoDB 사용

# 프로젝트 관리 정보 (선택사항)
management:
  repository: "https://github.com/company/portfolio"
  documentation: "https://docs.company.com/portfolio"
```

## 🤖 **AI 자동 감지 vs 수동 입력**

### **✅ AI가 자동으로 감지하는 것들**
```yaml
# 기존 프로젝트가 있으면 자동 감지됨
자동_감지_항목:
  - "기술스택: package.json, pom.xml 분석"
  - "코딩 컨벤션: 기존 코드 패턴 분석"
  - "폴더 구조: 기존 프로젝트 구조 분석"
  - "의존성: 현재 사용 중인 라이브러리"
  - "아키텍처 패턴: 기존 레이어 구조"
```

### **❓ 사용자가 선택적으로 입력하는 것들**
```yaml
선택적_입력:
  domain: "비즈니스 도메인 (가장 중요!)"
  security: "특별한 보안 요구사항"
  compliance: "규제 준수 사항"
  custom_rules: "팀 고유 규칙"
```

## 🎯 **도메인별 최적화 가이드**

### **전자상거래 (ecommerce)**
```yaml
name: "쇼핑몰 시스템"
domain: "ecommerce"

# 자동으로 다음이 적용됨:
# - 상품/주문/결제 엔티티 및 API
# - 재고 관리 비즈니스 로직
# - 장바구니 상태 관리
# - 결제 보안 처리
```

### **금융 (financial)**
```yaml
name: "뱅킹 시스템"
domain: "financial"

# 자동으로 다음이 적용됨:
# - 계좌/거래 엔티티 및 API
# - 이중 인증 보안
# - 거래 감사 로깅
# - PCI DSS 보안 기준
```

### **의료 (healthcare)**
```yaml
name: "병원 관리 시스템"
domain: "healthcare"

# 자동으로 다음이 적용됨:
# - 환자/진료 엔티티 및 API
# - 개인정보 암호화
# - HIPAA 준수 보안
# - 의료 데이터 접근 제어
```

### **일반 (general)**
```yaml
name: "업무 관리 시스템"
domain: "general"

# 자동으로 다음이 적용됨:
# - 기본 CRUD 기능
# - 표준 권한 관리
# - 일반적인 검증 규칙
# - 기본 보안 설정
```

## 🔧 **고급 설정 (선택사항)**

### **필요한 경우에만 추가로 설정**
```yaml
# 기본 정보 (필수)
project_id: "ADV-2025-001"
name: "고급 설정 예시"
version: "2.0.0"
domain: "ecommerce"
author: "전체 개발팀"
copyright: "© 2025 Enterprise Corp. All rights reserved."
license: "Apache 2.0"

# 상세 프로젝트 정보 (선택)
description: "대규모 전자상거래 플랫폼 with 마이크로서비스 아키텍처"
created_date: "2025-01-01"
last_modified: "2025-07-04"

# 팀 정보 (선택)
team:
  lead: "김개발"
  contributors: ["이프론트", "박백엔드", "최데브옵스"]
  contact: "dev-team@enterprise.com"
  department: "디지털혁신팀"

# 프로젝트 관리 (선택)
management:
  repository: "https://github.com/enterprise/ecommerce-platform"
  documentation: "https://wiki.enterprise.com/ecommerce"
  issue_tracker: "https://jira.enterprise.com/projects/EC"
  ci_cd: "Jenkins (https://jenkins.enterprise.com/job/ecommerce)"

# 비즈니스 정보 (선택)
business:
  client: "ABC 유통"
  target_users: ["일반 소비자", "기업 구매담당자", "공급업체"]
  scope: "B2B/B2C 통합 전자상거래 플랫폼"

# 기술스택 커스터마이징
frontend:
  framework: "React"           # Vue 대신
  ui_library: "Material-UI"    # OWS 대신
  state_management: "Redux"    # Pinia 대신

backend:
  framework: "Django"          # Spring Boot 대신  
  database: "MongoDB"          # PostgreSQL 대신
  architecture: "Hexagonal"    # Layered 대신

# 보안 강화
security:
  authentication: "OAuth2"     # JWT 대신
  encryption: "AES-256"        # 데이터 암호화
  compliance: "GDPR"          # 유럽 개인정보보호법

# 코딩 표준 커스터마이징
coding:
  naming: "snake_case"         # camelCase 대신
  package_structure: "domain" # feature-based 대신
```

## 📋 **실제 작성 체크리스트**

### **✅ 반드시 입력해야 하는 것**
- [ ] `project_id`: 프로젝트 고유 식별자
- [ ] `name`: 프로젝트/기능 이름
- [ ] `version`: 프로젝트 버전
- [ ] `domain`: 비즈니스 도메인 (ecommerce/financial/healthcare/general)
- [ ] `author`: 개발자/팀명
- [ ] `copyright`: 저작권 정보
- [ ] `license`: 라이선스 종류

### **🔸 상황에 따라 입력하는 것**
- [ ] `description`: 프로젝트 상세 설명
- [ ] `team.*`: 팀 정보 (리드, 기여자, 연락처 등)
- [ ] `management.*`: 프로젝트 관리 도구 정보
- [ ] `business.*`: 비즈니스 관련 정보 (고객, 대상, 범위)
- [ ] `frontend.framework`: 기존과 다른 프레임워크 사용시
- [ ] `backend.framework`: 기존과 다른 백엔드 프레임워크 사용시
- [ ] `security.*`: 특별한 보안 요구사항이 있을 때
- [ ] `compliance`: 규제 준수가 필요할 때

### **❌ 입력하지 않아도 되는 것**
- [ ] 기술 스택 버전 (자동으로 최신 버전 사용)
- [ ] 기본 코딩 컨벤션 (프레임워크 기본값 사용)
- [ ] 일반적인 보안 설정 (자동으로 적용)
- [ ] 폴더 구조 (표준 구조 자동 적용)
- [ ] 일반적인 의존성 (프레임워크 기본 패키지)

## 🎉 **결론**

**가장 간단한 경우:**
```yaml
project_id: "PROD-2025-001"
name: "상품 관리"
version: "1.0.0"
domain: "ecommerce"
author: "개발팀"
copyright: "© 2025 Company. All rights reserved."
license: "Proprietary"
```

**이 필수 정보만 있으면 AI가 완전한 프로덕션 애플리케이션을 생성합니다!**

나머지는 필요한 경우에만 추가하세요. AI가 대부분을 자동으로 처리합니다. 🚀