# 프로젝트 메타데이터 생성 가이드

## 📋 개요

프로젝트 메타데이터는 AI 화면 설계 시 **기술스택, 아키텍처, 도메인 규칙**을 자동으로 적용하기 위한 핵심 정보입니다. **최초 1회 생성** 후 프로젝트 전체에서 재사용되어 일관된 코드 생성을 보장합니다.

## 🎯 목적 및 효과

### 목적
- **일관성 보장**: 모든 화면에서 동일한 기술스택과 패턴 적용
- **효율성 향상**: 메타데이터 재사용으로 분석 시간 단축 (50% 이상)
- **품질 향상**: 프로젝트별 최적화된 코드 생성
- **유지보수성**: 중앙 집중식 설정 관리

### 생성 시점
```yaml
최초_생성:
  - 새 프로젝트 시작 시
  - AI 화면 설계 도구 최초 사용 시
  - 기존 프로젝트의 메타데이터 미존재 시

업데이트_시점:
  - 기술스택 변경 시 (Vue 2 → Vue 3)
  - 아키텍처 패턴 변경 시 (모놀리스 → 마이크로서비스)
  - 도메인 규칙 추가/변경 시
  - 새로운 라이브러리 도입 시
```

## 🏗️ 메타데이터 구조 정의

### 전체 구조 (JSON Schema)
```json
{
  "projectInfo": {
    "projectId": "string",
    "name": "string",
    "version": "string", 
    "description": "string",
    "author": "string",
    "copyright": "string",
    "license": "string",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  },
  "teamInfo": {
    "leadDeveloper": "string",
    "contributors": ["string"],
    "contactEmail": "string",
    "department": "string"
  },
  "projectManagement": {
    "repositoryUrl": "string",
    "documentationUrl": "string",
    "issueTrackerUrl": "string",
    "ciCdPipeline": "string"
  },
  "businessInfo": {
    "client": "string",
    "targetUsers": ["string"],
    "projectScope": "string",
    "businessDomain": "string"
  },
  "techStack": {
    "frontend": { "framework": "string", "version": "string", "libs": [] },
    "backend": { "framework": "string", "version": "string", "libs": [] },
    "database": { "type": "string", "version": "string" },
    "infrastructure": { "build": "string", "deploy": "string" }
  },
  "architecture": {
    "pattern": "string",
    "layers": [],
    "communication": "string",
    "stateManagement": "string"
  },
  "domain": {
    "type": "string",
    "businessRules": [],
    "compliance": [],
    "dataPatterns": []
  },
  "standards": {
    "naming": {},
    "structure": {},
    "security": {},
    "performance": {}
  }
}
```

### 기술스택 세부 정의
```yaml
Frontend:
  framework: "Vue 3" | "React 18" | "Angular 15" | "Svelte"
  ui_library: "Bootstrap" | "Material-UI" | "Ant Design" | "Tailwind"
  state_management: "Pinia" | "Vuex" | "Redux" | "Zustand"
  grid_component: "DevExtreme" | "AG-Grid" | "Vue-Tables-2"
  
Backend:
  framework: "Spring Boot" | "Express.js" | "Django" | "ASP.NET Core"
  language: "Java 17" | "Node.js 18" | "Python 3.11" | "C# 6"
  orm: "JPA/Hibernate" | "Sequelize" | "Django ORM" | "Entity Framework"
  
Database:
  type: "PostgreSQL" | "MySQL" | "MongoDB" | "SQL Server"
  version: "string"
  
Infrastructure:
  build_tool: "Vite" | "Webpack" | "Maven" | "Gradle"
  container: "Docker" | "Podman" | null
  orchestration: "Kubernetes" | "Docker Compose" | null
```

### 아키텍처 패턴 정의
```yaml
패턴_유형:
  Monolithic: "단일 배포 단위"
  Layered: "계층형 아키텍처 (Controller-Service-Repository)"
  Hexagonal: "포트-어댑터 패턴"
  Microservices: "마이크로서비스 아키텍처"
  Event_Driven: "이벤트 중심 아키텍처"

레이어_구조:
  Frontend: ["Components", "Pages", "Stores", "Services", "Utils"]
  Backend: ["Controller", "Service", "Repository", "Entity", "DTO"]
  
통신_방식:
  API: "RESTful" | "GraphQL" | "gRPC"
  Messaging: "RabbitMQ" | "Kafka" | "Redis Pub/Sub" | null
```

### 도메인 유형 정의
```yaml
도메인_분류:
  E-Commerce: "전자상거래"
  Finance: "금융/핀테크"
  Healthcare: "의료/헬스케어"
  Education: "교육"
  Manufacturing: "제조업"
  Logistics: "물류/배송"
  Media: "미디어/콘텐츠"
  Government: "공공/정부"
  Enterprise: "엔터프라이즈/관리시스템"
  Gaming: "게임"
  IoT: "사물인터넷"
  
비즈니스_규칙_예시:
  E-Commerce:
    - 재고 관리 (실시간 재고 차감)
    - 주문 처리 (결제-재고-배송 연계)
    - 쿠폰/할인 적용 로직
    - 배송비 계산 규칙
  
  Finance:
    - 거래 무결성 (ACID 트랜잭션)
    - 규제 준수 (PCI DSS, 금융권 보안)
    - 이중 기장 원칙
    - 리스크 관리 규칙
```

