# 🤖 AI 자율 비즈니스 도메인 리팩토링 가이드

## 🔴 필수 사전 작업
**반드시 다음 파일들을 순서대로 읽고 설정을 메모리에 저장한 후 진행:**
1. `project-config.md` - 현재 프로젝트의 구체적 설정 (프로젝트 루트에 위치)
2. `../common/refactoring-framework.md` - 프로젝트 독립적 리팩토링 프레임워크 및 설정

## 개요
이 가이드는 비즈니스 도메인 기능 단위로 소스코드를 리팩토링하는 자동화 가이드. 
Controller → Service → Mapper → MyBatis XML 순서로 진행하며, 기능은 100% 유지하면서 도메인별로 명확히 분리.

### 타겟 클래스별 적용 범위
- **Controller 지정시**: Controller → Service → Mapper → MyBatis XML 순서로 분석
- **Service 지정시**: Service → Mapper → MyBatis XML 순서로 분석 (Controller 제외)
- **Mapper 지정시**: Mapper → MyBatis XML 순서로 분석

## 🚀 실행 방법

### 1. 필요한 정보 제공
- **타겟 클래스**: 리팩토링 대상 Controller/Service/Mapper 클래스명 또는 경로
- **프로젝트 경로**: 소스코드가 있는 디렉토리 경로
- **결과 저장 경로**: 리팩토링 결과를 저장할 경로

### 2. 자동 실행
이 가이드가 제공되면 AI는 다음을 자동으로 수행합니다:
1. project-config.md 읽기 및 설정 적용 확인
2. refactoring-status.md 파일 생성
3. 단계별 순차 실행 및 진행 상황 업데이트
4. 최종 결과 검증 및 보고서 생성

## 📋 실행 단계

### Stage 1: 타겟 분석 (`stage-1/01-target-analysis.md`)
- **대상 클래스 구조 파악**: Controller/Service/Mapper 구조 분석
- **비즈니스 도메인별 기능 분류**: 도메인 경계 식별
- **의존성 관계 분석**: 클래스 간 의존성 매핑

### Stage 2: 리팩토링 계획 수립 (`stage-1/02-refactoring-plan.md`)
- **도메인별 패키지 구조 설계**: 새로운 패키지 구조 계획
- **메소드 이동 계획 수립**: 메소드별 이동 전략 수립
- **체크포인트 정의**: 단계별 검증 포인트 설정

### Stage 3: Controller 리팩토링 (`stage-1/03-controller-refactoring.md`)
- **핵심 원칙**: URL 매핑과 반환 타입은 절대 변경하지 않음
- **프로세스**:
  1. 도메인별 Controller 클래스 생성 (`first/controller/{domainName}/`)
  2. 관련 메소드 및 의존성 이동
  3. Service 의존성 주입 업데이트
  4. 원본 Controller에 이동 완료 주석 추가
  5. 컴파일 오류 해결 및 검증

### Stage 4: Service 리팩토링 (`stage-1/04-service-refactoring.md`)
- **핵심 원칙**: 비즈니스 로직과 트랜잭션 경계 유지
- **프로세스**:
  1. 도메인별 Service 클래스 생성 (`first/domain/{domainName}/`)
  2. CQRS 패턴 적용 시 Query/Command 분리
  3. 관련 메소드 및 private 헬퍼 메소드 이동
  4. Mapper 및 외부 Service 의존성 업데이트
  5. Controller의 Service 참조 업데이트

### Stage 5: Mapper 리팩토링 (`stage-1/05-mapper-refactoring.md`)
- **핵심 원칙**: 메소드 시그니처 완전 동일 유지
- **프로세스**:
  1. 도메인별 Mapper 인터페이스 생성 (`first/mapper/{domainName}/`)
  2. SQL 유형별 메소드 그룹핑 (SELECT, INSERT, UPDATE, DELETE)
  3. @Param 어노테이션 정확히 보존
  4. Service의 Mapper 참조 업데이트
  5. MyBatis 스캔 설정 확인

### Stage 6: MyBatis XML 리팩토링 (`stage-1/06-xml-refactoring.md`)
- **핵심 원칙**: namespace와 쿼리 ID 정확히 매핑
- **프로세스**:
  1. 도메인별 XML 파일 생성 (`first/resources/mapper/sal/{domainName}/`)
  2. namespace를 새 Mapper 패키지로 설정
  3. resultMap 및 SQL fragment 이동
  4. 쿼리 본문 이동 (동적 SQL 로직 유지)
  5. 조인 쿼리 및 복합 resultMap 처리

