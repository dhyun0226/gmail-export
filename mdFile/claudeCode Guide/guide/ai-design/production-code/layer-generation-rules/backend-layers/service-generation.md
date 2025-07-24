# ⚙️ Service 레이어 코드 생성 규칙

> 비즈니스 로직 처리를 담당하는 Service 레이어의 자동 생성을 위한 상세 가이드

## 📋 Service 레이어 역할

### **핵심 책임**
- 비즈니스 로직 구현 및 처리
- 트랜잭션 관리
- 도메인 규칙 검증
- DAO/Repository 레이어 호출
- 도메인 이벤트 발행
- 외부 서비스 연동

### **포함하지 않을 내용**
- HTTP 요청/응답 처리
- 데이터베이스 쿼리 직접 작성
- UI 관련 로직
- 인프라스트럭처 관심사

## 🏗️ 생성 규칙

### **1. 클래스 구조 규칙**

#### 네이밍 패턴
```yaml
인터페이스명: "{Entity}Service"
구현체명: "{Entity}ServiceImpl" 또는 "Default{Entity}Service"
패키지명: "{domain}.service" 또는 "service.{domain}"
파일명: "{Entity}Service.java", "{Entity}ServiceImpl.java"
```

#### 기본 어노테이션
```yaml
필수_어노테이션:
  - "@Service" # 구현체에만
  - "@Transactional(readOnly = true)" # 클래스 레벨
  - "@RequiredArgsConstructor" # Lombok 사용시

트랜잭션_어노테이션:
  - "@Transactional" # 쓰기 메서드
  - "@Transactional(readOnly = true)" # 읽기 메서드
  - "@Transactional(propagation = REQUIRES_NEW)" # 독립 트랜잭션
```

#### 클래스 JavaDoc 주석 규칙
```yaml
클래스_주석_템플릿:
  필수_내용:
    - "/**"
    - " * {엔티티명} 서비스"
    - " * {기능 설명 - 예: 사용자 생성, 조회, 수정, 삭제 및 상태 관리를 담당합니다.}"
    - " *"
    - " * @author ${author:Development Team}"
    - " * @version 1.0"
    - " * @since $(date +\"%Y-%m-%d\")"
    - " * @copyright (c) $(date +\"%Y\") ${company:OSSTEM IMPLANT}"
    - " */"

예시:
  """
  /**
   * 사용자 서비스
   * 사용자 생성, 조회, 수정, 삭제 및 상태 관리를 담당합니다.
   *
   * @author ${author:Development Team}
   * @version 1.0
   * @since $(date +"%Y-%m-%d")
   * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
   */
  """
```

### **1.1. DTO 클래스 생성 규칙**

#### DTO 타입별 패턴
```yaml
Request_DTO:
  - CreateRequest: "{Entity}CreateRequest"
  - UpdateRequest: "{Entity}UpdateRequest"
  - SearchRequest: "{Entity}SearchRequest"
  패키지: "{domain}.dto.request"

Response_DTO:
  - BasicResponse: "{Entity}Response"
  - DetailResponse: "{Entity}DetailResponse"
  - ListResponse: "{Entity}ListResponse"
  패키지: "{domain}.dto.response"

Common_DTO:
  - Transfer: "{Entity}Dto"
  - Summary: "{Entity}Summary"
  패키지: "{domain}.dto"
```

#### DTO 클래스 구조
```yaml
필수_어노테이션:
  - "@Getter @Setter (Lombok)"
  - "@Builder @NoArgsConstructor @AllArgsConstructor (Lombok)"
  - "@Schema(description = \"DTO 설명\") (Swagger v3)"
  - "@Valid (for Request DTOs)"

JavaDoc_주석:
  """
  /**
   * {DTO명}
   * {기능 설명}
   *
   * @author ${author:Development Team}
   * @version 1.0
   * @since $(date +"%Y-%m-%d")
   * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
   */
  """
```

#### DTO 필드 규칙
```yaml
일반_필드:
  annotations:
    - "@Schema(description = \"필드 설명\", example = \"예시값\", required = true)"
    - "@NotNull(message = \"필드명은 필수입니다.\") (for required fields)"
    - "@Size(min = 1, max = 100, message = \"필드명은 1~100자여야 합니다.\")"
    - "@Pattern(regexp = \"정규식\", message = \"형식이 올바르지 않습니다.\")"

날짜_필드:
  annotations:
    - "@Schema(description = \"날짜 설명\", example = \"2024-01-01\")"
    - "@JsonFormat(pattern = \"yyyy-MM-dd\")"
    - "@DateTimeFormat(pattern = \"yyyy-MM-dd\")"

리스트_필드:
  annotations:
    - "@Schema(description = \"목록 설명\")"
    - "@Valid (for nested validation)"
    - "@Size(min = 1, message = \"최소 1개 이상 필요합니다.\")"

숫자_필드:
  annotations:
    - "@Schema(description = \"숫자 설명\", example = \"100\", minimum = \"0\", maximum = \"999999\")"
    - "@Min(value = 0, message = \"0 이상이어야 합니다.\")"
    - "@Max(value = 999999, message = \"999999 이하여야 합니다.\")"
```