## 🤖 자동 생성 방법

### 방법 1: AI 자동 스캔
```bash
# 프로젝트 루트에서 실행
/ai-metadata-generate [프로젝트_경로] [스캔_깊이]

# 예시
/ai-metadata-generate ./my-project deep
/ai-metadata-generate . standard
```

**스캔 대상 파일들**
```yaml
Frontend_분석:
  - package.json (의존성 분석)
  - tsconfig.json (TypeScript 설정)
  - vite.config.js (빌드 설정)
  - src/main.ts (앱 진입점)
  - src/stores/* (상태 관리)
  
Backend_분석:
  - pom.xml / build.gradle (Java 의존성)
  - package.json (Node.js 의존성)
  - application.yml (Spring Boot 설정)
  - entity/* (데이터 모델)
  - controller/* (API 패턴)

인프라_분석:
  - Dockerfile
  - docker-compose.yml
  - kubernetes/*.yaml
  - .github/workflows/*
```

### 방법 2: 대화형 설정 도구
```bash
# 대화형 메타데이터 생성기 실행
/ai-metadata-wizard

# 단계별 질문 예시:
> 프로젝트 유형을 선택하세요:
  1) 웹 애플리케이션
  2) 모바일 앱  
  3) 데스크톱 앱
  4) API 서버

> 프론트엔드 프레임워크를 선택하세요:
  1) Vue 3 + TypeScript
  2) React 18 + TypeScript
  3) Angular 15
  4) 기타

> 백엔드 프레임워크를 선택하세요:
  1) Spring Boot + Java
  2) Express.js + Node.js
  3) Django + Python
  4) 기타
```

## ✏️ 수동 작성 방법

### 템플릿 기반 작성
```json
{
  "projectInfo": {
    "projectId": "OWS-2025-001",
    "name": "ows-system",
    "version": "2.5.10", 
    "description": "OWS 기반 엔터프라이즈 시스템",
    "author": "OWS 개발팀",
    "copyright": "© 2025 OWS Corporation. All rights reserved.",
    "license": "Proprietary",
    "createdAt": "2025-07-01T00:00:00Z",
    "updatedAt": "2025-07-04T00:00:00Z"
  },
  "teamInfo": {
    "leadDeveloper": "김개발",
    "contributors": ["이프론트", "박백엔드", "최데브옵스"],
    "contactEmail": "ows-dev@company.com",
    "department": "플랫폼개발팀"
  },
  "projectManagement": {
    "repositoryUrl": "https://github.com/company/ows-system",
    "documentationUrl": "https://docs.company.com/ows",
    "issueTrackerUrl": "https://jira.company.com/projects/OWS",
    "ciCdPipeline": "Jenkins - https://jenkins.company.com/job/ows"
  },
  "businessInfo": {
    "client": "내부 프로젝트",
    "targetUsers": ["기업 관리자", "일반 사용자", "시스템 관리자"],
    "projectScope": "엔터프라이즈 통합 관리 플랫폼",
    "businessDomain": "Enterprise Management System"
  },
  "techStack": {
    "frontend": {
      "framework": "Vue 3",
      "version": "3.4.32",
      "ui_library": "OWS UI Library",
      "libs": [
        "Bootstrap 5.3.3",
        "DevExtreme 22.2.3", 
        "Pinia 2.1.7",
        "Vue Router 4.4.0",
        "Day.js 1.11.12"
      ]
    },
    "backend": {
      "framework": "Spring Boot",
      "version": "3.x",
      "language": "Java 17",
      "libs": [
        "Spring Security",
        "Spring Data JPA", 
        "Hibernate",
        "Jackson",
        "Validation API"
      ]
    },
    "database": {
      "primary": "PostgreSQL 15",
      "cache": "Redis 7",
      "search": null
    },
    "infrastructure": {
      "build_tool": "Vite 4.5.3",
      "package_manager": "pnpm",
      "container": "Docker",
      "orchestration": null
    }
  },
  "architecture": {
    "pattern": "Layered Architecture",
    "frontend_layers": [
      "Components (Vue SFC)",
      "Pages (Route Components)", 
      "Stores (Pinia)",
      "Services (API)",
      "Utils (Helpers)"
    ],
    "backend_layers": [
      "Controller (REST API)",
      "Service (Business Logic)",
      "Repository (Data Access)",
      "Entity (JPA)",
      "DTO (Data Transfer)"
    ],
    "communication": "RESTful API",
    "state_management": "Pinia (Centralized)"
  },
  "domain": {
    "type": "Enterprise Management System",
    "business_rules": [
      "Role-based Access Control",
      "Audit Logging for All Changes",
      "Real-time Data Synchronization",
      "Multi-tenant Data Isolation"
    ],
    "compliance": [
      "GDPR (Personal Data Protection)",
      "SOX (Financial Reporting)",
      "ISO 27001 (Information Security)"
    ],
    "data_patterns": [
      "CRUD Operations",
      "Master-Detail Views", 
      "Bulk Operations",
      "Export/Import Functions"
    ]
  },
  "standards": {
    "naming": {
      "components": "PascalCase with 'Ow' prefix (OwButton)",
      "files": "kebab-case.vue",
      "variables": "camelCase",
      "constants": "UPPER_SNAKE_CASE",
      "database": "snake_case"
    },
    "structure": {
      "frontend": "/src/{components,pages,stores,services,utils}",
      "backend": "/src/main/java/{controller,service,repository,entity,dto}"
    },
    "security": {
      "authentication": "JWT Token",
      "authorization": "Role-based (@PreAuthorize)",
      "input_validation": "Bean Validation (@Valid)",
      "output_encoding": "Jackson Auto-escape"
    },
    "performance": {
      "frontend": "Virtual Scrolling, Lazy Loading, Code Splitting",
      "backend": "Connection Pooling, Query Optimization, Caching",
      "database": "Indexing, Partitioning, Read Replicas"
    }
  }
}
```