### Stage 7: 검증 및 완료 (`stage-1/07-verification.md`)
- **검증 항목**:
  1. 메소드 수량 일치 확인
  2. URL 매핑 정확성 검증
  3. 트랜잭션 경계 유지 확인
  4. MyBatis 쿼리 매핑 검증
  5. 컴파일 오류 없음 확인

### Stage 8: 매핑 결과 문서화 (`stage-1/08-mapping-result.md`)
- 이동된 메소드 매핑 테이블 생성
- 도메인별 구조 다이어그램 생성
- 리팩토링 전후 비교 문서

## 🎯 실행 원칙

### project-config.md 기반 실행
- **모든 결정의 기준**: project-config.md의 설정이 최우선
- **지속적 참조**: 각 파일 작성 시 설정된 변수와 규칙 적용
- **일관성 유지**: 전체 과정에서 동일한 설정 기준 사용

### 중단 없는 연속 실행
1. **자동 진행**: 각 단계 완료 후 즉시 다음 단계 시작
2. **무중단 실행**: 사용자 승인 없이 자동으로 진행
3. **에러 시에만 중단**: 치명적 오류 발생 시에만 중단 및 보고

### 체크포인트 시스템
- 각 단계별 체크포인트 자동 기록
- CP-C001 (Controller), CP-S001 (Service), CP-M001 (Mapper), CP-X001 (XML)
- 진행 상황 실시간 추적

## 📊 진행 상황 추적

### 실시간 업데이트 파일
`{outputPath}/{targetClassName}_{todayYYYYMMDD}/` 폴더에 생성되는 파일들:
- `refactoring-status.md` - 진행 상황 마크다운 (상세 시간 정보 포함)
- `dependency-analysis.md` - 의존성 분석 결과
- `mapping-result.md` - 메소드 매핑 결과

> 📋 **덮어쓰기 방지**: 각 리팩토링은 고유한 폴더에 저장되어 이전 결과와 겹치지 않음

### refactoring-status.md 템플릿
리팩토링 시작 시 아래 템플릿을 사용하여 refactoring-status.md 파일을 생성합니다:

```markdown
# 리팩토링 진행 상황

## 프로젝트 정보
- **타겟 클래스**: [분석할 Controller/Service/Mapper 클래스의 전체 경로]
- **작업 폴더**: {workingDir}
- **도메인 이름**: {domainName}
- **현재 단계**: [현재 진행 중인 단계]

## 상세 시간 로그
- **전체 시작 시간**: [YYYY-MM-DD HH:MM:SS]
- **01-target-analysis 시작**: [YYYY-MM-DD HH:MM:SS]
- **01-target-analysis 완료**: [YYYY-MM-DD HH:MM:SS]
- **02-refactoring-plan 시작**: [YYYY-MM-DD HH:MM:SS]
- **02-refactoring-plan 완료**: [YYYY-MM-DD HH:MM:SS]
- **03-controller-refactoring 시작**: [YYYY-MM-DD HH:MM:SS]
- **03-controller-refactoring 완료**: [YYYY-MM-DD HH:MM:SS]
- **04-service-refactoring 시작**: [YYYY-MM-DD HH:MM:SS]
- **04-service-refactoring 완료**: [YYYY-MM-DD HH:MM:SS]
- **05-mapper-refactoring 시작**: [YYYY-MM-DD HH:MM:SS]
- **05-mapper-refactoring 완룼**: [YYYY-MM-DD HH:MM:SS]
- **06-xml-refactoring 시작**: [YYYY-MM-DD HH:MM:SS]
- **06-xml-refactoring 완료**: [YYYY-MM-DD HH:MM:SS]
- **07-verification 시작**: [YYYY-MM-DD HH:MM:SS]
- **07-verification 완료**: [YYYY-MM-DD HH:MM:SS]
- **08-mapping-result 시작**: [YYYY-MM-DD HH:MM:SS]
- **08-mapping-result 완료**: [YYYY-MM-DD HH:MM:SS]
- **전체 완료 시간**: [YYYY-MM-DD HH:MM:SS]
- **총 소요 시간**: [XX분 XX초]

## 전체 진행 상황
- **완료 비율**: 0% (0/8 단계 완료)
- **리팩토링된 클래스 수**: 0개 (Controller: 0, Service: 0, Mapper: 0, XML: 0)
- **남은 작업**: 전체 도메인 리팩토링

## 체크포인트 현황 (총 8단계)

### 🟢 도메인 기능 분리 리팩토링
- [ ] 01-target-analysis (대기) - 대상 클래스 분석
- [ ] 02-refactoring-plan (대기) - 리팩토링 계획 수립
- [ ] 03-controller-refactoring (대기) - Controller 계층 리팩토링
- [ ] 04-service-refactoring (대기) - Service 계층 리팩토링
- [ ] 05-mapper-refactoring (대기) - Mapper 계층 리팩토링
- [ ] 06-xml-refactoring (대기) - MyBatis XML 리팩토링
- [ ] 07-verification (대기) - 리팩토링 결과 검증
- [ ] 08-mapping-result (대기) - 최종 매핑 결과 정리

## 생성된 레이어별 클래스

### Controller 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderController.java (대기) - 주문 관련 API 엔드포인트
- [ ] PaymentController.java (대기) - 결제 관련 API 엔드포인트

### Service 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderService.java (대기) - 주문 처리 비즈니스 로직
- [ ] PaymentService.java (대기) - 결제 처리 비즈니스 로직

### Mapper 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderMapper.java (대기) - 주문 데이터 액세스 인터페이스
- [ ] PaymentMapper.java (대기) - 결제 데이터 액세스 인터페이스

### MyBatis XML (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderMapper.xml (대기) - 주문 SQL 매핑
- [ ] PaymentMapper.xml (대기) - 결제 SQL 매핑

## 주요 이슈 및 결정 사항
이 섹션은 리팩토링 중 발생한 주요 이슈나 결정 사항을 기록합니다.

### 해결된 이슈
- 없음

### 미해결 이슈
- 없음

### 주요 결정 사항
- 없음
```

