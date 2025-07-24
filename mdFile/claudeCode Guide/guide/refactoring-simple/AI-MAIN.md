# 🤖 AI 자율 리팩토링 메인 가이드

## 개요
이 가이드는 레거시 코드베이스를 현대적인 아키텍처로 변환하는 도구입니다.

> 📌 **중요**: 이 가이드는 프로젝트별 `project-config.md` 파일에 정의된 설정을 기준으로 동작합니다.
> 리팩토링을 시작하기 전에 반드시 대상 프로젝트의 `project-config.md` 파일이 준비되어 있어야 합니다.

## 실행 지침

### 1. project-config.md 파일 확인
프로젝트 루트에서 `project-config.md` 파일을 찾아 읽어주세요.

**파일이 없으면:**
```
⚠️ project-config.md 파일이 없습니다.

먼저 /analyze-project 명령어를 실행하여 프로젝트 설정을 생성해주세요.
```

### 2. 설정 읽기 및 기억
project-config.md의 모든 설정을 읽고 메모리에 저장하세요. 
이 설정들은 이후 모든 리팩토링 과정에서 지속적으로 적용됩니다.

### 3. 타입별 가이드 실행
- `project.type`이 **"backend"**면: `backend/AI-BACKEND.md` 실행
- `project.type`이 **"frontend"**면: `frontend/AI-FRONTEND.md` 실행

## 출력 구조 (덮어쓰기 방지)
project-config.md에 정의된 `refactoring.outputPath`에 **클래스명+날짜** 기반으로 고유 폴더가 생성됩니다:

```
{outputPath}/                              # project-config.md에 정의된 경로
├── VisitActionController_20250101/        # 첫 번째 리팩토링 (클래스명_YYYYMMDD)
│   ├── first/                           # 리팩토링 결과
│   │   ├── controller/visitAction/
│   │   ├── domain/visitAction/
│   │   ├── mapper/visitAction/
│   │   └── resources/mapper/sal/visitAction/
│   ├── refactoring-status.md            # 상세 시간 정보 포함
│   ├── dependency-analysis.md
│   └── mapping-result.md
├── CustomerController_20250101/           # 같은 날 다른 클래스
│   ├── first/
│   └── *.md
├── OrderController_20250102/              # 다른 날 리팩토링
│   ├── first/
│   └── *.md
└── ProductController_20250103/
    ├── first/
    └── *.md
```

### 🔄 덮어쓰기 방지 원리
- **고유성**: 클래스명 + 날짜 조합으로 폴더별 완전 분리
- **추적성**: 각 리팩토링의 독립적인 이력 보존
- **효율성**: 같은 날 같은 클래스는 덮어쓰기 (일반적으로 의도된 동작)
- **시간 정보**: 정확한 시작/완료 시간은 각 폴더 내 .md 파일에 상세 기록

### 📋 명명 규칙

**폴더명 (workingDir)**:
- 패턴: `{targetClassName}_{todayYYYYMMDD}`
- 예시: `VisitActionController_20250101`

**domainName 규칙**:
- 대상 클래스명에서 레이어 suffix 제거 후 camelCase
- 예: VisitActionController → visitAction
- 예: OrderManagementController → orderManagement

**AI 자동 설정 변수**:
- `{targetClassName}`: 리팩토링 대상 클래스명
- bash date 명령어를 사용하여 날짜 설정정
- `{todayYYYYMMDD}`: 실행 날짜 (YYYYMMDD 형식)
- `{workingDir}`: {outputPath}/{targetClassName}_{todayYYYYMMDD}
- `{refactoringPath}`: {workingDir}

## 🚀 실제 사용 예시

### 1일차 리팩토링 시나리오
```
# 2025년 1월 1일 - VisitActionController 리팩토링
{outputPath}/VisitActionController_20250101/
├── first/controller/visitAction/
├── first/domain/visitAction/
└── refactoring-status.md  # 상세 시간 로그 포함

# 같은 날 - CustomerController 리팩토링
{outputPath}/CustomerController_20250101/
├── first/controller/customer/
├── first/domain/customer/
└── refactoring-status.md  # 독립적인 시간 로그

# 2025년 1월 2일 - OrderController 리팩토링
{outputPath}/OrderController_20250102/
├── first/controller/order/
├── first/domain/order/
└── refactoring-status.md  # 새로운 날의 리팩토링
```

### 이점
- ✅ **덮어쓰기 방지**: 각 리팩토링이 독립적으로 저장
- ✅ **이력 추적**: 모든 리팩토링 작업의 완전한 기록 보존
- ✅ **비교 분석**: 서로 다른 시점의 리팩토링 결과 비교 가능
- ✅ **효율성**: 같은 날 같은 클래스는 덮어쓰기로 최신 상태 유지

---

**이 가이드는 단순히 라우터 역할입니다. 실제 리팩토링은 타입별 AI 가이드에서 수행됩니다.**