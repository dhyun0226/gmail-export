# 프로젝트 상태 분석 가이드

이 가이드는 지정된 경로의 프로젝트 상태를 분석하여 기존 프로젝트인지 신규 프로젝트인지 판단합니다.

## 기본 기술 스택

**Frontend 신규 프로젝트 기본값:**

- Framework: Vue 3.5
- Language: TypeScript 5.3
- Build Tool: Vite 5.4
- UI Library: Bootstrap 5.3
- State Management: Pinia 2.2

**Backend 신규 프로젝트 기본값:**

- Language: Java 21
- Framework: Spring Boot 3.4.0
- Build Tool: Gradle 8.5
- Database: MariaDB 11.2
- ORM: MyBatis 3.5.15

## 분석 절차

### 1. 경로 유효성 검증

- --front-path와 --backend-path 옵션 확인
- 지정된 경로가 존재하는지 확인
- 경로에 대한 읽기/쓰기 권한 확인

### 2. Frontend 프로젝트 상태 확인

**기존 프로젝트 판단 기준:**

- `package.json` 파일 존재
- `src/` 폴더 존재
- `node_modules/` 폴더 존재 (선택사항)

**신규 프로젝트 판단 기준:**

- 폴더가 존재하지 않거나 비어있음
- package.json 파일이 없음

### 3. Backend 프로젝트 상태 확인

**기존 프로젝트 판단 기준:**

- `build.gradle` 또는 `pom.xml` 파일 존재
- `src/main/java/` 폴더 존재
- Java 소스 파일 (.java) 존재

**신규 프로젝트 판단 기준:**

- 폴더가 존재하지 않거나 비어있음
- build.gradle 또는 pom.xml 파일이 없음
- groupId, artifactId 파라미터 필요

### 4. 필수 파라미터 검증

**Backend 신규 프로젝트 시:**

```bash
# 필수 파라미터 확인
if [신규 Backend 프로젝트] && [groupId 또는 artifactId 누락]; then
    echo "❌ Backend 신규 프로젝트 생성을 위해 다음 파라미터가 필요합니다:"
    echo "   --groupId=com.yourcompany.yourproduct"
    echo "   --artifactId=your-service-name"
    echo ""
    echo "예시: /ai-design-config --backend-path=./backend --groupId=com.osstem.ows --artifactId=sal"
    exit 1
fi
```

## 분석 결과 설정

분석 완료 후 다음 변수들을 설정:

- `FRONTEND_EXISTS`: true/false
- `BACKEND_EXISTS`: true/false
- `FRONTEND_NEW_PROJECT`: true/false
- `BACKEND_NEW_PROJECT`: true/false
- `GROUPID`: Backend groupId 값
- `ARTIFACTID`: Backend artifactId 값

## 다음 단계 결정

분석 결과에 따라 적절한 가이드로 이동:

1. Frontend 기존 프로젝트 → frontend-analyzer.md
2. Frontend 신규 프로젝트 → frontend-initializer.md
3. Backend 기존 프로젝트 → backend-analyzer.md
4. Backend 신규 프로젝트 → backend-initializer.md