# MyBatis XML 분리 절차

## 1. 작업 준비

### 1.1 작업 디렉토리 생성
```
{workingDir}/first/                          # 고유 작업 폴더 내부
└── resources/
    └── mapper/
        └── sal/
            └── {domainName}/          # 예: visitAction/
                ├── VisitPlan.xml
                ├── VisitActionQuery.xml
                ├── VisitExecution.xml
                ├── ContractAction.xml
                ├── OrganizationVisit.xml
                ├── PerformanceReport.xml
                ├── Aggregation.xml
                └── DenJob.xml
```

> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

> 💡 **domainName 규칙**: 대상 클래스명에서 레이어 suffix를 제거하고 camelCase로 변환
> - 예: VisitActionController/Service/Mapper → visitAction 디렉토리
> - XML 파일은 resources/mapper/sal/{domainName}/ 하위에 위치

### 1.2 체크포인트 시작
- CP-X001: XML 리팩토링 시작
- 시작 시간: [YYYY-MM-DD HH:MM]
- 대상 파일: [big-mapper.xml]

### 1.3 이전 단계 결과 확인
- Mapper 인터페이스 분리 완료 확인
- Mapper 메소드와 XML 쿼리 ID 매핑 확인

## 2. XML 파일 구조 분석

### 2.1 원본 XML 파일 구조
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.osstem.ow.sal.mapper.BigMapper">
    
    <!-- ResultMap 정의 -->
    <resultMap id="orderResultMap" type="OrderDto">
        <!-- 매핑 정의 -->
    </resultMap>
    
    <!-- SQL Fragment -->
    <sql id="orderColumns">
        order_id, customer_id, order_date, status
    </sql>
    
    <!-- 쿼리들 -->
    <select id="selectOrderById">
        <!-- SQL -->
    </select>
</mapper>
```

### 2.2 이동 대상 요소 분석
```
요소 유형 | 요소 ID/이름 | 사용처 | 대상 XML
resultMap | orderResultMap | Order 쿼리 | order-mapper.xml
resultMap | customerResultMap | Customer 쿼리 | customer-mapper.xml
sql fragment | orderColumns | Order 쿼리 | order-mapper.xml
select | selectOrderById | OrderMapper | order-mapper.xml
```

## 3. 새 XML 파일 생성

### 3.1 도메인별 XML 파일 생성 예시
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.osstem.ow.sal.mapper.{domainName}.VisitPlanMapper">
    
    <!-- ResultMap 정의 -->
    
    <!-- SQL Fragment -->
    
    <!-- SELECT 쿼리 -->
    
    <!-- INSERT 쿼리 -->
    
    <!-- UPDATE 쿼리 -->
    
    <!-- DELETE 쿼리 -->
    
</mapper>
```

## 4. 쿼리 이동 상세 절차

### 4.1 SELECT 쿼리 이동

#### 4.1.1 쿼리: selectOrderById
```xml
<!-- 원본 위치: big-mapper.xml -->
<select id="selectOrderById" resultMap="orderResultMap">
    SELECT 
        <include refid="orderColumns"/>,
        total_amount,
        delivery_address
    FROM orders
    WHERE order_id = #{orderId}
</select>
```

#### 4.1.2 의존성 확인
- [ ] resultMap: orderResultMap 사용
- [ ] SQL fragment: orderColumns 사용
- [ ] 파라미터: #{orderId}
- [ ] 반환 타입: resultMap 지정

#### 4.1.3 이동 작업
1. resultMap 먼저 이동
2. SQL fragment 이동
3. 쿼리 본문 이동
4. namespace 확인

#### 4.1.4 이동된 쿼리
```xml
<!-- order-mapper.xml -->
<resultMap id="orderResultMap" type="com.osstem.ow.sal.dto.ord.OrderDto">
    <id property="orderId" column="order_id"/>
    <result property="customerId" column="customer_id"/>
    <result property="orderDate" column="order_date"/>
    <result property="status" column="status"/>
    <result property="totalAmount" column="total_amount"/>
    <result property="deliveryAddress" column="delivery_address"/>
</resultMap>

<sql id="orderColumns">
    order_id, customer_id, order_date, status
</sql>

<select id="selectOrderById" resultMap="orderResultMap">
    SELECT 
        <include refid="orderColumns"/>,
        total_amount,
        delivery_address
    FROM orders
    WHERE order_id = #{orderId}
</select>
```

### 4.2 복잡한 쿼리 처리

#### 4.2.1 조인 쿼리
```xml
<select id="selectOrderWithCustomer" resultMap="orderWithCustomerMap">
    SELECT 
        o.order_id,
        o.order_date,
        c.customer_id,
        c.customer_name
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_id = #{orderId}
</select>

<!-- 복합 resultMap도 함께 이동 -->
<resultMap id="orderWithCustomerMap" type="OrderDto">
    <id property="orderId" column="order_id"/>
    <result property="orderDate" column="order_date"/>
    <association property="customer" javaType="CustomerDto">
        <id property="customerId" column="customer_id"/>
        <result property="customerName" column="customer_name"/>
    </association>
</resultMap>
```

