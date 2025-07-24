# OWS 시스템 및 업무 코드 가이드

> OSSTEM IMPLANT OW시스템의 시스템 코드 체계 및 업무 코드 구조
> AI가 패키지 구조와 명명 규칙을 이해하기 위한 참조 가이드

## 📌 목차

1. [개요](#1-개요)
2. [시스템 코드 체계](#2-시스템-코드-체계)
3. [업무 코드 체계](#3-업무-코드-체계)
4. [패키지 명명 규칙](#4-패키지-명명-규칙)
5. [포트 및 URL 구조](#5-포트-및-url-구조)
6. [프로젝트 구조](#6-프로젝트-구조)
7. [의존성 관리](#7-의존성-관리)

---

## 1. 개요

### 1.1. 문서 목적
본 문서는 OSSTEM IMPLANT OW시스템의 전사적인 정보시스템 코드 체계를 정의하여 패키지 구조, 프로젝트 명명, URL 구조 등 개발 전반에 일관성 있게 적용하기 위한 가이드입니다.

### 1.2. 적용 범위
- **패키지 구조**: Java 패키지 명명 규칙
- **프로젝트 명명**: WEB/WAS 프로젝트 구분
- **URL 구조**: REST API 엔드포인트 설계
- **포트 구성**: 서비스별 포트 할당

---

## 2. 시스템 코드 체계

### 2.1. 전사 시스템 코드 정의
OW시스템 개발 시 전사적인 정보시스템 코드를 정의하여 패키지 구조 등 개발 전반에 적용합니다.

| 시스템 한글명 | 시스템 영문명 | 시스템 약어 | 설명 |
|--------------|--------------|------------|------|
| **OW시스템** | **OW System** | **OW** | **주요 대상 시스템** |
| 고객영업관리시스템 | Customer Relationship Management | ECRM | CRM 시스템 |
| 통합거래처관리시스템 | Customer Integration Management | CIMS | 거래처 통합 관리 |
| OPEN 시스템 | Open Portal System | OPEN | 오픈 포털 |
| eCampus | eCampus | CAMP | 교육 시스템 |

### 2.2. 시스템 약어 활용
- **패키지 구조**: `com.osstem.{시스템약어}.{업무코드}`
- **프로젝트 명**: `{시스템약어}-{업무코드}`, `{시스템약어}-web-{업무코드}`
- **URL 구조**: `/api/{업무코드}/v1/...`

---

## 3. 업무 코드 체계

### 3.1. 업무 코드 기본 원칙
업무 분류를 코드(3자리)로 정의하여 데이터베이스(업무코드) 설계 및 패키지(업무약어) 구조 등 개발 전반에 적용합니다.

### 3.2. 프로젝트 명명 규칙
- **WEB 프로젝트**: `{시스템코드}-web-{업무코드}`
- **WAS 프로젝트**: `{시스템코드}-{업무코드}`

**예시:**
- `ows-web-tsk` (OW시스템 할일관리 웹)
- `ows-tsk` (OW시스템 할일관리 WAS)
- `ows-web-sal` (OW시스템 국내영업 웹)
- `ows-sal` (OW시스템 국내영업 WAS)

### 3.3. OW시스템 업무 코드 정의

#### 3.3.1. 공통/시스템 관리 영역

| 업무코드 | DB업무코드 | Port/URL | 업무분류 | 비고 |
|---------|-----------|----------|---------|------|
| **COM** | CMG | :8010/com | 시스템관리(공통모듈) | Common, Security, Configuration |
| **DAM** | - | :8011/dam | 데이터 아키텍처 관리 | Data Architecture Management |
| **NTF** | - | :8012/ntf | 알림 | Notification |
| **BAT** | - | :8013/bat | 공통 배치 | Batch Processing |

#### 3.3.2. 업무 처리 영역

| 업무코드 | DB업무코드 | Port/URL | 업무분류 | 비고 |
|---------|-----------|----------|---------|------|
| **EAP** | - | :8020/eap | 전자결재 | Electronic Approval |
| **TSK** | - | :8030/tsk | 할일관리 | Task Management |
| **SAL** | SAM | :8150/sal | 국내영업 | Sales Management |
| **LOG** | - | :8070/log | 물류 | Logistics |
| **VOC** | - | :8201/voc | 통합 고객센터 | Voice of Customer |

#### 3.3.3. 특수 목적 영역

| 업무코드 | DB업무코드 | Port/URL | 업무분류 | 비고 |
|---------|-----------|----------|---------|------|
| **DNM** | - | :8050/dnm-adm | 덴올몰 패키지주문 관리자 | DenAll Mall Admin |
| **OIC** | SEI | :9051/education | 교육 | Osstem Implant Campus |
| **ITR** | - | :9041/interior | 인테리어 | Interior Design |
| **JOB** | - | :8130/job | 덴잡 | DenAll Job |

### 3.4. DenAll 시스템 업무 코드

| 업무코드 | DB업무코드 | Port/URL | 업무분류 | 비고 |
|---------|-----------|----------|---------|------|
| **DNA** | DEN | :9010/dna | 덴올 관리자 | DenAll Admin |
| **DNC** | - | :9020/dnc | 덴올 공통(사용자) | DenAll Common |
| **TXM** | - | :9901/txm | 파일/SMS/이메일 서버 | Transaction Management |
| **DNJ** | DNJ | :9030/dnj | 덴잡 | DenAll Job |
| **DNI** | DNI | :9040/interior | 덴올 인테리어 | DenAll Interior |
| **DNO** | DNO | :9050/education | 덴올 교육 | DenAll Education |
| **DNM** | DNM | :8040/dnm | 덴올몰 패키지주문 | DenAll Mall |
| **OCC** | OCC | :8200/voc | 오스템 통합 고객센터 | Osstem Customer Center |

---

## 4. 패키지 명명 규칙

### 4.1. Java 패키지 구조
```
com.osstem.ow.{업무코드}/
├── controller/      # API 컨트롤러
├── service/         # 비즈니스 서비스
├── mapper/          # MyBatis 매퍼
├── model/           # 데이터 모델
│   ├── dto/         # 데이터 전송 객체
│   ├── request/     # 요청 DTO
│   ├── search/      # 검색 DTO
│   └── code/        # Enum 코드
├── config/          # 설정 클래스
├── util/            # 유틸리티 클래스
└── common/          # 공통 클래스
```

### 4.2. 패키지 예시

#### 4.2.1. 국내영업(SAL) 시스템
```
com.osstem.ow.sal/
├── controller/
│   ├── CustomerController.java
│   ├── OrderController.java
│   └── ProductController.java
├── service/
│   ├── CustomerService.java
│   ├── OrderService.java
│   └── ProductService.java
├── mapper/
│   ├── CustomerMapper.java
│   ├── OrderMapper.java
│   └── ProductMapper.java
└── model/
    ├── dto/
    │   ├── CustomerDto.java
    │   ├── OrderDto.java
    │   └── ProductDto.java
    ├── request/
    │   ├── CustomerCreateRequestDto.java
    │   ├── OrderCreateRequestDto.java
    │   └── ProductCreateRequestDto.java
    ├── search/
    │   ├── CustomerSearchDto.java
    │   ├── OrderSearchDto.java
    │   └── ProductSearchDto.java
    └── code/
        ├── CustomerTypeCode.java
        ├── OrderStatusCode.java
        └── ProductCategoryCode.java
```

#### 4.2.2. 할일관리(TSK) 시스템
```
com.osstem.ow.tsk/
├── controller/
│   ├── TaskController.java
│   ├── ProjectController.java
│   └── AssignmentController.java
├── service/
│   ├── TaskService.java
│   ├── ProjectService.java
│   └── AssignmentService.java
├── mapper/
│   ├── TaskMapper.java
│   ├── ProjectMapper.java
│   └── AssignmentMapper.java
└── model/
    ├── dto/
    │   ├── TaskDto.java
    │   ├── ProjectDto.java
    │   └── AssignmentDto.java
    └── code/
        ├── TaskStatusCode.java
        ├── TaskPriorityCode.java
        └── ProjectStatusCode.java
```

### 4.3. 공통 프로젝트 구조
```
com.osstem.ow/
├── core/            # OW Core Library
├── storage-db/      # OW Database Library
├── storage-redis/   # OW Redis Library
├── storage-kafka/   # OW Kafka Library
└── logging/         # OW Logging Library
```

---

## 5. 포트 및 URL 구조

### 5.1. 포트 할당 체계

#### 5.1.1. OW시스템 포트 체계
```
8000번대: OW 핵심 시스템
├── 801X: 시스템 관리 (COM, DAM, NTF, BAT)
├── 802X: 업무 프로세스 (EAP)
├── 803X: 할일 관리 (TSK)
├── 804X: 쇼핑몰 (DNM)
├── 805X: 덴올몰 관리 (DNM-ADM)
├── 807X: 물류 (LOG)
├── 813X: 잡 (JOB)
├── 815X: 영업 (SAL)
└── 82XX: 고객센터 (VOC, OCC)

9000번대: DenAll 및 확장 시스템
├── 901X: DenAll 관리 (DNA)
├── 902X: DenAll 공통 (DNC)
├── 903X: DenAll 잡 (DNJ)
├── 904X: 인테리어 (DNI, ITR)
├── 905X: 교육 (DNO, OIC)
└── 990X: 트랜잭션 (TXM)
```

#### 5.1.2. 포트 상세 할당

| 업무코드 | 포트 | URL 패턴 | 서비스명 |
|---------|------|----------|---------|
| COM | :8010 | /api/com/v1/* | 시스템관리 |
| DAM | :8011 | /api/dam/v1/* | 데이터 아키텍처 관리 |
| NTF | :8012 | /api/ntf/v1/* | 알림 서비스 |
| BAT | :8013 | /api/bat/v1/* | 배치 관리 |
| EAP | :8020 | /api/eap/v1/* | 전자결재 |
| TSK | :8030 | /api/tsk/v1/* | 할일관리 |
| DNM | :8040 | /api/dnm/v1/* | 덴올몰 |
| LOG | :8070 | /api/log/v1/* | 물류 |
| SAL | :8150 | /api/sal/v1/* | 국내영업 |
| VOC | :8201 | /api/voc/v1/* | 고객센터 |

### 5.2. REST API URL 구조

#### 5.2.1. 기본 URL 패턴
```
http://{host}:{port}/api/{업무코드}/v{버전}/{리소스}
```

#### 5.2.2. URL 예시

**국내영업(SAL) 시스템:**
```
GET    /api/sal/v1/customers              # 고객 목록 조회
GET    /api/sal/v1/customers/{id}         # 고객 상세 조회
POST   /api/sal/v1/customers              # 고객 생성
PUT    /api/sal/v1/customers/{id}         # 고객 수정
DELETE /api/sal/v1/customers/{id}         # 고객 삭제

GET    /api/sal/v1/orders                 # 주문 목록 조회
POST   /api/sal/v1/orders                 # 주문 생성
POST   /api/sal/v1/orders/{id}/approve    # 주문 승인
POST   /api/sal/v1/orders/{id}/cancel     # 주문 취소
```

**할일관리(TSK) 시스템:**
```
GET    /api/tsk/v1/tasks                  # 할일 목록 조회
POST   /api/tsk/v1/tasks                  # 할일 생성
PUT    /api/tsk/v1/tasks/{id}             # 할일 수정
POST   /api/tsk/v1/tasks/{id}/complete    # 할일 완료
POST   /api/tsk/v1/tasks/{id}/assign      # 할일 배정

GET    /api/tsk/v1/projects               # 프로젝트 목록 조회
POST   /api/tsk/v1/projects               # 프로젝트 생성
POST   /api/tsk/v1/projects/{id}/close    # 프로젝트 종료
```

---

## 6. 프로젝트 구조

### 6.1. 멀티 모듈 프로젝트 구조
```
ows-master/
├── ow-common-project/          # 공통 라이브러리
│   ├── core/                   # 핵심 공통 기능
│   ├── storage-db/             # 데이터베이스 공통
│   ├── storage-redis/          # Redis 공통
│   ├── storage-kafka/          # Kafka 공통
│   └── logging/                # 로깅 공통
├── ows-sal/                    # 국내영업 WAS
├── ows-web-sal/                # 국내영업 WEB
├── ows-tsk/                    # 할일관리 WAS
├── ows-web-tsk/                # 할일관리 WEB
├── ows-com/                    # 시스템관리 WAS
├── ows-web-com/                # 시스템관리 WEB
└── docs/                       # 문서
```

### 6.2. 개별 프로젝트 구조

#### 6.2.1. WAS 프로젝트 구조 (예: ows-sal)
```
ows-sal/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/osstem/ow/sal/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── mapper/
│   │   │       ├── model/
│   │   │       ├── config/
│   │   │       └── SalApplication.java
│   │   └── resources/
│   │       ├── mapper/             # MyBatis XML
│   │       ├── messages/           # 메시지 파일
│   │       └── application.yml
│   └── test/
│       └── java/
│           └── com/osstem/ow/sal/
├── build.gradle
└── README.md
```

#### 6.2.2. WEB 프로젝트 구조 (예: ows-web-sal)
```
ows-web-sal/
├── packages/
│   └── main/
│       └── src/
│           ├── components/
│           ├── pages/
│           │   └── sal/            # 영업 관련 페이지
│           ├── composables/
│           ├── utils/
│           ├── scss/
│           └── messages/
├── package.json
├── vite.config.ts
└── README.md
```

---

## 7. 의존성 관리

### 7.1. 공통 라이브러리 의존성
모든 프로젝트는 ows 공통 프로젝트 패키지를 참조합니다.

#### 7.1.1. 필수 의존성
```gradle
// build.gradle
dependencies {
    // 필수 공통 라이브러리
    implementation("com.osstem:core:${owsVersion}")
    implementation("com.osstem:storage-db:${owsVersion}")
    implementation("com.osstem:logging:${owsVersion}")
    
    // 선택적 공통 라이브러리
    implementation("com.osstem:storage-redis:${owsVersion}")
    implementation("com.osstem:storage-kafka:${owsVersion}")
}
```

#### 7.1.2. 버전 관리
```gradle
// gradle.properties
owsVersion=1.0.0-SNAPSHOT

// 정식 버전 배포 시
owsVersion=1.0.0
owsVersion=1.1.0
owsVersion=2.0.0
```

### 7.2. 업무별 라이브러리 의존성

#### 7.2.1. 국내영업(SAL) 시스템
```gradle
dependencies {
    // OWS 공통
    implementation("com.osstem:core:${owsVersion}")
    implementation("com.osstem:storage-db:${owsVersion}")
    implementation("com.osstem:logging:${owsVersion}")
    
    // 업무 특화
    implementation("com.osstem:payment-integration:${paymentVersion}")
    implementation("com.osstem:erp-connector:${erpVersion}")
    
    // 외부 라이브러리
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter")
}
```

#### 7.2.2. 할일관리(TSK) 시스템
```gradle
dependencies {
    // OWS 공통
    implementation("com.osstem:core:${owsVersion}")
    implementation("com.osstem:storage-db:${owsVersion}")
    implementation("com.osstem:logging:${owsVersion}")
    implementation("com.osstem:storage-redis:${owsVersion}")
    
    // 업무 특화
    implementation("com.osstem:notification-service:${notificationVersion}")
    implementation("com.osstem:workflow-engine:${workflowVersion}")
}
```

### 7.3. 라이브러리 네이밍 규칙
- **artifactId**: `{기능명}-{버전}.{packaging}`
- **groupId**: `com.osstem`
- **version**: `1.0.0` (MAJOR.MINOR.PATCH)

**예시:**
- `com.osstem:core:1.0.0`
- `com.osstem:storage-db:1.2.3`
- `com.osstem:logging:2.0.0`

---

## 8. 코드 생성 시 참조 사항

### 8.1. AI 코드 생성 시 활용 방법

#### 8.1.1. 업무 코드 결정
```yaml
입력: "국내영업 고객 관리 시스템을 만들어주세요"
추론:
  - 업무영역: 국내영업 → SAL
  - 패키지: com.osstem.ow.sal
  - 프로젝트명: ows-sal (WAS), ows-web-sal (WEB)
  - URL: /api/sal/v1/customers
  - 포트: :8150
```

#### 8.1.2. 패키지 구조 생성
```java
// 자동 생성되는 패키지 구조
com.osstem.ow.sal.controller.CustomerController
com.osstem.ow.sal.service.CustomerService
com.osstem.ow.sal.mapper.CustomerMapper
com.osstem.ow.sal.model.dto.CustomerDto
com.osstem.ow.sal.model.request.CustomerCreateRequestDto
com.osstem.ow.sal.model.search.CustomerSearchDto
com.osstem.ow.sal.model.code.CustomerTypeCode
```

#### 8.1.3. URL 매핑 생성
```java
@RestController
@RequestMapping("/api/sal/v1/customers")
public class CustomerController {
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getList(
            CustomerSearchDto searchDto) {
        // 구현...
    }
    
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerDto>> get(
            @PathVariable String customerId) {
        // 구현...
    }
}
```

### 8.2. 업무 코드별 특화 고려사항

#### 8.2.1. 국내영업(SAL) 시스템
- **고객 관리**: 고객사, 담당자, 계약 정보
- **주문 관리**: 주문, 주문상품, 배송 정보
- **제품 관리**: 제품, 카테고리, 재고 정보
- **영업 관리**: 영업기회, 견적, 계약 관리

#### 8.2.2. 할일관리(TSK) 시스템
- **태스크 관리**: 할일, 프로젝트, 마일스톤
- **배정 관리**: 담당자 배정, 역할 관리
- **진행 관리**: 진행률, 상태 변경, 알림
- **리포팅**: 진행 현황, 성과 분석

#### 8.2.3. 시스템관리(COM) 시스템
- **사용자 관리**: 계정, 권한, 역할 관리
- **코드 관리**: 공통코드, 메뉴, 설정 관리
- **시스템 관리**: 로그, 모니터링, 배치 관리
- **보안 관리**: 인증, 인가, 감사 로그

---

이 가이드를 참조하여 OW시스템의 일관된 코드 체계와 구조를 유지하시기 바랍니다.