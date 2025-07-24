# AI 프로젝트 설정 명령어 가이드 (마크다운 기반)

## 📋 개요

`/ai-design-config`은 프로젝트 구성을 감지하여 설정 정보를 수집하거나, 프로젝트가 없을 경우 기본 설정을 제공하여 `frontend-config.md`와 `backend-config.md` 파일을 생성하는 Claude Code 명령어입니다.

## 🎯 명령어 사용법

```bash
/ai-design-config
```

이 명령어를 실행하면 Claude Code가 다음 작업을 수행합니다:

1. 현재 프로젝트 구조 분석
2. 프런트엔드/백엔드 프로젝트 경로 확인
3. 각 프로젝트의 기술스택 및 구조 파악
4. `frontend-config.md`와 `backend-config.md` 파일 생성

## 📁 생성되는 파일 구조

### frontend-config.md

```markdown
# Frontend 프로젝트 설정

## 프로젝트 정보
- **프로젝트명**: vue-frontend-app
- **경로**: ./frontend
- **설명**: Vue 3 기반 프런트엔드 애플리케이션

## 기술스택
- **프레임워크**: Vue 3 (3.4.32)
- **언어**: TypeScript 5.5.3
- **빌드도구**: Vite 4.5.3
- **패키지매니저**: pnpm

## UI 라이브러리
- **메인 UI**: Bootstrap Vue Next 0.15.5
- **그리드**: DevExtreme 22.2.3
- **아이콘**: Font Awesome 6.x

## 상태관리
- **도구**: Pinia 2.1.7
- **패턴**: Composition API Store

## 주요 라이브러리
- Vue Router 4.4.0 (라우팅)
- Axios 1.6.5 (HTTP 통신)
- Day.js 1.11.12 (날짜 처리)
- VueUse 10.11.0 (유틸리티)
- Lodash-es 4.17.21 (헬퍼 함수)

## 프로젝트 구조
```
frontend/
├── src/
│   ├── components/     # 재사용 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── stores/        # Pinia 스토어
│   ├── services/      # API 서비스
│   ├── types/         # TypeScript 타입
│   └── utils/         # 유틸리티 함수
├── public/            # 정적 파일
└── package.json       # 의존성 정의
```

## 컴포넌트 규칙
- **명명규칙**: PascalCase (예: UserProfile.vue)
- **접두사**: Ow (OWS 컴포넌트)
- **구조**: Composition API + `<script setup>`

## API 통신
- **기본 URL**: http://localhost:8080/api
- **인증**: JWT Bearer Token
- **타임아웃**: 30초
```

### backend-config.md

```markdown
# Backend 프로젝트 설정

## 프로젝트 정보
- **프로젝트명**: spring-boot-api
- **경로**: ./backend
- **설명**: Spring Boot 기반 REST API 서버

## 기술스택
- **프레임워크**: Spring Boot 3.2.x
- **언어**: Java 17
- **빌드도구**: Maven 3.9.x
- **패키징**: JAR

## 주요 의존성
- Spring Web (REST API)
- Spring Security (인증/인가)
- Spring Data JPA (데이터 접근)
- Hibernate 6.x (ORM)
- Jackson (JSON 처리)
- Bean Validation (입력 검증)
- Spring Boot Actuator (모니터링)

## 데이터베이스
- **메인 DB**: PostgreSQL 15.x
- **캐시**: Redis 7.x
- **연결풀**: HikariCP

## 프로젝트 구조
```
backend/
├── src/main/java/com/example/
│   ├── controller/    # REST 컨트롤러
│   ├── service/       # 비즈니스 로직
│   ├── repository/    # 데이터 접근
│   ├── entity/        # JPA 엔티티
│   ├── dto/           # 데이터 전송 객체
│   ├── config/        # 설정 클래스
│   └── security/      # 보안 설정
├── src/main/resources/
│   ├── application.yml    # 애플리케이션 설정
│   └── db/migration/      # DB 마이그레이션
└── pom.xml               # Maven 설정
```

## API 패턴
- **기본 경로**: /api/v1
- **페이징**: ?page=0&size=20&sort=id,desc
- **응답 형식**: 
  ```json
  {
    "success": true,
    "data": {},
    "message": ""
  }
  ```

## 보안 설정
- **인증**: JWT 토큰 기반
- **권한**: @PreAuthorize 어노테이션
- **CORS**: 프런트엔드 도메인 허용
```

