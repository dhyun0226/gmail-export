# 💾 DAO/Repository 레이어 코드 생성 규칙

> 데이터 접근을 담당하는 DAO/Repository 레이어의 자동 생성을 위한 상세 가이드

## 📋 DAO/Repository 레이어 역할

### **핵심 책임**
- 데이터베이스 CRUD 연산
- 복합 조회 쿼리 구현
- 데이터 매핑 및 변환
- 쿼리 최적화
- 트랜잭션 지원
- 페이징 및 정렬

### **포함하지 않을 내용**
- 비즈니스 로직 구현
- 트랜잭션 경계 설정
- 예외 처리 (데이터 접근 예외 제외)
- 캐싱 로직

## 🏗️ 생성 규칙

### **1. Entity 클래스 생성 규칙**

#### JPA Entity 패턴
```yaml
클래스명: "{도메인}Entity" 또는 "{도메인}"
어노테이션: "@Entity, @Table"
패키지명: "{domain}.entity" 또는 "entity.{domain}"
상속: "BaseEntity 또는 Auditable"

필수_어노테이션:
  - "@Entity"
  - "@Table(name = \"TB_{테이블명}\")"
  - "@Getter @Setter (Lombok)"
  - "@Builder @NoArgsConstructor @AllArgsConstructor (Lombok)"
  - "@Schema(description = \"엔티티 설명\") (Swagger v3)"

JavaDoc_주석:
  """
  /**
   * {엔티티명} Entity
   * {기능 설명}
   *
   * @author ${author:Development Team}
   * @version 1.0
   * @since $(date +"%Y-%m-%d")
   * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
   */
  """
```

#### Entity 필드 규칙
```yaml
Primary_Key:
  annotations:
    - "@Id"
    - "@GeneratedValue(strategy = GenerationType.IDENTITY)"
    - "@Column(name = \"ID컬럼명\")"
    - "@Schema(description = \"고유 ID\", example = \"1\", accessMode = Schema.AccessMode.READ_ONLY)"
  type: "Long"
  
일반_필드:
  annotations:
    - "@Column(name = \"컬럼명\", nullable = false, length = 100)"
    - "@Schema(description = \"필드 설명\", example = \"예시값\", required = true, maxLength = 100)"
  naming: "camelCase"
  
날짜_필드:
  annotations:
    - "@Column(name = \"날짜컬럼명\")"
    - "@JsonFormat(pattern = \"yyyy-MM-dd HH:mm:ss\")"
    - "@Schema(description = \"날짜 설명\", example = \"2024-01-01 09:00:00\")"
  type: "LocalDateTime"
  
ENUM_필드:
  annotations:
    - "@Enumerated(EnumType.STRING)"
    - "@Column(name = \"상태코드\", length = 20)"
    - "@Schema(description = \"상태\", example = \"ACTIVE\", allowableValues = {\"ACTIVE\", \"INACTIVE\"})"
  type: "StatusEnum"

관계_매핑:
  OneToMany:
    - "@OneToMany(mappedBy = \"parent\", cascade = CascadeType.ALL, orphanRemoval = true)"
    - "@JsonManagedReference"
    - "@Schema(description = \"하위 엔티티 목록\")"
  ManyToOne:
    - "@ManyToOne(fetch = FetchType.LAZY)"
    - "@JoinColumn(name = \"FK_컬럼명\")"
    - "@JsonBackReference"
    - "@Schema(hidden = true)"
```

#### Entity 예시
```java
/**
 * 사용자 Entity
 * 시스템 사용자 정보를 관리하는 엔티티입니다.
 *
 * @author ${author:Development Team}
 * @version 1.0
 * @since $(date +"%Y-%m-%d")
 * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
 */
@Entity
@Table(name = "TB_USER", indexes = {
    @Index(name = "IDX_USER_EMAIL", columnList = "EMAIL"),
    @Index(name = "IDX_USER_STATUS", columnList = "STATUS_CD")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "사용자 정보 엔티티")
public class User extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    @Schema(description = "사용자 ID", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long userId;
    
    @Column(name = "USERNAME", nullable = false, length = 50, unique = true)
    @Schema(description = "사용자명", example = "john_doe", required = true, minLength = 3, maxLength = 50)
    private String username;
    
    @Column(name = "EMAIL", nullable = false, length = 100, unique = true)
    @Schema(description = "이메일", example = "john@example.com", required = true, format = "email")
    private String email;
    
    @Column(name = "PASSWORD", nullable = false, length = 200)
    @Schema(description = "비밀번호 (암호화됨)", hidden = true)
    @JsonIgnore
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_CD", nullable = false, length = 20)
    @Schema(description = "사용자 상태", example = "ACTIVE", 
            allowableValues = {"ACTIVE", "INACTIVE", "SUSPENDED"})
    private UserStatus status;
    
    @Column(name = "LAST_LOGIN_DTM")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "마지막 로그인 일시", example = "2024-01-01 09:00:00")
    private LocalDateTime lastLoginDateTime;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Schema(description = "사용자 권한 목록")
    private List<UserRole> userRoles = new ArrayList<>();
}
```

