# 의존성 분석 (Dependency Analysis)

지정된 Controller(대상 클래스)를 시작으로, 의존 관계에 있는 모든 클래스와 MyBatis XML의 메서드(또는 SQL ID)를 분석하여 테이블 형식의 문서로 생성
의존성 전체를 파악하는 것이 목적이므로 메소드/SQL ID를 절대 생략하지 않으며, ... 등과 같이 축약을 허용하지 않음
각각의 레이어별 기능 설명은 파악된 내용을 중심으로 간략하게 기술
`{workingDir}/dependency-analysis.md` 파일을 생성

> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

## 📊 코드 메트릭스 측정 (대시보드 데이터 수집)

### Before 메트릭스 측정
분석 시작 전 반드시 아래 메트릭스를 측정하여 기록:

```markdown
## 초기 코드 품질 메트릭스

### 복잡도 지표
- **순환 복잡도 (Cyclomatic Complexity)**
  - 최대값: [측정값] (메소드명: [메소드명])
  - 평균값: [측정값]
  - 상위 5개 메소드: [메소드명:복잡도] 형식으로 나열

- **인지 복잡도 (Cognitive Complexity)**
  - 최대값: [측정값] (메소드명: [메소드명])
  - 평균값: [측정값]

### 크기 지표
- **클래스 크기**
  - 총 라인 수: [측정값]
  - 실제 코드 라인 수 (주석 제외): [측정값]
  - 메소드 수: [측정값]
  - 필드 수: [측정값]

- **메소드 크기**
  - 최대 라인 수: [측정값] (메소드명: [메소드명])
  - 평균 라인 수: [측정값]
  - 30줄 초과 메소드 수: [측정값]개

### 결합도/응집도
- **의존성**
  - 들어오는 의존성 (Fan-in): [측정값]
  - 나가는 의존성 (Fan-out): [측정값]
  - 의존하는 클래스 목록: [클래스명1, 클래스명2, ...]

- **응집도**
  - LCOM (Lack of Cohesion of Methods): [측정값]
  - 메소드 간 필드 공유율: [측정값]%

### 코드 품질 이슈
| 이슈 타입 | 심각도 | 위치 | 설명 | 영향도 |
|-----------|--------|------|------|--------|
| God Class | Critical | {className}Service | 1,847줄의 거대 클래스 | 유지보수성 심각 저하 |
| Long Method | Critical | processVisit() | 450줄의 긴 메소드 | 가독성/테스트 어려움 |
| 높은 결합도 | Major | Service 전체 | 15개 이상의 의존성 | 변경 영향 범위 과다 |
| 코드 중복 | Major | 여러 메소드 | 유사 로직 반복 | DRY 원칙 위반 |

### 성능 관련 지표
- **데이터베이스 접근**
  - 총 쿼리 수: [측정값]
  - N+1 문제 가능성: [있음/없음]
  - 복잡한 조인 쿼리: [개수]

- **API 응답 시간 (추정)**
  - 예상 평균 응답 시간: [측정값]ms
  - 병목 구간: [설명]
```

### 메트릭스 데이터 JSON 저장
```json
{
  "timestamp": "[YYYY-MM-DD HH:MM:SS]",
  "phase": "before",
  "metrics": {
    "complexity": {
      "cyclomatic": {
        "max": 156,
        "average": 23.5,
        "top5": [
          {"method": "processVisit", "value": 156},
          {"method": "validateOrder", "value": 89}
        ]
      },
      "cognitive": {
        "max": 203,
        "average": 31.2
      }
    },
    "size": {
      "class": {
        "totalLines": 1847,
        "codeLines": 1523,
        "methods": 48,
        "fields": 23
      },
      "methods": {
        "maxLines": 450,
        "avgLines": 31.7,
        "over30Lines": 15
      }
    },
    "coupling": {
      "fanIn": 12,
      "fanOut": 23,
      "dependencies": ["OrderService", "UserService", "ProductService"]
    },
    "cohesion": {
      "lcom": 0.82,
      "fieldSharingRate": 15.3
    },
    "issues": {
      "critical": 3,
      "major": 8,
      "minor": 15
    },
    "performance": {
      "totalQueries": 156,
      "nPlusOne": true,
      "complexJoins": 12,
      "estimatedResponseTime": 450
    }
  }
}
```