## 🔄 명령어 실행 프로세스

### 1단계: 프로젝트 구조 확인

Claude Code가 다음 패턴으로 프로젝트를 탐색합니다:

```
현재디렉토리/
├── frontend/     # 또는 client/, web/, vue-app/ 등
├── backend/      # 또는 server/, api/, spring-api/ 등
└── ...
```

**프로젝트를 감지하지 못한 경우:**
- 프런트엔드/백엔드 폴더가 없거나 비어있을 때
- 기본 설정 템플릿을 사용하여 프로젝트 초기화 제안
- 사용자 확인 후 기본 설정으로 config 파일 생성

### 2단계: 대화형 정보 수집

#### 기존 프로젝트가 있는 경우:
```
🔍 프로젝트 구조를 분석 중입니다...

다음 구조를 발견했습니다:
- 프런트엔드: ./frontend (Vue 프로젝트로 추정)
- 백엔드: ./backend (Spring Boot 프로젝트로 추정)

이 정보가 맞습니까? (Y/n): Y

추가 정보를 입력해주세요:
1. 프런트엔드 프로젝트 설명: Vue 3 기반 관리자 대시보드
2. 백엔드 프로젝트 설명: REST API 서버
3. 주요 비즈니스 도메인: 사용자 관리, 상품 관리, 주문 처리
```

#### 프로젝트가 없거나 비어있는 경우:
```
🔍 프로젝트 구조를 분석 중입니다...

⚠️ 프런트엔드/백엔드 프로젝트를 찾을 수 없습니다.

기본 설정을 사용하여 프로젝트를 초기화하시겠습니까? (Y/n): Y

📋 기본 설정 템플릿:
- 프런트엔드: Vue 3, Bootstrap 5, Pinia, TypeScript
- 백엔드: Java 21, Spring Boot 3.4, MariaDB, MyBatis, Swagger

이 설정으로 진행하시겠습니까? (Y/n): Y

✅ 기본 설정으로 config 파일을 생성합니다...
```

### 3단계: 파일 분석

Claude Code가 각 프로젝트의 주요 파일을 읽어 정보를 추출합니다:

**프런트엔드 분석 대상:**
- package.json (의존성 및 스크립트)
- tsconfig.json (TypeScript 설정)
- vite.config.js (빌드 설정)
- src/main.ts (진입점)

**백엔드 분석 대상:**
- pom.xml 또는 build.gradle (의존성)
- application.yml (설정)
- 주요 Controller 파일 (API 패턴)

### 4단계: 설정 파일 생성

분석 결과를 바탕으로 `frontend-config.md`와 `backend-config.md` 파일을 현재 디렉토리에 생성합니다.

## 📝 설정 파일 활용

생성된 설정 파일은 `/ai-design` 명령어에서 자동으로 읽혀집니다:

```bash
# 1. 프로젝트 설정
/ai-design-config

# 2. 설정 파일 생성 확인
ls *.config.md
> frontend-config.md
> backend-config.md

# 3. AI 화면 설계 실행
/ai-design ./mockup.png full
# → 자동으로 설정 파일을 읽어 메타데이터로 활용
```

## 🎨 설정 파일 커스터마이징

생성된 설정 파일은 수동으로 편집 가능합니다:

### 컴포넌트 매핑 추가

```markdown
## 커스텀 컴포넌트 매핑
- 텍스트 입력: OwInput
- 셀렉트박스: OwFormSelect
- 날짜선택: OwBizDatePicker
- 데이터그리드: DxDataGrid
- 페이지네이션: OwPagination
```

### API 엔드포인트 패턴 추가

```markdown
## API 엔드포인트 규칙
- 목록 조회: GET /api/{resource}
- 상세 조회: GET /api/{resource}/{id}
- 생성: POST /api/{resource}
- 수정: PUT /api/{resource}/{id}
- 삭제: DELETE /api/{resource}/{id}
```

## 🚀 실제 사용 예시

### 예시 1: 모노레포 구조

```
my-project/
├── packages/
│   ├── web/          # Vue 3 프런트엔드
│   └── api/          # Spring Boot 백엔드
└── package.json
```

```bash
cd my-project
/ai-design-config

# Claude Code 프롬프트:
> 프런트엔드 경로를 입력하세요: packages/web
> 백엔드 경로를 입력하세요: packages/api
```