### **2. 기술별 구현 패턴**

#### JPA/Hibernate 패턴
```yaml
인터페이스명: "{Entity}Repository"
상속: "JpaRepository<{Entity}, Long>"
패키지명: "{domain}.repository" 또는 "repository.{domain}"
파일명: "{Entity}Repository.java"

기본_메서드:
  - "자동_생성: save, findById, findAll, delete 등"
  - "커스텀_쿼리: @Query 또는 메서드명 기반"
  - "네이티브_쿼리: @Query(nativeQuery = true)"
```

#### 인터페이스 JavaDoc 주석 규칙
```yaml
인터페이스_주석_템플릿:
  필수_내용:
    - "/**"
    - " * {엔티티명} Repository"
    - " * {기능 설명 - 예: 사용자 데이터에 대한 데이터 접근을 담당하는 Repository입니다.}"
    - " *"
    - " * @author 개발팀"
    - " * @version 1.0"
    - " * @since {생성일자}"
    - " * @copyright (c) 2024 OSSTEM IMPLANT"
    - " */"

예시:
  """
  /**
   * 사용자 Repository
   * 사용자 데이터에 대한 데이터 접근을 담당하는 Repository입니다.
   *
   * @author 개발팀
   * @version 1.0
   * @since 2024-01-01
   * @copyright (c) 2024 OSSTEM IMPLANT
   */
  """
```

#### MyBatis 패턴
```yaml
인터페이스명: "{Entity}Mapper"
어노테이션: "@Mapper"
매핑파일: "resources/mapper/{Entity}Mapper.xml"
패키지명: "{domain}.mapper" 또는 "mapper.{domain}"

XML_구조:
  - "namespace: 인터페이스_풀네임"
  - "resultMap: 엔티티_매핑"
  - "sql: 공통_쿼리_조각"
  - "CRUD_쿼리: insert, select, update, delete"
```

#### MyBatis Mapper JavaDoc 주석 규칙
```yaml
Mapper_인터페이스_주석_템플릿:
  필수_내용:
    - "/**"
    - " * {엔티티명} Mapper"
    - " * {기능 설명 - 예: 사용자 데이터에 대한 MyBatis 매퍼 인터페이스입니다.}"
    - " *"
    - " * @author 개발팀"
    - " * @version 1.0"
    - " * @since {생성일자}"
    - " * @copyright (c) 2024 OSSTEM IMPLANT"
    - " */"

예시:
  """
  /**
   * 사용자 Mapper
   * 사용자 데이터에 대한 MyBatis 매퍼 인터페이스입니다.
   *
   * @author 개발팀
   * @version 1.0
   * @since 2024-01-01
   * @copyright (c) 2024 OSSTEM IMPLANT
   */
  """
```

#### JDBC 패턴
```yaml
클래스명: "{Entity}Dao" 또는 "{Entity}Repository"
어노테이션: "@Repository"
의존성: "JdbcTemplate 또는 NamedParameterJdbcTemplate"

메서드_패턴:
  - "RowMapper<{Entity}> 구현"
  - "PreparedStatement 활용"
  - "배치_처리_지원"
```

### **2. 표준 CRUD 메서드 규칙**

#### 기본 CRUD (JPA 기준)
```yaml
CREATE:
  method: "save({Entity} entity)"
  return: "{Entity}"
  description: "엔티티 저장 또는 업데이트"

READ_BY_ID:
  method: "findById(Long id)"
  return: "Optional<{Entity}>"
  description: "ID로 엔티티 조회"

READ_ALL:
  method: "findAll()"
  return: "List<{Entity}>"
  description: "모든 엔티티 조회"

READ_PAGED:
  method: "findAll(Pageable pageable)"
  return: "Page<{Entity}>"
  description: "페이징된 엔티티 조회"

UPDATE:
  method: "save({Entity} entity)" # JPA는 save로 통합
  return: "{Entity}"
  description: "엔티티 업데이트"

DELETE:
  method: "deleteById(Long id)"
  return: "void"
  description: "ID로 엔티티 삭제"

DELETE_ENTITY:
  method: "delete({Entity} entity)"
  return: "void"
  description: "엔티티 삭제"
```