#### 4.2.2 동적 SQL
```xml
<select id="selectOrdersByCondition" resultMap="orderResultMap">
    SELECT * FROM orders
    <where>
        <if test="customerId != null">
            AND customer_id = #{customerId}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
        <if test="startDate != null">
            AND order_date >= #{startDate}
        </if>
        <if test="endDate != null">
            AND order_date <= #{endDate}
        </if>
    </where>
    ORDER BY order_date DESC
    LIMIT #{offset}, #{limit}
</select>
```

### 4.3 INSERT/UPDATE 쿼리 이동

#### 4.3.1 INSERT 쿼리
```xml
<insert id="insertOrder" parameterType="OrderDto" useGeneratedKeys="true" keyProperty="orderId">
    INSERT INTO orders (
        customer_id,
        order_date,
        status,
        total_amount,
        delivery_address,
        proc_prgm_id,
        rgst_procr_id,
        rgst_proc_dtm
    ) VALUES (
        #{customerId},
        #{orderDate},
        #{status},
        #{totalAmount},
        #{deliveryAddress},
        #{procPrgmId},
        #{rgstProcrId},
        NOW()
    )
</insert>
```

#### 4.3.2 UPDATE 쿼리
```xml
<update id="updateOrderStatus">
    UPDATE orders
    SET 
        status = #{status},
        updt_procr_id = #{updtProcrId},
        updt_proc_dtm = NOW()
    WHERE order_id = #{orderId}
</update>
```

## 5. 공통 요소 처리

### 5.1 공유 SQL Fragment
```xml
<!-- 여러 XML에서 사용하는 경우 -->
<!-- common-mapper.xml 생성 고려 -->
<sql id="auditColumns">
    proc_prgm_id, rgst_procr_id, rgst_proc_dtm, updt_procr_id, updt_proc_dtm
</sql>
```

### 5.2 TypeAlias 확인
```yaml
# application.yml
mybatis:
  type-aliases-package: com.osstem.ow.sal.dto
```

## 6. 진행 상태 추적

### 6.1 쿼리별 진행 상태
```
쿼리 ID | 쿼리 유형 | 원본 XML | 대상 XML | 상태 | 체크포인트
selectOrderById | SELECT | big-mapper.xml | Order_SqlMapper.xml | ✓ 완료 | CP-X002
insertOrder | INSERT | big-mapper.xml | Order_SqlMapper.xml | ✓ 완료 | CP-X003
updateOrderStatus | UPDATE | big-mapper.xml | Order_SqlMapper.xml | ⏳ 진행중 | CP-X004
selectCustomerById | SELECT | big-mapper.xml | Customer_SqlMapper.xml | ⏸ 대기 | -
```

### 6.2 의존성 요소 처리
```
요소 유형 | 요소 ID | 원본 위치 | 대상 위치 | 상태
resultMap | orderResultMap | big-mapper.xml | Order_SqlMapper.xml | ✓ 이동
sql | orderColumns | big-mapper.xml | Order_SqlMapper.xml | ✓ 이동
resultMap | orderWithCustomerMap | big-mapper.xml | Order_SqlMapper.xml | ⏳ 진행중
```

## 7. 검증 체크리스트

### 7.1 수량 검증
- [ ] 원본 XML 쿼리 수: [N]개
- [ ] Order_SqlMapper.xml 쿼리 수: [X]개
- [ ] Customer_SqlMapper.xml 쿼리 수: [Y]개
- [ ] 합계: [X+Y]개 = [N]개

### 7.2 구조 검증
- [ ] namespace가 Mapper 인터페이스 패키지와 일치
- [ ] 모든 쿼리 ID가 Mapper 메소드명과 일치
- [ ] resultMap이 올바르게 참조됨
- [ ] SQL fragment가 올바르게 포함됨

### 7.3 쿼리 검증
- [ ] 파라미터 바인딩 정확성
- [ ] 반환 타입 매핑 정확성
- [ ] 동적 SQL 로직 유지
- [ ] 데이터베이스 함수 호출 정확성

## 8. 특수 케이스 처리

### 8.1 Stored Procedure 호출
```xml
<select id="callOrderProcedure" statementType="CALLABLE">
    {call sp_process_order(
        #{orderId, mode=IN, jdbcType=BIGINT},
        #{result, mode=OUT, jdbcType=VARCHAR}
    )}
</select>
```

### 8.2 Batch Insert
```xml
<insert id="insertOrderDetails">
    INSERT INTO order_details (order_id, item_id, quantity, price)
    VALUES
    <foreach collection="details" item="detail" separator=",">
        (#{orderId}, #{detail.itemId}, #{detail.quantity}, #{detail.price})
    </foreach>
</insert>
```

## 9. 최종 확인

### 9.1 파일 구조 확인
```
mapper/sal/
└── {domainName}/  # 예: visitAction/
    ├── VisitPlan.xml
    ├── VisitActionQuery.xml
    ├── VisitExecution.xml
    └── Common.xml (필요시)
```

### 9.2 참조 무결성 확인
- Mapper 인터페이스 → XML namespace
- Mapper 메소드 → XML 쿼리 ID
- Service import → Mapper 패키지

## 10. 다음 단계
- 07-verification.md로 이동하여 전체 검증 수행
- 누락된 기능 확인
- 최종 매핑 결과 문서화