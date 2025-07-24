# AI 프로젝트 초기화 명령어 가이드

## 📋 개요

`/ai-project-init`는 `frontend-config.md`와 `backend-config.md` 파일을 기반으로 실제 프로젝트 구조를 생성하고 의존성을 설정하는 Claude Code 명령어입니다. 기본 설정 템플릿이나 사용자 정의 설정을 사용하여 프로젝트를 초기화할 수 있습니다.

## 🎯 명령어 사용법

```bash
/ai-project-init [options]
```

### 옵션:
- `--frontend-only`: 프런트엔드만 초기화
- `--backend-only`: 백엔드만 초기화
- `--skip-install`: 의존성 설치 건너뛰기
- `--force`: 기존 파일 덮어쓰기

### 기본 사용:
```bash
# 전체 프로젝트 초기화
/ai-project-init

# 프런트엔드만 초기화
/ai-project-init --frontend-only

# 백엔드만 초기화
/ai-project-init --backend-only
```

## 🔄 명령어 실행 프로세스

### 1단계: 설정 파일 확인

```
🔍 프로젝트 설정 파일을 확인 중입니다...

✅ frontend-config.md 발견
✅ backend-config.md 발견

다음 설정으로 프로젝트를 초기화합니다:
- 프런트엔드: Vue 3, Bootstrap 5, Pinia
- 백엔드: Java 21, Spring Boot 3.4, MariaDB

계속하시겠습니까? (Y/n): Y
```

### 2단계: 디렉토리 구조 생성

```
📁 프로젝트 구조를 생성 중입니다...

✅ frontend/ 디렉토리 생성
  ├── src/
  ├── public/
  └── 설정 파일들...

✅ backend/ 디렉토리 생성
  ├── src/main/java/
  ├── src/main/resources/
  └── 빌드 파일들...
```

### 3단계: 설정 파일 생성

Claude Code가 각 프로젝트의 설정 파일을 자동 생성합니다:

**프런트엔드:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `.eslintrc.js`
- `.prettierrc`
- 환경 변수 파일들 (.env, .env.development, .env.production)

**백엔드:**
- `build.gradle` 또는 `pom.xml`
- `application.yml`
- `application-dev.yml`
- `application-prod.yml`
- `logback-spring.xml`

### 4단계: 초기 코드 생성

기본 구조와 샘플 코드를 생성합니다:

**프런트엔드:**
- `src/main.ts` - 애플리케이션 진입점
- `src/App.vue` - 루트 컴포넌트
- `src/router/index.ts` - 라우터 설정
- `src/stores/auth.store.ts` - 인증 스토어
- 기본 컴포넌트들

**백엔드:**
- `Application.java` - Spring Boot 메인 클래스
- `WebConfig.java` - 웹 설정
- `SwaggerConfig.java` - API 문서화 설정
- `GlobalExceptionHandler.java` - 예외 처리
- 샘플 Controller/Service/Mapper

### 5단계: 의존성 설치

```
📦 의존성을 설치 중입니다...

[프런트엔드]
$ npm install
✅ 의존성 설치 완료 (45개 패키지)

[백엔드]
$ ./gradlew build
✅ 빌드 완료
```

## 🚀 실행 예시

### 예시 1: 신규 프로젝트 완전 초기화

```bash
# 1. 빈 디렉토리에서 시작
mkdir my-project && cd my-project

# 2. 프로젝트 정보 수집 (기본 설정 사용)
/ai-design-config
# → 기본 설정으로 config 파일 생성

# 3. 프로젝트 초기화
/ai-project-init
# → 전체 프로젝트 구조 생성 및 의존성 설치

# 4. 개발 서버 실행
cd frontend && npm run dev
cd ../backend && ./gradlew bootRun
```

### 예시 2: 기존 설정 파일로 초기화

```bash
# 이미 frontend-config.md, backend-config.md가 있는 경우
/ai-project-init

# 출력:
✅ 설정 파일을 기반으로 프로젝트를 초기화했습니다.

[프런트엔드]
- 경로: ./frontend
- 실행: npm run dev
- 접속: http://localhost:3000

[백엔드]
- 경로: ./backend
- 실행: ./gradlew bootRun
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
```

### 예시 3: 부분 초기화

```bash
# 프런트엔드만 초기화
/ai-project-init --frontend-only

# 백엔드만 초기화
/ai-project-init --backend-only
```

## 📝 생성되는 파일 예시

### 프런트엔드 주요 파일

**package.json:**
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "bootstrap": "^5.3.3",
    "pinia": "^2.2.0",
    // ... 기타 의존성
  }
}
```

**src/main.ts:**
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
```

### 백엔드 주요 파일

**build.gradle:**
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    implementation 'org.mariadb.jdbc:mariadb-java-client'
    // ... 기타 의존성
}
```

**Application.java:**
```java
package com.example.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 🔧 문제 해결

