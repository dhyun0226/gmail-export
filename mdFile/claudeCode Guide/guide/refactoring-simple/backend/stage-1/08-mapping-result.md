# 최종 매핑 결과

> 📌 **결과 파일**: `{workingDir}/mapping-result.md`로 저장
> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

## 1. 프로젝트 정보
```
원본 클래스: [TargetController, BigService, BigMapper, big-mapper.xml]
작업 기간: [시작일] ~ [종료일]
총 작업 시간: [XX시간]
최종 검증일: [YYYY-MM-DD]
```

## 2. Controller 레이어 매핑

### 2.1 클래스 레벨 매핑
```
원본 클래스 | 패키지 | 메소드 수 | 대상 클래스들 | 패키지
-----------|--------|-----------|--------------|--------
TargetController | com.osstem.ow.sal.controller | 10 | OrderController (6) | com.osstem.ow.sal.controller.ord
 | | | CustomerController (4) | com.osstem.ow.sal.controller.cust
```

### 2.2 메소드 레벨 상세 매핑
```
원본 메소드 | 라인 | HTTP | URL | 대상 클래스 | 대상 메소드 | 라인
-----------|------|------|-----|-----------|-----------|------
createOrder() | 100-150 | POST | /order | OrderController | createOrder() | 50-100
updateOrder() | 160-200 | PUT | /order/{id} | OrderController | updateOrder() | 110-160
deleteOrder() | 210-250 | DELETE | /order/{id} | OrderController | deleteOrder() | 170-210
getOrderList() | 260-310 | GET | /orders | OrderController | getOrderList() | 220-270
getOrderDetail() | 320-370 | GET | /order/{id} | OrderController | getOrderDetail() | 280-330
processOrderBatch() | 380-420 | POST | /order/batch | OrderController | processOrderBatch() | 340-380
getCustomer() | 430-480 | GET | /customer/{id} | CustomerController | getCustomer() | 50-100
updateCustomer() | 490-540 | PUT | /customer/{id} | CustomerController | updateCustomer() | 110-160
getCustomerList() | 550-600 | GET | /customers | CustomerController | getCustomerList() | 170-220
searchCustomer() | 610-650 | POST | /customer/search | CustomerController | searchCustomer() | 230-270
```

### 2.3 Private 메소드 매핑
```
원본 Private 메소드 | 사용처 | 처리 방법 | 대상 위치
------------------|--------|----------|----------
validateRequest() | createOrder, updateOrder | 복사 | OrderController (2곳)
formatResponse() | 모든 메소드 | 복사 | 양쪽 Controller
checkPermission() | updateOrder, updateCustomer | 복사 | 양쪽 Controller
```

## 3. Service 레이어 매핑

### 3.1 클래스 레벨 매핑
```
원본 클래스 | 패키지 | 메소드 수 | 대상 클래스들 | 패키지
-----------|--------|-----------|--------------|--------
BigService | com.osstem.ow.sal.domain | 15 | OrderService (9) | com.osstem.ow.sal.domain.ord
 | | | CustomerService (6) | com.osstem.ow.sal.domain.cust
```

### 3.2 메소드 레벨 상세 매핑
```
원본 메소드 | 트랜잭션 | 대상 클래스 | 대상 메소드 | Mapper 호출
-----------|---------|-----------|-----------|------------
processOrder() | @Transactional | OrderService | processOrder() | OrderMapper(3), CustomerMapper(1)
updateOrderStatus() | @Transactional | OrderService | updateOrderStatus() | OrderMapper(2)
cancelOrder() | @Transactional | OrderService | cancelOrder() | OrderMapper(2)
getOrderHistory() | - | OrderService | getOrderHistory() | OrderMapper(1)
calculateOrderAmount() | - | OrderService | calculateOrderAmount() | OrderMapper(1)
validateOrder() | - | OrderService | validateOrder() | OrderMapper(1)
processPayment() | @Transactional | OrderService | processPayment() | OrderMapper(2), PaymentMapper(1)
processRefund() | @Transactional | OrderService | processRefund() | OrderMapper(1), PaymentMapper(1)
getOrderStatistics() | - | OrderService | getOrderStatistics() | OrderMapper(1)
findCustomer() | - | CustomerService | findCustomer() | CustomerMapper(1)
updateCustomerInfo() | @Transactional | CustomerService | updateCustomerInfo() | CustomerMapper(1)
getCustomerOrders() | - | CustomerService | getCustomerOrders() | CustomerMapper(1), OrderMapper(1)
calculateCustomerGrade() | - | CustomerService | calculateCustomerGrade() | CustomerMapper(2)
mergeCustomer() | @Transactional | CustomerService | mergeCustomer() | CustomerMapper(3)
getCustomerStatistics() | - | CustomerService | getCustomerStatistics() | CustomerMapper(1)
```

## 4. Mapper 레이어 매핑

### 4.1 클래스 레벨 매핑
```
원본 클래스 | 패키지 | 메소드 수 | 대상 클래스들 | 패키지
-----------|--------|-----------|--------------|--------
BigMapper | com.osstem.ow.sal.mapper | 25 | OrderMapper (15) | com.osstem.ow.sal.mapper.ord
 | | | CustomerMapper (10) | com.osstem.ow.sal.mapper.cust
```

