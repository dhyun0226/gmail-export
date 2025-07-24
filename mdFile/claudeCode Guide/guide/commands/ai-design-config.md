# ai-design-config - AI 디자인을 위한 프로젝트 설정 생성

프로젝트 폴더를 분석하여 기존 프로젝트 설정을 문서화하거나, 신규 프로젝트를 초기화하고 front-config.md와 backend-config.md를 생성합니다.

## 사용법
```
/ai-design-config [옵션]
```

## 설명
이 명령어는 Frontend와 Backend 프로젝트를 자동으로 초기화하고 설정 파일을 생성합니다:
- 기존 프로젝트: 기술 스택 분석 후 config 파일 생성
- 신규 프로젝트: 기본 설정으로 프로젝트 구조 생성 후 config 파일 생성

**기본 기술 스택:**
- **Frontend**: Vue 3.5 + TypeScript + Vite + Bootstrap
- **Backend**: Spring Boot 3.4 + Java 21 + Gradle + MariaDB + MyBatis

## 옵션
- **--front-path=[경로]**: Frontend 프로젝트 경로 (필수 - Frontend 작업 시)
- **--backend-path=[경로]**: Backend 프로젝트 경로 (필수 - Backend 작업 시)
- **--groupId=[값]**: Backend Group ID (예: com.osstem.ows) - 신규 프로젝트 시 필수
- **--artifactId=[값]**: Backend Artifact ID (예: sal) - 신규 프로젝트 시 필수
- **--force**: 기존 설정 파일 강제 재생성

## 예시
```bash
# Frontend와 Backend 모두 설정
/ai-design-config --backend-path=. --front-path=../ows-web-sal --groupId=com.osstem.ows --artifactId=sal

# Frontend만 설정
/ai-design-config --front-path=./frontend

# Backend만 설정 (기존 프로젝트)
/ai-design-config --backend-path=./backend

# Backend 신규 프로젝트 생성
/ai-design-config --backend-path=./new-backend --groupId=com.example --artifactId=my-app
```

## 전제조건
- Node.js 18+ (Frontend 프로젝트)
- Java 21+ (Backend 프로젝트)
- 프로젝트 경로 지정 시 해당 폴더의 읽기/쓰기 권한

## 필수 파라미터 확인
Backend 신규 프로젝트 생성 시 다음 파라미터가 필수입니다:
- **groupId**: Java 패키지 구조 결정 (예: com.company.product)
- **artifactId**: 프로젝트명 및 JAR 파일명 (예: my-service)

누락된 필수 파라미터가 있으면 다음과 같이 안내 후 종료:
```
❌ Backend 신규 프로젝트 생성을 위해 다음 파라미터가 필요합니다:
   --groupId=com.yourcompany.yourproduct
   --artifactId=your-service-name

예시: /ai-design-config --backend-path=./backend --groupId=com.osstem.ows --artifactId=sal
```

## 실행 가이드
이 명령어가 실행되면 다음 가이드를 순서대로 참조하여 실행하세요:

1. **파라미터 검증**
   - Backend 신규 프로젝트 시 groupId, artifactId 필수 확인
   - 경로 유효성 검증

2. **프로젝트 상태 분석**
   - /mnt/c/guide/ai-design/project-setup/project-analyzer.md

3. **Frontend 처리** (--front-path 지정 시)
   - 기존 프로젝트: /mnt/c/guide/ai-design/project-setup/frontend-analyzer.md
   - 신규 프로젝트: /mnt/c/guide/ai-design/project-setup/frontend-initializer.md

4. **Backend 처리** (--backend-path 지정 시)
   - 기존 프로젝트: /mnt/c/guide/ai-design/project-setup/backend-analyzer.md
   - 신규 프로젝트: /mnt/c/guide/ai-design/project-setup/backend-initializer.md

5. **설정 파일 생성**
   - /mnt/c/guide/ai-design/project-setup/config-generator.md

## 출력
- **front-config.md**: Frontend 기술 스택 및 구조 정보
- **backend-config.md**: Backend 기술 스택 및 구조 정보
- **project-setup.log**: 초기화 과정 로그 (신규 프로젝트 시)

## 주요 원칙
- **기본 설정 우선**: 검증된 기본 기술 스택 사용 (Vue 3.5 + Gradle 8.5)
- **최소 설정**: 필수 설정만 포함하여 단순성 유지
- **표준 구조**: 업계 표준 프로젝트 구조 적용
- **자동 의존성**: 필요한 라이브러리 자동 설치
- **기술 스택 고정**: Maven, React 등 대안 기술 사용하지 않음

## 다음 단계
설정 완료 후:
```bash
# 생성된 설정 파일 확인
cat front-config.md
cat backend-config.md

# AI 디자인 실행
/ai-design [이미지파일]

# 개발 서버 실행
npm run dev        # Frontend
./gradlew bootRun  # Backend
```