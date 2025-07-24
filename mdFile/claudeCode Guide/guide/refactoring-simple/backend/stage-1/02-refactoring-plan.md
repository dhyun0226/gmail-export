# 리팩토링 계획 (Refactoring Plan)

클래스 의존성 분석 결과를 기반으로 도메인별 분리 계획을 수립하고, 각 클래스와 메서드 이동 매핑을 정의
절대 생략하지 않으며, ... 등과 같이 축약을 허용하지 않음
{analysisPath}/refactoring-plan.md 파일을 생성

## 📊 예상 개선 효과 (대시보드 데이터)

### 메트릭스 개선 목표
```markdown
## 리팩토링 목표 지표

### 복잡도 개선
- **순환 복잡도**
  - 현재: 156 (최대값)
  - 목표: 12 이하
  - 개선율: 92.3%
  - 방법: 거대 메소드를 도메인별 작은 메소드로 분해

- **인지 복잡도**
  - 현재: 203 (최대값)
  - 목표: 15 이하
  - 개선율: 92.6%

### 크기 개선
- **평균 메소드 길이**
  - 현재: 185줄
  - 목표: 25줄 이하
  - 개선율: 86.5%

- **클래스 당 메소드 수**
  - 현재: 48개 (단일 클래스)
  - 목표: 10개 이하 (클래스당)
  - 분산도: 15개 클래스로 분산

- **파일 수 증가**
  - 현재: 2개 (Controller, Service)
  - 목표: 28개 (도메인별 분리)
  - 증가율: 1300%

### 결합도/응집도 개선
- **의존성 감소**
  - Fan-out: 23 → 5 이하 (클래스당)
  - 순환 참조: 제거
  - 계층 간 명확한 분리

- **응집도 향상**
  - LCOM: 0.82 → 0.2 이하
  - 단일 책임 원칙 준수

### 성능 개선 목표
- **API 응답 시간**
  - 현재: 450ms (평균)
  - 목표: 230ms 이하
  - 개선율: 48.8%

- **쿼리 최적화**
  - N+1 문제: 완전 해결
  - 불필요한 조인: 제거
  - 캐싱 적용: 주요 조회 쿼리
```

### 적용할 디자인 패턴
```markdown
## 디자인 패턴 적용 계획

| 패턴명 | 적용 위치 | 목적 | 기대 효과 |
|--------|-----------|------|-----------|
| CQRS | Service 계층 | 읽기/쓰기 분리 | 성능 향상, 확장성 개선 |
| Repository | Data Access | 데이터 접근 추상화 | 테스트 용이성, 유연성 |
| Factory | DTO 생성 | 객체 생성 로직 캡슐화 | 코드 재사용성 |
| Strategy | 비즈니스 규칙 | 알고리즘 교체 가능 | 유연성, 확장성 |
| Template Method | 공통 프로세스 | 공통 로직 재사용 | 중복 제거 |
| Decorator | 로깅/인증 | 횡단 관심사 처리 | AOP 구현 |
```

### 예상 개선 효과 JSON
```json
{
  "expectedImprovements": {
    "metrics": {
      "complexity": {
        "cyclomatic": {"from": 156, "to": 12, "improvement": "92.3%"},
        "cognitive": {"from": 203, "to": 15, "improvement": "92.6%"}
      },
      "size": {
        "avgMethodLength": {"from": 185, "to": 25, "improvement": "86.5%"},
        "filesCount": {"from": 2, "to": 28, "increase": "1300%"}
      },
      "coupling": {
        "fanOut": {"from": 23, "to": 5, "improvement": "78.3%"},
        "circularDependencies": {"from": 3, "to": 0, "improvement": "100%"}
      },
      "performance": {
        "avgResponseTime": {"from": 450, "to": 230, "improvement": "48.8%"},
        "nPlusOneQueries": {"from": 12, "to": 0, "improvement": "100%"}
      }
    },
    "patterns": [
      {"name": "CQRS", "impact": "high", "area": "performance"},
      {"name": "Repository", "impact": "medium", "area": "testability"},
      {"name": "Factory", "impact": "medium", "area": "maintainability"}
    ]
  }
}
```

## 도메인별 분리 계획

### 1. 패키지 구조 설계 원칙

#### 패키지 명명 규칙
- **기본 원칙**: 리팩토링 대상 클래스명에서 레이어 suffix(Controller, Service, Mapper)를 제외하고 camelCase로 변환
- **예시**: 
  - VisitActionController → visitAction 패키지
  - OrderManagementController → orderManagement 패키지
  - UserProfileService → userProfile 패키지

#### 1.1 Controller 계층 구조
```
controller/
└── {className}/  # 예: visitAction/
    ├── VisitPlanController.java
    ├── VisitExecutionController.java
    ├── ContractActionController.java
    ├── OrganizationVisitController.java
    ├── PerformanceReportController.java
    ├── AggregationController.java
    └── DenJobController.java
```

#### 1.2 Service(Domain) 계층 구조
```
domain/
└── {className}/  # 예: visitAction/
    ├── VisitPlanQueryService.java (CQRS - Query)
    ├── VisitPlanCommandService.java (CQRS - Command)
    ├── VisitPlanValidator.java
    ├── VisitPlanProcessor.java
    ├── VisitActionQueryService.java
    ├── VisitExecutionQueryService.java
    ├── ContractActionService.java
    ├── OrganizationVisitService.java
    ├── PerformanceReportService.java
    ├── AggregationService.java
    └── DenJobService.java
```

#### 1.3 Mapper 계층 구조
```
mapper/
└── {className}/  # 예: visitAction/
    ├── VisitPlanMapper.java
    ├── VisitActionQueryMapper.java
    ├── VisitExecutionMapper.java
    ├── ContractActionMapper.java
    ├── OrganizationVisitMapper.java
    ├── PerformanceReportMapper.java
    ├── AggregationMapper.java
    └── DenJobMapper.java
```

