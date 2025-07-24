# Service 분리 절차

## 1. 작업 준비

### 1.1 작업 디렉토리 생성
```
{workingDir}/first/                          # 고유 작업 폴더 내부
├── domain/
│   └── {domainName}/              # 예: visitAction/
│        ├── VisitPlanQueryService.java
│        ├── VisitPlanCommandService.java
│        ├── VisitPlanValidator.java
│        ├── VisitActionQueryService.java
│        ├── ContractActionService.java
│        └── 기타 도메인별 Service...
```

> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

> 💡 **domainName 규칙**: 대상 클래스명에서 레이어 suffix를 제거하고 camelCase로 변환
> - **식별한 비지니스 도메인 기능별 하위 패키지를 절대 생성하지 않음**
> - 예: VisitActionService → visitAction 패키지
> - CQRS 패턴 적용 기준: 단일 서비스에 15개 이상 메소드가 있을 때 Query/Command 분리 검토

### 1.2 체크포인트 시작
- CP-S001: Service 리팩토링 시작
- 시작 시간: [YYYY-MM-DD HH:MM]
- 대상 파일: [BigService.java]

### 1.3 이전 단계 결과 확인
- Controller 분리 완료 확인
- Controller에서 호출하는 Service 메소드 목록 확인

## 2. CQRS 패턴 적용 기준

### 2.1 CQRS 적용 조건
- **조건 1**: 대상 서비스의 public 메소드가 15개 이상
- **조건 2**: 읽기(조회) 메소드가 전체의 60% 이상
- **조건 3**: 쓰기(생성/수정/삭제) 메소드가 명확히 구분됨

> ⚠️ 모든 조건을 만족할 때만 CQRS 적용, 그렇지 않으면 단일 서비스로 유지

### 2.2 Private 메소드 처리 정책
1. **단일 사용**: 한 도메인에서만 사용하는 private 메소드는 해당 서비스로 이동
2. **다중 사용**: 여러 도메인에서 사용하는 private 메소드는 각 서비스에 복사
3. **공통 유틸리티**: 3개 이상 도메인에서 사용시 별도 유틸리티 클래스로 분리 검토

## 3. Service 의존성 분석

### 2.1 대상 Service 메소드 식별
```
Controller 메소드 | Service 클래스 | Service 메소드 | 도메인
M001 (createOrder) | BigService | processOrder | Order
M002 (getCustomer) | BigService | findCustomer | Customer
M003 (updateOrder) | BigService | updateOrderStatus | Order
```

### 2.2 Service 내부 의존성 분석
```
Service 메소드: processOrder
├─ Private 메소드 호출
│  ├─ validateOrder()
│  ├─ calculatePrice()
│  └─ applyDiscount()
├─ 다른 Service 메소드 호출
│  └─ checkInventory()
└─ 외부 Service 호출
   ├─ CommonService.validateUser()
   └─ NotificationService.sendEmail()
```

## 3. 새 Service 파일 생성

### 3.1 도메인별 Service 생성 예시 (CQRS 패턴)
```java
package com.osstem.ow.sal.domain.{className}; // 예: domain.visitAction

import com.osstem.ow.sal.mapper.{className}.VisitPlanMapper;
import com.osstem.ow.sal.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Query 서비스의 경우
public class VisitPlanQueryService {
    // Mapper 주입 (의존성 매핑에서 식별된 것)
    private final OrderMapper orderMapper;
    private final CustomerMapper customerMapper;
    
    // 외부 Service 주입
    private final CommonService commonService;
    private final NotificationService notificationService;
    
    // 유틸리티 주입
    private final MessageSourceUtil messageSourceUtil;
    
    // 메소드들이 여기에 추가됨
}
```

## 4. 메소드 이동 상세 절차

### 4.1 메소드: processOrder() 이동

#### 4.1.1 원본 분석
```
위치: BigService.java 라인 [200-300]
접근제어자: public
트랜잭션: @Transactional
반환타입: ResponseOrder
파라미터: OrderDto orderDto
```

#### 4.1.2 의존성 체크
```
내부 메소드 호출:
- validateOrder(OrderDto) - private
- calculatePrice(List<Item>) - private
- applyDiscount(BigDecimal) - private

Mapper 호출:
- orderMapper.selectOrderById()
- orderMapper.insertOrder()
- customerMapper.selectCustomerById()

외부 Service 호출:
- commonService.validateUser()
- notificationService.sendEmail()
```

