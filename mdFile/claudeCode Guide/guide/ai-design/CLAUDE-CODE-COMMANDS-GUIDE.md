# Claude Code 커스텀 명령어 등록 가이드 (실행 가능 버전)

## 📋 개요

Claude Code가 실제로 수행할 수 있는 방식으로 AI 설계 명령어들을 등록하는 가이드입니다. Claude Code는 자바스크립트를 실행하지 않으며, 대신 파일을 읽고 쓰고, 자연어로 작업을 수행합니다.

## 🎯 핵심 원칙

1. **Claude Code는 자바스크립트를 실행하지 않습니다**
2. **마크다운 파일로 명령어를 정의합니다**
3. **Claude Code가 파일을 읽고, 분석하고, 생성합니다**
4. **자연어 처리를 통해 작업을 수행합니다**

## 📁 명령어 정의 방법

### CLAUDE.md 파일 생성

프로젝트 루트에 `CLAUDE.md` 파일을 생성하여 명령어를 정의합니다:

```markdown
# CLAUDE.md - AI Design System Commands

## 프로젝트 개요
이 프로젝트는 AI 기반 화면 설계 및 코드 생성 시스템입니다.

## 커스텀 명령어 정의

### /ai-design-config
분리된 프런트엔드와 백엔드 프로젝트의 정보를 수집하여 설정 파일을 생성합니다.

**실행 방법:**
1. 현재 디렉토리에서 프런트엔드와 백엔드 프로젝트 디렉토리를 찾습니다
   - 일반적인 패턴: frontend/, backend/, client/, server/, web/, api/
2. 각 프로젝트의 주요 파일을 읽어 분석합니다:
   - 프런트엔드: package.json, tsconfig.json, vite.config.js
   - 백엔드: package.json, pom.xml, build.gradle, application.yml
3. 분석 결과를 바탕으로 다음 파일을 생성합니다:
   - frontend-config.md: 프런트엔드 프로젝트 설정 정보
   - backend-config.md: 백엔드 프로젝트 설정 정보

**대화형 프롬프트:**
- 프로젝트 디렉토리를 자동으로 찾을 수 없는 경우, 사용자에게 경로를 물어봅니다
- 추가 정보가 필요한 경우 대화형으로 수집합니다

### /ai-design [이미지파일] [옵션]
이미지를 분석하여 UI 와이어프레임, 프로그램 사양서, 프로덕션 코드를 생성합니다.

**실행 방법:**
1. 현재 디렉토리에서 frontend-config.md와 backend-config.md 파일을 읽습니다
2. 설정 파일이 없으면 /ai-design-config를 먼저 실행하도록 안내합니다
3. 이미지 파일을 분석하여 화면 구성 요소를 파악합니다
4. 설정 파일의 정보를 바탕으로 코드를 생성합니다

**생성 옵션:**
- `wireframe`: UI 와이어프레임만 생성
- `spec`: 프로그램 사양서만 생성
- `both`: 와이어프레임과 사양서 생성 (기본값)
- `full`: 와이어프레임, 사양서, 실제 코드까지 생성

### /ai-validate-config
생성된 설정 파일의 유효성을 검증합니다.

**실행 방법:**
1. frontend-config.md와 backend-config.md 파일을 읽습니다
2. 필수 섹션이 모두 포함되어 있는지 확인합니다
3. 기술스택 정보가 올바른지 검증합니다
4. 검증 결과를 사용자에게 보고합니다

### /ai-project-init [옵션]
설정 파일을 기반으로 실제 프로젝트 구조를 생성하고 의존성을 설정합니다.

**실행 방법:**
1. frontend-config.md와 backend-config.md 파일을 읽습니다
   - 파일이 없으면 기본 설정 템플릿 사용 여부를 묻습니다
2. 프로젝트 디렉토리 구조를 생성합니다
3. 각 프로젝트의 설정 파일들을 생성합니다:
   - 프런트엔드: package.json, vite.config.ts, tsconfig.json 등
   - 백엔드: build.gradle, application.yml 등
4. 초기 코드와 샘플 파일들을 생성합니다
5. 의존성 설치를 실행합니다 (--skip-install 옵션으로 건너뛸 수 있음)

**옵션:**
- `--frontend-only`: 프런트엔드만 초기화
- `--backend-only`: 백엔드만 초기화  
- `--skip-install`: 의존성 설치 건너뛰기
- `--force`: 기존 파일 덮어쓰기

**기본 설정 템플릿:**
- 프런트엔드: Vue 3, Bootstrap 5, Pinia, TypeScript, Vite
- 백엔드: Java 21, Spring Boot 3.4, MariaDB, MyBatis, Swagger
```

## 🔧 명령어 실행 프로세스

### 1. /ai-design-config 실행 시

Claude Code가 수행하는 작업:

