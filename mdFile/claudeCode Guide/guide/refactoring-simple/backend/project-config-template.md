# 백엔드 프로젝트 설정 템플릿

이 파일은 Java/Spring Boot 백엔드 프로젝트를 위한 완전한 설정 템플릿입니다.
`project-config.md` 파일명으로 프로젝트 루트에 저장하세요.

## 🔴 필수 사용자 입력 변수

```yaml
# 사용자가 반드시 입력해야 하는 변수
user_input:
  className: "VisitAction"  # 리팩토링 대상 클래스명 (Controller/Service/Mapper에서 suffix 제외)
  targetClass: "VisitActionController"  # 실제 타겟 클래스 (전체명)
```

## 프로젝트 정보

```yaml
project:
  name: "my-backend-project"
  type: "backend"
  framework: "spring-boot"
  language: "java"
  version: "17"  # Java 버전
```

## 기술 스택

```yaml
tech_stack:
  build_tool: "gradle"  # gradle 또는 maven
  spring_boot_version: "3.2.0"
  database: "mysql"  # mysql, mariadb, postgresql, oracle
  orm: "mybatis"  # mybatis 또는 jpa
```

## 📂 경로 설정 (절대경로)

```yaml
paths:
  baseProjectPath: "/path/to/your/project"
  javaMain: "src/main/java"
  resourceMain: "src/main/resources"
  testMain: "src/test/java"
  projectPackagePath: "com/example/project"  # 패키지 경로 (슬래시 구분)
  
  # 계산된 전체 경로
  fullProjectPath: "{baseProjectPath}/{javaMain}/{projectPackagePath}"
  fullResourcePath: "{baseProjectPath}/{resourceMain}"
  
  # 출력 경로 (가이드 요구사항)
  outputPath: "{baseProjectPath}/refactoring"
```

## 📦 패키지 구조

```yaml
packages:
  basePackage: "com.example.project"
  controllerPackage: "{basePackage}.controller"
  servicePackage: "{basePackage}.service"  # 또는 domain
  mapperPackage: "{basePackage}.mapper"    # MyBatis 사용시
  repositoryPackage: "{basePackage}.repository"  # JPA 사용시
  dtoPackage: "{basePackage}.dto"
  modelPackage: "{basePackage}.model"
  configPackage: "{basePackage}.config"
  exceptionPackage: "{basePackage}.exception"
  utilPackage: "{basePackage}.util"
```

## 🔍 소스 파일 검색 경로

```yaml
sourceLocations:
  # 실제 소스 파일이 있는 위치 (AI가 검색할 경로)
  firstControllerPath: "{fullProjectPath}/controller"
  firstServicePath: "{fullProjectPath}/service"  # 또는 domain
  firstMapperPath: "{fullProjectPath}/mapper"
  firstXMLPath: "{fullResourcePath}/mapper"
  
  # 개별 파일 경로 (검색용)
  controllerFile: "{firstControllerPath}/{className}Controller.java"
  serviceFile: "{firstServicePath}/{className}Service.java"
  mapperFile: "{firstMapperPath}/{className}Mapper.java"
  xmlFile: "{firstXMLPath}/{className}_SqlMapper.xml"
```

## 🚀 리팩토링 설정

```yaml
refactoring:
  # 기본 리팩토링 경로
  refactoringBase: "{baseProjectPath}/refactoring"
  
  # 작업 디렉토리 (가이드 핵심 변수)
  workingDir: "{outputPath}/{targetClassName}_{todayYYYYMMDD}"
  
  # 날짜별 리팩토링 경로 (하위 호환성)
  refactoringPath: "{workingDir}"
  
  # 전략
  strategy: "domain-driven"  # domain-driven, layer-based
  
  # 리팩토링 대상 레이어
  layers:
    - controller
    - domain  # service 대신 domain 권장
    - mapper
    - xml
  
  # 결과 경로 (가이드 요구사항: first/ 폴더 구조)
  resultPaths:
    analysisPath: "{workingDir}/analysis"
    resultPath: "{workingDir}/result"
    controllerOutput: "{workingDir}/first/controller"
    serviceOutput: "{workingDir}/first/domain"  # 또는 service
    mapperOutput: "{workingDir}/first/mapper"
    xmlOutput: "{workingDir}/first/resources/mapper"
```