#### 4.1.3 이동 내용
```java
@Transactional
public ResponseOrder processOrder(OrderDto orderDto) {
    // 1. 검증
    validateOrder(orderDto);
    
    // 2. 고객 정보 조회
    CustomerDto customer = customerMapper.selectCustomerById(orderDto.getCustomerId());
    if (customer == null) {
        throw new EntityNotFoundException("customer.notFound");
    }
    
    // 3. 가격 계산
    BigDecimal totalPrice = calculatePrice(orderDto.getItems());
    BigDecimal finalPrice = applyDiscount(totalPrice);
    
    // 4. 주문 저장
    orderDto.setTotalPrice(finalPrice);
    orderDto.setOrderStatus(OrderStatus.PENDING);
    int result = orderMapper.insertOrder(orderDto);
    
    // 5. 알림 발송
    notificationService.sendEmail(customer.getEmail(), "주문 접수 완료");
    
    return ResponseOrder.builder()
        .orderId(orderDto.getOrderId())
        .totalPrice(finalPrice)
        .status(orderDto.getOrderStatus())
        .build();
}

// Private 메소드들도 함께 이동
private void validateOrder(OrderDto orderDto) {
    // 검증 로직
}

private BigDecimal calculatePrice(List<ItemDto> items) {
    // 가격 계산 로직
}

private BigDecimal applyDiscount(BigDecimal price) {
    // 할인 적용 로직
}
```

#### 4.1.4 이동 후 체크리스트
- [ ] Public 메소드 복사 완료
- [ ] Private 헬퍼 메소드 복사 완료
- [ ] @Transactional 어노테이션 유지
- [ ] Import 문 추가
- [ ] Mapper 주입 필드 확인
- [ ] 외부 Service 주입 필드 확인

### 4.2 Controller 참조 업데이트

#### 4.2.1 Controller 수정 예시
```java
// 변경 전
private final BigService bigService;

// 변경 후
private final OrderService orderService;

// 메소드 내 호출 부분
// 변경 전
ResponseOrder response = bigService.processOrder(orderDto);

// 변경 후
ResponseOrder response = orderService.processOrder(orderDto);
```

## 5. 트랜잭션 경계 처리

### 5.1 트랜잭션 어노테이션 확인
```
메소드 | 원본 트랜잭션 | 신규 트랜잭션 | 비고
processOrder | @Transactional | @Transactional | 유지
updateOrderStatus | @Transactional | @Transactional | 유지
findCustomer | 없음 | 없음 | 읽기 전용
```

### 5.2 트랜잭션 전파 설정
- 기본값 사용: REQUIRED
- 특수한 경우만 명시적 설정

## 6. 공통 로직 처리

### 6.1 도메인 간 공유 메소드
```
메소드명 | 사용 도메인 | 처리 방안
formatDate | Order, Customer | CommonUtil 클래스로 분리
validateEmail | Order, Customer | CommonService 활용
```

### 6.2 상수 처리
```java
// 도메인별 상수는 각 Service에 정의
private static final int MAX_ORDER_ITEMS = 100;
private static final String DEFAULT_CURRENCY = "KRW";
```

## 7. 진행 상태 추적

### 7.1 메소드별 진행 상태
```
Service 메소드 | 원본 위치 | 대상 Service | 상태 | 체크포인트
getVisitPlans | 라인 200-250 | VisitPlanQueryService | ✓ 완료 | CP-S002
createVisitPlan | 라인 300-400 | VisitPlanCommandService | ✓ 완료 | CP-S003
getContractActions | 라인 500-550 | ContractActionService | ⏳ 진행중 | CP-S004
```

### 7.2 Private 메소드 처리 현황
```
Private 메소드 | 원본 Service | 대상 Service | 상태
validateOrder | BigService | OrderService | ✓ 이동
calculatePrice | BigService | OrderService | ✓ 이동
formatCustomerData | BigService | CustomerService | ⏳ 진행중
```

## 8. 검증 체크리스트

### 8.1 수량 검증
- [ ] 원본 Service public 메소드 수: [N]개
- [ ] OrderService public 메소드 수: [X]개
- [ ] CustomerService public 메소드 수: [Y]개
- [ ] 합계: [X+Y]개 = [N]개

### 8.2 기능 검증
- [ ] 모든 public 메소드 이동 완료
- [ ] 필요한 private 메소드 이동 완료
- [ ] 트랜잭션 설정 유지
- [ ] 예외 처리 로직 유지

### 8.3 의존성 검증
- [ ] Mapper 주입 완료
- [ ] 외부 Service 주입 완료
- [ ] 유틸리티 클래스 주입 완료
- [ ] 순환 참조 없음 확인

## 9. 다음 단계 준비
- Mapper 레이어 분리를 위한 정보 수집
- Service에서 호출하는 Mapper 메소드 목록 최종 확인
- 05-mapper-refactoring.md로 이동