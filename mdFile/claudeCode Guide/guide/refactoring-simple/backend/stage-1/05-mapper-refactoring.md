# Mapper 분리 절차

## 1. 작업 준비

### 1.1 작업 디렉토리 생성
```
{workingDir}/first/                          # 고유 작업 폴더 내부
├── mapper/
│   └── {domainName}/              # 예: visitAction/
│        ├── VisitPlanMapper.java
│        ├── VisitActionQueryMapper.java
│        ├── VisitExecutionMapper.java
│        ├── ContractActionMapper.java
│        ├── OrganizationVisitMapper.java
│        ├── PerformanceReportMapper.java
│        ├── AggregationMapper.java
│        └── DenJobMapper.java
```

> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

> 💡 **domainName 규칙**: 대상 클래스명에서 레이어 suffix를 제거하고 camelCase로 변환
> - 예: VisitActionMapper → visitAction 패키지
> - 예: UserManagementMapper → userManagement 패키지

### 1.2 체크포인트 시작
- CP-M001: Mapper 리팩토링 시작
- 시작 시간: [YYYY-MM-DD HH:MM]
- 대상 파일: [BigMapper.java]

### 1.3 이전 단계 결과 확인
- Service 분리 완료 확인
- Service에서 호출하는 Mapper 메소드 목록 확인

## 2. Mapper 메소드 분석

### 2.1 대상 Mapper 메소드 식별
```
Service 메소드 | Mapper 클래스 | Mapper 메소드 | SQL 유형 | 도메인
processOrder | BigMapper | selectOrderById | SELECT | Order
processOrder | BigMapper | insertOrder | INSERT | Order
processOrder | BigMapper | updateOrderStatus | UPDATE | Order
findCustomer | BigMapper | selectCustomerById | SELECT | Customer
findCustomer | BigMapper | selectCustomerByEmail | SELECT | Customer
```

### 2.2 메소드 시그니처 분석
```
메소드: selectOrderById
├─ 반환 타입: OrderDto
├─ 파라미터: @Param("orderId") Long orderId
├─ SQL 유형: SELECT
└─ XML 매핑: big-mapper.xml#selectOrderById
```

## 3. 새 Mapper 인터페이스 생성

### 3.1 도메인별 Mapper 생성 예시
```java
package com.osstem.ow.sal.mapper.{className}; // 예: mapper.visitAction

import com.osstem.ow.sal.dto.ord.OrderDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface OrderMapper {
    // SELECT 메소드
    OrderDto selectOrderById(@Param("orderId") Long orderId);
    
    List<OrderDto> selectOrdersByCustomerId(@Param("customerId") Long customerId);
    
    OrderDto selectOrderWithDetails(@Param("orderId") Long orderId);
    
    // INSERT 메소드
    int insertOrder(OrderDto order);
    
    int insertOrderDetail(@Param("orderId") Long orderId, 
                         @Param("details") List<OrderDetailDto> details);
    
    // UPDATE 메소드
    int updateOrderStatus(@Param("orderId") Long orderId, 
                         @Param("status") String status);
    
    int updateOrderAmount(@Param("orderId") Long orderId, 
                         @Param("amount") BigDecimal amount);
    
    // DELETE 메소드
    int deleteOrder(@Param("orderId") Long orderId);
}
```

### 3.2 CustomerMapper 생성
[동일한 구조로 생성]

## 4. 메소드 이동 상세 절차

### 4.1 메소드: selectOrderById 이동

#### 4.1.1 원본 분석
```java
// BigMapper.java
OrderDto selectOrderById(@Param("orderId") Long orderId);
```

#### 4.1.2 이동 체크리스트
- [ ] 메소드 시그니처 복사
- [ ] @Param 어노테이션 확인
- [ ] 반환 타입 import 확인
- [ ] 파라미터 타입 import 확인

#### 4.1.3 XML 매핑 확인
```xml
<!-- big-mapper.xml -->
<select id="selectOrderById" resultMap="orderResultMap">
    SELECT * FROM orders WHERE order_id = #{orderId}
</select>
```

### 4.2 복잡한 메소드 처리

