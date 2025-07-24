# 🔍 AI 프로젝트 자동 분석 가이드

## 📁 가이드 파일 경로 설정
```
GUIDE_ROOT = "/mnt/c/guide/refactoring-simple"
BACKEND_GENERATOR = "/mnt/c/guide/refactoring-simple/backend/project-config-generator.md"
FRONTEND_GENERATOR = "/mnt/c/guide/refactoring-simple/frontend/project-config-generator.md"
BACKEND_TEMPLATE = "/mnt/c/guide/refactoring-simple/backend/project-config-template.md"
FRONTEND_TEMPLATE = "/mnt/c/guide/refactoring-simple/frontend/project-config-template.md"
```

## 개요
이 가이드는 AI가 프로젝트 타입을 자동으로 분석하고 `project-config.md`를 생성하는 절차입니다.

## 🚀 실행 절차

### Step 1: 프로젝트 루트 확인
1. **현재 작업 디렉토리 확인**
   - LS 도구로 현재 디렉토리의 파일들 나열
   - 프로젝트 루트 지표 파일 존재 여부 확인:
     - `.git` 폴더
     - `package.json`
     - `build.gradle` 또는 `pom.xml`
     - `requirements.txt`

2. **프로젝트 루트 탐색**
   - 위 지표 파일이 없으면 상위 디렉토리로 이동
   - 루트 디렉토리까지 반복 탐색
   - 가장 가까운 프로젝트 루트 식별

### Step 2: 백엔드 프로젝트 감지
1. **Java/Spring Boot 확인**
   - `build.gradle` 또는 `pom.xml` 파일 존재 확인
   - `src/main/java` 디렉토리 존재 확인
   - Read 도구로 빌드 파일 내용 확인:
     - Spring Boot 의존성 포함 여부
     - Java 버전 정보
   - 감지 시: "✅ Java/Spring Boot 백엔드 프로젝트 감지" 출력

2. **Python 프로젝트 확인**
   - `requirements.txt`, `setup.py`, `pyproject.toml` 확인
   - `manage.py` (Django) 또는 `main.py` (FastAPI) 확인
   - 감지 시: "✅ Python 백엔드 프로젝트 감지" 출력

3. **Go 프로젝트 확인**
   - `go.mod`, `go.sum` 파일 확인
   - 감지 시: "✅ Go 백엔드 프로젝트 감지" 출력

### Step 3: 프론트엔드 프로젝트 감지
1. **Node.js 기반 확인**
   - `package.json` 파일 존재 확인
   - Read 도구로 `package.json` 내용 읽기

2. **React 프로젝트 확인**
   - `package.json`에서 다음 패턴 검색:
     - `"react":` (dependencies)
     - `"@types/react":` (devDependencies)
   - `src/components` 디렉토리 확인
   - `.jsx` 또는 `.tsx` 파일 존재 확인
   - 감지 시: "✅ React 프론트엔드 프로젝트 감지" 출력

3. **Vue 프로젝트 확인**
   - `package.json`에서 `"vue":` 패턴 검색
   - `vue.config.js` 파일 확인
   - `.vue` 파일 존재 확인
   - 감지 시: "✅ Vue 프론트엔드 프로젝트 감지" 출력

4. **Angular 프로젝트 확인**
   - `angular.json` 파일 확인
   - `package.json`에서 `"@angular/core":` 확인
   - `.component.ts` 파일 확인
   - 감지 시: "✅ Angular 프론트엔드 프로젝트 감지" 출력

### Step 4: 모호한 경우 처리
1. **멀티 타입 감지**
   - 백엔드와 프론트엔드 신호가 모두 있는 경우:
     ```
     🔍 풀스택 프로젝트 감지
     
     다음 구조를 발견했습니다:
     - 백엔드: [경로]
     - 프론트엔드: [경로]
     
     리팩토링할 부분을 알려주세요.
     ```

2. **감지 실패 시**
   - 모든 패턴이 매치되지 않으면:
     ```
     ❌ 프로젝트 타입을 자동으로 감지할 수 없습니다.
     
     수동으로 generator를 실행해주세요:
     - 백엔드: /mnt/c/guide/refactoring-simple/backend/project-config-generator.md
     - 프론트엔드: /mnt/c/guide/refactoring-simple/frontend/project-config-generator.md
     ```

### Step 5: 적절한 Generator 실행
1. **백엔드 감지 시**
   - "백엔드 project-config-generator.md 실행 시작" 출력
   - `/mnt/c/guide/refactoring-simple/backend/project-config-generator.md` 가이드 실행
   - 완료 후: "✅ 백엔드 project-config.md 생성 완료" 출력

2. **프론트엔드 감지 시**
   - "프론트엔드 project-config-generator.md 실행 시작" 출력
   - `/mnt/c/guide/refactoring-simple/frontend/project-config-generator.md` 가이드 실행
   - 완료 후: "✅ 프론트엔드 project-config.md 생성 완료" 출력

## 📊 감지 우선순위 및 신호

### 백엔드 신호 (우선순위 순)
1. **Java/Spring Boot** (최우선)
   - 필수: `build.gradle` 또는 `pom.xml`
   - 필수: `src/main/java` 디렉토리
   - 추가: Spring Boot 의존성

2. **Python**
   - 신호: `requirements.txt`, `setup.py`, `manage.py`
   - 추가: Django, FastAPI 관련 파일

3. **Go**
   - 신호: `go.mod`, `go.sum`

### 프론트엔드 신호 (우선순위 순)
1. **React** (최우선)
   - 필수: `package.json`에 react 의존성
   - 추가: JSX/TSX 파일, src/components

2. **Vue**
   - 필수: `package.json`에 vue 의존성
   - 추가: .vue 파일, vue.config.js

3. **Angular**
   - 필수: `angular.json`
   - 추가: @angular 의존성

## 🎯 실행 규칙

### 자동 진행 규칙
1. **명확한 감지**: 즉시 해당 generator 실행
2. **모호한 감지**: 사용자에게 확인 요청
3. **감지 실패**: 수동 실행 가이드 제공

### 출력 메시지 형식
```
🔍 프로젝트 분석 시작...

[감지 과정 메시지들]

✅ 최종 결과: [프로젝트 타입]
📄 project-config.md 생성 중...

✅ 완료! 이제 AI-MAIN.md를 실행할 수 있습니다.
```

### 도구 사용 지침
- **LS**: 디렉토리 구조 확인
- **Read**: 설정 파일 내용 분석
- **Glob**: 특정 패턴 파일 검색
- **Grep**: 파일 내 키워드 검색

## 🚨 중요 사항

1. **즉시 실행**: 감지 완료 즉시 적절한 generator 자동 실행
2. **명확한 메시지**: 각 단계별 진행 상황 명확히 출력
3. **에러 친화적**: 실패 시 명확한 대안 제시
4. **도구 활용**: bash 명령어 대신 Claude 전용 도구 사용

---

**이 분석기는 `/analyze-project` 명령어로도 실행할 수 있습니다.**