## 의존성 분석 보고서

### Controller 레이어 영역
- **클래스명**: {controllerPackage}.{className}Controller
- **기능 설명**: [간략한 기능 설명]
- 총 라인수: [1,202]
- 총 메소드 수: [30개]

| HTTP Method | URL Pattern | 메소드 | 라인(From,To) | 반환 타입 | 파라미터 | 기능 설명 |
|---|---|---|---|---|---|---|
| GET | /specific/path/getUserAndProduct | getUserAndProduct | 35-45 | ApiResponse<Map> | Long userId, Long productId | 특정 사용자와 상품 정보를 함께 조회 |
| POST | /specific/path/create | createOrder | 47-58 | ApiResponse<Long> | OrderRequest orderRequest | 새로운 주문을 생성 |
| POST | /specific/path/cancel | cancelProduct | 60-70 | ApiResponse<Void> | Long productId, String reason | 상품 등록을 취소 |

### Service 레이어 영역
- **클래스명**: {servicePackage}.{className}Service
- **기능 설명**: [간략한 기능 설명]
- 총 라인수: [2,202]
- 총 메소드 수: [32개]

| 접근 제어자 | 메소드 | 라인(From,To) | 반환 타입 | 파라미터 | 기능 설명 |
|---|---|---|---|---|---|
| public | getUserAndProductInfo | 25-40 | Map<String, Object> | Long userId, Long productId | 사용자 정보와 상품 정보를 각각 조회하여 조합 |
| public | registerNewOrder | 42-55 | Long | OrderRequest orderRequest | 주문 정보를 검증하고 DB에 등록 |
| public | cancelProductRegistration | 57-68 | void | Long productId, String reason | 상품 상태를 'CANCELLED'로 변경 |

### Mapper 레이어 영역
- **클래스명**: {mapperPackage}.{className}Mapper
- **기능 설명**: [간략한 기능 설명]
- 총 라인수: [202]
- 총 메소드 수: [31개]

| 메소드 | 라인(From,To) | 반환 타입 | 파라미터 | 기능 설명 |
|---|---|---|---|---|
| findUserById | 15-16 | User | @Param("id") Long id | ID로 사용자 정보 조회 |
| findProductById | 18-19 | Product | @Param("id") Long id | ID로 상품 정보 조회 |
| insertOrder | 21-22 | int | Order order | 주문 정보 삽입 |
| updateProductStatus | 24-25 | int | @Param("id") Long id, @Param("status") String status | 상품 상태 업데이트 |

### Mybatis Xml 영역
- **리소스경로**: {xmlPath}.{className}_SqlMapper.xml
- **기능 설명**: [간략한 기능 설명]
- 총 라인수: [2,020]
- 총 메소드 수: [30개]

| SQL Type | SQL ID | 라인(From,To) | 반환 타입 | 파라미터 | 기능 설명 |
|---|---|---|---|---|---|
| select | findUserById | 10-15 | com.example.project.domain.User | long | 사용자 ID를 기준으로 사용자 정보 조회 |
| select | findProductById | 17-22 | com.example.project.domain.Product | long | 상품 ID를 기준으로 상품 정보 조회 |
| insert | insertOrder | 24-35 | int | com.example.project.domain.Order | 주문 데이터를 orders 테이블에 삽입 |
| update | updateProductStatus | 37-41 | int | map | 상품 ID를 기준으로 products 테이블의 상태 변경 |

## 의존성 매핑 절차

### 1. Controller → Service 매핑

#### 1.1 메소드별 Service 호출 추적
```
메소드 ID: M001 (methodName)
├─ Service 호출 1
│  ├─ 클래스: OrderService
│  ├─ 메소드: processOrder(OrderDto dto)
│  ├─ 라인: 125
│  └─ 용도: 주문 처리
├─ Service 호출 2
│  ├─ 클래스: CommonService
│  ├─ 메소드: validateUser(Long userId)
│  ├─ 라인: 120
│  └─ 용도: 사용자 검증
└─ Service 호출 3
   ├─ 클래스: MessageService
   ├─ 메소드: sendNotification(String message)
   ├─ 라인: 130
   └─ 용도: 알림 발송
```