## 📁 파일 저장 및 관리

### 저장 위치
```
프로젝트_루트/
├── .ai-metadata/
│   ├── project-metadata.json     # 메인 메타데이터
│   ├── component-mappings.json   # UI 컴포넌트 매핑
│   ├── api-patterns.json         # API 패턴 정의
│   └── domain-rules.json         # 도메인별 비즈니스 규칙
└── ...
```

### 버전 관리
```json
{
  "metadata_version": "2.0.0",
  "schema_version": "2025.1",
  "last_updated": "2025-07-04T10:30:00Z",
  "updated_by": "dev-team",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-07-01",
      "changes": ["Initial metadata creation"],
      "author": "system-admin"
    },
    {
      "version": "2.0.0",
      "date": "2025-07-04",
      "changes": [
        "Added projectId field for unique identification",
        "Added teamInfo section with developer information",
        "Added projectManagement section with tool URLs",
        "Added businessInfo section with client details",
        "Enhanced copyright and license information"
      ],
      "author": "dev-team"
    }
  ]
}
```

## 🔧 검증 및 업데이트

### 자동 검증 규칙
```yaml
일관성_검증:
  - 기술스택 버전 호환성 체크
  - 아키텍처 패턴과 레이어 구조 일치성
  - 도메인 규칙과 보안 정책 호환성
  
실시간_검증:
  - package.json 변경 감지
  - 새 라이브러리 추가 알림
  - 버전 업그레이드 제안
  
품질_검증:
  - 메타데이터 완성도 (필수 필드 체크)
  - 표준 규칙 준수도
  - 모범 사례 적용도
```

### 업데이트 시나리오
```bash
# 기술스택 변경 시
/ai-metadata-update --tech-stack
> Vue 2 → Vue 3 마이그레이션이 감지되었습니다.
> 메타데이터를 업데이트하시겠습니까? (y/n)

# 새 라이브러리 추가 시  
/ai-metadata-sync
> 새로운 의존성이 발견되었습니다: @vueuse/core
> 메타데이터에 추가하시겠습니까? (y/n)

# 도메인 규칙 변경 시
/ai-metadata-update --domain
> 새로운 비즈니스 규칙을 추가하세요:
> 1) 데이터 보존 정책 변경
> 2) 새로운 규제 준수 요구사항
```

## 📊 사용 통계 및 모니터링

### 메타데이터 활용 지표
```yaml
사용_빈도:
  - AI 분석 시 메타데이터 참조 횟수
  - 코드 생성 시 적용된 규칙 수
  - 템플릿 사용률

정확도_지표:
  - 자동 생성 vs 수동 수정 비율
  - 기술스택 탐지 정확도
  - 도메인 규칙 적용 성공률
  
성능_지표:
  - 메타데이터 로딩 시간
  - 코드 생성 속도 향상률
  - 분석 시간 단축률
```

---

## 🎯 빠른 시작 가이드

### 1단계: 메타데이터 생성 선택
```bash
# 방법 A: 자동 스캔 (권장)
/ai-metadata-generate . deep

# 방법 B: 대화형 생성
/ai-metadata-wizard

# 방법 C: 템플릿 복사 후 수정
cp /templates/project-metadata.template.json ./.ai-metadata/project-metadata.json
```

### 2단계: 검증 및 확인
```bash
# 메타데이터 검증
/ai-metadata-validate

# 미리보기
/ai-metadata-preview
```

### 3단계: AI 화면 설계 시작
```bash
# 이제 메타데이터가 자동 적용됩니다
/ai-design image.png full
```

이제 프로젝트 메타데이터를 **한 번만 설정**하면, 모든 AI 화면 설계에서 **일관되고 최적화된 코드**가 자동 생성됩니다! 🚀