### 설정 파일이 없는 경우

```bash
❌ 오류: frontend-config.md 파일을 찾을 수 없습니다.

해결 방법:
1. /ai-design-config 명령어를 먼저 실행하세요
2. 또는 수동으로 config 파일을 생성하세요
```

### 디렉토리가 이미 존재하는 경우

```bash
⚠️ 경고: frontend 디렉토리가 이미 존재합니다.

옵션:
1. 기존 디렉토리에 병합 (기본값)
2. 기존 디렉토리 백업 후 새로 생성
3. 취소

선택하세요 (1/2/3): 1
```

### 의존성 설치 실패

```bash
❌ npm install 실패

가능한 원인:
1. Node.js가 설치되지 않음
2. 네트워크 연결 문제
3. 권한 문제

--skip-install 옵션으로 의존성 설치를 건너뛸 수 있습니다.
```

## 🎨 커스터마이징

### 설정 파일 수정 후 재초기화

```bash
# 1. config 파일 수정
vim frontend-config.md

# 2. 강제 재초기화
/ai-project-init --force
```

### 특정 파일만 생성

```bash
# Claude Code 프롬프트에서 선택 가능
/ai-project-init

> 생성할 항목을 선택하세요:
  [x] 디렉토리 구조
  [x] 설정 파일
  [ ] 샘플 코드
  [x] 의존성 설치
```

## 🏗️ 프로젝트 구조 템플릿

### 프런트엔드 구조
```
frontend/
├── src/
│   ├── assets/          # 정적 자원
│   ├── components/      # 재사용 컴포넌트
│   ├── composables/     # Composition 함수
│   ├── layouts/         # 레이아웃 컴포넌트
│   ├── pages/           # 페이지 컴포넌트
│   ├── router/          # 라우터 설정
│   ├── services/        # API 서비스
│   ├── stores/          # Pinia 스토어
│   ├── types/           # TypeScript 타입
│   ├── utils/           # 유틸리티 함수
│   ├── App.vue          # 루트 컴포넌트
│   └── main.ts          # 진입점
├── public/              # 정적 파일
├── .env                 # 환경 변수
├── .env.development     # 개발 환경 변수
├── .env.production      # 운영 환경 변수
├── .eslintrc.js         # ESLint 설정
├── .gitignore           # Git 제외 파일
├── .prettierrc          # Prettier 설정
├── index.html           # HTML 템플릿
├── package.json         # 프로젝트 정보
├── tsconfig.json        # TypeScript 설정
├── vite.config.ts       # Vite 설정
└── README.md            # 프로젝트 문서
```

### 백엔드 구조
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/project/
│   │   │   ├── common/          # 공통 기능
│   │   │   ├── config/          # 설정 클래스
│   │   │   ├── controller/      # 컨트롤러
│   │   │   ├── service/         # 서비스
│   │   │   ├── mapper/          # MyBatis 매퍼
│   │   │   ├── model/           # 모델 클래스
│   │   │   └── Application.java # 메인 클래스
│   │   └── resources/
│   │       ├── mapper/          # SQL 매퍼 XML
│   │       ├── messages/        # 메시지 파일
│   │       ├── application.yml  # 애플리케이션 설정
│   │       └── logback-spring.xml # 로깅 설정
│   └── test/                    # 테스트 코드
├── gradle/                      # Gradle 래퍼
├── .gitignore                   # Git 제외 파일
├── build.gradle                 # 빌드 설정
├── gradlew                      # Gradle 래퍼 (Unix)
├── gradlew.bat                  # Gradle 래퍼 (Windows)
├── settings.gradle              # 프로젝트 설정
└── README.md                    # 프로젝트 문서
```

## 📊 초기화 검증

```bash
# 초기화 완료 후 검증
/ai-project-validate

# 출력:
✅ 프런트엔드 검증 완료
  - package.json 존재 ✓
  - 주요 의존성 설치됨 ✓
  - TypeScript 설정 완료 ✓
  - 개발 서버 실행 가능 ✓

✅ 백엔드 검증 완료
  - build.gradle 존재 ✓
  - Spring Boot 설정 완료 ✓
  - 데이터베이스 설정 확인 ✓
  - 빌드 성공 ✓

🎉 프로젝트가 성공적으로 초기화되었습니다!
```

## 🎯 다음 단계

프로젝트 초기화 후:

1. **개발 서버 실행**
   ```bash
   # 프런트엔드
   cd frontend && npm run dev
   
   # 백엔드
   cd backend && ./gradlew bootRun
   ```

2. **데이터베이스 설정**
   - MariaDB 설치 및 실행
   - 데이터베이스 및 사용자 생성
   - 초기 테이블 생성

3. **AI 화면 설계 시작**
   ```bash
   /ai-design [이미지파일] full
   ```

이제 프로젝트 기반이 준비되었으므로 AI를 활용한 화면 개발을 시작할 수 있습니다!