## 📅 날짜 변수 (AI 자동 설정)

```yaml
date_variables:
  # AI가 실행 시점에 자동으로 설정
  todayDate: "{CALCULATED_AT_RUNTIME}"  # YYYY-MM-DD 형식
  todayDatetime: "{CALCULATED_AT_RUNTIME}"  # YYYY-MM-DD HH:MM:SS 형식
  todayYYYYMMDD: "{CALCULATED_AT_RUNTIME}"  # YYYYMMDD 형식
  timestamp: "{CALCULATED_AT_RUNTIME}"  # YYYYMMDD_HHMMSS 형식
```

## MyBatis 설정 (MyBatis 사용시)

```yaml
mybatis:
  xmlLocation: "mapper"  # resources 하위 경로
  xmlSubPath: "sal"      # 추가 하위 경로 (선택사항)
  xmlNaming: "{SpecificDomain}.xml"  # XML 파일 명명 규칙 (가이드 요구사항)
  xmlNamingLegacy: "{className}_SqlMapper.xml"  # 레거시 프로젝트 패턴
  mapperScanPackage: "{basePackage}.mapper"
  
  # 실제 XML 경로
  xmlFullPath: "{fullResourcePath}/{xmlLocation}/{xmlSubPath}"
  
  # 리팩토링 후 XML 경로 (가이드 요구사항)
  xmlOutputPath: "{workingDir}/first/resources/mapper/{xmlSubPath}/{domainName}"
  
  # namespace 규칙 (가이드 요구사항)
  namespacePattern: "{basePackage}.mapper.{domainName}.{SpecificDomain}Mapper"
```

## JPA 설정 (JPA 사용시)

```yaml
jpa:
  entityPackage: "{basePackage}.entity"
  repositoryPackage: "{basePackage}.repository"
  useQueryDsl: true
  namingStrategy: "snake_case"  # snake_case, camelCase
```

## 🏷️ 네이밍 규칙

```yaml
naming:
  # 클래스 네이밍
  controllerSuffix: "Controller"
  serviceSuffix: "Service"
  serviceImplSuffix: "ServiceImpl"
  mapperSuffix: "Mapper"
  repositorySuffix: "Repository"
  
  # DTO 네이밍
  requestPrefix: "Request"   # RequestUser
  responsePrefix: "Response"  # ResponseUser
  dtoSuffix: "Dto"           # UserDto
  
  # 패키지 네이밍 (가이드 핵심 규칙)
  domainPackageStyle: "camelCase"  # camelCase 사용
  domainNameRule: "suffix 제거 후 camelCase 변환"
  domainNameExamples:
    - "VisitActionController → visitAction"
    - "OrderManagementService → orderManagement"
    - "CustomerMapper → customer"
  subPackageAllowed: true  # 도메인 하위 패키지 허용 여부
  
  # 특수 네이밍 패턴
  specialPatterns:
    - "ManageController"  # 관리 컨트롤러
    - "QueryService"      # 조회 서비스 (CQRS)
    - "CommandService"    # 명령 서비스 (CQRS)
    - "MapperImpl"        # 매퍼 구현체
```

## 🎯 AI 도구 사용 지침

```yaml
ai_tools:
  # 권장 도구 사용법
  file_exploration: "LS, Glob"  # find, ls 명령어 대신
  pattern_search: "Grep"        # grep 명령어 대신
  file_reading: "Read"          # cat, head, tail 명령어 대신
  file_creation: "Write, Edit"  # echo, touch 명령어 대신
  folder_creation: "Write"      # mkdir 명령어 대신 (디렉토리 구조와 함께)
  
  # 검색 패턴 예시 (가이드 요구사항)
  glob_patterns:
    - "**/{className}Controller.java"
    - "**/*{className}*.java"
    - "**/mapper/**/*{className}*_SqlMapper.xml"
    - "**/{className}*Service.java"
    - "**/{domainName}/*Controller.java"
    - "**/{domainName}/*Service.java"
    - "**/{domainName}/*Mapper.java"
  
  grep_patterns:
    - "class {className}Controller"
    - "@Mapper.*{className}"
    - "@Service.*{className}"
    - "public interface {className}Mapper"
    - "@RestController|@Controller"
    - "@Service|@Component"
```

## 📁 폴더 구조 템플릿

