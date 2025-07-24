# 기술 스택 정의 및 공통 변수 (레거시 - 참고용)

> ⚠️ **주의**: 이 파일은 특정 프로젝트(osstem/ows-sal)에 종속된 레거시 설정입니다.
> 독립적인 가이드 사용을 위해서는 다음 파일들을 참고하세요:
> - `refactoring-framework.md`: 프로젝트 독립적 가이드
> - `project-config-template.md`: 프로젝트별 설정 템플릿
> - `README.md`: 사용 방법

---

## 기술 스택
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.2
- **빌드**: Gradle
- **ORM**: MyBatis
- **데이터베이스**: MariaDB

## 날짜 변수
- AI가 실행 시점에 자동으로 설정하는 날짜 변수
- `{todayDate}`: 오늘 날짜 (예: 2024-03-15)
- `{todayDatetime}`: 현재 일시 (예: 2024-03-15 14:30:00)
- `{todayYYYYMMDD}`: 오늘 날짜 (예: 20240315)
- `{timestamp}`: 타임스탬프 (예: 20240315_143000)

## 경로 변수
- `{guideDocPath}`: /mnt/c/guide/refactoring
- `{baseProjectPath}`: /mnt/c/ows-project/workspace-codereview/ows-sal
- `{refactoringBase}`: {baseProjectPath}/refactoring
- `{className}`: 리팩토링 대상 클래스명에서 layer (Controller, Service, Mapper) suffix를 제외한 이름
- `{refactoringPath}`: {refactoringBase}/{className}-{todayYYYYMMDD}
- `{javaMain}`: src/main/java
- `{resourceMain}`: src/main/resources
- `{projectPath}`: com/osstem/ow/sal
- `{fullProjectPath}`: {baseProjectPath}/{javaMain}/{projectPath}
- `{fullResourcePath}`: {baseProjectPath}/{resourceMain}/mapper

## 패키지 구조
- `{basePackage}`: com.osstem.ow.sal
- `{controllerPackage }`: {basePackage}.controller
- `{servicePackage}`: {basePackage}.domain
- `{mapperPackage}`: {basePackage}.mapper
- `{dtoPackage}`: {basePackage}.dto
- `{modelPackage}`: {basePackage}.model

## AI 도구 사용 지침
- **파일 탐색**: find, ls 명령어 대신 LS, Glob 도구 사용
- **패턴 검색**: grep 명령어 대신 Grep 도구 사용
- **파일 읽기**: cat, head, tail 명령어 대신 Read 도구 사용
- **파일 생성/수정**: echo, touch 명령어 대신 Write, Edit 도구 사용
- **폴더 생성**: mkdir 명령어 대신 Write 도구로 디렉토리 구조 생성
- **날짜/시간**: date 명령어 대신 AI가 내장 기능으로 처리

## 리팩토링 대상 실제 경로
**AI가 검색하는 원본 소스 위치**:
- `{firstControllerPath}`: {fullProjectPath}/controller
- `{firstServicePath}`: {fullProjectPath}/domain
- `{firstMapperPath}`: {fullProjectPath}/mapper
- `{firstXMLPath}`: {fullResourcePath}/sal

### 🔍 AI를 위한 소스 파일 절대 경로 빠른 찾기 가이드

#### Java 소스 파일
```
# Controller 찾기
{firstControllerPath}/{className}Controller.java

# Service/Domain 찾기
{firstServicePath}/{className}Service.java

# Mapper 찾기
{firstMapperPath}/{className}Mapper.java

# MyBatis XML 파일
{firstXMLPath}/{className}_SqlMapper.xml
```

### 빠른 검색 명령어
```bash
# Glob 도구 사용 예시
pattern: "**/{className}Controller.java"
pattern: "**/*{className}*.java"
pattern: "**/mapper/sal/*{className}*_SqlMapper.xml"

# Grep 도구 사용 예시
pattern: "class {className}Controller"
pattern: "@Mapper.*{className}"
include: "*.java"
```

### 리팩토링된 파일 찾기
```
# 리팩토링 파일
{refactoringPath}/controller/{className}/*.java
{refactoringPath}/domain/{className}/*.java
{refactoringPath}/mapper/{className}/*.java
{refactoringPath}/resources/mapper/sal/{className}/*.xml
```

