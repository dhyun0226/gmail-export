# 설정 파일 생성 가이드

Frontend와 Backend 프로젝트 분석 또는 초기화 완료 후 최종 설정 파일을 생성하는 가이드입니다.

## 생성할 파일
1. **front-config.md** - Frontend 설정 정보 (--front-path 지정 시)
2. **backend-config.md** - Backend 설정 정보 (--backend-path 지정 시)

## front-config.md 표준 형식

```markdown
# Frontend Configuration

## 프로젝트 정보(Project Information)
- **Project ID**: [프로젝트 고유 식별자]
- **Project Name**: [프로젝트명]
- **Version**: [프로젝트 버전]
- **Description**: [프로젝트 설명]
- **Author**: [개발자/팀명]
- **Copyright**: © [연도] [회사명/개인명]. All rights reserved.
- **License**: [라이선스 종류] (예: MIT, Apache 2.0, Proprietary)
- **Created Date**: [프로젝트 생성일]
- **Last Modified**: [최종 수정일]

## 팀 정보(Team Information)
- **Lead Developer**: [리드 개발자명]
- **Contributors**: [기여자 목록]
- **Contact Email**: [연락처 이메일]
- **Team/Department**: [팀/부서명]

## 프로젝트 관리(Project Management)
- **Repository URL**: [Git 저장소 URL]
- **Documentation**: [문서화 사이트 URL]
- **Issue Tracker**: [이슈 트래커 URL]
- **CI/CD Pipeline**: [CI/CD 도구 및 URL]

## 비즈니스 정보(Business Information)
- **Client/Customer**: [고객사명]
- **Business Domain**: [비즈니스 도메인]
- **Project Scope**: [프로젝트 범위]
- **Target Users**: [대상 사용자]

## 기술 스택(Technology Stack)
- **Framework**: [프레임워크] [버전]
- **UI Library**: [UI 라이브러리] [버전]
- **State Management**: [상태 관리] [버전]
- **Build Tool**: [빌드 도구] [버전]
- **Language**: [언어] [버전]

## 프로젝트 구조(Project Structure)
\`\`\`
src/
├── views/          # 페이지 컴포넌트
├── components/     # 재사용 컴포넌트
├── stores/         # 상태 관리
├── api/           # API 클라이언트
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
├── assets/        # 정적 자산
└── main.ts        # 애플리케이션 진입점
\`\`\`

## 코딩 컨벤션(Coding Conventions)
- **컴포넌트명**: PascalCase
- **파일명**: kebab-case
- **변수/함수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE

## 개발 명령어(Development Commands)
\`\`\`bash
npm run dev     # 개발 서버 실행
npm run build   # 프로덕션 빌드
npm run preview # 빌드 미리보기
\`\`\`

## 주요 의존성(Main Dependencies)
[dependencies 목록]

## 환경 설정(Environment Configuration)
- **Node.js 버전**: 18.0.0 이상 권장
- **패키지 매니저**: npm 또는 yarn
- **개발 포트**: 3000 (기본값)

---
*이 설정 파일은 AI 코드 생성 시 자동으로 참조됩니다.*
```

## backend-config.md 표준 형식

