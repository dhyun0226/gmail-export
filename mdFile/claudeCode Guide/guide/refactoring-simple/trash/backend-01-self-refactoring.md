# 🤖 AI 자율 비즈니스 도메인 리팩토링 실행 가이드

## 🔴 필수 준비 사항

### 프로젝트 설정 파일 읽기
1. **필수 파일 확인**:
   - `../../common/refactoring-framework.md` - 리팩토링 프레임워크
   - `project-config.md` - 프로젝트별 설정 (프로젝트 루트)
2. **설정 확인**: 다음 항목들이 올바르게 설정되었는지 확인
   - 프로젝트 구조 관련 변수
   - 기술 스택 버전 정보
   - 코딩 규칙 및 네이밍 컨벤션
   - 리팩토링 제약 사항
3. **적용 범위**: 이 설정은 전체 리팩토링 과정에서 지속적으로 적용
4. **확인 출력**: "프로젝트 설정을 읽었으며, 모든 설정을 적용할 준비가 완료되었습니다."

## 📊 비즈니스 도메인 리팩토링 구조

### 🔰 도메인별 기능 분리 원칙
- **목표**: 비즈니스 도메인별 명확한 기능 분리
- **범위**: Controller → Service → Mapper → XML 계층별 순차 진행
- **완료 조건**: 기능 100% 보존 + 도메인별 완전 분리
- **결과물**: 리팩토링 경로에 도메인별로 분리된 소스코드

### 적용 범위
- **Controller 지정시**: Controller → Service → Mapper → MyBatis XML 순서로 분석
- **Service 지정시**: Service → Mapper → MyBatis XML 순서로 분석 (Controller 제외)
- **Mapper 지정시**: Mapper → MyBatis XML 순서로 분석

### 📝 진행 상황 기록 템플릿 (refactoring-status.md)

리팩토링 시작 시 아래 템플릿을 사용하여 refactoring-status.md 파일을 생성합니다:

```markdown
# 리팩토링 진행 상황

## 프로젝트 정보
- **타겟 클래스**: [분석할 Controller/Service/Mapper 클래스의 전체 경로]
- **분석 시작 시간**: [YYYY-MM-DD HH:MM]
- **현재 단계**: [현재 진행 중인 단계]

## 전체 진행 상황
- **완료 비율**: 0% (0/7 단계 완료)
- **리팩토링된 클래스 수**: 0개 (Controller: 0, Service: 0, Mapper: 0, XML: 0)
- **남은 작업**: 전체 도메인 리팩토링

## 체크포인트 현황 (총 7단계)

### 🔰 도메인 기능 분리 리팩토링
- [ ] 01-self-refactoring (진행 중) - AI 자율 리팩토링 가이드 확인
- [ ] 02-target-analysis (대기) - 대상 클래스 분석
- [ ] 03-refactoring-plan (대기) - 리팩토링 계획 수립
- [ ] 04-CONTROLLER-REFACTORING (대기) - Controller 계층 리팩토링
- [ ] 05-SERVICE-REFACTORING (대기) - Service 계층 리팩토링
- [ ] 06-MAPPER-REFACTORING (대기) - Mapper 계층 리팩토링
- [ ] 07-XML-REFACTORING (대기) - MyBatis XML 리팩토링
- [ ] 08-VERIFICATION (대기) - 리팩토링 결과 검증
- [ ] 09-MAPPING-RESULT (대기) - 최종 매핑 결과 정리

## 생성된 레이어별 클래스

### Controller 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderController.java (대기) - 주문 관련 API 엔드포인트
- [ ] PaymentController.java (대기) - 결제 관련 API 엔드포인트
- [ ] RefundController.java (대기) - 환불 관련 API 엔드포인트

### Service 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderService.java (대기) - 주문 처리 비즈니스 로직
- [ ] PaymentService.java (대기) - 결제 처리 비즈니스 로직
- [ ] RefundService.java (대기) - 환불 처리 비즈니스 로직

### Mapper 계층 (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderMapper.java (대기) - 주문 데이터 액세스 인터페이스
- [ ] PaymentMapper.java (대기) - 결제 데이터 액세스 인터페이스
- [ ] RefundMapper.java (대기) - 환불 데이터 액세스 인터페이스

### MyBatis XML (0개)
** 분석 후 아래 형식으로 생성 예정 **
예시:
- [ ] OrderMapper.xml (대기) - 주문 SQL 매핑
- [ ] PaymentMapper.xml (대기) - 결제 SQL 매핑
- [ ] RefundMapper.xml (대기) - 환불 SQL 매핑

## 주요 이슈 및 결정 사항
이 섹션은 리팩토링 중 발생한 주요 이슈나 결정 사항을 기록합니다.

### 해결된 이슈
- 없음

### 미해결 이슈
- 없음

### 주요 결정 사항
- 없음
```