#### 4.2.1 다중 파라미터 메소드
```java
List<OrderDto> selectOrdersByCondition(
    @Param("customerId") Long customerId,
    @Param("status") String status,
    @Param("startDate") LocalDateTime startDate,
    @Param("endDate") LocalDateTime endDate,
    @Param("offset") int offset,
    @Param("limit") int limit
);
```

#### 4.2.2 Map 파라미터 메소드
```java
List<OrderDto> selectOrdersByMap(Map<String, Object> params);
```

#### 4.2.3 객체 파라미터 메소드
```java
int updateOrder(OrderDto order);
```

## 5. Service 참조 업데이트

### 5.1 OrderService 수정
```java
// 변경 전
private final BigMapper bigMapper;

// 변경 후
private final OrderMapper orderMapper;

// 메소드 내 호출 부분
// 변경 전
OrderDto order = bigMapper.selectOrderById(orderId);

// 변경 후
OrderDto order = orderMapper.selectOrderById(orderId);
```

### 5.2 Import 문 업데이트
```java
// 제거
import com.osstem.ow.sal.mapper.BigMapper;

// 추가
import com.osstem.ow.sal.mapper.ord.OrderMapper;
```

## 6. MyBatis 설정 확인

### 6.1 Mapper 스캔 설정
```yaml
# application.yml
mybatis:
  mapper-locations: classpath:mapper/sal/**/*.xml
  type-aliases-package: com.osstem.ow.sal.dto
```

### 6.2 새 Mapper 패키지 확인
- com.osstem.ow.sal.mapper.{className} // 예: mapper.visitAction
- @MapperScan 어노테이션 범위 확인

## 7. 진행 상태 추적

### 7.1 메소드별 진행 상태
```
Mapper 메소드 | 원본 위치 | 대상 Mapper | 상태 | 체크포인트
selectOrderById | BigMapper | OrderMapper | ✓ 완료 | CP-M002
insertOrder | BigMapper | OrderMapper | ✓ 완료 | CP-M003
selectCustomerById | BigMapper | CustomerMapper | ⏳ 진행중 | CP-M004
updateOrderStatus | BigMapper | OrderMapper | ⏸ 대기 | -
```

### 7.2 특수 케이스 처리
```
메소드 | 이슈 | 처리 방법
selectOrderWithCustomer | 조인 쿼리 | OrderMapper로 이동
selectCommonCode | 공통 코드 조회 | CommonMapper 생성 고려
```

## 8. 검증 체크리스트

### 8.1 수량 검증
- [ ] 원본 Mapper 메소드 수: [N]개
- [ ] OrderMapper 메소드 수: [X]개
- [ ] CustomerMapper 메소드 수: [Y]개
- [ ] 합계: [X+Y]개 = [N]개

### 8.2 구조 검증
- [ ] 모든 메소드 시그니처 동일
- [ ] @Param 어노테이션 유지
- [ ] 반환 타입 정확성
- [ ] 파라미터 타입 정확성

### 8.3 매핑 검증
- [ ] XML 파일명과 Mapper 인터페이스명 일치
- [ ] namespace와 패키지 경로 일치
- [ ] 메소드명과 쿼리 ID 일치

## 9. XML 매핑 준비

### 9.1 XML 파일 매핑 확인
```
Mapper 인터페이스 | XML 파일 | namespace
VisitPlanMapper | VisitPlan.xml | com.osstem.ow.sal.mapper.{className}.VisitPlanMapper
VisitActionQueryMapper | VisitActionQuery.xml | com.osstem.ow.sal.mapper.{className}.VisitActionQueryMapper
ContractActionMapper | ContractAction.xml | com.osstem.ow.sal.mapper.{className}.ContractActionMapper
```

### 9.2 쿼리 이동 대상 확인
```
원본 XML | 쿼리 ID | 대상 XML | 도메인
big-mapper.xml | selectOrderById | order-mapper.xml | Order
big-mapper.xml | insertOrder | order-mapper.xml | Order
big-mapper.xml | selectCustomerById | customer-mapper.xml | Customer
```

## 10. 다음 단계 준비
- XML 파일 분리를 위한 정보 수집
- Mapper 메소드와 XML 쿼리 매핑 최종 확인
- 06-xml-refactoring.md로 이동