#### DTO 예시
```java
/**
 * 사용자 생성 요청 DTO
 * 사용자 등록 시 필요한 정보를 전달하는 DTO입니다.
 *
 * @author ${author:Development Team}
 * @version 1.0
 * @since $(date +"%Y-%m-%d")
 * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "사용자 생성 요청 정보")
public class UserCreateRequest {
    
    @NotBlank(message = "사용자명은 필수입니다.")
    @Size(min = 3, max = 50, message = "사용자명은 3~50자여야 합니다.")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "사용자명은 영문자, 숫자, 언더스코어만 사용 가능합니다.")
    @Schema(description = "사용자명", example = "john_doe", required = true, minLength = 3, maxLength = 50)
    private String username;
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Schema(description = "이메일 주소", example = "john@example.com", required = true, format = "email")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]+$", 
             message = "비밀번호는 영문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.")
    @Schema(description = "비밀번호", example = "Password123!", required = true, minLength = 8, maxLength = 20)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @NotNull(message = "부서 ID는 필수입니다.")
    @Schema(description = "부서 ID", example = "1", required = true)
    private Long departmentId;
    
    @Valid
    @Schema(description = "사용자 권한 목록")
    private List<UserRoleRequest> userRoles;
}

/**
 * 사용자 응답 DTO
 * 사용자 정보 조회 시 반환되는 DTO입니다.
 *
 * @author ${author:Development Team}
 * @version 1.0
 * @since $(date +"%Y-%m-%d")
 * @copyright (c) $(date +"%Y") ${company:OSSTEM IMPLANT}
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "사용자 정보 응답")
public class UserResponse extends BaseDto {
    
    @Schema(description = "사용자 ID", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long userId;
    
    @Schema(description = "사용자명", example = "john_doe")
    private String username;
    
    @Schema(description = "이메일", example = "john@example.com")
    private String email;
    
    @Schema(description = "사용자 상태", example = "ACTIVE")
    private UserStatus status;
    
    @Schema(description = "부서명", example = "개발팀")
    private String departmentName;
    
    @Schema(description = "마지막 로그인 일시", example = "2024-01-01 09:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginDateTime;
    
    @Schema(description = "사용자 권한 목록")
    private List<UserRoleResponse> userRoles;
}
```

### **2. CRUD 메서드 생성 규칙**

#### 표준 CRUD 패턴
```yaml
CREATE:
  method_name: "create{Entity}"
  parameters: "{Entity}CreateCommand"
  return_type: "{Entity}"
  transaction: "@Transactional"
  validation: "도메인_규칙_검증"
  steps:
    - "입력_데이터_검증"
    - "비즈니스_규칙_적용"
    - "엔티티_생성"
    - "저장_호출"
    - "이벤트_발행"

READ_BY_ID:
  method_name: "get{Entity}ById"
  parameters: "Long id"
  return_type: "{Entity}"
  transaction: "@Transactional(readOnly = true)"
  exception: "{Entity}NotFoundException"

READ_LIST:
  method_name: "get{Entity}List"
  parameters: "Pageable pageable, {Entity}SearchCriteria criteria"
  return_type: "Page<{Entity}>"
  transaction: "@Transactional(readOnly = true)"
  caching: "@Cacheable" # 적절한 경우

UPDATE:
  method_name: "update{Entity}"
  parameters: "Long id, {Entity}UpdateCommand"
  return_type: "{Entity}"
  transaction: "@Transactional"
  steps:
    - "기존_엔티티_조회"
    - "변경_권한_확인"
    - "비즈니스_규칙_검증"
    - "엔티티_업데이트"
    - "변경_이벤트_발행"

DELETE:
  method_name: "delete{Entity}"
  parameters: "Long id"
  return_type: "void"
  transaction: "@Transactional"
  steps:
    - "삭제_권한_확인"
    - "참조_무결성_검증"
    - "소프트_삭제_또는_물리_삭제"
    - "삭제_이벤트_발행"
```

### **3. 비즈니스 로직 패턴**

#### 도메인 규칙 검증
```yaml
입력_검증:
  - "필수값_검증"
  - "형식_검증"
  - "범위_검증"
  - "중복_검증"

비즈니스_규칙:
  - "상태_전이_검증"
  - "권한_검증"
  - "제약조건_검증"
  - "정책_규칙_적용"

예외_처리:
  - "도메인_예외_발생"
  - "의미있는_에러_메시지"
  - "복구_가능한_예외_처리"
```