## 단계별 경로
- `{analysisPath}`: {refactoringPath}/analysis
- `{resultPath}`: {refactoringPath}/result

### 명명 규칙
- Controller: {className}Controller.java
- Service: {className}Service.java
- Mapper: {className}Mapper.java
- XML: mapper/sal/{className}_SqlMapper.xml
- Request DTO: Request{className}.java
- Response DTO: Response{className}.java
- 내부 DTO: {className}Dto.java

## 폴더 구조
```
{refactoringPath}/
  ├── analysis/          # 의존성 분석 + 코드 리뷰
  ├── controller/        # 도메인별 Controller
  ├── domain/            # 도메인별 Service
  ├── mapper/            # 도메인별 Mapper
  ├── resources/         # MyBatis XML 파일
  └── result/            # 결과 리포트
```

### 리팩토링 폴더 구조 예시

#### ✅ 올바른 리팩토링 폴더 구조
```
{refactoringPath}/
├── controller/
│   └── visitAction/                 # {className} 소문자
│       ├── ActionPlanController.java
│       ├── CustomerController.java
│       └── OrganizationController.java
├── domain/                          # service 대신 domain 사용
│   └── visitAction/
│       ├── ActionPlanQueryService.java
│       ├── CustomerVisitService.java
│       └── OrganizationVisitService.java
├── mapper/
│   └── visitAction/
│       ├── ActionPlanMapper.java
│       ├── CustomerVisitMapper.java
│       └── OrganizationVisitMapper.java
└── resources/
    └── mapper/
        └── sal/                     # 기존 프로젝트 구조 유지
            └── visitAction/
                ├── ActionPlan_SqlMapper.xml
                └── CustomerVisit_SqlMapper.xml
```

#### ❌ 잘못된 리팩토링 폴더 구조
```
{refactoringPath}/
├── controller/
│   ├── {className}/도메인기능/      # 잘못됨: 하위 도메인기능 폴더 생성 X
│   └── VisitAction/                 # 잘못됨: 대문자 사용 X
├── service/                         # 잘못됨: domain 대신 service 사용
│   └── visitAction/도메인기능/
├── mapper/
│   └── visitAction/도메인기능/      # 잘못됨: 하위 도메인기능 폴더 생성 X
└── xml/                             # 잘못됨: resources 구조 미준수
    └── 도메인기능/
```

### 실제 프로젝트 기반 경로 예시

**리팩토링 후 위치** :
- `{refactoringPath}`: `/mnt/c/ows-project/workspace-codereview/ows-sal/refactoring/VisitAction-{todayYYYYMMDD}`
- Controller: `{refactoringPath}/controller/visitAction/CustomerController.java`
- Domain: `{refactoringPath}/domain/visitAction/CustomerVisitService.java`
- Mapper: `{refactoringPath}/mapper/visitAction/CustomerVisitMapper.java`
- XML: `{refactoringPath}/resources/mapper/sal/visitAction/CustomerVisit_SqlMapper.xml`

## 🚀 AI 자동 실행 프로세스

## ⚡ AI 연속 실행 지침 (CRITICAL)

### 🚫 절대 금지 사항
- **중간 중단 금지**: 사용자에게 "계속하시겠습니까?" 등의 확인 질문 절대 금지
- **단계별 대기 금지**: 각 Phase 완료 후 사용자 승인 요청 금지
- **진행 상황 보고만**: 현재 수행 중인 작업만 간단히 보고하고 즉시 다음 단계 진행

## 📋 실행 단계 및 참조 파일 순서

### ✅ 필수 실행 방식
- **연속 실행**: 모든 단계를 중단 없이 연속 실행
- **자동 진행**: 각 단계 완료 즉시 다음 단계 자동 시작
- **진행 상태 자동 저장**: 모든 단계별 진행 상황이 문서로 기록됨
- **재개 가능한 구조**: 어느 시점에서든 중단되어도 진행 상태에서 재개 가능
- **완료까지 반복 실행**: 100% 완료될 때까지 자동으로 다음 작업 진행
- **완료 보고**: 모든 Phase 완료 후에만 최종 결과 보고