```markdown
1. **프로젝트 구조 탐색**
   - 현재 디렉토리의 하위 폴더들을 확인
   - frontend, client, web, vue-app 등의 패턴 검색
   - backend, server, api, spring-api 등의 패턴 검색

2. **파일 분석**
   - 프런트엔드: package.json 읽기 → 의존성 분석 → 프레임워크 감지
   - 백엔드: pom.xml 또는 build.gradle 읽기 → 프레임워크 감지

3. **대화형 정보 수집**
   ```
   프런트엔드 프로젝트를 ./frontend에서 발견했습니다.
   백엔드 프로젝트를 ./backend에서 발견했습니다.
   
   추가 정보를 입력해주세요:
   1. 프로젝트 설명: 
   2. 주요 비즈니스 도메인:
   ```

4. **설정 파일 생성**
   - frontend-config.md 파일 생성
   - backend-config.md 파일 생성
```

### 2. /ai-design 실행 시

Claude Code가 수행하는 작업:

```markdown
1. **설정 파일 확인**
   - frontend-config.md 파일 존재 여부 확인
   - backend-config.md 파일 존재 여부 확인
   - 없으면: "/ai-design-config를 먼저 실행하세요" 안내

2. **설정 파일 읽기**
   - 프런트엔드 기술스택, UI 라이브러리, 컴포넌트 정보 파악
   - 백엔드 API 패턴, 데이터베이스 정보 파악

3. **이미지 분석**
   - UI 구성 요소 식별
   - 화면 레이아웃 파악
   - 기능 요구사항 추론

4. **코드 생성**
   - 설정 파일의 정보를 바탕으로 맞춤형 코드 생성
   - 프런트엔드: Vue 3 + 지정된 UI 라이브러리 사용
   - 백엔드: Spring Boot + 지정된 패턴 사용
```

### 3. /ai-project-init 실행 시

Claude Code가 수행하는 작업:

```markdown
1. **설정 파일 확인**
   - frontend-config.md와 backend-config.md 파일 존재 여부 확인
   - 없으면: 기본 설정 템플릿 사용 여부를 대화형으로 확인

2. **프로젝트 구조 생성**
   - frontend/, backend/ 디렉토리 생성
   - 각 디렉토리 내부에 표준 프로젝트 구조 생성
   - src/, public/, resources/ 등 하위 디렉토리 구성

3. **설정 파일 생성**
   - 프런트엔드: package.json, vite.config.ts, tsconfig.json, .eslintrc.js
   - 백엔드: build.gradle, application.yml, logback-spring.xml

4. **초기 코드 생성**
   - 프런트엔드: main.ts, App.vue, 라우터, 스토어 등
   - 백엔드: Application.java, 설정 클래스, 샘플 Controller/Service

5. **의존성 설치** (--skip-install 옵션이 없는 경우)
   - 프런트엔드: npm install 실행
   - 백엔드: ./gradlew build 실행
```

## 📝 실제 사용 예시

### 시나리오 1: 새 프로젝트 시작

```bash
# 1. 프로젝트 구조
my-project/
├── vue-frontend/      # Vue 3 프런트엔드
├── spring-backend/    # Spring Boot 백엔드
└── CLAUDE.md         # 명령어 정의 파일

# 2. Claude Code에서 실행
/ai-design-config

# Claude Code 응답:
프로젝트 구조를 분석했습니다:
- 프런트엔드: ./vue-frontend (Vue 3.4.32)
- 백엔드: ./spring-backend (Spring Boot 3.2.x)

설정 파일을 생성했습니다:
✅ frontend-config.md
✅ backend-config.md

# 3. 이미지 기반 화면 설계
/ai-design ./mockup.png full

# Claude Code 응답:
설정 파일을 읽었습니다.
이미지를 분석 중입니다...
✅ UI 와이어프레임 생성 완료
✅ 프로그램 사양서 생성 완료
✅ Vue 3 컴포넌트 코드 생성 완료
✅ Spring Boot API 코드 생성 완료
```

### 시나리오 2: 기존 프로젝트에 적용

```bash
# 1. 이미 설정 파일이 있는 경우
/ai-design ./new-screen.png full

# Claude Code가 자동으로:
- frontend-config.md 읽기
- backend-config.md 읽기
- 설정에 맞는 코드 생성

# 2. 설정 파일 수정 후
# frontend-config.md를 편집하여 새 컴포넌트 추가
/ai-design ./updated-screen.png full

# 수정된 설정이 자동 반영됨
```

### 시나리오 3: 신규 프로젝트 초기화