### 예시 2: 별도 저장소

```bash
# 작업 디렉토리에 두 프로젝트를 clone
git clone https://github.com/company/frontend.git
git clone https://github.com/company/backend.git

/ai-design-config
# → 자동으로 frontend/, backend/ 디렉토리 감지
```

### 예시 3: 비표준 디렉토리명

```
workspace/
├── vue-admin/        # 프런트엔드
├── spring-api/       # 백엔드
└── docs/
```

```bash
/ai-design-config

# Claude Code 프롬프트:
> 프런트엔드 프로젝트를 찾을 수 없습니다. 경로를 입력하세요: vue-admin
> 백엔드 프로젝트를 찾을 수 없습니다. 경로를 입력하세요: spring-api
```

## 🔧 문제 해결

### 프로젝트를 찾을 수 없는 경우

```bash
# 수동으로 경로 지정
/ai-design-config

> 프런트엔드 경로: ./client-app
> 백엔드 경로: ./server-app
```

### 설정 파일이 생성되지 않는 경우

1. 현재 디렉토리 쓰기 권한 확인
2. 프로젝트 구조가 올바른지 확인
3. package.json, pom.xml 등 필수 파일 존재 여부 확인

### 잘못된 정보가 감지된 경우

생성된 `.md` 파일을 직접 편집하여 수정 가능:

```bash
# 편집기로 열기
code frontend-config.md
code backend-config.md
```

## 📊 설정 파일 검증

```bash
# 설정 파일 검증 (ai-design 실행 전)
/ai-validate-config

# 출력 예시:
✅ frontend-config.md 검증 완료
  - 프레임워크: Vue 3 ✓
  - UI 라이브러리: Bootstrap Vue Next ✓
  - 필수 정보: 모두 포함 ✓

✅ backend-config.md 검증 완료
  - 프레임워크: Spring Boot ✓
  - 데이터베이스: PostgreSQL ✓
  - API 패턴: RESTful ✓

🎉 설정 파일이 올바르게 구성되었습니다!
```

## 🌟 기본 설정 템플릿

프로젝트가 없거나 초기 설정이 필요한 경우, Claude Code는 기본 설정 템플릿을 제공합니다:

### 프런트엔드 기본 설정
- **프레임워크**: Vue 3.5+ (Composition API)
- **UI 라이브러리**: Bootstrap 5.3+
- **상태 관리**: Pinia 2.2+
- **빌드 도구**: Vite 5.0+
- **언어**: TypeScript 5.3+
- **추가 라이브러리**: Vue Router, Axios, Day.js, VeeValidate, Vue I18n

### 백엔드 기본 설정
- **언어**: Java 21 (LTS)
- **프레임워크**: Spring Boot 3.4.0
- **빌드 도구**: Gradle 8.5
- **데이터베이스**: MariaDB 11.2
- **ORM**: MyBatis 3.5.15
- **API 문서화**: Swagger (SpringDoc OpenAPI) 2.3.0
- **아키텍처**: 레이어드 아키텍처

### 기본 설정 템플릿 위치
```
ai-analysis/templates/default-configs/
├── frontend-default-config.md
└── backend-default-config.md
```

### 기본 설정 사용 시나리오

1. **신규 프로젝트 시작**
   ```bash
   mkdir my-new-project
   cd my-new-project
   /ai-design-config
   # → 프로젝트 없음 감지 → 기본 설정 제안
   ```

2. **빈 폴더가 있는 경우**
   ```bash
   mkdir frontend backend
   /ai-design-config
   # → 빈 폴더 감지 → 기본 설정 제안
   ```

3. **부분적으로만 존재하는 경우**
   ```bash
   # backend만 있고 frontend가 없는 경우
   /ai-design-config
   # → frontend 기본 설정 제안
   ```

## 🎯 다음 단계

설정 파일 생성 후:

1. **파일 검토**: 생성된 `.md` 파일 내용 확인
2. **필요시 수정**: 프로젝트 특성에 맞게 편집
3. **프로젝트 초기화**: `/ai-project-init` 명령어로 실제 프로젝트 구조 생성 (선택사항)
4. **AI 화면 설계**: `/ai-design [이미지] full` 실행

이제 Claude Code가 설정 파일을 자동으로 읽어 프로젝트에 최적화된 코드를 생성합니다!