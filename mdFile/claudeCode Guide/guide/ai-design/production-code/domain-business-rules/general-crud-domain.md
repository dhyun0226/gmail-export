# 📝 일반 CRUD 도메인 비즈니스 규칙

> 기본적인 CRUD 기능을 제공하는 일반 도메인의 비즈니스 규칙 및 코드 생성 가이드

## 📋 CRUD 도메인 개요

### **적용 대상**
- 마스터 데이터 관리 (코드, 카테고리, 설정)
- 사용자 관리 시스템
- 콘텐츠 관리 시스템
- 기본적인 업무 관리 시스템
- 참조 데이터 관리

### **핵심 특징**
- 표준 CRUD 연산 중심
- 단순한 비즈니스 규칙
- 기본적인 검증 로직
- 일반적인 권한 체계

## 🏗️ 엔티티 구조 규칙

### **공통 필드 패턴**
```yaml
기본_식별자:
  - "id: Long - 기본키 (자동 증가)"
  - "uuid: String - 글로벌 고유 식별자 (선택적)"

감사_필드:
  - "createdAt: LocalDateTime - 생성일시"
  - "createdBy: String - 생성자"
  - "updatedAt: LocalDateTime - 수정일시"
  - "updatedBy: String - 수정자"

상태_관리:
  - "status: Status - 상태 (ACTIVE, INACTIVE, DELETED)"
  - "version: Long - 낙관적 락 버전"

메타데이터:
  - "displayOrder: Integer - 표시 순서 (선택적)"
  - "description: String - 설명 (선택적)"
```

### **비즈니스 필드 패턴**
```yaml
네이밍_필드:
  - "name: String - 명칭 (필수, 중복 검증)"
  - "code: String - 코드 (필수, 유니크)"
  - "title: String - 제목"

분류_필드:
  - "category: Category - 카테고리"
  - "type: Type - 유형"
  - "tags: List<String> - 태그 목록"

설정_필드:
  - "isDefault: Boolean - 기본값 여부"
  - "isPublic: Boolean - 공개 여부"
  - "priority: Integer - 우선순위"
```

## 🔍 비즈니스 규칙 정의

### **1. 데이터 검증 규칙**

#### 필수값 검증
```yaml
생성시_필수:
  - "name: 1-100자, 공백 불가"
  - "code: 2-50자, 영숫자+하이픈/언더스코어만"
  - "status: 기본값 ACTIVE"

수정시_필수:
  - "name: 변경 가능"
  - "code: 변경 불가 (읽기 전용)"
  - "status: 상태 전이 규칙 적용"
```

#### 유니크 제약
```yaml
전역_유니크:
  - "code: 시스템 전체에서 유일"
  - "name: 같은 카테고리 내에서 유일 (선택적)"

조건부_유니크:
  - "name + category: 카테고리별 명칭 유일성"
  - "email: 활성 사용자 중 유일"
```

#### 형식 검증
```yaml
문자열_패턴:
  - "code: ^[a-zA-Z0-9_-]+$"
  - "email: 이메일 형식"
  - "phone: 전화번호 형식"
  - "url: URL 형식 (선택적)"

숫자_범위:
  - "displayOrder: 1-999"
  - "priority: 1-10"
  - "percentage: 0-100"
```

### **2. 상태 전이 규칙**

#### 기본 상태 전이
```yaml
ACTIVE_상태:
  - "INACTIVE로 변경 가능"
  - "DELETED로 변경 가능"
  - "모든 기능 사용 가능"

INACTIVE_상태:
  - "ACTIVE로 변경 가능"
  - "DELETED로 변경 가능"
  - "조회만 가능, 수정 제한"

DELETED_상태:
  - "복구 불가 (소프트 삭제)"
  - "화면에서 숨김"
  - "참조 무결성 유지"
```

#### 특수 상태 규칙
```yaml
기본값_항목:
  - "isDefault=true인 항목은 삭제 불가"
  - "카테고리별 최소 1개 기본값 유지"
  - "새 기본값 설정시 기존 기본값 해제"

참조_항목:
  - "다른 엔티티에서 참조 중인 항목은 삭제 불가"
  - "참조 해제 후 삭제 가능"
  - "cascade 삭제 옵션 (신중히 적용)"
```

### **3. 권한 체계 규칙**

#### 기본 권한 매트릭스
```yaml
관리자:
  - "CREATE: 모든 항목 생성 가능"
  - "READ: 모든 항목 조회 가능"
  - "UPDATE: 모든 항목 수정 가능"
  - "DELETE: 모든 항목 삭제 가능"

일반_사용자:
  - "CREATE: 소유 범위 내 생성 가능"
  - "READ: 공개 항목 + 소유 항목 조회"
  - "UPDATE: 소유 항목만 수정 가능"
  - "DELETE: 소유 항목만 삭제 가능"

읽기_전용_사용자:
  - "READ: 공개 항목만 조회 가능"
  - "CREATE/UPDATE/DELETE: 권한 없음"
```

#### 데이터 소유권 규칙
```yaml
소유권_확인:
  - "createdBy 필드 기반 소유권"
  - "부서/팀 기반 소유권 (선택적)"
  - "역할 기반 접근 제어"

위임_권한:
  - "상급자가 하급자 데이터 관리 가능"
  - "임시 권한 위임 기능"
  - "감사 로그 기록"
```

## 💻 코드 생성 패턴