### 진행률 계산
- 전체 진행률 = (완료 단계 / 전체 8단계) × 100%
- Stage 1: 타겟 분석 (12.5%)
- Stage 2: 계획 수립 (12.5%)
- Stage 3: Controller (12.5%)
- Stage 4: Service (12.5%)
- Stage 5: Mapper (12.5%)
- Stage 6: XML (12.5%)
- Stage 7: 검증 (12.5%)
- Stage 8: 문서화 (12.5%)

## 🔧 사전 준비사항

### 필수 확인사항
1. **🔴 project-config.md 파일 필수 읽기 및 변수 설정**
   - 이 파일의 모든 설정을 메모리에 저장
   - 전체 과정에서 지속적으로 적용
   - 파일이 없으면 project-config-generator.md 실행 필요
2. 타겟 클래스 경로 확인
3. 결과 저장 디렉토리 생성 가능 여부 확인
4. 소스코드 백업 완료

## 🚨 주의사항

### 실행 중 주의사항
- 중간에 사용자에게 질문하지 않음
- 단계별 승인 요청하지 않음
- 오류 발생 시에만 중단하고 문제 보고
- 진행 상황은 간단히 보고하고 즉시 계속

### 기능 보존 원칙
- **100% 기능 유지**: 모든 API와 비즈니스 로직이 동일하게 동작
- **URL 매핑 불변**: 모든 엔드포인트 경로 유지
- **반환 타입 불변**: API 응답 구조 완전 보존
- **트랜잭션 경계 유지**: 데이터 일관성 보장

## 🎯 최종 목표

### 리팩토링 목표
- 비즈니스 도메인별 명확한 분리
- 기능 100% 보존
- 의존성 정리 및 구조 개선
- 유지보수성 향상

### 최종 산출물
1. **도메인별로 분리된 소스코드** (`{workingDir}/first/`)
   - Controller 패키지: `controller/{domainName}/`
   - Service 패키지: `domain/{domainName}/`
   - Mapper 패키지: `mapper/{domainName}/`
   - XML 경로: `resources/mapper/sal/{domainName}/`

2. **분석 결과 문서** (`{workingDir}/`)
   - `refactoring-status.md` - 진행 상황 및 상세 시간 정보
   - `dependency-analysis.md` - 의존성 분석 결과
   - `mapping-result.md` - 매핑 결과 및 요약

### 🔄 경로 변수 정의
- `{outputPath}`: project-config.md에 정의된 기본 출력 경로
- `{targetClassName}`: 리팩토링 대상 클래스명 (예: VisitActionController)
- `{todayYYYYMMDD}`: 실행 날짜 (예: 20250101)
- `{workingDir}`: {outputPath}/{targetClassName}_{todayYYYYMMDD}
- `{refactoringPath}`: {workingDir} (하위 호환성)
- `{domainName}`: 대상 클래스에서 레이어 suffix 제거 (visitAction, orderManagement 등)

---

**시작하려면 이 가이드와 함께 타겟 클래스명을 제공해주세요.**

⚠️ **실행 순서**:
1. 필수 파일 읽기
   - project-config.md (프로젝트 설정)
   - refactoring-framework.md (프레임워크)
   - 없으면 project-config-generator.md 실행하여 생성
2. 이 가이드에 따라 자동 실행
3. 각 단계에서 설정을 지속적으로 적용