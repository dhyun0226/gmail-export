# 🎛️ Controller 레이어 코드 생성 규칙

> REST API 컨트롤러 레이어의 자동 생성을 위한 상세 가이드

## 📋 Controller 레이어 역할

### **핵심 책임**
- HTTP 요청/응답 처리
- 요청 데이터 검증 및 변환
- 비즈니스 로직 호출 (Service 레이어)
- 예외 처리 및 응답 형식화
- API 문서화 (OpenAPI/Swagger)

### **포함하지 않을 내용**
- 비즈니스 로직 구현
- 데이터베이스 직접 접근
- 복잡한 데이터 변환 로직
- 트랜잭션 관리

## 🏗️ 생성 규칙

### **1. 클래스 구조 규칙**

#### 네이밍 패턴
```yaml
클래스명: "{Entity}Controller"
패키지명: "{domain}.controller" 또는 "controller.{domain}"
파일명: "{Entity}Controller.java"
예시: "ProductController.java"
```

#### 기본 어노테이션
```yaml
필수_어노테이션:
  - "@RestController"
  - "@RequestMapping(\"/api/{entity-plural}\")"
  - "@RequiredArgsConstructor" # Lombok 사용시
  - "@Validated" # 입력 검증 필요시

선택적_어노테이션:
  - "@CrossOrigin" # CORS 필요시
  - "@PreAuthorize" # 보안 필요시
  - "@Tag" # OpenAPI 문서화시
```

#### 클래스 JavaDoc 주석 규칙
```yaml
클래스_주석_템플릿:
  필수_내용:
    - "/**"
    - " * {엔티티명} 컨트롤러"
    - " * {기능 설명 - 예: 사용자 관리 기능을 제공하는 REST API 컨트롤러입니다.}"
    - " *"
    - " * @author 개발팀"
    - " * @version 1.0"
    - " * @since {생성일자}"
    - " * @copyright (c) 2024 OSSTEM IMPLANT"
    - " */"

예시:
  """
  /**
   * 사용자 컨트롤러
   * 사용자 관리 기능을 제공하는 REST API 컨트롤러입니다.
   *
   * @author 개발팀
   * @version 1.0
   * @since 2024-01-01
   * @copyright (c) 2024 OSSTEM IMPLANT
   */
  """
```

### **2. CRUD 메서드 생성 규칙**

#### 표준 CRUD 패턴
```yaml
CREATE:
  method: "POST /"
  handler: "create{Entity}"
  request_body: "{Entity}CreateRequest"
  response: "ResponseEntity<{Entity}Response>"
  status_code: "201 CREATED"

READ_LIST:
  method: "GET /"
  handler: "get{Entity}List"
  parameters: "Pageable, 검색조건DTO"
  response: "ResponseEntity<Page<{Entity}Response>>"
  status_code: "200 OK"

READ_DETAIL:
  method: "GET /{id}"
  handler: "get{Entity}"
  parameters: "@PathVariable Long id"
  response: "ResponseEntity<{Entity}Response>"
  status_code: "200 OK"

UPDATE:
  method: "PUT /{id}"
  handler: "update{Entity}"
  parameters: "@PathVariable Long id, @RequestBody {Entity}UpdateRequest"
  response: "ResponseEntity<{Entity}Response>"
  status_code: "200 OK"

DELETE:
  method: "DELETE /{id}"
  handler: "delete{Entity}"
  parameters: "@PathVariable Long id"
  response: "ResponseEntity<Void>"
  status_code: "204 NO_CONTENT"
```

#### 검색/필터링 메서드
```yaml
SEARCH:
  method: "GET /search"
  handler: "search{Entity}"
  parameters: "{Entity}SearchCriteria, Pageable"
  response: "ResponseEntity<Page<{Entity}Response>>"

FILTER:
  method: "GET /filter"
  handler: "filter{Entity}By{Condition}"
  parameters: "조건별 파라미터"
  response: "ResponseEntity<List<{Entity}Response>>"
```

### **3. 요청/응답 DTO 매핑 규칙**

#### DTO 변환 패턴
```yaml
요청_변환:
  - "{Entity}CreateRequest → {Entity}CreateCommand"
  - "{Entity}UpdateRequest → {Entity}UpdateCommand"
  - "검색조건 → {Entity}SearchCriteria"

응답_변환:
  - "{Entity} → {Entity}Response"
  - "Page<{Entity}> → Page<{Entity}Response>"
  - "List<{Entity}> → List<{Entity}Response>"

변환_위치:
  - "Controller에서 직접 변환" # 단순한 경우
  - "Mapper 클래스 활용" # 복잡한 경우
  - "Service에서 DTO 반환" # 도메인별 정책
```