```yaml
folder_structure:
  # 올바른 리팩토링 폴더 구조 (가이드 요구사항)
  correct_structure: |
    {workingDir}/
    ├── analysis/                           # 분석 결과
    │   ├── dependency-analysis.md
    │   └── refactoring-plan.md
    ├── first/                              # 첫 번째 리팩토링 단계 (핵심)
    │   ├── controller/
    │   │   └── {domainName}/              # 예: visitAction/
    │   │       ├── VisitPlanController.java
    │   │       ├── VisitExecutionController.java
    │   │       └── ContractActionController.java
    │   ├── domain/                        # service 대신 domain 사용
    │   │   └── {domainName}/
    │   │       ├── VisitPlanQueryService.java
    │   │       ├── VisitPlanCommandService.java
    │   │       └── VisitExecutionService.java
    │   ├── mapper/
    │   │   └── {domainName}/
    │   │       ├── VisitPlanMapper.java
    │   │       ├── VisitActionQueryMapper.java
    │   │       └── VisitExecutionMapper.java
    │   └── resources/
    │       └── mapper/
    │           └── sal/                   # 기존 구조 유지 (프로젝트별)
    │               └── {domainName}/      # 예: visitAction/
    │                   ├── VisitPlan.xml
    │                   ├── VisitActionQuery.xml
    │                   └── VisitExecution.xml
    ├── refactoring-status.md              # 진행 상황 추적
    └── mapping-result.md                  # 매핑 결과
  
  # 금지된 구조 (가이드 요구사항)
  forbidden_patterns:
    - "domainName 하위에 추가 기능별 폴더 생성"
    - "대문자 도메인 폴더명"
    - "service 폴더 사용 (domain 사용 권장)"
    - "xml 폴더 직접 사용 (resources 구조 준수)"
    - "first/ 폴더 생략"
```

## ✅ 체크포인트 시스템

```yaml
checkpoints:
  # 체크포인트 ID 규칙 (가이드 요구사항)
  controller: "CP-C{번호}"  # 예: CP-C001, CP-C002, CP-C003
  service: "CP-S{번호}"     # 예: CP-S001, CP-S002, CP-S003
  mapper: "CP-M{번호}"      # 예: CP-M001, CP-M002, CP-M003
  xml: "CP-X{번호}"         # 예: CP-X001, CP-X002, CP-X003
  verification: "CP-V{번호}" # 예: CP-V001, CP-V002
  
  # 단계별 체크포인트 계획
  stage_checkpoints:
    "01-target-analysis": ["CP-A001"]
    "02-refactoring-plan": ["CP-P001"]
    "03-controller-refactoring": ["CP-C001", "CP-C002", "CP-C003"]
    "04-service-refactoring": ["CP-S001", "CP-S002", "CP-S003"]
    "05-mapper-refactoring": ["CP-M001", "CP-M002", "CP-M003"]
    "06-xml-refactoring": ["CP-X001", "CP-X002", "CP-X003"]
    "07-verification": ["CP-V001", "CP-V002"]
    "08-mapping-result": ["CP-R001"]
  
  # 진행 상황 추적
  progress_tracking: true
  auto_save: true
  issue_documentation: true
  real_time_update: true
```

## 🚨 연속 실행 원칙

```yaml
execution_rules:
  # 무중단 실행 설정
  continuous_execution: true
  no_user_confirmation: true  # 사용자 확인 절대 금지
  auto_progress: true         # 단계별 자동 진행
  
  # 에러 처리
  stop_on_critical_only: true  # 치명적 오류시에만 중단
  auto_retry: 3                # 자동 재시도 횟수
  
  # 진행 상황 보고
  progress_report_only: true   # 진행 상황만 보고
  final_report_at_end: true    # 완료 후에만 최종 보고
```

## 🔧 코드 스타일

```yaml
codeStyle:
  indentation: "spaces"  # spaces 또는 tabs
  indentSize: 4
  maxLineLength: 120
  finalParameters: true
  explicitTypes: true  # var 사용 여부
```

## ✅ 검증 규칙