#### 커스텀 조회 메서드
```yaml
조건별_조회:
  - "findBy{Property}(Type property)"
  - "findBy{Property1}And{Property2}(Type1 prop1, Type2 prop2)"
  - "findBy{Property}OrderBy{OrderProperty}(Type property)"

존재_확인:
  - "existsBy{Property}(Type property)"
  - "countBy{Property}(Type property)"

삭제:
  - "deleteBy{Property}(Type property)"
  - "removeBy{Property}(Type property)"
```

### **3. 복합 쿼리 생성 규칙**

#### 검색 및 필터링 (JPA)
```yaml
동적_쿼리:
  method: "findBy{Entity}SearchCriteria({Entity}SearchCriteria criteria, Pageable pageable)"
  annotation: "@Query"
  approach: "Criteria API 또는 Specification"
  
JPQL_쿼리:
  format: "@Query(\"SELECT e FROM {Entity} e WHERE e.property = :value\")"
  parameters: "@Param(\"value\") Type value"
  
네이티브_쿼리:
  format: "@Query(value = \"SELECT * FROM {table} WHERE column = ?1\", nativeQuery = true)"
  use_case: "복잡한_조인_또는_DB_특화_기능"
```

#### 집계 쿼리
```yaml
카운트_쿼리:
  - "countBy{Property}(Type property)"
  - "@Query(\"SELECT COUNT(e) FROM {Entity} e WHERE ...\")"

합계_쿼리:
  - "@Query(\"SELECT SUM(e.{property}) FROM {Entity} e WHERE ...\")"
  
그룹핑_쿼리:
  - "@Query(\"SELECT e.{groupProperty}, COUNT(e) FROM {Entity} e GROUP BY e.{groupProperty}\")"
```

### **4. 성능 최적화 규칙**

#### 페치 전략
```yaml
즉시_로딩:
  - "@Query(\"SELECT e FROM {Entity} e JOIN FETCH e.{relation}\")"
  - "연관관계_미리_로딩"

지연_로딩:
  - "기본_전략_유지"
  - "필요시_명시적_페치"

배치_페치:
  - "@BatchSize(size = 10)"
  - "N+1_문제_해결"
```

#### 쿼리 힌트
```yaml
JPA_힌트:
  - "@QueryHints({@QueryHint(name = \"org.hibernate.readOnly\", value = \"true\")})"
  - "@QueryHints({@QueryHint(name = \"org.hibernate.fetchSize\", value = \"50\")})"

캐시_힌트:
  - "@QueryHints({@QueryHint(name = \"org.hibernate.cacheable\", value = \"true\")})"
```

### **5. 동시성 제어 규칙**

#### 락킹 전략
```yaml
낙관적_락:
  - "@Lock(LockModeType.OPTIMISTIC)"
  - "@Version" # Entity에 버전 필드

비관적_락:
  - "@Lock(LockModeType.PESSIMISTIC_WRITE)"
  - "@Lock(LockModeType.PESSIMISTIC_READ)"

락_타임아웃:
  - "@QueryHints({@QueryHint(name = \"jakarta.persistence.lock.timeout\", value = \"3000\")})"
```

## 📝 기술별 특화 규칙

### **MyBatis 매퍼 XML 구조**

#### 기본 XML 템플릿
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
    