### **4. 예외 처리 규칙**

#### 표준 예외 처리
```yaml
입력_검증_오류:
  exception: "MethodArgumentNotValidException"
  status: "400 BAD_REQUEST"
  response: "ValidationErrorResponse"

리소스_없음:
  exception: "{Entity}NotFoundException"
  status: "404 NOT_FOUND"
  response: "ErrorResponse"

권한_없음:
  exception: "AccessDeniedException"
  status: "403 FORBIDDEN"
  response: "ErrorResponse"

서버_오류:
  exception: "RuntimeException"
  status: "500 INTERNAL_SERVER_ERROR"
  response: "ErrorResponse"
```

### **5. 보안 적용 규칙**

#### 인증/인가 패턴
```yaml
인증_필요_API:
  - 생성/수정/삭제: "@PreAuthorize(\"hasRole('USER')\")"
  - 관리자_전용: "@PreAuthorize(\"hasRole('ADMIN')\")"
  - 소유자_확인: "@PreAuthorize(\"@securityService.isOwner(#id, authentication.name)\")"

공개_API:
  - 목록_조회: "인증 불필요"
  - 상세_조회: "정책에 따라 결정"
  - 검색: "정책에 따라 결정"
```

## 📝 도메인별 특화 규칙

### **전자상거래 도메인**
```yaml
상품_관리:
  - 재고_확인: "GET /{id}/stock"
  - 가격_변경: "PATCH /{id}/price"
  - 할인_적용: "POST /{id}/discount"

주문_관리:
  - 주문_취소: "POST /{id}/cancel"
  - 배송_추적: "GET /{id}/shipping"
  - 결제_확인: "POST /{id}/payment/confirm"
```

### **금융 도메인**
```yaml
계좌_관리:
  - 잔액_조회: "GET /{id}/balance"
  - 거래_내역: "GET /{id}/transactions"
  - 이체_실행: "POST /{id}/transfer"

추가_보안:
  - 거래_승인: "이중_인증_필요"
  - 감사_로깅: "모든_API_호출_기록"
  - 접근_제한: "IP_화이트리스트"
```

### **의료 도메인**
```yaml
환자_관리:
  - 진료_기록: "GET /{id}/medical-records"
  - 처방_내역: "GET /{id}/prescriptions"
  - 검사_결과: "GET /{id}/test-results"

개인정보_보호:
  - 암호화_전송: "모든_민감정보"
  - 접근_로깅: "상세_접근_기록"
  - 권한_분리: "역할별_데이터_접근"
```

## 🔍 생성 시 고려사항

### **성능 최적화**
```yaml
페이징_처리:
  - 기본_페이지_크기: "20"
  - 최대_페이지_크기: "100"
  - 정렬_기본값: "생성일시_내림차순"

캐싱_전략:
  - 읽기_전용_API: "@Cacheable"
  - 캐시_무효화: "수정/삭제시 @CacheEvict"
  - 캐시_키: "엔티티ID_기반"

응답_압축:
  - 대용량_응답: "GZIP_압축"
  - JSON_최적화: "불필요_필드_제외"
```

### **API 문서화**
```yaml
OpenAPI_어노테이션:
  - "@Operation": "API_설명"
  - "@ApiResponse": "응답_코드별_설명"
  - "@Parameter": "파라미터_설명"
  - "@RequestBody": "요청_본문_설명"

문서_정보:
  - summary: "간단한_기능_설명"
  - description: "상세한_동작_설명"
  - tags: "API_그룹핑"
  - examples: "요청/응답_예시"
```

### **테스트 코드 생성**
```yaml
단위_테스트:
  - 성공_케이스: "정상_요청_처리"
  - 실패_케이스: "검증_오류_처리"
  - 경계값_테스트: "페이징_한계_테스트"

통합_테스트:
  - API_호출_테스트: "@SpringBootTest"
  - 보안_테스트: "인증/인가_검증"
  - 성능_테스트: "응답_시간_검증"
```

이 규칙을 바탕으로 AI가 프로젝트 메타데이터에 맞는 Controller 레이어 코드를 자동 생성합니다.