#### 1.4 MyBatis XML 구조
```
resources/mapper/sal/
└── {className}/  # 예: visitAction/
    ├── VisitPlan.xml
    ├── VisitActionQuery.xml
    ├── VisitExecution.xml
    ├── ContractAction.xml
    ├── OrganizationVisit.xml
    ├── PerformanceReport.xml
    ├── Aggregation.xml
    └── DenJob.xml
```

### 2. 메소드 이동 매핑

#### 2.1 Controller 레이어 매핑
| 원본 메소드 | 대상 Controller | 새 메소드명 | 변경사항 |
|------------|----------------|------------|----------|
| getUserAndProduct() | OrderController | getOrderWithDetails() | 파라미터 통합, DTO 변경 |
| createOrder() | OrderController | createOrder() | 유지 |
| processPayment() | PaymentController | processPayment() | 분리 |
| cancelProduct() | OrderController | cancelOrder() | 명칭 변경 |

#### 2.2 Service 레이어 매핑
| 원본 메소드 | 대상 Service | 새 메소드명 | 책임 |
|------------|-------------|------------|------|
| getUserAndProductInfo() | OrderQueryService | getOrderDetails() | 조회 전용 |
| registerNewOrder() | OrderCommandService | createOrder() | 생성 로직 |
| processPaymentLogic() | PaymentService | processPayment() | 결제 처리 |
| validateOrderData() | OrderService | validateOrder() | 검증 로직 |

#### 2.3 Mapper 레이어 매핑
| 원본 메소드 | 대상 Mapper | 변경사항 |
|------------|------------|----------|
| findUserById() | UserMapper | 분리 이동 |
| findProductById() | ProductMapper | 분리 이동 |
| insertOrder() | OrderMapper | 유지 |
| updateOrderStatus() | OrderMapper | 유지 |

#### 2.4 XML 쿼리 매핑
| 원본 SQL ID | 대상 XML | 최적화 사항 |
|------------|----------|------------|
| findUserById | UserMapper.xml | 인덱스 활용 |
| findProductById | ProductMapper.xml | 불필요 컬럼 제거 |
| insertOrder | OrderMapper.xml | 배치 처리 추가 |
| selectOrderWithDetails | OrderMapper.xml | JOIN 최적화 |

### 3. 의존성 재구성

#### 3.1 Service 간 의존성
```
OrderService
├─ UserService (사용자 검증)
├─ ProductService (재고 확인)
└─ NotificationService (알림 발송)

PaymentService
├─ OrderService (주문 정보 조회)
└─ ExternalPaymentGateway (외부 결제)
```

#### 3.2 순환 참조 해결
- 현재: OrderService ↔ PaymentService 순환 참조
- 해결: EventBus 패턴 도입으로 느슨한 결합

### 4. 트랜잭션 경계 설정

#### 4.1 Command 서비스 트랜잭션
```java
@Transactional
public class OrderCommandService {
    // 생성, 수정, 삭제 작업
}
```

#### 4.2 Query 서비스 트랜잭션
```java
@Transactional(readOnly = true)
public class OrderQueryService {
    // 조회 전용 작업
}
```

### 5. 공통 컴포넌트 추출

#### 5.1 공통 유틸리티
```
common/
├── utils/
│   ├── ValidationUtil.java
│   └── DateUtil.java
├── exception/
│   ├── BusinessException.java
│   └── ValidationException.java
└── config/
    └── MyBatisConfig.java
```

#### 5.2 횡단 관심사
- 로깅: AOP 기반 통합 로깅
- 인증/인가: Spring Security 통합
- 캐싱: Spring Cache 적용

## 리팩토링 실행 순서

### Phase 1: 기반 구조 생성
1. 대상 클래스명 기반 패키지 구조 생성
   - controller/{className}/
   - domain/{className}/
   - mapper/{className}/
   - resources/mapper/sal/{className}/
2. 공통 컴포넌트 이동
3. 설정 파일 분리

### Phase 2: Controller 분리
1. 도메인별 Controller 생성
2. 메소드 이동 및 수정
3. RequestMapping 재구성

### Phase 3: Service 분리
1. CQRS 패턴 적용
2. 비즈니스 로직 이동
3. 트랜잭션 경계 설정

### Phase 4: Mapper/XML 분리
1. 도메인별 Mapper 생성
2. SQL 쿼리 이동 및 최적화
3. ResultMap 재구성

## 위험 관리

### 식별된 위험 요소
1. **데이터 정합성**: 분산 트랜잭션 처리
2. **성능 저하**: Service 간 호출 오버헤드
3. **복잡도 증가**: 파일 수 증가로 인한 관리 복잡도

### 위험 완화 전략
1. **Saga 패턴**: 분산 트랜잭션 관리
2. **캐싱 전략**: 자주 사용되는 데이터 캐싱
3. **문서화**: 명확한 도메인 경계 문서화

## 예상 일정

| 단계 | 예상 시간 | 산출물 |
|------|-----------|--------|
| Controller 분리 | 2시간 | 15개 Controller 파일 |
| Service 분리 | 4시간 | 20개 Service 파일 |
| Mapper/XML 분리 | 3시간 | 15개 Mapper, 15개 XML |
| 테스트 및 검증 | 2시간 | 테스트 결과 보고서 |
| 총 소요 시간 | 11시간 | 65개 이상 파일 |

## 다음 단계
- 03-controller-refactoring.md 참조하여 Controller 계층 리팩토링 시작
- 계획된 구조에 따라 순차적으로 진행
- 각 단계별 검증 수행