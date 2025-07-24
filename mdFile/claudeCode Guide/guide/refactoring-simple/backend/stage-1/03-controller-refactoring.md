# Controller 분리 절차

## 1. 작업 준비

### 1.1 작업 디렉토리 생성
```
{workingDir}/first/                          # 고유 작업 폴더 내부
├── controller/
│    └── {domainName}/              # 예: visitAction/
│         ├── VisitPlanController.java
│         ├── VisitExecutionController.java
│         ├── ContractActionController.java
│         └── 기타 도메인별 Controller...
```

> 📋 **경로 설명**: {workingDir} = {outputPath}/{targetClassName}_{todayYYYYMMDD}

> 💡 **domainName 규칙**: 대상 클래스명에서 레이어 suffix를 제거하고 camelCase로 변환
> - 예: VisitActionController → visitAction 패키지
> - 예: OrderManagementController → orderManagement 패키지
> - 예: CustomerService → customer 패키지

### 1.2 체크포인트 시작
- CP-C001: Controller 리팩토링 시작
- 시작 시간: [YYYY-MM-DD HH:MM]
- 대상 파일: [TargetController.java]

## 2. 새 Controller 파일 생성

### 2.1 도메인별 Controller 생성 예시
```java
package {basePackage}.controller.{domainName}; // 예: controller.visitAction

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("{existing-url-mapping}") // 기존 URL 매핑 유지 (예: "visit-action")
@RequiredArgsConstructor
@Tag(name = "방문계획 관리", description = "방문계획 관련 API")
public class VisitPlanController {
    // Service 주입 (의존성 매핑에서 식별된 것)
    private final OrderService orderService;
    private final CommonService commonService;
    
    // 메소드들이 여기에 추가됨
}
```

### 2.2 CustomerController 생성
[동일한 구조로 생성]

## 3. 메소드 이동 상세 절차

### 3.0 중요 지침
> ⚠️ **절대 수정하지 않는 항목**
> - RequestMapping URL 경로는 절대 변경하지 않음
> - 메소드의 반환 타입(ResponseEntity 등)은 절대 변경하지 않음
> - 기존 API의 동작과 응답 구조를 100% 유지

### 3.1 메소드 ID: M001 이동

#### 3.1.1 이동 전 체크리스트
- [ ] 원본 메소드 위치 확인: 라인 [100-150]
- [ ] 메소드 전체 선택 (어노테이션 포함)
- [ ] JavaDoc 주석 포함 여부 확인
- [ ] private 헬퍼 메소드 의존성 확인
- [ ] **URL 매핑과 반환 타입 변경 없음 확인**

#### 3.1.2 복사할 내용
```java
/**
 * 주문 생성
 * @param request 주문 생성 요청
 * @return 생성된 주문 정보
 */
@PostMapping
@Operation(summary = "주문 생성", description = "새로운 주문을 생성합니다")
public ResponseEntity<ResponseOrder> createOrder(
    @RequestBody @Valid RequestOrder request) {
    
    // 메소드 본문
    OrderDto orderDto = OrderDto.builder()
        .customerId(request.getCustomerId())
        .items(request.getItems())
        .build();
        
    ResponseOrder response = orderService.processOrder(orderDto);
    return ResponseEntity.ok(response);
}
```

#### 3.1.3 이동 후 체크리스트
- [ ] 대상 파일: {domainName}/VisitPlanController.java (예시)
- [ ] import 문 추가
  - [ ] RequestOrder import
  - [ ] ResponseOrder import
  - [ ] @Valid import
  - [ ] 기타 필요한 import
- [ ] 메소드 위치: 클래스 본문 내
- [ ] 컴파일 오류 없음 (문법적)

#### 3.1.4 원본 처리
- [ ] 원본 메소드에 이동 완료 주석 추가
```java
// MOVED TO: VisitPlanController.createVisitPlan() - [날짜]
```

### 3.2 메소드 ID: M002 이동
[위와 동일한 형식으로 작성]

## 4. Private 메소드 처리

### 4.1 Private 메소드 식별
```
메소드명 | 사용처 | 처리 방안
validateRequest | M001, M003 | OrderController로 이동
formatResponse | M002, M004 | CustomerController로 이동
commonValidate | M001, M002 | 양쪽에 복사 또는 유틸 클래스로 분리
```

### 4.2 이동 절차
- Private 메소드는 사용하는 public 메소드와 함께 이동
- 여러 도메인에서 사용하는 경우 복사 또는 공통 유틸리티로 분리

## 5. 상수 및 필드 처리

### 5.1 클래스 레벨 상수
```java
private static final String DEFAULT_SORT = "createdDate,desc";
private static final int DEFAULT_PAGE_SIZE = 20;
```
- 사용처에 따라 해당 Controller로 이동
- 공통 사용 시 각 Controller에 복사

### 5.2 공통 필드
- Logger는 각 Controller에서 자체 생성
- 공통 설정값은 application.yml 활용 권장

## 6. 진행 상태 추적

### 6.1 메소드별 진행 상태
```
메소드 ID | 원본 위치 | 대상 Controller | 상태 | 체크포인트
M001 | 라인 100-150 | OrderController | ✓ 완료 | CP-C002
M002 | 라인 160-200 | CustomerController | ✓ 완료 | CP-C003
M003 | 라인 210-250 | OrderController | ⏳ 진행중 | CP-C004
M004 | 라인 260-300 | CustomerController | ⏸ 대기 | -
M005 | 라인 310-350 | OrderController | ⏸ 대기 | -
```

### 6.2 이슈 및 특이사항
```
시간 | 이슈 | 해결 방법
HH:MM | Private 메소드 공통 사용 | 각 Controller에 복사
HH:MM | 순환 참조 가능성 | Service 분리 시 해결 예정
```

## 7. 검증 체크리스트

### 7.1 수량 검증
- [ ] 원본 Controller 메소드 수: [N]개
- [ ] OrderController 메소드 수: [X]개
- [ ] CustomerController 메소드 수: [Y]개
- [ ] 합계: [X+Y]개 = [N]개

### 7.2 구조 검증
- [ ] 모든 public 메소드 이동 완료
- [ ] 필요한 private 메소드 이동 완료
- [ ] 모든 import 문 추가 완료
- [ ] 클래스/메소드 어노테이션 유지
- [ ] **URL 매핑 정확성 확인 (변경 없음)**
- [ ] **반환 타입 유지 확인 (변경 없음)**

### 7.3 의존성 검증
- [ ] Service 주입 필드 추가
- [ ] 생성자 주입 패턴 유지
- [ ] 불필요한 의존성 제거

## 8. 다음 단계 준비
- Service 레이어 분리를 위한 정보 수집
- Controller에서 호출하는 Service 메소드 목록 최종 확인
- 04-service-refactoring.md로 이동