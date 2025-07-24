# 📁 Legacy Examples (레거시 예제)

> 기존 고정된 예제 코드들 - 참조 및 학습용으로 보관

## 📌 이 폴더의 목적

이 폴더는 **규칙 기반 시스템 도입 이전**의 고정된 예제 코드들을 보관합니다:

### **⚠️ 주의사항**
- **현재 사용 중단**: 새로운 규칙 기반 시스템을 사용하세요
- **참조용으로만 활용**: 코드 구조나 패턴 학습에 활용
- **업데이트 중단**: 이 예제들은 더 이상 업데이트되지 않습니다

### **🔄 새 시스템으로 마이그레이션**
대신 다음을 사용하세요:
- **메타데이터 기반**: `../project-metadata/`
- **레이어별 규칙**: `../layer-generation-rules/`
- **도메인 특화**: `../domain-business-rules/`

## 🗂️ 보관된 파일들

### **고정 예제 코드**
```
legacy-examples/
├── README.md                              # 📖 이 파일
├── Full-Project-Structure-Guide.md       # 고정된 프로젝트 구조 예제
├── frontend/                              # Vue 3 고정 예제
│   └── Production-Vue-Code-Templates.md
├── backend/                               # Spring Boot 고정 예제
│   └── Production-Spring-Boot-Templates.md
├── infrastructure/                        # 인프라 고정 설정
│   └── Infrastructure-Setup-Guide.md
├── testing/                               # 테스트 고정 예제
│   └── Testing-Code-Generation-Guide.md
├── security/                              # 보안 고정 구현
│   └── Security-Implementation-Guide.md
└── optimization/                          # 최적화 고정 패턴
    ├── Performance-Optimization-Guide.md
    └── Error-Handling-Patterns.md
```

## 🚫 문제점 (해결됨)

### **경직성 문제**
- ❌ Vue 3.4 + Spring Boot 3.x로 하드코딩
- ❌ OWS 컴포넌트만 지원
- ❌ 다른 기술스택 대응 불가

### **확장성 한계**
- ❌ 새로운 도메인 적용 불가
- ❌ 기업별 표준 반영 불가
- ❌ 커스터마이징 어려움

## ✅ 새로운 시스템의 장점

### **유연성**
- ✅ 모든 주요 프레임워크 지원 (React, Vue, Angular, Spring, Express, Django 등)
- ✅ 모든 데이터베이스 지원 (PostgreSQL, MongoDB, MySQL 등)
- ✅ 아키텍처 패턴 자유 선택 (MVC, 레이어드, 헥사고날 등)

### **특화성**
- ✅ 도메인별 비즈니스 규칙 (전자상거래, 금융, 의료 등)
- ✅ 기업별 코딩 표준 적용
- ✅ 프로젝트별 메타데이터 기반 생성

## 📚 학습 가치

이 레거시 예제들은 여전히 다음 용도로 유용합니다:

### **코드 패턴 학습**
- Vue 3 Composition API 패턴
- Spring Boot 레이어드 아키텍처
- TypeScript 타입 정의 방법
- JPA 엔티티 관계 설정

### **구현 참조**
- REST API 설계 패턴
- 에러 처리 전략
- 보안 구현 방법
- 성능 최적화 기법

### **비교 분석**
- 고정 코드 vs 규칙 기반 코드
- 경직성 vs 유연성
- 일반화 vs 특화

## 🔄 마이그레이션 가이드

### **기존 예제 → 새 시스템**

#### 1단계: 메타데이터 정의
```yaml
# 기존: 고정된 Vue + Spring Boot
# 새로운: project-metadata/project-template.md 작성
project_metadata:
  frontend:
    framework: "Vue"  # 또는 React, Angular
    version: "3.4"
    ui_library: "OWS"  # 또는 Ant Design, Material-UI
  backend:
    framework: "Spring Boot"  # 또는 Express, Django
    version: "3.2"
    database: "PostgreSQL"  # 또는 MongoDB, MySQL
```

#### 2단계: 레이어 규칙 적용
```yaml
# 기존: 고정된 ProductController 예제
# 새로운: layer-generation-rules/backend-layers/controller-generation.md

Controller_생성_규칙:
  - "프로젝트 메타데이터 기반 동적 생성"
  - "도메인별 비즈니스 규칙 적용"
  - "아키텍처 패턴별 구조 적용"
```

#### 3단계: 도메인 규칙 적용
```yaml
# 기존: 범용 CRUD 예제
# 새로운: domain-business-rules/ecommerce-domain.md

전자상거래_특화:
  - "상품 재고 관리"
  - "주문 상태 전이"
  - "결제 보안 처리"
  - "쿠폰 할인 로직"
```

## 📖 추천 학습 경로

### **Step 1**: 레거시 코드 이해
1. `Full-Project-Structure-Guide.md` - 전체 구조 파악
2. `frontend/Production-Vue-Code-Templates.md` - Vue 패턴 학습
3. `backend/Production-Spring-Boot-Templates.md` - Spring Boot 패턴 학습

### **Step 2**: 새 시스템 학습
1. `../project-metadata/project-template.md` - 메타데이터 구조 이해
2. `../layer-generation-rules/` - 레이어별 생성 규칙 파악
3. `../domain-business-rules/` - 도메인별 특화 규칙 학습

### **Step 3**: 실전 적용
1. 새로운 규칙 기반 시스템으로 코드 생성
2. 레거시 예제와 비교 분석
3. 프로젝트에 맞는 커스터마이징

---

**보관 일자**: 2024년 1월  
**마지막 활성 버전**: 2.0.0  
**대체 시스템**: 규칙 기반 코드 생성 시스템 3.0.0

> 💡 **팁**: 이 예제들로 기본기를 익힌 후, 새로운 규칙 기반 시스템으로 실제 프로젝트에 적용하세요!