### 4.2 메소드 레벨 상세 매핑
```
원본 메소드 | SQL 유형 | 파라미터 | 대상 Mapper | 대상 메소드
-----------|---------|----------|------------|------------
selectOrderById | SELECT | Long | OrderMapper | selectOrderById
selectOrdersByCustomerId | SELECT | Long | OrderMapper | selectOrdersByCustomerId
selectOrdersByStatus | SELECT | String | OrderMapper | selectOrdersByStatus
selectOrdersByDateRange | SELECT | Map | OrderMapper | selectOrdersByDateRange
insertOrder | INSERT | OrderDto | OrderMapper | insertOrder
insertOrderDetail | INSERT | List | OrderMapper | insertOrderDetail
updateOrderStatus | UPDATE | Map | OrderMapper | updateOrderStatus
updateOrderAmount | UPDATE | Map | OrderMapper | updateOrderAmount
deleteOrder | DELETE | Long | OrderMapper | deleteOrder
deleteOrderDetails | DELETE | Long | OrderMapper | deleteOrderDetails
selectOrderStatistics | SELECT | Map | OrderMapper | selectOrderStatistics
selectOrderWithDetails | SELECT | Long | OrderMapper | selectOrderWithDetails
selectPendingOrders | SELECT | - | OrderMapper | selectPendingOrders
updateOrderDelivery | UPDATE | OrderDto | OrderMapper | updateOrderDelivery
selectOrderCount | SELECT | Map | OrderMapper | selectOrderCount
selectCustomerById | SELECT | Long | CustomerMapper | selectCustomerById
selectCustomerByEmail | SELECT | String | CustomerMapper | selectCustomerByEmail
selectCustomersByGrade | SELECT | String | CustomerMapper | selectCustomersByGrade
insertCustomer | INSERT | CustomerDto | CustomerMapper | insertCustomer
updateCustomer | UPDATE | CustomerDto | CustomerMapper | updateCustomer
updateCustomerGrade | UPDATE | Map | CustomerMapper | updateCustomerGrade
deleteCustomer | DELETE | Long | CustomerMapper | deleteCustomer
selectCustomerStatistics | SELECT | Map | CustomerMapper | selectCustomerStatistics
mergeCustomerData | UPDATE | Map | CustomerMapper | mergeCustomerData
selectInactiveCustomers | SELECT | Date | CustomerMapper | selectInactiveCustomers
```

## 5. XML 레이어 매핑

### 5.1 파일 레벨 매핑
```
원본 XML | 경로 | 쿼리 수 | 대상 XML들 | 경로
---------|-----|---------|-----------|-----
big-mapper.xml | /mapper/sal/ | 25 | order-mapper.xml (15) | /mapper/sal/order/
 | | | customer-mapper.xml (10) | /mapper/sal/customer/
```

### 5.2 쿼리 레벨 상세 매핑
```
원본 쿼리 ID | 쿼리 유형 | ResultMap | 대상 XML | 대상 쿼리 ID | 특이사항
------------|----------|-----------|----------|-------------|--------
selectOrderById | SELECT | orderResultMap | order-mapper.xml | selectOrderById | -
selectOrdersByCustomerId | SELECT | orderResultMap | order-mapper.xml | selectOrdersByCustomerId | 동적SQL
insertOrder | INSERT | - | order-mapper.xml | insertOrder | useGeneratedKeys
updateOrderStatus | UPDATE | - | order-mapper.xml | updateOrderStatus | -
[모든 쿼리 나열...]
```

### 5.3 공통 요소 매핑
```
요소 유형 | 원본 ID | 사용처 | 대상 위치 | 처리 방법
---------|---------|--------|----------|----------
ResultMap | orderResultMap | Order 쿼리 | order-mapper.xml | 이동
ResultMap | customerResultMap | Customer 쿼리 | customer-mapper.xml | 이동
SQL Fragment | auditColumns | 모든 INSERT/UPDATE | 각 XML | 복사
SQL Fragment | orderColumns | Order SELECT | order-mapper.xml | 이동
```

## 6. DTO 사용 매핑

### 6.1 Request DTO 매핑
```
DTO 클래스 | 원본 사용처 | 신규 사용처 | 변경사항
----------|-----------|-----------|--------
RequestOrder | TargetController | OrderController | 없음
RequestCustomer | TargetController | CustomerController | 없음
RequestOrderSearch | TargetController | OrderController | 없음
```

### 6.2 Response DTO 매핑
```
DTO 클래스 | 원본 생성처 | 신규 생성처 | 변경사항
----------|-----------|-----------|--------
ResponseOrder | BigService | OrderService | 없음
ResponseCustomer | BigService | CustomerService | 없음
ResponseOrderList | BigService | OrderService | 없음
```

## 7. 의존성 변경 요약

### 7.1 Controller 의존성
```
Controller | 이전 의존성 | 현재 의존성 | 변경 내용
----------|-----------|-----------|----------
OrderController | - | OrderService, CommonService | 신규 생성
CustomerController | - | CustomerService, CommonService | 신규 생성
```

### 7.2 Service 의존성
```
Service | 이전 의존성 | 현재 의존성 | 변경 내용
--------|-----------|-----------|----------
OrderService | - | OrderMapper, CustomerMapper, PaymentMapper | 신규 생성
CustomerService | - | CustomerMapper, OrderMapper | 신규 생성
```

## 8. 최종 검증 결과

### 8.1 수량 검증 요약
```
레이어 | 원본 총계 | 분리 후 총계 | 차이 | 검증
-------|----------|------------|------|-----
Controller 메소드 | 10 | 10 | 0 | ✓
Service 메소드 | 15 | 15 | 0 | ✓
Mapper 메소드 | 25 | 25 | 0 | ✓
XML 쿼리 | 25 | 25 | 0 | ✓
```

### 8.2 기능 검증 요약
```
비즈니스 기능 | 엔드포인트 수 | 서비스 로직 | DB 쿼리 | 전체 체인 검증
-------------|-------------|-----------|---------|-------------
주문 관리 | 6 | 9 | 15 | ✓
고객 관리 | 4 | 6 | 10 | ✓
```