## 🚀 자동 실행 프로세스

### 1. 초기화 단계
- project-config.md 설정 로드
- 프로젝트 구조 파악
- 타겟 클래스 유효성 검증

### 2. 실행 순서
1. **02-TARGET-ANALYSIS.md** - 타겟 분석
2. **03-REFACTORING-PLAN.md** - 계획 수립
3. **04-CONTROLLER-REFACTORING.md** - Controller 리팩토링
4. **05-SERVICE-REFACTORING.md** - Service 리팩토링
5. **06-MAPPER-REFACTORING.md** - Mapper 리팩토링
6. **07-XML-REFACTORING.md** - XML 리팩토링
7. **08-VERIFICATION.md** - 검증
8. **09-MAPPING-RESULT.md** - 매핑 결과

### 3. 완료 조건
- 모든 단계 성공적으로 완료
- 기능 100% 보존 확인
- 컴파일 오류 없음
- 도메인별 명확한 분리 달성

## 📁 결과물 구조

### 디렉토리 구조
```
{resultPath}/
├── controller/
│   ├── {domainName1}/
│   │   └── {DomainName1}Controller.java
│   └── {domainName2}/
│       └── {DomainName2}Controller.java
├── domain/
│   ├── {domainName1}/
│   │   ├── {DomainName1}Service.java
│   │   └── {DomainName1}QueryService.java
│   └── {domainName2}/
│       └── {DomainName2}Service.java
├── mapper/
│   ├── {domainName1}/
│   │   └── {DomainName1}Mapper.java
│   └── {domainName2}/
│       └── {DomainName2}Mapper.java
└── resources/
    └── mapper/
        └── sal/
            ├── {domainName1}/
            │   └── {DomainName1}Mapper.xml
            └── {domainName2}/
                └── {DomainName2}Mapper.xml
```

## 🔥 중요 원칙

### 코드 보존 원칙
1. **기능 100% 보존**: 모든 비즈니스 로직 유지
2. **API 불변**: URL 매핑과 응답 구조 유지
3. **트랜잭션 경계 유지**: 데이터 일관성 보장

### 도메인 분리 원칙
1. **단일 책임**: 하나의 도메인 = 하나의 비즈니스 기능
2. **의존성 최소화**: 도메인 간 결합도 최소화
3. **명확한 경계**: 각 도메인의 역할과 책임 명확화

### 자동 실행 원칙
1. **무중단 진행**: 사용자 개입 없이 자동 진행
2. **에러 시 중단**: 치명적 오류 시에만 중단
3. **진행 상황 기록**: 각 단계별 상태 자동 업데이트

## 🎯 시작하기

이 가이드가 제공되면 AI는 자동으로 다음을 수행합니다:
1. project-config.md 읽기 및 설정 적용
2. 타겟 클래스 분석 (02-TARGET-ANALYSIS.md)
3. 순차적으로 모든 단계 실행
4. 최종 결과 검증 및 보고서 생성

**준비가 완료되면 타겟 클래스명을 제공해주세요.**