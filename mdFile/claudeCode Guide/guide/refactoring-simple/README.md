# 🚀 독립적 리팩토링 가이드 v2.0

## 개요
프로젝트 타입(백엔드/프론트엔드)별로 최적화된 도메인 기반 리팩토링 프레임워크입니다.

## 📂 프로젝트 구조

```
refactoring-simple/
├── AI-MAIN.md                     # 메인 진입점 (project-config.md 기반)
├── analyze-project-command.md     # Claude Code 명령어 등록
├── README.md                      # 이 파일
├── common/                        # 공통 모듈
│   ├── refactoring-framework.md  # 핵심 방법론
│   └── project-analyzer.md       # 프로젝트 타입 자동 감지
├── backend/                       # 백엔드 전용
│   ├── AI-BACKEND.md             # 백엔드 리팩토링 실행
│   ├── project-config-template.md
│   ├── project-config-generator.md
│   └── stage-1/                  # 백엔드 실행 단계 (9단계)
└── frontend/                      # 프론트엔드 전용
    ├── AI-FRONTEND.md            # 프론트엔드 리팩토링 실행
    ├── project-config-template.md
    ├── project-config-generator.md
    └── stage-1/                  # 프론트엔드 실행 단계 (9단계)
```

## 🎯 주요 특징

### 1. 2단계 실행 프로세스
```mermaid
graph LR
    A[/analyze-project] --> B[project-config.md 생성]
    B --> C[AI-MAIN.md 실행]
    C --> D{타입 확인}
    D -->|backend| E[AI-BACKEND.md]
    D -->|frontend| F[AI-FRONTEND.md]
```

### 2. 프로젝트별 최적화
- **백엔드**: Java/Spring Boot, MyBatis/JPA 특화
- **프론트엔드**: React/Vue3/Angular, 컴포넌트 기반
- 각 타입별 전용 템플릿과 가이드

### 3. 완전 자동화
- 프로젝트 타입 자동 감지
- 설정 파일 자동 생성
- 무중단 리팩토링 실행

## 💻 사용 방법

### 🚀 빠른 시작 (권장)

#### Step 1: 프로젝트 분석
```bash
# Claude Code 명령어
/analyze-project
```

**실행 결과:**
- 프로젝트 타입 자동 감지 (백엔드/프론트엔드)
- `project-config.md` 파일 생성
- 기술 스택과 구조 분석 완료

#### Step 2: 리팩토링 실행
```bash
# project-config.md가 생성된 후
"AI-MAIN.md로 리팩토링 시작해줘"
```

**실행 과정:**
1. project-config.md 읽기
2. 타입에 맞는 AI 가이드 자동 선택
3. 단계별 리팩토링 자동 진행

### 📋 상세 실행 흐름

#### 백엔드 프로젝트 (Java/Spring Boot)
```
1. 분석 단계 (/analyze-project)
   - build.gradle/pom.xml 감지
   - Spring Boot 버전 확인
   - 패키지 구조 스캔
   - MyBatis/JPA 확인

2. 리팩토링 단계 (AI-MAIN.md → AI-BACKEND.md)
   - 타겟 분석 → 계획 수립
   - Controller → Service → Mapper → XML
   - 도메인별 패키지 분리
   - 검증 및 최적화

3. 결과 구조
   controller/{domain}/
   service/{domain}/
   mapper/{domain}/
   resources/mapper/{domain}/
```

#### 프론트엔드 프로젝트 (React/Vue3)
```
1. 분석 단계 (/analyze-project)
   - package.json 감지
   - 프레임워크 확인 (React/Vue/Angular)
   - 컴포넌트 구조 파악
   - 상태 관리 도구 확인

2. 리팩토링 단계 (AI-MAIN.md → AI-FRONTEND.md)
   - 구조 분석 → 계획 수립
   - Components → State → Hooks → Services
   - 도메인별 폴더 구성
   - 번들 최적화

3. 결과 구조
   domains/{domain}/
   ├── components/
   ├── hooks/
   ├── services/
   └── store/
```

## 🔧 project-config.md 예시

### 백엔드 설정
```yaml
project:
  type: "backend"
  framework: "spring-boot"
  version: "2.7.0"
  
packages:
  basePackage: "com.example.api"
  controllerPackage: "${basePackage}.controller"
  servicePackage: "${basePackage}.service"
  
refactoring:
  outputPath: "./refactored"
  strategy: "domain-driven"
```

### 프론트엔드 설정
```yaml
project:
  type: "frontend"
  framework: "react"
  version: "18.2.0"
  
structure:
  pattern: "domain-driven"
  domains: ["user", "product", "order"]
  
refactoring:
  outputPath: "./refactored"
  componentPattern: "functional"
```

## 🎯 핵심 차별점

1. **Zero Configuration**: `/analyze-project` 한 번으로 설정 완료
2. **타입별 최적화**: 백엔드/프론트엔드 전용 프로세스
3. **도메인 중심**: 비즈니스 로직 기반 구조화
4. **완전 자동화**: 분석부터 리팩토링까지 자동 진행

## 🚀 Claude Code 명령어

### 등록된 명령어
```bash
/analyze-project     # 프로젝트 분석 및 설정 생성
```

### 사용 예시
```bash
# 1. 프로젝트 분석
/analyze-project

# 2. 리팩토링 실행
"AI-MAIN.md로 리팩토링 시작"

# 완료!
```

## 📊 지원 기술 스택

### 백엔드
- **언어**: Java 8/11/17/21
- **프레임워크**: Spring Boot 2.x/3.x
- **빌드**: Maven/Gradle
- **ORM**: MyBatis/JPA
- **DB**: MySQL/PostgreSQL/Oracle

### 프론트엔드
- **프레임워크**: React 16+, Vue 3+, Angular 2+
- **상태 관리**: Redux/Zustand, Pinia/Vuex
- **빌드**: Webpack/Vite
- **언어**: TypeScript/JavaScript

## 🔄 마이그레이션 가이드

### 기존 프로젝트
```bash
# 1. 프로젝트 루트로 이동
cd /path/to/your/project

# 2. 분석 실행
/analyze-project

# 3. 생성된 project-config.md 확인 및 수정 (필요시)

# 4. 리팩토링 실행
"AI-MAIN.md로 리팩토링 시작"
```

## 📚 추가 문서

- **common/refactoring-framework.md**: 리팩토링 방법론
- **backend/AI-BACKEND.md**: 백엔드 상세 가이드
- **frontend/AI-FRONTEND.md**: 프론트엔드 상세 가이드
- **FILE-NAMING-CONVENTION.md**: 파일 네이밍 규칙

---

**"분석부터 리팩토링까지, AI가 모든 것을 자동으로 처리합니다"**