### **Entity 클래스 생성**
```yaml
JPA_어노테이션:
  - "@Entity"
  - "@Table(name = \"{table_name}\")"
  - "@Id @GeneratedValue"
  - "@Column(nullable = false, unique = true)"

검증_어노테이션:
  - "@NotNull, @NotBlank"
  - "@Size(min = 1, max = 100)"
  - "@Pattern(regexp = \"정규식\")"
  - "@Email, @URL"

감사_기능:
  - "@EntityListeners(AuditingEntityListener.class)"
  - "@CreatedDate, @LastModifiedDate"
  - "@CreatedBy, @LastModifiedBy"
```

### **Repository 인터페이스 생성**
```yaml
기본_메서드:
  - "findByCode(String code)"
  - "findByNameContaining(String name)"
  - "findByStatus(Status status)"
  - "findByStatusOrderByDisplayOrder(Status status)"

페이징_메서드:
  - "findByStatusAndNameContaining(Status status, String name, Pageable pageable)"
  - "countByStatus(Status status)"

카운트_메서드:
  - "existsByCode(String code)"
  - "countByCategory(Category category)"
```

### **Service 클래스 생성**
```yaml
CRUD_메서드:
  - "create({Entity}CreateRequest request)"
  - "getById(Long id)"
  - "getList({Entity}SearchCriteria criteria, Pageable pageable)"
  - "update(Long id, {Entity}UpdateRequest request)"
  - "delete(Long id)"

비즈니스_메서드:
  - "activate(Long id)"
  - "deactivate(Long id)"
  - "setAsDefault(Long id)"
  - "validateUniqueness(String code, Long excludeId)"

검색_메서드:
  - "searchByKeyword(String keyword, Pageable pageable)"
  - "getByCategory(String category)"
  - "getActiveList()"
```

### **Controller 클래스 생성**
```yaml
REST_엔드포인트:
  - "POST /api/{entities} - 생성"
  - "GET /api/{entities} - 목록 조회"
  - "GET /api/{entities}/{id} - 상세 조회"
  - "PUT /api/{entities}/{id} - 수정"
  - "DELETE /api/{entities}/{id} - 삭제"

추가_엔드포인트:
  - "GET /api/{entities}/search - 검색"
  - "PATCH /api/{entities}/{id}/status - 상태 변경"
  - "GET /api/{entities}/categories - 카테고리 목록"

검증_처리:
  - "@Valid 어노테이션"
  - "BindingResult 오류 처리"
  - "글로벌 예외 핸들러 연동"
```

## 🔍 프론트엔드 생성 규칙

### **Vue 컴포넌트 패턴**
```yaml
목록_컴포넌트:
  - "{Entity}List.vue"
  - "검색/필터 기능"
  - "페이징 처리"
  - "정렬 기능"
  - "상태별 필터링"

상세_컴포넌트:
  - "{Entity}Detail.vue"
  - "읽기 전용 정보 표시"
  - "관련 데이터 링크"
  - "액션 버튼 (수정/삭제)"

폼_컴포넌트:
  - "{Entity}Form.vue"
  - "생성/수정 통합 폼"
  - "실시간 검증"
  - "중복 확인 기능"
```

### **상태 관리 패턴**
```yaml
Pinia_스토어:
  - "use{Entity}Store.ts"
  - "CRUD 액션 구현"
  - "캐싱 전략"
  - "에러 처리"

상태_구조:
  - "list: {Entity}[] - 목록 데이터"
  - "current: {Entity} | null - 현재 선택"
  - "pagination: PaginationInfo"
  - "filters: SearchCriteria"
```

## 🧪 테스트 생성 규칙

### **백엔드 테스트**
```yaml
Repository_테스트:
  - "기본 CRUD 테스트"
  - "커스텀 쿼리 테스트"
  - "페이징 테스트"
  - "제약 조건 테스트"

Service_테스트:
  - "비즈니스 로직 테스트"
  - "검증 규칙 테스트"
  - "예외 상황 테스트"
  - "권한 체크 테스트"

Controller_테스트:
  - "API 엔드포인트 테스트"
  - "요청/응답 형식 테스트"
  - "인증/인가 테스트"
  - "에러 응답 테스트"
```

### **프론트엔드 테스트**
```yaml
컴포넌트_테스트:
  - "렌더링 테스트"
  - "사용자 상호작용 테스트"
  - "폼 검증 테스트"
  - "이벤트 처리 테스트"

스토어_테스트:
  - "액션 실행 테스트"
  - "상태 변화 테스트"
  - "API 호출 모킹"
  - "에러 처리 테스트"
```

## 📊 일반적인 활용 예시

### **코드 관리 시스템**
```yaml
엔티티: "CommonCode"
비즈니스_규칙:
  - "그룹별 코드 관리"
  - "계층형 코드 구조"
  - "다국어 지원"
  - "사용 여부 관리"
```

### **사용자 관리 시스템**
```yaml
엔티티: "User"
비즈니스_규칙:
  - "이메일 중복 방지"
  - "패스워드 정책"
  - "계정 잠금/해제"
  - "권한 그룹 관리"
```

### **카테고리 관리**
```yaml
엔티티: "Category"
비즈니스_규칙:
  - "계층형 구조"
  - "상위 카테고리 참조"
  - "하위 카테고리 자동 삭제"
  - "순서 관리"
```

이 규칙을 바탕으로 AI가 일반적인 CRUD 도메인의 완전한 애플리케이션 코드를 자동 생성합니다.