```bash
# 1. 빈 디렉토리에서 시작
mkdir new-project && cd new-project

# 2. 프로젝트 정보 수집 (기본 설정 사용)
/ai-design-config

# Claude Code 응답:
⚠️ 프런트엔드/백엔드 프로젝트를 찾을 수 없습니다.
기본 설정을 사용하여 프로젝트를 초기화하시겠습니까? (Y/n): Y

✅ 기본 설정으로 config 파일을 생성했습니다:
- frontend-config.md (Vue 3, Bootstrap 5, Pinia)
- backend-config.md (Java 21, Spring Boot 3.4, MariaDB)

# 3. 프로젝트 초기화
/ai-project-init

# Claude Code 응답:
📁 프로젝트 구조를 생성 중입니다...
✅ frontend/ 디렉토리 생성
✅ backend/ 디렉토리 생성
✅ 설정 파일들 생성 완료
✅ 초기 코드 생성 완료
📦 의존성 설치 중...
✅ 프로젝트 초기화 완료!

실행 방법:
- 프런트엔드: cd frontend && npm run dev
- 백엔드: cd backend && ./gradlew bootRun
```

## 🎨 설정 파일 커스터마이징

### frontend-config.md 커스터마이징 예시

```markdown
## 커스텀 컴포넌트 매핑
이 프로젝트에서 사용하는 컴포넌트 매핑:
- 텍스트 입력 → OwInput
- 날짜 선택 → OwBizDatePicker
- 데이터 그리드 → DxDataGrid
- 페이지네이션 → OwPagination

## 코드 생성 규칙
- Composition API 사용 (<script setup>)
- TypeScript 필수
- 모든 API 호출은 try-catch로 감싸기
```

### backend-config.md 커스터마이징 예시

```markdown
## API 명명 규칙
- 목록 조회: GET /api/v1/{resource}
- 페이징: ?page=0&size=20&sort=id,desc
- 응답 형식:
  ```json
  {
    "success": true,
    "data": {},
    "message": ""
  }
  ```

## 보안 설정
- 모든 API는 JWT 인증 필요
- @PreAuthorize 어노테이션 사용
- CORS 설정 필수
```

## 🚀 고급 기능

### 조건부 코드 생성

CLAUDE.md에 조건부 규칙 추가:

```markdown
## 조건부 코드 생성 규칙

### 화면 타입별 생성 규칙
- **CRUD 화면**: 목록, 상세, 등록/수정 폼 자동 생성
- **대시보드**: 차트 컴포넌트, 실시간 업데이트 코드 포함
- **폼 화면**: 유효성 검증, 에러 처리 강화

### 도메인별 비즈니스 로직
- **사용자 관리**: 권한 체크, 비밀번호 암호화
- **상품 관리**: 재고 확인, 가격 계산
- **주문 처리**: 트랜잭션 처리, 상태 관리
```

### 다중 프로젝트 지원

```markdown
## 다중 프로젝트 구조
프로젝트가 여러 개인 경우:

/ai-design-config --project=admin
→ admin-frontend-config.md, admin-backend-config.md 생성

/ai-design-config --project=customer  
→ customer-frontend-config.md, customer-backend-config.md 생성

/ai-design ./admin-screen.png full --project=admin
→ admin 프로젝트 설정 사용
```

## 🔧 문제 해결

### 명령어가 인식되지 않는 경우

1. CLAUDE.md 파일이 프로젝트 루트에 있는지 확인
2. 명령어가 올바르게 정의되어 있는지 확인
3. Claude Code를 재시작

### 설정 파일을 찾을 수 없는 경우

```markdown
에러: frontend-config.md 파일을 찾을 수 없습니다.
해결: /ai-design-config 명령어를 먼저 실행하세요.
```

### 잘못된 정보가 생성된 경우

설정 파일을 직접 편집하여 수정:
- frontend-config.md 열어서 수정
- backend-config.md 열어서 수정

## 📚 베스트 프랙티스

### 1. 명확한 명령어 정의
- 각 명령어가 수행할 작업을 단계별로 명시
- Claude Code가 이해할 수 있는 자연어로 작성

### 2. 구조화된 설정 파일
- 마크다운 헤더로 섹션 구분
- 코드 블록으로 예시 제공
- 리스트로 옵션 나열

### 3. 대화형 프롬프트 활용
- 필요한 정보를 대화형으로 수집
- 사용자 친화적인 메시지 제공

### 4. 검증 및 피드백
- 각 단계마다 진행 상황 표시
- 완료 후 결과 요약 제공

## 🎉 완료!

이제 Claude Code가 실제로 실행할 수 있는 방식으로 명령어가 정의되었습니다:

1. **마크다운 기반**: 자바스크립트 대신 마크다운으로 정의
2. **파일 읽기/쓰기**: Claude Code가 직접 파일 작업 수행
3. **자연어 처리**: 복잡한 로직도 자연어로 설명
4. **대화형 인터페이스**: 필요시 사용자와 상호작용

이 방식으로 Claude Code는 실제로 명령어를 이해하고 실행할 수 있습니다!