#### 1.2 Service 의존성 요약
```
Controller 메소드 | Service 클래스 | Service 메소드 | 호출 횟수
M001 | OrderService | processOrder | 1
M001 | CommonService | validateUser | 1
M001 | MessageService | sendNotification | 1
M002 | CustomerService | getCustomer | 1
```

### 2. Service → Mapper 매핑

#### 2.1 Service 메소드별 Mapper 호출 추적
```
Service: OrderService.processOrder()
├─ Mapper 호출 1
│  ├─ 클래스: OrderMapper
│  ├─ 메소드: selectOrderById(Long orderId)
│  ├─ 용도: 주문 조회
│  └─ 트랜잭션: 읽기
├─ Mapper 호출 2
│  ├─ 클래스: OrderMapper
│  ├─ 메소드: updateOrderStatus(OrderDto order)
│  ├─ 용도: 상태 업데이트
│  └─ 트랜잭션: 쓰기
└─ Mapper 호출 3
   ├─ 클래스: CustomerMapper
   ├─ 메소드: selectCustomerById(Long customerId)
   ├─ 용도: 고객 정보 조회
   └─ 트랜잭션: 읽기
```

#### 2.2 Mapper 의존성 요약
```
Service 메소드 | Mapper 클래스 | Mapper 메소드 | 작업 유형
processOrder | OrderMapper | selectOrderById | SELECT
processOrder | OrderMapper | updateOrderStatus | UPDATE
processOrder | CustomerMapper | selectCustomerById | SELECT
```

### 3. Mapper → XML 매핑

#### 3.1 Mapper 인터페이스별 XML 매핑
```
Mapper: OrderMapper
└─ XML 파일: /mapper/sal/Order_SqlMapper.xml
   ├─ namespace: com.osstem.ow.sal.mapper.OrderMapper
   ├─ 쿼리 목록:
   │  ├─ selectOrderById (SELECT)
   │  ├─ updateOrderStatus (UPDATE)
   │  ├─ insertOrder (INSERT)
   │  └─ deleteOrder (DELETE)
   └─ 공통 요소:
      ├─ resultMap: orderResultMap
      └─ sql fragment: orderColumns
```

#### 3.2 XML 쿼리 상세 정보
```
쿼리 ID: selectOrderById
├─ 유형: SELECT
├─ 파라미터 타입: Long
├─ 반환 타입: OrderDto
├─ resultMap 사용: orderResultMap
├─ 동적 SQL: 없음
└─ 조인 테이블: orders, order_details
```

## 도메인 분석 결과

### 식별된 비즈니스 도메인
분석 결과 다음과 같은 도메인이 식별되었습니다:

| 도메인 | 주요 기능 | 관련 메소드 수 | 예상 클래스 |
|--------|-----------|---------------|-------------|
| 주문(Order) | 주문 생성, 조회, 수정, 취소 | 15개 | OrderController, OrderService, OrderMapper |
| 결제(Payment) | 결제 처리, 취소, 환불 | 8개 | PaymentController, PaymentService, PaymentMapper |
| 사용자(User) | 사용자 조회, 인증, 권한 | 10개 | UserController, UserService, UserMapper |
| 상품(Product) | 상품 조회, 재고 관리 | 12개 | ProductController, ProductService, ProductMapper |
| 알림(Notification) | 알림 발송, 이력 관리 | 5개 | NotificationService, NotificationMapper |

## 리팩토링 영향도 분석

### 예상 변경 규모
- **분리될 클래스 수**: 1개 → 15개 이상
- **영향받는 메소드**: 48개
- **수정될 쿼리**: 30개
- **새로 생성될 파일**: 약 20개

### 위험 요소
1. **순환 참조 가능성**: Service 간 상호 의존성 존재
2. **트랜잭션 경계**: 도메인 분리 시 트랜잭션 처리 복잡도 증가
3. **성능 영향**: 분리된 Service 간 호출로 인한 오버헤드

## 다음 단계
- 02-refactoring-plan.md 참조하여 도메인별 분리 계획 수립
- 식별된 도메인별로 클래스 구조 설계
- 메소드 이동 매핑 테이블 작성