#### 상태 관리 패턴
```yaml
상태_기반_메서드:
  - "activate{Entity}" # 활성화
  - "deactivate{Entity}" # 비활성화
  - "approve{Entity}" # 승인
  - "reject{Entity}" # 거부
  - "cancel{Entity}" # 취소

상태_검증:
  - "현재_상태_확인"
  - "허용된_전이_검증"
  - "전이_조건_검증"
```

### **4. 외부 연동 처리 규칙**

#### 외부 서비스 호출
```yaml
호출_패턴:
  - "Circuit_Breaker_적용"
  - "Retry_메커니즘"
  - "Timeout_설정"
  - "Fallback_처리"

비동기_처리:
  - "@Async" # 비동기 메서드
  - "CompletableFuture" # 비동기 응답
  - "이벤트_기반_처리"
```

### **5. 캐싱 전략 규칙**

#### 캐시 적용 대상
```yaml
읽기_전용_데이터:
  - "@Cacheable" # 조회 메서드
  - "key = '#id'" # 캐시 키
  - "unless = '#result == null'" # 캐시 조건

캐시_무효화:
  - "@CacheEvict" # 수정/삭제시
  - "allEntries = true" # 전체 캐시 삭제
  - "@CachePut" # 캐시 업데이트
```

## 📝 도메인별 특화 규칙

### **전자상거래 도메인**

#### 상품 서비스
```yaml
상품_관리:
  - "updateStock" # 재고 업데이트
  - "applyDiscount" # 할인 적용
  - "calculatePrice" # 가격 계산
  - "checkAvailability" # 재고 확인

재고_관리:
  - "동시성_제어" # @Lock 적용
  - "재고_부족_예외"
  - "예약_재고_처리"
```

#### 주문 서비스
```yaml
주문_처리:
  - "createOrder" # 주문 생성
  - "processPayment" # 결제 처리
  - "updateOrderStatus" # 상태 업데이트
  - "cancelOrder" # 주문 취소

복합_트랜잭션:
  - "재고_차감_→_주문_생성_→_결제_요청"
  - "실패시_롤백_처리"
  - "보상_트랜잭션_패턴"
```

### **금융 도메인**

#### 계좌 서비스
```yaml
계좌_관리:
  - "transfer" # 이체
  - "withdraw" # 출금
  - "deposit" # 입금
  - "checkBalance" # 잔액 조회

보안_요구사항:
  - "이중_인증_검증"
  - "거래_한도_확인"
  - "의심_거래_탐지"
  - "감사_로깅"

동시성_제어:
  - "@Lock(LockModeType.PESSIMISTIC_WRITE)"
  - "잔액_동시성_보장"
  - "데드락_방지"
```

### **의료 도메인**

#### 환자 서비스
```yaml
환자_관리:
  - "registerPatient" # 환자 등록
  - "updateMedicalRecord" # 진료 기록
  - "prescribeMedicine" # 처방
  - "scheduleAppointment" # 예약

개인정보_보호:
  - "민감정보_암호화"
  - "접근_권한_검증"
  - "데이터_마스킹"
  - "감사_추적"
```

## 🔍 생성 시 고려사항

### **성능 최적화**
```yaml
쿼리_최적화:
  - "N+1_문제_방지"
  - "페치_조인_활용"
  - "배치_처리_지원"

비동기_처리:
  - "대용량_데이터_처리"
  - "외부_API_호출"
  - "이메일/SMS_발송"
```

### **트랜잭션 설계**
```yaml
트랜잭션_경계:
  - "비즈니스_단위별_트랜잭션"
  - "읽기_전용_최적화"
  - "격리_수준_설정"

예외_처리:
  - "체크_예외_vs_언체크_예외"
  - "트랜잭션_롤백_정책"
  - "부분_실패_처리"
```

### **이벤트 처리**
```yaml
도메인_이벤트:
  - "엔티티_생성_이벤트"
  - "상태_변경_이벤트"
  - "비즈니스_규칙_이벤트"

이벤트_발행:
  - "@EventListener"
  - "비동기_이벤트_처리"
  - "이벤트_순서_보장"
```

### **테스트 지원**
```yaml
단위_테스트:
  - "Mock_객체_활용"
  - "비즈니스_로직_검증"
  - "예외_상황_테스트"

통합_테스트:
  - "@SpringBootTest"
  - "트랜잭션_테스트"
  - "이벤트_처리_테스트"
```

### **모니터링/로깅**
```yaml
로깅_전략:
  - "메서드_시작/종료_로깅"
  - "중요_비즈니스_이벤트_로깅"
  - "성능_메트릭_수집"

메트릭_수집:
  - "처리_시간_측정"
  - "성공/실패_카운트"
  - "비즈니스_KPI_추적"
```

이 규칙을 바탕으로 AI가 도메인과 비즈니스 요구사항에 맞는 Service 레이어 코드를 자동 생성합니다.