```markdown
# Backend Configuration

## 프로젝트 정보(Project Information)
- **Project ID**: [프로젝트 고유 식별자]
- **Project Name**: [프로젝트명]
- **Version**: [프로젝트 버전]
- **Description**: [프로젝트 설명]
- **Author**: [개발자/팀명]
- **Copyright**: © [연도] [회사명/개인명]. All rights reserved.
- **License**: [라이선스 종류] (예: MIT, Apache 2.0, Proprietary)
- **Created Date**: [프로젝트 생성일]
- **Last Modified**: [최종 수정일]

## 팀 정보(Team Information)
- **Lead Developer**: [리드 개발자명]
- **Contributors**: [기여자 목록]
- **Contact Email**: [연락처 이메일]
- **Team/Department**: [팀/부서명]

## 프로젝트 관리(Project Management)
- **Repository URL**: [Git 저장소 URL]
- **Documentation**: [문서화 사이트 URL]
- **Issue Tracker**: [이슈 트래커 URL]
- **CI/CD Pipeline**: [CI/CD 도구 및 URL]

## 비즈니스 정보(Business Information)
- **Client/Customer**: [고객사명]
- **Business Domain**: [비즈니스 도메인]
- **Project Scope**: [프로젝트 범위]
- **Target Users**: [대상 사용자]

## 기술 스택(Technology Stack)
- **Language**: [언어] [버전]
- **Framework**: [프레임워크] [버전]
- **Build Tool**: [빌드 도구] [버전]
- **Database**: [데이터베이스] [버전]
- **ORM**: [ORM] [버전]

## 프로젝트 구조(Project Structure)
\`\`\`
src/main/java/[패키지 경로]/
├── controller/     # REST API 엔드포인트
├── service/        # 비즈니스 로직
├── mapper/     # 데이터 접근 계층
├── entity/         # 도메인 엔티티
├── dto/           # 데이터 전송 객체
├── config/        # 설정 클래스
└── Application.java # 애플리케이션 진입점

src/main/resources/
├── application.yml # 애플리케이션 설정
├── mapper/        # MyBatis XML 매퍼
└── static/        # 정적 리소스
\`\`\`

## 네이밍 규칙(Naming Conventions)
- **클래스명**: PascalCase
- **메서드명**: camelCase
- **변수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE
- **테이블명**: snake_case
- **컬럼명**: snake_case

## API 설계 규칙(API Design Rules)
- **RESTful URL 패턴**:
  - GET /api/{resource} - 목록 조회
  - GET /api/{resource}/{id} - 단건 조회
  - POST /api/{resource} - 생성
  - PUT /api/{resource}/{id} - 수정
  - DELETE /api/{resource}/{id} - 삭제

## 개발 명령어(Development Commands)
\`\`\`bash
./gradlew bootRun  # 애플리케이션 실행
./gradlew build    # 빌드
./gradlew test     # 테스트 실행
\`\`\`

## 주요 의존성(Main Dependencies)
[dependencies 목록]

## 환경 설정(Environment Configuration)
- **Java 버전**: [Java 버전]
- **빌드 도구**: [빌드 도구]
- **서버 포트**: 8080 (기본값)
- **데이터베이스 포트**: [DB 포트]

## 데이터베이스 설정(Database Configuration)
\`\`\`yaml
[실제 데이터베이스 설정]
\`\`\`

---
*이 설정 파일은 AI 코드 생성 시 자동으로 참조됩니다.*
```

## 파일 생성 규칙

### 1. 파일 위치
- front-config.md: 지정된 --front-path 폴더의 루트
- backend-config.md: 지정된 --backend-path 폴더의 루트

### 2. 덮어쓰기 규칙
- 기본: 기존 파일이 있으면 확인 후 생성
- --force 옵션: 기존 파일 무조건 덮어쓰기

### 3. 인코딩
- UTF-8 인코딩으로 생성
- 줄바꿈: LF (\n)

## 완료 메시지 형식

```
✅ AI 프로젝트 설정 완료!

📊 처리된 프로젝트 정보:
  - Frontend 경로: [경로 또는 '없음']
  - Backend 경로: [경로 또는 '없음']
  - 프로젝트 상태: [기존분석/신규초기화]

📁 생성된 파일:
  ✅ front-config.md - [파일 크기] (Frontend 처리 시)
  ✅ backend-config.md - [파일 크기] (Backend 처리 시)

🚀 다음 단계:
  1. 설정 파일 검토: cat front-config.md
  2. AI 디자인 실행: /ai-design [이미지파일]
  3. 개발 서버 실행: npm run dev / ./gradlew bootRun

💡 팁: 생성된 설정 파일은 AI 코드 생성 시 자동으로 참조됩니다!
```