# OWS 공통 개발 표준 가이드

> OSSTEM IMPLANT OW시스템 전체에 적용되는 공통 개발 표준
> 프론트엔드/백엔드 구분 없이 적용되는 범용 개발 원칙 및 규칙

## 📌 목차

1. [개요](#1-개요)
2. [기본 개발 원칙](#2-기본-개발-원칙)
3. [코딩 스타일 공통 규칙](#3-코딩-스타일-공통-규칙)
4. [로깅 표준](#4-로깅-표준)
5. [메시지 처리 표준](#5-메시지-처리-표준)
6. [파일 및 인코딩 표준](#6-파일-및-인코딩-표준)
7. [보안 및 웹 표준](#7-보안-및-웹-표준)
8. [성능 최적화 원칙](#8-성능-최적화-원칙)
9. [문서화 표준](#9-문서화-표준)
10. [품질 보증 원칙](#10-품질-보증-원칙)

---

## 1. 개요

### 1.1. 문서 목적
본 문서는 OSSTEM IMPLANT OW시스템 개발 시 프론트엔드/백엔드 구분 없이 적용되는 공통 개발 표준을 정의하여 개발자들 간의 단일 커뮤니케이션 수단을 제공하고, 일관되며 가독성 높은 소스 코드 개발과 효율적인 유지보수를 수행할 수 있는 체계를 제공합니다.

### 1.2. 적용 범위
- **전 시스템**: OSSTEM IMPLANT OW시스템 전체
- **전 계층**: 프론트엔드, 백엔드, 데이터베이스
- **전 개발자**: OW시스템 개발 참여 인원 전체
- **전 단계**: 개발, 테스트, 배포, 운영

---

## 2. 기본 개발 원칙

### 2.1. 핵심 개발 원칙

#### 2.1.1. 코드 품질 원칙
1. **주석은 모든 소스 코드에 상세히 기술**하는 것을 원칙으로 합니다.
2. **소스 코드는 불가피한 내용을 제외하고 원칙적으로 중복을 금지**합니다.
3. **클래스파일, 변수명 등 가능한 풀네임을 적용**합니다.
4. **OW DB용어사전의 약어 대신 영문명으로 작성**합니다.

#### 2.1.2. 웹 표준 및 보안 원칙
1. **소스 코드는 웹 표준 및 접근성에 각별히 주의**합니다.
2. **웹 보안 취약점 등에 각별히 주의**합니다.
3. **개인정보 및 민감 정보 처리 시 암호화**를 적용합니다.
4. **입력값 검증 및 출력값 이스케이프**를 철저히 수행합니다.

#### 2.1.3. 일관성 및 유지보수 원칙
1. **명명 규칙의 일관성**을 유지합니다.
2. **코딩 스타일의 통일성**을 확보합니다.
3. **설계 패턴의 일관된 적용**을 원칙으로 합니다.
4. **버전 관리 및 변경 이력 추적**을 체계적으로 수행합니다.

### 2.2. 용어 사용 원칙

#### 2.2.1. 기본 용어 원칙
- **용어는 원칙적으로 용어사전을 준수**하여 해당 영문명을 사용합니다.
- **여러 개의 단어를 조합하여 사용하는 경우에는 영문 약어명을 조합**하여 사용합니다.
- **축약어를 사용하는 경우에는 모두 대문자**를 사용합니다. (예: HTML, API, JSON)
- **용어를 사용할 때 동음이의어에 주의**합니다.

#### 2.2.2. 프로그램 명명 규칙 적용 예시
**예시: 단어관리 프로그램을 작성하는 경우**
- '단어'의 약어: WRD, 영문명: Word
- '관리'의 약어: MNGT, 영문명: Management
- **결과**: WordManagement (영문명 조합 사용)

---

## 3. 코딩 스타일 공통 규칙

### 3.1. 들여쓰기 (Indentation)
- **들여쓰기는 4 space를 1 tab으로 정의**하여 사용합니다.
- **새로운 라인은 이전 라인의 표현식과 같은 레벨로 들여쓰기**합니다.
- **일관된 들여쓰기**를 전체 프로젝트에서 유지합니다.

```java
// Java 예시
public class Example {
    
    public void method() {
        if (condition) {
            doSomething();
        }
    }
}
```

```javascript
// JavaScript 예시
const example = {
    
    method() {
        if (condition) {
            doSomething()
        }
    }
}
```

### 3.2. 띄어쓰기 (Spacing)
- **하나의 라인에는 하나의 문장만 기술**합니다.
- **comma(,), colon(:), semicolon(;) 으로 문장이 연속될 경우 해당 문자 뒤에는 space**를 둡니다.
- **Assignment operator('=') 앞과 뒤에 space**를 둡니다.
- **Unary operator는 space를 두지 않습니다**.
- **Binary operator인 '+', '-', '&&' 등은 앞과 뒤에 space**를 둡니다.

```java
// 올바른 예시
int num = 1;
int k = k + 1;
i++;
boolean result = (a > b) && (c < d);
String[] items = {"item1", "item2", "item3"};
```

```javascript
// 올바른 예시
const num = 1
const k = k + 1
i++
const result = (a > b) && (c < d)
const items = ['item1', 'item2', 'item3']
```

### 3.3. 블록 및 중괄호 (Braces)
- **'{' 와 '}' 뒤에는 새로운 라인이 위치**하여 다른 내용과 함께 기술하지 않습니다.
- **'{'는 앞의 '{'와 비교해서 indent**를 둡니다.
- **'}'는 짝이 되는 '{'과 동일하게 indent**를 둡니다.
- **Brace에 주석을 작성하는 경우에는 "// 주석"으로 사용**합니다.

```java
// 권장 스타일
public class Test {

    public static void main(String[] args) {
        log.debug("시작");
        
        if (condition) {
            processData();
        } else {
            handleError();
        } // if-else 블록 종료
    }
}
```

### 3.4. 라인 길이 및 줄바꿈
- **한 라인의 최대 길이는 120자**를 권장합니다.
- **라인을 바꿀 경우 콤마(,) 다음에, 연산자(operator) 이전에 바꿉니다**.
- **메서드 체이닝의 경우 각 메서드마다 줄바꿈**을 적용합니다.

```java
// 긴 라인의 줄바꿈 예시
String result = someVeryLongMethodName(parameter1, parameter2, 
    parameter3, parameter4);

// 메서드 체이닝 예시
List<String> result = list.stream()
    .filter(item -> item.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

---

## 4. 로깅 표준

### 4.1. 로깅 기본 원칙
1. **Log는 반드시 Framework에서 제공하는 Logger만을 사용**합니다. (기본 Slf4j)
2. **절대로 System.out.print 등은 사용하지 말 것**
3. **Log는 debug, info, warn, error로 구별하여 사용**합니다.
4. **Lombok을 이용한 어노테이션 기능을 활용**합니다. (@Slf4j)

### 4.2. 로그 레벨별 사용 기준

#### 4.2.1. DEBUG 레벨
- **개발 시에만 사용하고 운영 중에는 사용하지 않습니다**.
- **디버깅 목적의 상세 정보**를 기록합니다.
- **메서드 진입/종료, 변수값 확인** 등에 사용합니다.

```java
@Slf4j
public class CustomerService {
    
    public Customer findById(Long customerId) {
        log.debug("고객 조회 시작: customerId={}", customerId);
        
        Customer customer = customerRepository.findById(customerId);
        
        log.debug("고객 조회 완료: customer={}", customer);
        return customer;
    }
}
```

#### 4.2.2. INFO 레벨
- **운영자에게 도움이 될 내용**을 기록합니다.
- **비즈니스 로직의 주요 흐름**을 기록합니다.
- **시스템 상태 변경** 정보를 기록합니다.

```java
public class OrderService {
    
    public Order createOrder(OrderCreateRequest request) {
        log.info("주문 생성 시작: customerId={}, itemCount={}", 
            request.getCustomerId(), request.getItems().size());
        
        Order order = processOrder(request);
        
        log.info("주문 생성 완료: orderId={}, orderNumber={}", 
            order.getId(), order.getOrderNumber());
        
        return order;
    }
}
```

#### 4.2.3. WARN 레벨
- **error는 아니나 잠재적인 error 발생이 가능한 내용**을 기록합니다.
- **예상치 못한 상황이지만 처리 가능한 경우**에 사용합니다.
- **성능 저하나 리소스 부족** 상황을 기록합니다.

```java
public class PaymentService {
    
    public PaymentResult processPayment(PaymentRequest request) {
        if (request.getAmount().compareTo(MAX_AMOUNT) > 0) {
            log.warn("고액 결제 요청: customerId={}, amount={}", 
                request.getCustomerId(), request.getAmount());
        }
        
        // 처리 로직...
    }
}
```

#### 4.2.4. ERROR 레벨
- **error code와 함께 error에 대한 내용**을 기록합니다.
- **시스템 오류나 예외 상황**을 기록합니다.
- **복구 불가능한 오류**를 기록합니다.

```java
public class OrderService {
    
    public Order createOrder(OrderCreateRequest request) {
        try {
            return processOrder(request);
        } catch (PaymentException e) {
            log.error("결제 처리 실패: customerId={}, errorCode={}, message={}", 
                request.getCustomerId(), e.getErrorCode(), e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("주문 생성 중 예상치 못한 오류: customerId={}", 
                request.getCustomerId(), e);
            throw new SystemException("주문 생성 실패", e);
        }
    }
}
```

### 4.3. 로깅 구조화
```java
// 구조화된 로깅 예시
@Slf4j
public class AuditService {
    
    public void logUserAction(String userId, String action, String resource) {
        log.info("사용자 액션: userId={}, action={}, resource={}, timestamp={}", 
            userId, action, resource, Instant.now());
    }
    
    public void logApiCall(String endpoint, String method, long duration) {
        log.info("API 호출: endpoint={}, method={}, duration={}ms", 
            endpoint, method, duration);
    }
}
```

---

## 5. 메시지 처리 표준

### 5.1. 메시지 처리 기본 원칙
- **메시지의 내용은 반드시 "~바랍니다.", "~주십시오.", "~하시겠습니까?"와 같은 존칭어로 끝나는 종결자**를 사용해야 합니다.
- **"~하세요.", "~주시오. ^^"와 같은 비종결 언어 및 특수 문자는 사용하지 않습니다**.
- **OW시스템 설정 메시지에 등록 후 사용**합니다.

### 5.2. 메시지 카테고리별 예시

#### 5.2.1. 확인 메시지
```properties
# 올바른 예시
confirm.delete=선택한 항목을 삭제하시겠습니까?
confirm.save=변경사항을 저장하시겠습니까?
confirm.cancel=작업을 취소하시겠습니까?

# 잘못된 예시 (사용 금지)
confirm.delete=선택한 항목을 삭제하세요.
confirm.save=변경사항을 저장하시오.
```

#### 5.2.2. 안내 메시지
```properties
# 올바른 예시
info.input.required=필수 입력 항목을 확인해 주십시오.
info.save.success=저장이 완료되었습니다.
info.processing=처리 중입니다. 잠시만 기다려 주십시오.

# 잘못된 예시 (사용 금지)
info.input.required=필수 입력 항목을 확인하세요.
info.processing=처리 중... ^^
```

#### 5.2.3. 오류 메시지
```properties
# 올바른 예시
error.validation.required={0}은(는) 필수 입력 항목입니다.
error.access.denied=접근 권한이 없습니다. 관리자에게 문의해 주십시오.
error.system.unavailable=시스템을 사용할 수 없습니다. 잠시 후 다시 시도해 주십시오.

# 잘못된 예시 (사용 금지)
error.access.denied=접근 권한이 없어요.
error.system.unavailable=시스템 에러 발생!!!
```

### 5.3. 메시지 다국어 지원
```properties
# messages_ko.properties (한국어)
welcome.message=OW시스템에 오신 것을 환영합니다.
login.success=로그인이 완료되었습니다.

# messages_en.properties (영어)
welcome.message=Welcome to OW System.
login.success=Login completed successfully.
```

---

## 6. 파일 및 인코딩 표준

### 6.1. 파일 인코딩 표준
- **파일 Encoding은 UTF-8을 기본**으로 합니다.
- **모든 텍스트 파일은 UTF-8 BOM 없이 저장**합니다.
- **라인 엔딩은 LF(Unix 스타일)**를 사용합니다.

### 6.2. 파일명 명명 규칙
- **파일명은 영문 소문자와 하이픈(-) 조합**을 사용합니다.
- **확장자는 소문자**로 작성합니다.
- **공백이나 특수문자는 사용하지 않습니다**.

```
# 올바른 예시
customer-management.html
order-service.js
product-list.css
user-guide.md

# 잘못된 예시
Customer Management.html
orderService.JS
product_list.CSS
user guide(Korean).md
```

### 6.3. 디렉토리 구조 표준
- **디렉토리명은 소문자와 하이픈(-) 조합**을 사용합니다.
- **의미 있는 계층 구조**를 유지합니다.
- **깊이는 5단계를 초과하지 않도록** 합니다.

```
# 권장 디렉토리 구조
src/
├── main/
│   ├── java/
│   ├── resources/
│   └── webapp/
├── test/
│   ├── java/
│   └── resources/
└── docs/
    ├── api/
    ├── user-guide/
    └── development/
```

---

## 7. 보안 및 웹 표준

### 7.1. 보안 기본 원칙

#### 7.1.1. 입력값 검증
- **모든 사용자 입력은 서버 사이드에서 검증**합니다.
- **클라이언트 사이드 검증은 UX 향상 목적으로만 사용**합니다.
- **화이트리스트 방식의 검증**을 우선 적용합니다.

```java
// 입력값 검증 예시
@PostMapping("/customers")
public ResponseEntity<?> createCustomer(@Validated @RequestBody CustomerCreateRequest request) {
    // Bean Validation이 자동으로 검증 수행
    // 추가 비즈니스 검증
    if (!isValidBusinessNumber(request.getBusinessNumber())) {
        throw new ValidationException("유효하지 않은 사업자번호입니다.");
    }
    // 처리 로직...
}
```

#### 7.1.2. 출력값 이스케이프
- **사용자 입력 데이터 출력 시 HTML 이스케이프**를 적용합니다.
- **SQL Injection 방지를 위해 PreparedStatement 사용**을 원칙으로 합니다.
- **XSS 방지를 위해 Content Security Policy(CSP) 적용**을 권장합니다.

```html
<!-- Vue.js 템플릿에서 자동 이스케이프 -->
<template>
  <div>{{ userInput }}</div> <!-- 자동으로 HTML 이스케이프 -->
  
  <!-- v-html 사용 시 주의 -->
  <div v-html="sanitizedHtml"></div> <!-- DOMPurify 등으로 사전 정제 필요 -->
</template>
```

#### 7.1.3. 인증 및 인가
- **모든 API는 인증이 필요**합니다.
- **권한 기반 접근 제어(RBAC)**를 적용합니다.
- **세션 관리 및 토큰 관리**를 안전하게 수행합니다.

### 7.2. 웹 표준 준수

#### 7.2.1. HTML 시맨틱 마크업
```html
<!-- 올바른 시맨틱 마크업 -->
<main role="main">
  <header>
    <h1>고객 관리</h1>
    <nav aria-label="주 메뉴">
      <ul>
        <li><a href="/customers">고객 목록</a></li>
        <li><a href="/orders">주문 관리</a></li>
      </ul>
    </nav>
  </header>
  
  <section aria-label="고객 목록">
    <h2>고객 목록</h2>
    <table role="table">
      <thead>
        <tr>
          <th scope="col">고객명</th>
          <th scope="col">연락처</th>
        </tr>
      </thead>
      <tbody>
        <!-- 데이터 행들... -->
      </tbody>
    </table>
  </section>
</main>
```

#### 7.2.2. 접근성 고려사항
- **WAI-ARIA 속성**을 적극 활용합니다.
- **키보드 네비게이션**을 지원합니다.
- **스크린 리더 호환성**을 확보합니다.
- **색상에만 의존하지 않는 정보 전달**을 원칙으로 합니다.

---

## 8. 성능 최적화 원칙

### 8.1. 코드 레벨 최적화

#### 8.1.1. 알고리즘 효율성
- **시간 복잡도와 공간 복잡도**를 고려합니다.
- **불필요한 반복문과 중첩 로직**을 최소화합니다.
- **적절한 자료구조**를 선택합니다.

```java
// 비효율적인 예시
List<Customer> customers = getAllCustomers(); // 전체 조회
return customers.stream()
    .filter(c -> c.getCity().equals("서울"))
    .collect(Collectors.toList());

// 효율적인 예시
return customerRepository.findByCity("서울"); // DB에서 필터링
```

#### 8.1.2. 메모리 관리
- **불필요한 객체 생성**을 최소화합니다.
- **메모리 누수 방지**를 위해 리소스를 적절히 해제합니다.
- **캐싱 전략**을 적절히 활용합니다.

```java
// StringBuilder 활용으로 성능 개선
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(",");
}
return sb.toString();

// 스트림의 적절한 활용
return items.stream()
    .map(this::processItem)
    .parallel() // 대용량 데이터의 경우
    .collect(Collectors.toList());
```

### 8.2. 데이터베이스 최적화
- **적절한 인덱스 활용**을 고려합니다.
- **N+1 쿼리 문제**를 방지합니다.
- **페이징 처리**를 적절히 적용합니다.
- **불필요한 데이터 조회**를 최소화합니다.

### 8.3. 네트워크 최적화
- **API 응답 크기**를 최소화합니다.
- **적절한 HTTP 캐싱**을 활용합니다.
- **압축(Gzip)**을 적용합니다.
- **CDN 활용**을 고려합니다.

---

## 9. 문서화 표준

### 9.1. 코드 문서화

#### 9.1.1. 주석 작성 원칙
- **의미 있는 주석**만 작성합니다.
- **코드로 표현할 수 있는 내용은 주석 대신 코드로 명확히** 작성합니다.
- **TODO, FIXME 등의 태그**를 활용합니다.

```java
/**
 * 고객 정보를 생성합니다.
 * 
 * 처리 절차:
 * 1. 입력값 유효성 검증
 * 2. 중복 고객 확인
 * 3. 고객 정보 저장
 * 4. 환영 이메일 발송
 *
 * @param request 고객 생성 요청 정보
 * @return 생성된 고객 정보
 * @throws DuplicateCustomerException 중복 고객인 경우
 * @throws ValidationException 입력값이 유효하지 않은 경우
 */
public Customer createCustomer(CustomerCreateRequest request) {
    // TODO: 이메일 발송 기능 구현 필요
    // FIXME: 전화번호 형식 검증 로직 개선 필요
}
```

#### 9.1.2. API 문서화
- **Swagger/OpenAPI 3.0**을 활용합니다.
- **요청/응답 예시**를 포함합니다.
- **에러 코드 및 메시지**를 명시합니다.

```java
@Operation(summary = "고객 생성", description = "새로운 고객을 생성합니다.")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "고객 생성 성공"),
    @ApiResponse(responseCode = "400", description = "입력값 오류"),
    @ApiResponse(responseCode = "409", description = "중복 고객")
})
@PostMapping("/customers")
public ResponseEntity<CustomerResponse> createCustomer(
    @Valid @RequestBody CustomerCreateRequest request) {
    // 구현...
}
```

### 9.2. 프로젝트 문서화

#### 9.2.1. README 문서
```markdown
# OWS 고객관리 시스템

## 개요
OSSTEM IMPLANT OW시스템의 고객관리 모듈입니다.

## 기술 스택
- Java 21
- Spring Boot 3.4
- Vue 3
- PostgreSQL

## 설치 및 실행
1. 프로젝트 클론
2. 데이터베이스 설정
3. 애플리케이션 실행

## API 문서
- Swagger UI: http://localhost:8080/swagger-ui.html

## 기여 가이드
- 코딩 표준 준수
- 테스트 코드 작성
- 코드 리뷰 필수
```

#### 9.2.2. 변경 이력 관리
```markdown
# 변경 이력

## [1.2.0] - 2024-01-15
### 추가
- 고객 등급 관리 기능
- 고객 이력 조회 API

### 변경
- 고객 검색 성능 개선
- UI 개선

### 수정
- 고객 생성 시 유효성 검증 오류 수정
```

---

## 10. 품질 보증 원칙

### 10.1. 코드 리뷰 표준

#### 10.1.1. 리뷰 체크리스트
- [ ] **코딩 표준 준수** (명명 규칙, 들여쓰기, 주석)
- [ ] **보안 취약점 확인** (SQL Injection, XSS 등)
- [ ] **성능 이슈 확인** (N+1 쿼리, 메모리 누수 등)
- [ ] **테스트 코드 작성** (단위 테스트, 통합 테스트)
- [ ] **예외 처리 적절성** (예외 타입, 메시지)
- [ ] **로깅 적절성** (로그 레벨, 구조화)

#### 10.1.2. 리뷰 프로세스
1. **개발자 자체 검토** (Self Review)
2. **동료 개발자 리뷰** (Peer Review)
3. **시니어 개발자 승인** (Senior Approval)
4. **머지 및 배포** (Merge & Deploy)

### 10.2. 테스트 표준

#### 10.2.1. 테스트 커버리지
- **단위 테스트**: 최소 80% 커버리지
- **통합 테스트**: 주요 비즈니스 플로우 100% 커버
- **E2E 테스트**: 핵심 사용자 시나리오 커버

#### 10.2.2. 테스트 작성 원칙
```java
// Given-When-Then 패턴 적용
@Test
@DisplayName("고객 생성 시 정상적으로 저장되어야 한다")
void shouldCreateCustomerSuccessfully() {
    // Given
    CustomerCreateRequest request = CustomerCreateRequest.builder()
        .name("홍길동")
        .email("hong@example.com")
        .build();
    
    // When
    Customer result = customerService.createCustomer(request);
    
    // Then
    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("홍길동");
    assertThat(result.getEmail()).isEqualTo("hong@example.com");
}
```

### 10.3. 배포 및 모니터링

#### 10.3.1. 배포 전 체크리스트
- [ ] **모든 테스트 통과**
- [ ] **코드 리뷰 완료**
- [ ] **보안 스캔 통과**
- [ ] **성능 테스트 완료**
- [ ] **배포 스크립트 검증**
- [ ] **롤백 계획 수립**

#### 10.3.2. 운영 모니터링
- **애플리케이션 로그 모니터링**
- **성능 지표 모니터링** (응답시간, 처리량)
- **에러율 모니터링**
- **리소스 사용량 모니터링** (CPU, 메모리, 디스크)

---

## 부록: 개발 환경 설정

### A.1. IDE 설정 권장사항

#### A.1.1. IntelliJ IDEA 설정
```properties
# 코드 스타일 설정
editor.indent.size=4
editor.tab.size=4
editor.use.tab.character=false
editor.line.length=120
```

#### A.1.2. VS Code 설정
```json
{
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.rulers": [120],
  "files.encoding": "utf8",
  "files.eol": "\n"
}
```

### A.2. Git 설정 권장사항

#### A.2.1. .gitignore 공통 설정
```gitignore
# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 빌드 결과물
target/
build/
dist/
node_modules/

# 로그 파일
*.log

# 환경 설정
.env
.env.local
```

#### A.2.2. 커밋 메시지 컨벤션
```
feat: 고객 관리 기능 추가
fix: 주문 생성 시 유효성 검증 오류 수정
docs: API 문서 업데이트
style: 코드 포맷팅 적용
refactor: 결제 서비스 리팩토링
test: 고객 서비스 단위 테스트 추가
chore: 빌드 스크립트 개선
```

---

이 공통 개발 표준을 준수하여 일관되고 품질 높은 OW시스템을 개발하시기 바랍니다.