```yaml
validation:
  # 리팩토링 완료 기준 (가이드 요구사항)
  requireTests: false  # 테스트는 선택사항
  allowWarnings: true  # 경고 허용
  method_count_tolerance: 0  # 메소드 수 정확히 일치
  url_mapping_changes: false # URL 변경 절대 금지
  return_type_changes: false # 반환 타입 변경 절대 금지
  
  # 코드 품질 기준
  maxMethodLength: 100  # 메소드 길이 제한
  maxClassLength: 1000  # 클래스 길이 제한
  maxCyclomaticComplexity: 15  # 복잡도 제한
  
  # 기능 보존 원칙 (가이드 핵심 요구사항)
  preserve_functionality: 100  # 100% 기능 보존
  preserve_api_contracts: true # API 계약 보존
  preserve_transaction_boundaries: true # 트랜잭션 경계 보존
  preserve_url_mappings: true # URL 매핑 완전 보존
  preserve_return_types: true # 반환 타입 완전 보존
  
  # 수량 검증
  total_method_preservation: true # 전체 메소드 수 보존
  mapper_signature_preservation: true # Mapper 시그니처 완전 보존
  xml_query_preservation: true # XML 쿼리 완전 보존
```

## 🎯 프로젝트별 특수 설정

```yaml
custom:
  # 특수 어노테이션
  customAnnotations:
    - "@CustomTransactional"
    - "@CompanySpecific"
  
  # 제외 패턴
  excludePatterns:
    - "**/generated/**"
    - "**/test/**"
  
  # 추가 의존성
  additionalDependencies:
    - "com.company.common"

# CQRS 적용 기준 (가이드 요구사항 추가)
cqrs_criteria:
  # CQRS 적용 조건 (가이드 04-service-refactoring.md)
  apply_when_methods_over: 15  # 메소드 수 15개 이상
  query_method_ratio_over: 60  # 읽기 메소드 비율 60% 이상
  clear_separation_exists: true # 읽기/쓰기 명확히 구분됨
  
  # CQRS 적용 시 분리 패턴
  query_service_suffix: "QueryService"
  command_service_suffix: "CommandService"
  
  # 트랜잭션 설정
  query_transaction: "@Transactional(readOnly = true)"
  command_transaction: "@Transactional"
```

## 📋 리팩토링 우선순위

```yaml
priorities:
  # 우선 리팩토링 대상
  high:
    - "UserController"
    - "OrderService"
  
  # 나중에 리팩토링
  low:
    - "LegacyController"
    - "UtilService"
  
  # 제외 대상
  exclude:
    - "SystemController"
    - "HealthCheckController"
```

# 🔄 핵심 변수 정의 (가이드 요구사항)

```yaml
# 가이드에서 사용하는 핵심 변수들
core_variables:
  # 입력 변수
  className: "{user_input.className}"  # VisitAction
  targetClass: "{user_input.targetClass}"  # VisitActionController
  targetClassName: "{user_input.targetClass}"  # VisitActionController (별칭)
  
  # 계산 변수
  domainName: "{className를 camelCase로 변환}"  # visitAction
  
  # 경로 변수
  outputPath: "{paths.outputPath}"  # /path/to/project/refactoring
  workingDir: "{outputPath}/{targetClassName}_{todayYYYYMMDD}"
  
  # 날짜 변수 (런타임 계산)
  todayYYYYMMDD: "{실행 시점 자동 계산}"
  todayDate: "{실행 시점 자동 계산}"
  todayDatetime: "{실행 시점 자동 계산}"
  
  # 패키지 변수
  basePackage: "{packages.basePackage}"
  fullProjectPath: "{paths.fullProjectPath}"
  fullResourcePath: "{paths.fullResourcePath}"

# 변수 사용 예시
variable_examples:
  # 가이드에서 사용하는 패턴
  - "{workingDir}/first/controller/{domainName}/"
  - "{workingDir}/first/domain/{domainName}/"
  - "{workingDir}/first/mapper/{domainName}/"
  - "{workingDir}/first/resources/mapper/sal/{domainName}/"
  - "{basePackage}.mapper.{domainName}.{SpecificDomain}Mapper"
```

---

## ⚠️ 중요 알림

이 설정 파일은 리팩토링 가이드 요구사항을 완벽히 준수하도록 설계되었습니다.
**가이드 준수 항목**: workingDir, first/ 폴더 구조, domainName 규칙, CQRS 기준, 변수 문법 통일 등.
프로젝트별로 필요에 따라 수정하여 사용하되, 핵심 구조는 유지하세요.