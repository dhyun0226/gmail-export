# 리팩토링 프레임워크 가이드

이 문서는 프로젝트 독립적인 리팩토링 방법론과 기술 스택을 정의합니다.

## 지원 기술 스택

### 언어 및 프레임워크
- **언어**: Java 17+ (LTS 버전 권장)
- **프레임워크**: Spring Boot 2.x / 3.x
- **빌드 도구**: Maven / Gradle
- **ORM**: MyBatis / JPA
- **데이터베이스**: MySQL / MariaDB / PostgreSQL / Oracle

## 리팩토링 방법론

### 1. 도메인 기반 분리 원칙
- 비즈니스 도메인별로 명확한 경계 설정
- 각 도메인은 독립적인 패키지 구조 유지
- 도메인 간 의존성 최소화

### 2. 계층별 리팩토링 순서
1. **Controller 계층**: API 엔드포인트 분리
2. **Service 계층**: 비즈니스 로직 분리
3. **Mapper/Repository 계층**: 데이터 액세스 분리
4. **XML/Query 계층**: 쿼리 분리

### 3. 폴더 구조 패턴

```
{outputPath}/                    # project-config.md에 정의된 경로
├── first/                      # 첫 번째 리팩토링 단계
│   ├── controller/
│   │   └── {domainName}/      # 도메인별 패키지
│   │       └── {Domain}Controller.java
│   ├── domain/                # 서비스 레이어 (프로젝트 관례)
│   │   └── {domainName}/
│   │       ├── {Domain}Service.java
│   │       └── {Domain}QueryService.java  # CQRS 적용 시
│   ├── mapper/                # MyBatis 사용 시
│   │   └── {domainName}/
│   │       └── {Domain}Mapper.java
│   ├── repository/            # JPA 사용 시
│   │   └── {domainName}/
│   │       └── {Domain}Repository.java
│   └── resources/
│       └── mapper/            # MyBatis XML
│           └── sal/           # 프로젝트별 패키지
│               └── {domainName}/
│                   └── {Domain}_SqlMapper.xml
└── *.md                        # 분석 결과 문서들
```

### 4. 명명 규칙

#### 클래스 명명
- Controller: `{Domain}Controller`
- Service: `{Domain}Service`
- Query Service: `{Domain}QueryService`
- Command Service: `{Domain}CommandService`
- Mapper: `{Domain}Mapper`
- Repository: `{Domain}Repository`

#### 패키지 명명 (domainName)
- 도메인 패키지명 규칙: 대상 클래스명에서 레이어 suffix를 제거하고 camelCase로 변환
- 예시:
  - VisitActionController → visitAction
  - OrderManagementService → orderManagement
  - CustomerMapper → customer

## AI 실행 지침

### 도구 사용 가이드
| 작업 | 권장 도구 | 피해야 할 명령어 |
|------|----------|-----------------|
| 파일 탐색 | LS, Glob | find, ls |
| 패턴 검색 | Grep | grep |
| 파일 읽기 | Read | cat, head, tail |
| 파일 생성/수정 | Write, Edit | echo, touch |
| 폴더 생성 | Write (디렉토리 구조와 함께) | mkdir |

### 날짜 변수 (AI 자동 설정)
- `{todayDate}`: YYYY-MM-DD 형식
- `{todayDatetime}`: YYYY-MM-DD HH:MM:SS 형식
- `{todayYYYYMMDD}`: YYYYMMDD 형식
- `{timestamp}`: YYYYMMDD_HHMMSS 형식

### 연속 실행 원칙
1. **무중단 실행**: 모든 단계를 중단 없이 연속 실행
2. **자동 진행**: 사용자 확인 없이 자동으로 다음 단계 진행
3. **상태 저장**: 각 단계별 진행 상황 자동 기록
4. **에러 처리**: 치명적 오류 시에만 중단 및 보고

## 체크포인트 시스템

### 체크포인트 ID 규칙
- Controller: `CP-C{번호}` (예: CP-C001)
- Service: `CP-S{번호}` (예: CP-S001)
- Mapper: `CP-M{번호}` (예: CP-M001)
- XML: `CP-X{번호}` (예: CP-X001)
- Verification: `CP-V{번호}` (예: CP-V001)

### 진행 상황 추적
- 각 메소드/쿼리 이동 시 체크포인트 기록
- 완료율 자동 계산
- 이슈 및 특이사항 문서화

## 검색 패턴 예시

### Glob 패턴
```bash
# Controller 찾기
"**/*Controller.java"
"**/{domainName}/*Controller.java"

# Service 찾기
"**/*Service.java"
"**/{domainName}/*Service*.java"

# Mapper 찾기
"**/*Mapper.java"
"**/*Mapper.xml"
```

### Grep 패턴
```bash
# 클래스 정의 찾기
"class.*Controller"
"@RestController|@Controller"
"@Service|@Component"
"@Mapper"

# 메소드 찾기
"@RequestMapping|@GetMapping|@PostMapping"
"public.*Service"
```

## 품질 기준

### 코드 보존 원칙
- **기능 100% 보존**: 모든 API와 비즈니스 로직 유지
- **URL 불변**: 모든 엔드포인트 경로 유지
- **반환 타입 불변**: API 응답 구조 완전 보존
- **트랜잭션 경계 유지**: 데이터 일관성 보장

### 리팩토링 완료 기준
1. 모든 컴파일 오류 해결
2. 원본과 동일한 메소드 수
3. 모든 의존성 정상 주입
4. 도메인별 명확한 분리 달성