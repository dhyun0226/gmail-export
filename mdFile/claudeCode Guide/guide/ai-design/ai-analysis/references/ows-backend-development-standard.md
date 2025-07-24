# OWS 백엔드 개발 표준 가이드

> OSSTEM IMPLANT OW시스템 백엔드 개발을 위한 종합 표준 가이드
> Java 21 + Spring Boot 3.4 기반 백엔드 소스 코드 생성 및 개발 표준

## 📌 목차

1. [개요](#1-개요)
2. [OW시스템 특화 구조](#2-ow시스템-특화-구조)
3. [기술 스택 및 설계 원칙](#3-기술-스택-및-설계-원칙)
4. [명명 규칙](#4-명명-규칙)
5. [패키지 구조](#5-패키지-구조)
6. [코딩 스타일](#6-코딩-스타일)
7. [Java 21 최신 기법](#7-java-21-최신-기법)
8. [소스 코드 생성 프로세스](#8-소스-코드-생성-프로세스)
9. [주석 작성 규칙](#9-주석-작성-규칙)
10. [메시지 처리 및 예외 처리](#10-메시지-처리-및-예외-처리)

---

## 1. 개요

### 1.1. 문서 목적
본 문서는 OSSTEM IMPLANT OW시스템 백엔드 개발의 단일 표준을 제공하여 일관되며 가독성 높은 소스 코드 개발과 효율적인 유지보수를 수행할 수 있는 체계를 제공합니다.

### 1.2. 적용 범위
- **프로젝트**: OSSTEM IMPLANT OW시스템 전체
- **기술 스택**: Java 21 + Spring Boot 3.4 + MyBatis + MariaDB
- **개발자**: OW시스템 백엔드 개발 참여 인원 전체

---

## 2. OW시스템 특화 구조

### 2.1. 시스템 코드
OW시스템 개발 시 전사적인 정보시스템 코드를 정의하여 패키지 구조 등 개발 전반에 적용합니다.

| 시스템 한글명 | 시스템 영문명 | 시스템 약어 |
|--------------|--------------|------------|
| 고객영업관리시스템 | Customer relationship management | ECRM |
| 통합거래처관리시스템 | Customer Integration Management | CIMS |
| OPEN 시스템 | Open Portal System | OPEN |
| **OW시스템** | **OW System** | **OW** |
| eCampus | eCampus | CAMP |

### 2.2. 업무 코드
업무 분류를 코드(3자리)로 정의하여 데이터베이스(업무코드) 설계 및 패키지(업무약어) 구조 등 개발 전반에 적용합니다.

**프로젝트 명명 규칙:**
- WEB: `{시스템 코드}-web-{업무 코드}`
- WAS: `{시스템 코드}-{업무 코드}`
- 예시: `ows-web-tsk`, `ows-tsk`

#### 2.2.1. OW 업무 코드

| 업무코드 | DB업무코드 | Port/URL | 업무분류 | 비고 |
|---------|-----------|----------|---------|------|
| COM | CMG | :8010/com | 시스템관리(공통모듈) | Common, Security, Configuration |
| DAM | | :8011/dam | 데이터 아키텍처 관리 | |
| NTF | | :8012/ntf | 알림 | |
| BAT | | :8013/bat | 공통 배치 | |
| EAP | | :8020/eap | 전자결재 | |
| TSK | | :8030/tsk | 할일관리 | |
| DNM | | :8050/dnm-adm | 덴올몰 패키지주문 관리자 | |
| LOG | | :8070/log | 물류 | |
| OIC | SEI | :9051/education | 교육 | |
| ITR | | :9041/interior | 인테리어 | Interior |
| JOB | | :8130/job | 덴잡 | |
| SAL | SAM | :8150/sal | 국내영업 | |
| VOC | | :8201/voc | 통합 고객센터 | |

### 2.3. 프로젝트 의존성
모든 프로젝트는 ows 공통 프로젝트 패키지를 참조합니다.

```gradle
# 필수
implementation("com.osstem:core:버전")
implementation("com.osstem:storage-db:버전")
implementation("com.osstem:logging:버전")

# 선택
implementation("com.osstem:storage-redis:버전")
implementation("com.osstem:storage-kafka:버전")
```

---

## 3. 기술 스택 및 설계 원칙

### 3.1. 기술 스택
- **언어**: Java 21 (LTS)
- **프레임워크**: Spring Boot 3.4
- **데이터베이스**: MariaDB
- **ORM**: MyBatis
- **기본 패키지**: `com.osstem.ow.{업무코드}`
- **API 문서화**: Swagger 3 (API 응답 제외)
- **메시지 관리**: Spring MessageSource (messages.properties)
- **예외 처리**: 글로벌 예외 핸들러 (@ControllerAdvice)

> **중요**: ApiResponse 클래스는 프레임워크에서 이미 제공하고 있으므로 별도로 생성하지 않습니다.

### 3.2. 설계 원칙

#### 3.2.1. SOLID 원칙
- **S (Single Responsibility Principle)**: 각 클래스는 하나의 책임만 가져야 함
  - Controller: HTTP 요청/응답 처리만 담당
  - Service: 비즈니스 로직 처리만 담당
  - Mapper: 데이터 액세스만 담당
  - DTO: 데이터 전송만 담당

- **O (Open/Closed Principle)**: 확장에는 열려있고 수정에는 닫혀있어야 함
  - 인터페이스를 통한 추상화 활용
  - 전략 패턴, 팩토리 패턴 등을 활용한 확장 가능한 구조

- **D (Dependency Inversion Principle)**: 고수준 모듈은 저수준 모듈에 의존하지 않아야 함
  - 인터페이스를 통한 의존성 주입
  - @Autowired 필드 주입 금지, 생성자 주입 사용

#### 3.2.2. Clean Architecture 원칙
- **의존성 규칙**: 외부 계층은 내부 계층에 의존하되, 내부 계층은 외부 계층에 의존하지 않음
- **계층 간 경계**: 명확한 계층 분리를 통한 관심사 분리
- **엔티티 중심**: 비즈니스 규칙을 엔티티와 서비스에 집중

### 3.3. 의존성 주입 방식
- @Autowired 필드 주입 사용 금지
- 생성자 주입 방식만 사용 (@RequiredArgsConstructor 활용)

### 3.4. Audit 컬럼 정의
모든 테이블은 다음의 Audit 컬럼 포함:

```sql
PROC_PRGM_ID VARCHAR(50) NOT NULL COMMENT '처리프로그램ID',
RGST_PROCR_ID VARCHAR(50) NOT NULL COMMENT '등록처리자ID',
RGST_PROC_DTM DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '등록처리일시',
UPDT_PROCR_ID VARCHAR(50) DEFAULT NULL COMMENT '수정처리자ID',
UPDT_PROC_DTM DATETIME(6) DEFAULT NULL COMMENT '수정처리일시'
```

> **중요**: DTO의 Audit 컬럼의 값은 MyBatis Interceptor Plugin에서 자동으로 처리. 서비스 계층에서 DTO 객체의 Audit 컬럼값을 직접 설정하는 코드를 작성하지 않음

### 3.5. 예외 처리 정책
다음 공통 예외 클래스 사용 (프레임워크에서 제공):
- **BusinessException**: 업무 규칙 위반 시 발생
- **AuthorizationException**: 권한 부족 시 발생
- **ValidationException**: 입력값 검증 실패 시 발생
- **EntityNotFoundException**: 데이터가 존재하지 않을 때 발생
- **SystemException**: 시스템 오류 발생 시 사용

---

## 4. 명명 규칙

### 4.1. 패키지 명명 규칙
자바 패키지는 모두 소문자로 사용하며 그 명명규칙은 다음과 같습니다.

| 패키지 | 설명 |
|--------|------|
| `com.osstem.ow.{업무코드}` | 기본 패키지 구조 |
| controller | API Endpoint를 정의하는 클래스 |
| service | 비즈니스 로직을 담당하고 Persistence Layer로 전달 |
| mapper | MyBatis Mapper Interface를 갖는 패키지 |
| model.dto | DTO 클래스를 갖는 패키지 |
| model.record | Record 클래스 (Java 21) |
| model.request | 요청 DTO |
| model.search | 검색 DTO |
| model.code | Enum 상수 코드 클래스 |

**패키지 예시:**
- `com.osstem.ow.sal.controller.CommonCodeController.java`
- `com.osstem.ow.sal.service.CommonCodeService.java`
- `com.osstem.ow.sal.model.dto.CommonCodeDto.java`

### 4.2. 클래스 명명 규칙
클래스명은 각 단어의 첫 글자만 대문자로 사용하며 가능한 풀네임을 적용합니다.

| Suffix | 사용 예 | 설명 |
|--------|---------|------|
| Controller | `EmployeeController.java` | API 컨트롤러 |
| Service | `EmployeeService.java` | 비즈니스 서비스 |
| ServiceImpl | `EmployeeServiceImpl.java` | 서비스 구현체 |
| Mapper | `EmployeeMapper.java` | MyBatis 매퍼 |
| Dto | `EmployeeDto.java` | 데이터 전송 객체 |
| CreateRequestDto | `EmployeeCreateRequestDto.java` | 생성 요청 DTO |
| UpdateRequestDto | `EmployeeUpdateRequestDto.java` | 수정 요청 DTO |
| SearchDto | `EmployeeSearchDto.java` | 검색 조건 DTO |
| Exception | `BizException.java` | 예외 클래스 |
| Test | `EmployeeServiceTest.java` | 테스트 클래스 |

### 4.3. 메서드 명명 규칙
메소드 명명규칙은 기본적으로 **[Prefix]{명사}**를 사용하며, 해당 단어는 용어사전을 준용합니다.

#### 4.3.1. 계층별 메서드 명명 규칙

| 구분 | 유형 | Prefix | 비고 |
|------|------|--------|------|
| **Controller** | 조회 | get | 단건: get<br>다건: getList |
| | 등록 | add | 단건: add<br>다건: addList |
| | 수정 | modify | 단건: modify<br>다건: modifyList |
| | 삭제 | remove | 단건: remove<br>다건: removeList |
| | 멀티(등록/수정/삭제) | save | 다중 등록/수정/삭제 |
| | 화면 버튼 기능 처리 | 버튼 ID | 승인: approve<br>취소: cancel |
| **Service** | 조회 | get | 단건: get<br>다건: getList |
| | 등록 | add | 단건: add<br>다건: addList |
| | 수정 | modify | 단건: modify<br>다건: modifyList |
| | 삭제 | remove | 단건: remove<br>다건: removeList |
| | 상태 변경 | changeStatus | 상태 기반 처리 |
| | 검증 | validate{동작} | 비즈니스 규칙 검증 |
| | 조회 (Optional) | find{EntityName} | Optional 반환 |
| **Mapper** | 조회 | select | 단건: select<br>다건: selectList |
| | 건수 조회 | selectCount | 전체 건수 조회 |
| | 등록 (MyBatis) | insert | 단건: insert |
| | 등록/수정 (JPA) | save | 단건: save |
| | 수정 | update | 단건: update |
| | 삭제 | delete | 단건: delete |
| | 상태 수정 | updateStatus | 상태 변경 전용 |

#### 4.3.2. 동일 프로그램(화면)에서 다른 데이터 조회 시
예) EmployeeController: 기본 정보와 경력 내역을 함께 조회하는 경우

- 기본 정보: `getList`, `addList`, `modifyList`, `removeList`
- 경력 내역: `getCareerList`, `addCareerList`, `modifyCareerList`, `removeCareerList`

### 4.4. 변수 명명 규칙
- 자바 변수의 명명규칙은 DB영문명(약어 X) 사용으로 명명
- 흔히 사용하는 id, no 등은 예외적으로 허용
- 첫 글자는 소문자를 사용하고 이후 단어의 첫 글자만 대문자 사용
- loop index에서 사용하는 변수는 i, j, k, m, n 등을 사용
- 변수명에는 '$' 또는 '_' 사용하지 않음 (데이터베이스 컬럼명 그대로 사용하는 경우는 '_' 허용)

### 4.5. 상수 명명 규칙
- 상수는 static final로 선언하고 용어사전을 사용하여 대문자로만 작성
- 단어 사이는 '_'를 사용하여 구분
- 예) `DATE_FORMAT = "yyyy-MM-dd"`

### 4.6. Request Mapping 명명 규칙

#### 4.6.1. 기본 원칙
- **소문자 사용**: URL은 항상 소문자로 작성
- **하이픈(-) 사용**: 단어 구분은 하이픈(-) 사용
- **명사 중심**: RESTful 규칙에 따라 리소스를 명사로 표현
- **복수형 사용**: 리소스는 복수형 명사로 표현
- **버전 명시**: URL에 API 버전 명시 (v1, v2 등)

#### 4.6.2. URL 구조 예시

| 기능 | URL 예시 | 설명 |
|------|----------|------|
| 사용자 목록 조회 | `GET /api/com/v1/users` | 모든 사용자 가져오기 |
| 특정 사용자 조회 | `GET /api/com/v1/users/1` | ID가 1인 사용자 |
| 특정 사용자의 게시글 | `GET /api/com/v1/users/1/posts` | 사용자 1의 게시글 |
| 게시글 검색 | `GET /api/com/v1/posts?keyword=java` | 게시글 키워드 검색 |

---

## 5. 패키지 구조

### 5.1. 전체 패키지 구조
```
com.osstem.ow.{업무코드}/
├── controller/      # 컨트롤러 클래스
├── service/         # 서비스 클래스
├── mapper/          # MyBatis 매퍼 인터페이스
├── model/           # 데이터 모델
│   ├── dto/         # 데이터 전송 객체
│   ├── record/      # Record 클래스 (Java 21)
│   ├── request/     # 요청 DTO
│   ├── search/      # 검색 DTO
│   └── code/        # Enum 상수 코드 클래스
├── config/          # Application 설정 클래스
├── util/            # 비즈니스 로직 유틸 클래스
└── common/
    ├── constant/    # 상수 클래스
    ├── util/        # 유틸리티 클래스
    ├── message/     # 메시지 관련 클래스
    └── builder/     # 빌더 패턴 클래스
```

### 5.2. 서비스와 Repository 의존성 규칙
- Service와 Repository는 1:1로 매핑되어야 함 (1:N 관계는 허용하지 않음)
- Service에서 다른 Repository의 Method를 사용하고자 할 경우에 해당 Repository와 매핑된 Service에 Service Method를 정의하여 Service의 메소드를 호출하여 사용

---

## 6. 코딩 스타일

### 6.1. 기본 원칙
- 주석은 모든 소스 코드에 상세히 기술하는 것을 원칙으로 함
- 소스 코드는 불가피한 내용을 제외하고 원칙적으로 중복을 금지함
- 소스 코드는 웹 표준 및 접근성, 웹 보안 취약점 등에 각별히 주의함
- 파일 Encoding은 UTF-8을 기본으로 함
- 클래스파일, 변수명 등 가능한 풀네임을 적용함

### 6.2. Indent (들여쓰기)
- 들여쓰기는 4 space를 1 tab으로 정의하여 사용
- 새로운 라인은 이전 라인의 표현식과 같은 레벨로 들여쓰기

### 6.3. Space (띄어쓰기)
- 하나의 라인에는 하나의 문장만 기술
- comma(,), colon(:), semicolon(;) 으로 문장이 연속될 경우 해당 문자 뒤에는 space를 둠
- Assignment operator('=') 앞과 뒤에 space를 둠
- Unary operator는 space를 두지 않음
- Binary operator인 '+', '-', '&&' 등은 앞과 뒤에 space를 둠

### 6.4. Brace (블럭)
- '{' 와 '}' 뒤에는 새로운 라인이 위치하여 다른 내용과 함께 기술하지 않음
- '{'는 앞의 '{'와 비교해서 indent를 둠
- '}'는 짝이 되는 '{'과 동일하게 indent를 둠

```java
public class Test {

    public static void main(String[] args) {
        log.debug("###");
    }
}
```

### 6.5. 자바 소스 파일 구성
자바 소스 파일은 다음과 같이 구성되며, 각 구성요소는 한 라인의 공백을 둡니다.

1. 프로그램 주석
2. package 문장
3. import 문장
4. 클래스 또는 인터페이스 주석/선언
5. 멤버 변수 주석/선언
6. 메소드 주석/선언
7. 메소드 구현

### 6.6. Import 규칙
- import 하는 클래스는 ".*"를 사용하지 않고 모두 적음
- 클래스 import 시 동일 패키지를 그룹으로 묶으며 중복하여 import하지 않음
- 이클립스에서 [Ctrl+Shift+O] 키를 사용하여 Organize Imports 기능 활용

### 6.7. Logging (로깅)
- Log는 반드시 Framework에서 제공하는 Logger만을 사용 (기본 Slf4j)
- **절대로 System.out.print 등은 사용하지 말 것**
- Log는 debug, info, warn, error로 구별하여 사용
- debug log는 개발 시에만 사용하고 운영 중에는 사용하지 않음
- Lombok을 이용한 어노테이션 기능을 활용 **(@Slf4j)**

---

## 7. Java 21 최신 기법

### 7.1. 적용 기법
- **Record Classes**: 불변 데이터 구조, API 응답, DTO 대안으로 활용
- **Pattern Matching**: instanceof와 Switch에서 타입 안전성 확보
- **Switch Expressions**: 조건부 로직 간소화, 상태 기반 처리
- **Sealed Classes**: 제한된 상속 구조로 도메인 모델 강화
- **Stream API**: 데이터 처리 효율성 향상, 함수형 프로그래밍
- **Optional**: null 안전성 확보, 메서드 체이닝
- **Generic**: 타입 안전성과 재사용성 향상
- **Virtual Threads**: 동시성 처리 개선, 대량 데이터 처리

> **중요**: var 키워드 사용 안함

### 7.2. 적용 우선순위
1. **Record**: 불변 데이터가 필요한 경우 DTO 대신 활용
2. **Optional**: 모든 조회 메서드에서 null 안전성 확보
3. **Switch Expressions**: 상태 기반 로직, Enum 처리
4. **Stream API**: 컬렉션 처리, 데이터 변환
5. **Pattern Matching**: 타입 검사와 캐스팅이 필요한 경우

### 7.3. 활용 예시

#### 7.3.1. Enum과 Switch Expressions 활용
```java
@Getter
@RequiredArgsConstructor
public enum OrderStatusCode {
    WAIT("결제대기", "결제를 기다리고 있는 상태"),
    PAID("결제완료", "결제가 완료된 상태"),
    CANCEL("취소", "주문이 취소된 상태");
    
    private final String name;
    private final String description;
    
    public static Optional<OrderStatusCode> of(String code) {
        return Arrays.stream(values())
            .filter(status -> status.name().equals(code))
            .findFirst();
    }
    
    public boolean canTransitionTo(OrderStatusCode newStatus) {
        return switch (this) {
            case WAIT -> newStatus == PAID || newStatus == CANCEL;
            case PAID -> newStatus == CANCEL;
            case CANCEL -> false;
        };
    }
}
```

#### 7.3.2. Optional 활용
```java
@Transactional(readOnly = true)
public Optional<OrderDto> findById(Long orderId) {
    return Optional.ofNullable(orderMapper.select(orderId));
}

@Transactional(readOnly = true)
public OrderDto get(Long orderId) {
    return findById(orderId)
        .orElseThrow(() -> new EntityNotFoundException("order.notFound"));
}
```

---

## 8. 소스 코드 생성 프로세스

### 8.1. 코드성 데이터 Enum 클래스 생성

#### 8.1.1. 생성 규칙
- 네이밍: `{도메인명}{코드유형}`
- Java 21 Switch Expression과 Pattern Matching 지원
- Static 메서드: `of(String code)` (Optional 반환), `isValid(String code)`

#### 8.1.2. 기본 구조
```java
@Getter
@RequiredArgsConstructor
public enum OrderStatusCode {
    WAIT("결제대기", "결제를 기다리고 있는 상태"),
    PAID("결제완료", "결제가 완료된 상태"),
    CANCEL("취소", "주문이 취소된 상태");
    
    private final String name;
    private final String description;
    
    public static Optional<OrderStatusCode> of(String code) {
        return Arrays.stream(values())
            .filter(status -> status.name().equals(code))
            .findFirst();
    }
    
    public static boolean isValid(String code) {
        return of(code).isPresent();
    }
}
```

### 8.2. DTO 클래스 생성

#### 8.2.1. 기본 DTO 구조
```java
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "주문 정보")
public class OrderDto {
    
    @Schema(description = "주문 ID", example = "1")
    private Long orderId;
    
    @Schema(description = "주문 번호", example = "ORD20240101001")
    private String orderNumber;
    
    @Schema(description = "고객 ID", example = "CUST001")
    private String customerId;
    
    @Schema(description = "주문 상태", example = "WAIT")
    private OrderStatusCode orderStatusCode;
    
    @Schema(description = "주문 일시")
    private LocalDateTime orderDate;
    
    @Schema(description = "총 금액", example = "50000")
    private BigDecimal totalAmount;
    
    /**
     * 신규 생성용 팩토리 메소드
     */
    public static OrderDto of(OrderCreateRequestDto requestDto) {
        return OrderDto.builder()
            .orderNumber(OrderNumberGenerator.generate())
            .customerId(requestDto.getCustomerId())
            .orderDate(LocalDateTime.now())
            .orderStatusCode(WAIT)
            .totalAmount(requestDto.getTotalAmount())
            .build();
    }
    
    /**
     * 수정용 팩토리 메소드
     */
    public static OrderDto of(Long orderId, OrderUpdateRequestDto requestDto) {
        return OrderDto.builder()
            .orderId(orderId)
            .deliveryZipCode(requestDto.getDeliveryZipCode())
            .deliveryBaseAddress(requestDto.getDeliveryBaseAddress())
            .build();
    }
    
    /**
     * 상태 변경용 팩토리 메소드
     */
    public static OrderDto of(Long orderId, OrderStatusCode newStatus) {
        return OrderDto.builder()
            .orderId(orderId)
            .orderStatusCode(newStatus)
            .build();
    }
}
```

#### 8.2.2. 요청 DTO - BaseDto 상속
```java
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "주문 생성 요청")
public class OrderCreateRequestDto extends BaseDto {
    
    @NotBlank
    @Schema(description = "고객 ID", example = "CUST001")
    private String customerId;
    
    @NotNull
    @DecimalMin("0")
    @Schema(description = "총 금액", example = "50000")
    private BigDecimal totalAmount;
    
    @Valid
    @NotEmpty
    @Schema(description = "주문 상품 목록")
    private List<OrderItemCreateRequestDto> orderItems;
}
```

#### 8.2.3. 검색 DTO
```java
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "주문 검색 조건")
public class OrderSearchDto {
    
    @Schema(description = "고객 ID", example = "CUST001")
    private String customerId;
    
    @Schema(description = "주문 상태", example = "WAIT")
    private String orderStatusCode;
    
    @Schema(description = "주문 시작일", example = "2024-01-01")
    private LocalDate orderDateFrom;
    
    @Schema(description = "주문 종료일", example = "2024-01-31")
    private LocalDate orderDateTo;
    
    @Schema(description = "정렬 조건", example = "orderDate:DESC,totalAmount:ASC")
    private String sortFields;
    
    @Schema(description = "페이지 번호", example = "1")
    @Builder.Default
    private Integer page = 1;
    
    @Schema(description = "페이지 크기", example = "15")
    @Builder.Default
    private Integer size = 15;
    
    /**
     * OFFSET 계산
     */
    public int getOffset() {
        return (page - 1) * size;
    }
    
    /**
     * LIMIT 값 반환
     */
    public int getLimit() {
        return size;
    }
    
    /**
     * 정렬 조건이 있는지 확인
     */
    public boolean hasSortFields() {
        return sortFields != null && !sortFields.trim().isEmpty();
    }
}
```

### 8.3. Mapper 인터페이스 및 XML 생성

#### 8.3.1. Mapper 인터페이스
```java
@Mapper
public interface OrderMapper {
    
    /**
     * 주문 목록 조회
     */
    List<OrderDto> selectList(OrderSearchDto searchDto);
    
    /**
     * 주문 건수 조회
     */
    int selectCount(OrderSearchDto searchDto);
    
    /**
     * 주문 상세 조회
     */
    OrderDto select(@Param("orderId") Long orderId);
    
    /**
     * 주문 생성
     */
    int insert(OrderDto orderDto);
    
    /**
     * 주문 수정
     */
    int update(OrderDto orderDto);
    
    /**
     * 주문 삭제
     */
    int delete(@Param("orderId") Long orderId);
    
    /**
     * 주문 상태 변경
     */
    int updateStatus(@Param("orderId") Long orderId, @Param("statusCode") String statusCode);
}
```

#### 8.3.2. Mapper XML 작성 규칙
- 키워드, 테이블명, 컬럼명은 모두 대문자로 작성
- 들여쓰기는 4칸 공백 사용
- 디버깅을 위해 `/* {네임스페이스}.{sql id} */` 주석을 xml 태그 안쪽 첫번째 줄에 추가
- 주요 키워드 다음에서 줄바꿈 수행 (SELECT, FROM, WHERE, ORDER BY, GROUP BY, HAVING)

```xml
<select id="selectList" parameterType="OrderSearchDto" resultType="OrderDto">
    /* com.osstem.ow.sal.mapper.OrderMapper.selectList */
    SELECT
        O.ORD_ID AS ORDER_ID,
        O.ORD_NO AS ORDER_NUMBER,
        O.CUST_ID AS CUSTOMER_ID,
        O.ORD_STAT_CD AS ORDER_STATUS_CODE,
        O.ORD_DT AS ORDER_DATE,
        O.TOT_AMT AS TOTAL_AMOUNT
    FROM
        TB_ORD O
    WHERE
        1 = 1
        <if test="customerId != null and customerId != ''">
        AND O.CUST_ID = #{customerId}
        </if>
        <if test="orderStatusCode != null and orderStatusCode != ''">
        AND O.ORD_STAT_CD = #{orderStatusCode}
        </if>
        <if test="orderDateFrom != null">
        AND O.ORD_DT >= #{orderDateFrom}
        </if>
        <if test="orderDateTo != null">
        AND O.ORD_DT <= #{orderDateTo}
        </if>
    <choose>
        <when test="hasSortFields()">
        ORDER BY
            <foreach collection="sortFields.split(',')" item="sortField" separator=",">
                <choose>
                    <when test="sortField.trim().startsWith('orderDate')">
                        O.ORD_DT ${sortField.contains(':DESC') ? 'DESC' : 'ASC'}
                    </when>
                    <when test="sortField.trim().startsWith('totalAmount')">
                        O.TOT_AMT ${sortField.contains(':DESC') ? 'DESC' : 'ASC'}
                    </when>
                    <otherwise>
                        O.ORD_DT DESC
                    </otherwise>
                </choose>
            </foreach>
        </when>
        <otherwise>
        ORDER BY
            O.ORD_DT DESC
        </otherwise>
    </choose>
    LIMIT #{limit} OFFSET #{offset}
</select>

<insert id="insert" parameterType="OrderDto">
    /* com.osstem.ow.sal.mapper.OrderMapper.insert */
    INSERT INTO TB_ORD (
        ORD_NO,
        CUST_ID,
        ORD_STAT_CD,
        ORD_DT,
        TOT_AMT,
        PROC_PRGM_ID,
        RGST_PROCR_ID,
        RGST_PROC_DTM
    ) VALUES (
        #{orderNumber},
        #{customerId},
        #{orderStatusCode},
        #{orderDate},
        #{totalAmount},
        #{procPrgmId},
        #{rgstProcrId},
        #{rgstProcDtm}
    )
</insert>
```

### 8.4. Service 클래스 생성

#### 8.4.1. 기본 구조
```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderMapper orderMapper;
    private final CustomerService customerService;
    
    /**
     * 주문 목록을 조회합니다.
     *
     * @param searchDto 검색 조건
     * @return 주문 목록
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getList(OrderSearchDto searchDto) {
        return orderMapper.selectList(searchDto);
    }
    
    /**
     * 주문 건수를 조회합니다.
     *
     * @param searchDto 검색 조건
     * @return 주문 건수
     */
    @Transactional(readOnly = true)
    public int getCount(OrderSearchDto searchDto) {
        return orderMapper.selectCount(searchDto);
    }
    
    /**
     * 주문 상세 정보를 조회합니다.
     *
     * @param orderId 주문 ID
     * @return 주문 정보
     * @throws EntityNotFoundException 주문이 존재하지 않는 경우
     */
    @Transactional(readOnly = true)
    public OrderDto get(Long orderId) {
        return findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("order.notFound"));
    }
    
    /**
     * 주문을 생성합니다.
     * 
     * 처리 절차:
     * 1. 고객 존재 여부 및 주문 상품 유효성 검증
     * 2. 주문 기본 정보 생성 (주문번호 자동 생성, 상태 설정)
     * 3. 주문 정보 데이터베이스 저장
     * 4. 주문 상품 목록 저장
     * 5. 주문 생성 후속 처리 (알림 발송, 이력 기록)
     *
     * @param requestDto 주문 생성 요청 정보
     * @return 생성된 주문 정보
     * @throws BusinessException 고객이 존재하지 않거나 주문 상품이 유효하지 않은 경우
     * @throws ValidationException 필수 입력값이 누락된 경우
     */
    public OrderDto create(OrderCreateRequestDto requestDto) {
        validateCustomerExists(requestDto.getCustomerId());
        validateOrderItems(requestDto.getOrderItems());
        
        OrderDto orderDto = OrderDto.of(requestDto);
        orderMapper.insert(orderDto);
        saveOrderItems(orderDto.getOrderId(), requestDto.getOrderItems());
        processAfterOrderCreation(orderDto);
        
        return orderDto;
    }
    
    /**
     * 주문 상태를 변경합니다.
     * 
     * 처리 절차:
     * 1. 주문 존재 여부 및 상태 변경 권한 검증
     * 2. 현재 상태에서 변경 가능한 상태인지 검증
     * 3. 상태별 추가 비즈니스 규칙 적용
     * 4. 상태 변경 실행 및 이력 저장
     * 5. 외부 시스템 연동 (결제, 배송 등)
     * 6. 고객 알림 발송
     *
     * @param orderId 주문 ID
     * @param newStatus 변경할 상태
     * @param processorId 처리자 ID
     * @return 변경된 주문 정보
     * @throws EntityNotFoundException 주문이 존재하지 않는 경우
     * @throws BusinessException 상태 변경이 불가능한 경우
     * @throws AuthorizationException 상태 변경 권한이 없는 경우
     */
    public OrderDto changeStatus(Long orderId, OrderStatusCode newStatus, String processorId) {
        OrderDto existingOrder = get(orderId);
        validateStatusChangePermission(existingOrder, processorId);
        validateStatusTransition(existingOrder.getOrderStatusCode(), newStatus);
        
        applyBusinessRulesForStatus(existingOrder, newStatus);
        
        OrderDto statusChangeDto = OrderDto.of(orderId, newStatus);
        orderMapper.updateStatus(orderId, newStatus.name());
        saveStatusChangeHistory(orderId, existingOrder.getOrderStatusCode(), newStatus, processorId);
        
        processExternalSystemIntegration(existingOrder, newStatus);
        sendCustomerNotification(existingOrder, newStatus);
        
        return get(orderId);
    }
    
    // Private 메서드들...
    
    @Transactional(readOnly = true)
    private Optional<OrderDto> findById(Long orderId) {
        return Optional.ofNullable(orderMapper.select(orderId));
    }
    
    private void validateCustomerExists(String customerId) {
        customerService.findById(customerId)
            .orElseThrow(() -> new BusinessException("customer.notFound"));
    }
    
    private void validateStatusTransition(OrderStatusCode currentStatus, OrderStatusCode newStatus) {
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new BusinessException("order.invalidStatusTransition", 
                new String[]{currentStatus.name(), newStatus.name()});
        }
    }
}
```

### 8.5. Controller 클래스 생성

```java
@Slf4j
@RestController
@RequestMapping("/api/sal/v1/orders")
@RequiredArgsConstructor
@Tag(name = "주문 관리", description = "주문 생성, 조회, 수정, 삭제 API")
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * 주문 목록을 조회합니다.
     */
    @GetMapping
    @Operation(summary = "주문 목록 조회", description = "검색 조건에 따른 주문 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getList(
            @RequestParam(required = false) String sortFields,
            @ModelAttribute OrderSearchDto searchDto) {
        
        searchDto.setSortFields(sortFields);
        List<OrderDto> orderList = orderService.getList(searchDto);
        
        ApiResponse<List<OrderDto>> response = ApiResponse.<List<OrderDto>>builder()
            .success(true)
            .messageCode("success.order.list")
            .data(orderList)
            .build();
            
        return ResponseEntity.ok(response);
    }
    
    /**
     * 주문 상세 정보를 조회합니다.
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "주문 상세 조회", description = "특정 주문의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<OrderDto>> get(
            @PathVariable Long orderId) {
        
        OrderDto order = orderService.get(orderId);
        
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
            .success(true)
            .messageCode("success.order.get")
            .data(order)
            .build();
            
        return ResponseEntity.ok(response);
    }
    
    /**
     * 주문을 생성합니다.
     */
    @PostMapping
    @Operation(summary = "주문 생성", description = "새로운 주문을 생성합니다.")
    public ResponseEntity<ApiResponse<OrderDto>> create(
            @Validated @RequestBody OrderCreateRequestDto requestDto) {
        
        OrderDto createdOrder = orderService.create(requestDto);
        
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
            .success(true)
            .messageCode("success.order.create")
            .data(createdOrder)
            .build();
            
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * 주문을 수정합니다.
     */
    @PutMapping("/{orderId}")
    @Operation(summary = "주문 수정", description = "기존 주문 정보를 수정합니다.")
    public ResponseEntity<ApiResponse<OrderDto>> update(
            @PathVariable Long orderId,
            @Validated @RequestBody OrderUpdateRequestDto requestDto) {
        
        OrderDto updatedOrder = orderService.update(orderId, requestDto);
        
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
            .success(true)
            .messageCode("success.order.update")
            .data(updatedOrder)
            .build();
            
        return ResponseEntity.ok(response);
    }
    
    /**
     * 주문 상태를 변경합니다.
     */
    @PostMapping("/{orderId}/status")
    @Operation(summary = "주문 상태 변경", description = "주문 상태를 변경합니다.")
    public ResponseEntity<ApiResponse<OrderDto>> changeStatus(
            @PathVariable Long orderId,
            @Validated @RequestBody OrderStatusChangeRequestDto requestDto) {
        
        OrderStatusCode newStatus = OrderStatusCode.of(requestDto.getStatusCode())
            .orElseThrow(() -> new ValidationException("order.invalidStatus"));
            
        OrderDto updatedOrder = orderService.changeStatus(orderId, newStatus, requestDto.getProcessorId());
        
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
            .success(true)
            .messageCode("success.order.statusChange")
            .data(updatedOrder)
            .build();
            
        return ResponseEntity.ok(response);
    }
}
```

---

## 9. 주석 작성 규칙

### 9.1. 클래스 주석
```java
/**
 * 주문 서비스
 * 주문 생성, 조회, 수정, 삭제 및 상태 관리를 담당합니다.
 *
 * @author 개발팀
 * @version 1.0
 * @since 2024-01-01
 * @copyright (c) 2024 OSSTEM IMPLANT
 */
@Service
public class OrderService {
    // 구현...
}
```

### 9.2. 메서드 주석
```java
/**
 * 주문 상태를 변경합니다.
 * 
 * 처리 절차:
 * 1. 주문 존재 여부 및 상태 변경 권한 검증
 * 2. 현재 상태에서 변경 가능한 상태인지 검증
 * 3. 상태별 추가 비즈니스 규칙 적용
 * 4. 상태 변경 실행 및 이력 저장
 * 5. 외부 시스템 연동 (결제, 배송 등)
 * 6. 고객 알림 발송
 *
 * @param orderId 주문 ID
 * @param newStatus 변경할 상태
 * @param processorId 처리자 ID
 * @return 변경된 주문 정보
 * @throws EntityNotFoundException 주문이 존재하지 않는 경우
 * @throws BusinessException 상태 변경이 불가능한 경우
 * @throws AuthorizationException 상태 변경 권한이 없는 경우
 */
public OrderDto changeStatus(Long orderId, OrderStatusCode newStatus, String processorId) {
    // 구현...
}
```

### 9.3. 변수 주석
```java
/**
 * 주문 매퍼
 */
private final OrderMapper orderMapper;

private String customerId;    // 고객 ID
private BigDecimal totalAmount;    // 총 금액
```

---

## 10. 메시지 처리 및 예외 처리

### 10.1. 메시지 키 명명 규칙
- **유효성 검증**: `{필드}.{제약조건}`
- **비즈니스 예외**: `{도메인}.{에러코드}`
- **성공 메시지**: `success.{도메인}.{동작}`

### 10.2. 메시지 리소스 구조
```
src/main/resources/messages/
├── sal-validation.properties  # 유효성 검증 -> Bean Validation 메시지
├── common-message.properties          # 공통 메시지
└── sal-message.properties     # 비즈니스 예외, 성공 메시지 -> 프로젝트별 업무 메시지
```

### 10.3. 메시지 파일 예시

#### sal-validation.properties
```properties
# 주문 관련 유효성 검증 메시지
customerId.notBlank=고객 ID는 필수 입력 항목입니다.
totalAmount.notNull=총 금액은 필수 입력 항목입니다.
totalAmount.decimalMin=총 금액은 0 이상이어야 합니다.
orderItems.notEmpty=주문 상품은 최소 1개 이상 등록해야 합니다.
```

#### sal-message.properties
```properties
# 성공 메시지
success.order.list=주문 목록을 성공적으로 조회했습니다.
success.order.get=주문 정보를 성공적으로 조회했습니다.
success.order.create=주문이 성공적으로 생성되었습니다.
success.order.update=주문이 성공적으로 수정되었습니다.
success.order.statusChange=주문 상태가 성공적으로 변경되었습니다.

# 비즈니스 예외 메시지
order.notFound=존재하지 않는 주문입니다.
order.invalidStatus=유효하지 않은 주문 상태입니다.
order.invalidStatusTransition=현재 상태({0})에서 {1} 상태로 변경할 수 없습니다.
order.alreadyProcessed=이미 처리된 주문입니다.
customer.notFound=존재하지 않는 고객입니다.
```

### 10.4. 예외 처리 방식
- Bean Validation: 메시지 키만 지정, 시스템이 자동 처리
- 예외 발생: 메시지 코드만 지정, 프레임워크가 자동 처리
- API 응답: 메시지 코드만 지정, 프레임워크가 자동 처리

```java
// 비즈니스 예외 발생 예시
if (!WAIT.equals(order.getOrderStatusCode())) {
    throw new BusinessException("order.invalidStatus", 
        new String[]{order.getOrderStatusCode().name()});
}

// 엔티티 없음 예외 발생 예시
if (order == null) {
    throw new EntityNotFoundException("order.notFound");
}
```

---

## 부록: 추가 고려사항

### A.1. 성능 최적화
1. **Virtual Threads**: 대량 데이터 처리 시 활용
2. **Stream API**: 병렬 처리 고려
3. **Optional**: 메서드 체이닝으로 성능 최적화
4. **Record**: 불변 데이터로 메모리 효율성 확보

### A.2. 보안 고려사항
1. **SQL Injection 방지**: 동적 SQL에서 화이트리스트 방식 검증
2. **입력값 검증**: Bean Validation과 비즈니스 규칙 검증 분리
3. **권한 검증**: 메서드 레벨에서 권한 확인
4. **데이터 암호화**: 민감 정보 처리 시 암호화 적용

### A.3. 확장성 고려사항
1. **모듈화**: 기능별 모듈 분리를 통한 독립적 확장
2. **캐싱 전략**: 적절한 캐싱을 통한 성능 최적화
3. **비동기 처리**: 대용량 처리를 위한 비동기 패턴 적용
4. **수평 확장**: Stateless 설계를 통한 인스턴스 확장 가능

---

이 가이드를 기반으로 일관되고 품질 높은 OW시스템 백엔드 소스 코드를 생성하시기 바랍니다.