<mapper namespace="{package}.{Entity}Mapper">
    
    <!-- 결과 매핑 -->
    <resultMap id="{entity}ResultMap" type="{package}.{Entity}">
        <id property="id" column="id"/>
        <result property="{property}" column="{column}"/>
        <!-- 연관관계 매핑 -->
        <association property="{relation}" 
                     javaType="{RelationType}" 
                     resultMap="{relation}ResultMap"/>
    </resultMap>
    
    <!-- 공통 SQL 조각 -->
    <sql id="selectColumns">
        SELECT id, {columns} FROM {table}
    </sql>
    
    <!-- CRUD 쿼리 -->
    <insert id="insert" parameterType="{Entity}">
        INSERT INTO {table} ({columns}) VALUES (#{property})
        <selectKey keyProperty="id" resultType="long">
            SELECT LAST_INSERT_ID()
        </selectKey>
    </insert>
    
    <select id="selectById" parameterType="long" resultMap="{entity}ResultMap">
        <include refid="selectColumns"/>
        WHERE id = #{id}
    </select>
    
    <!-- 동적 쿼리 -->
    <select id="selectByCriteria" parameterType="{SearchCriteria}" resultMap="{entity}ResultMap">
        <include refid="selectColumns"/>
        <where>
            <if test="property != null">
                AND {column} = #{property}
            </if>
        </where>
        ORDER BY {orderColumn} {direction}
    </select>
</mapper>
```

### **JDBC Template 패턴**

#### RowMapper 구현
```yaml
RowMapper_클래스:
  - "클래스명: {Entity}RowMapper"
  - "구현: RowMapper<{Entity}>"
  - "mapRow 메서드: ResultSet → Entity 변환"

메서드_구현:
  - "jdbcTemplate.query(sql, rowMapper)"
  - "jdbcTemplate.queryForObject(sql, rowMapper, params)"
  - "namedParameterJdbcTemplate.query(sql, paramMap, rowMapper)"
```

## 🔍 도메인별 특화 쿼리

### **전자상거래 도메인**

#### 상품 Repository
```yaml
재고_관리:
  - "findByStockLessThan(int minStock)"
  - "updateStockQuantity(Long productId, int quantity)"
  - "findTopSellingProducts(Pageable pageable)"

가격_조회:
  - "findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice)"
  - "findDiscountedProducts()"
  - "calculateAveragePrice()"
```

#### 주문 Repository
```yaml
주문_조회:
  - "findByUserIdAndDateBetween(Long userId, Date start, Date end)"
  - "findPendingOrders()"
  - "findOrdersWithItems(Long orderId)"

통계_쿼리:
  - "calculateTotalSales(Date start, Date end)"
  - "findTopCustomers(int limit)"
  - "getOrderStatsByStatus()"
```

### **금융 도메인**

#### 계좌 Repository
```yaml
잔액_조회:
  - "findAccountBalance(String accountNumber)"
  - "findAccountsWithLowBalance(BigDecimal threshold)"

거래_내역:
  - "findTransactionHistory(String accountNumber, Pageable pageable)"
  - "findLargeTransactions(BigDecimal amount)"
  - "calculateDailyBalance(String accountNumber, Date date)"

보안_조회:
  - "findSuspiciousTransactions()"
  - "findFailedLoginAttempts(String userId)"
```

### **의료 도메인**

#### 환자 Repository
```yaml
환자_조회:
  - "findByPatientNumber(String patientNumber)"
  - "findByDoctorId(Long doctorId)"
  - "findPatientsWithUpcomingAppointments(Date date)"

진료_기록:
  - "findMedicalRecordsByPatient(Long patientId)"
  - "findRecordsByDateRange(Long patientId, Date start, Date end)"
  - "findPatientsByDiagnosis(String diagnosis)"
```

## 🔧 생성 시 고려사항

### **인덱스 활용**
```yaml
인덱스_고려:
  - "WHERE_절_컬럼_인덱스"
  - "ORDER_BY_절_컬럼_인덱스"
  - "복합_인덱스_순서"

쿼리_힌트:
  - "USE_INDEX_힌트_적용"
  - "FORCE_INDEX_필요시"
```

### **데이터베이스별 최적화**

#### PostgreSQL
```yaml
특화_기능:
  - "JSONB_타입_활용"
  - "배열_타입_지원"
  - "전문검색_기능"
  - "윈도우_함수"

최적화:
  - "EXPLAIN_ANALYZE_활용"
  - "적절한_인덱스_타입"
```

#### MySQL
```yaml
특화_기능:
  - "전문검색_인덱스"
  - "파티셔닝_활용"
  - "JSON_함수"

최적화:
  - "EXPLAIN_FORMAT=JSON"
  - "InnoDB_최적화"
```

### **테스트 지원**
```yaml
Repository_테스트:
  - "@DataJpaTest" # JPA Repository 테스트
  - "@MybatisTest" # MyBatis Mapper 테스트
  - "TestContainer" # 실제 DB 테스트
  - "H2_인메모리_DB" # 빠른 테스트
```

이 규칙을 바탕으로 AI가 기술스택과 도메인에 맞는 최적화된 DAO/Repository 레이어 코드를 자동 생성합니다.