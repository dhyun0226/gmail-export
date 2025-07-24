# ai-design v2.0 - AI 화면 설계 자동화

UI 이미지나 와이어프레임을 분석하여 프로젝트 설정 파일(backend-config.md, front-config.md)을 기반으로 프로덕션 수준의 애플리케이션 코드를 자동 생성합니다.

## 사용법

```
/ai-design [이미지 파일] [생성 옵션] [화면 타입] [메타데이터 옵션]
```

## 파라미터

### 필수 파라미터
- **이미지 파일 경로**: 분석할 UI 이미지 파일 경로
  - 지원 형식: `.png`, `.jpg`, `.jpeg`, `.webp`

### 선택 파라미터
- **생성 옵션**: 생성할 문서 타입 (기본값: `both`)
  - `wireframe`: UI 와이어프레임만 생성
  - `spec`: 프로그램 사양서만 생성
  - `both`: 와이어프레임과 사양서 모두 생성
  - `full`: 와이어프레임, 사양서, 전체 소스 코드 생성

- **화면 타입**: 화면 유형 힌트 (기본값: `auto`)
  - `crud`: CRUD 목록/상세 화면
  - `dashboard`: 대시보드 화면
  - `form`: 입력/수정 폼 화면
  - `popup`: 팝업/모달 화면
  - `auto`: 자동 식별

## 사용 예시

### 기본 사용법
```bash
# 와이어프레임과 사양서 생성
/ai-design ./screens/product-list.png

# 전체 코드 생성 (pilot 폴더에 생성)
/ai-design ./screens/dashboard.png full dashboard
```

## 워크플로우

1. **설정 파일 로드**: backend-config.md, front-config.md 읽기
2. **이미지 분석**: AI가 화면 구조와 컴포넌트 식별
3. **문서 생성**: 와이어프레임과 사양서 작성
4. **코드 생성** (full 옵션): pilot 폴더에 전체 소스 코드 생성

## Pilot 폴더 구조 (full 옵션)

```
pilot/
├── README-[화면명].md         # 프로젝트 설명 및 실행 방법
├── docs/                      # 설계 문서
│   ├── wireframe/            # UI 와이어프레임
│   └── specification/        # 프로그램 사양서
├── frontend/                 # Frontend 애플리케이션
│   └── src/
│       ├── views/           # 페이지 컴포넌트
│       ├── stores/          # 상태 관리
│       └── api/             # API 통신
└── backend/                  # Backend 애플리케이션
    └── src/main/java/
        └── com/example/
            ├── controller/   # REST API
            ├── service/      # 비즈니스 로직
            ├── entity/       # JPA 엔티티
            └── dto/          # DTO 클래스
```

---

파라미터: $ARGUMENTS

## 🤖 AI 분석 실행

이제 설정 파일 기반으로 이미지를 분석하겠습니다.

**분석 대상**: $ARGUMENTS

### Step 1: 설정 파일 로드 및 검증

프로젝트 설정 파일을 확인하겠습니다.

**설정 파일**:
- `backend-config.md`: 백엔드 기술 스택 및 설정
- `front-config.md`: 프론트엔드 기술 스택 및 설정

### Step 2: AI 이미지 분석

**분석 가이드 참조**:
- **AI 분석**: `/mnt/c/guide/ai-design/ai-analysis/references/AI-Quick-Reference-Card.md`
- **컴포넌트 매핑**: `/mnt/c/guide/ai-design/ai-analysis/core/AI-Component-Recognition-Guide.md`
- **DDL 분석**: `/mnt/c/guide/ai-design/ai-analysis/core/ai-ddl-analysis-guide.md` ⭐
- **OWS 컴포넌트**: `/mnt/c/guide/ai-design/ai-analysis/references/OWS-Component-Detailed-Reference.md`
- **화면 패턴**: `/mnt/c/guide/ai-design/ai-analysis/references/Enterprise-Screen-Patterns-Guide.md`

**분석 진행 과정**:
1. **이미지 로딩 및 전처리**
2. **DDL 파일 탐지 및 파싱** ⭐
   - 프로젝트 루트/database/ 폴더에서 DDL 파일 자동 탐지
   - DDL 구문 파싱 → 테이블 구조, 컬럼 정보, 제약조건 추출
   - 테이블명/컬럼명 → 화면 제목/필드명 자동 매핑
3. **화면 유형 인식** (CRUD/Dashboard/Form/Popup)
4. **UI 구성요소 감지** (Header, Search, Grid, Action 등)
5. **이미지+DDL 필드 매칭** ⭐
   - 이미지 필드명 ↔ DDL 컬럼명 직접/의미적 매칭
   - 데이터 타입 기반 컴포넌트 추론 (VARCHAR→OwInput, DATE→OwFormDate)
   - 제약조건 기반 속성 설정 (NOT NULL→required, UNIQUE→중복체크)
6. **메타데이터 기반 컴포넌트 매핑** (OWS/Material-UI/Ant Design 등)
7. **비즈니스 로직 추론** (도메인별 특화 규칙 적용)

### Step 3: OWS 컴포넌트 매핑 및 분석 완료

**메타데이터 기반 OWS 컴포넌트 매핑**:
- **조회기간/검색기간** → `OwBizDatePicker` (필수)
- **상태 필터** → `OwStateFilter` (필수)  
- **담당자/조직 선택** → `OwFormOrg` (필수)
- **텍스트 입력** → `OwInput`
- **드롭다운 선택** → `OwFormSelect`
- **페이징** → `OwPagination`
- **팝업/모달** → `OwPopup`

### Step 4: UI 와이어프레임 문서 생성

**⚠️ 필수: 코드 생성 전에 반드시 완료되어야 함**

**생성할 와이어프레임 종류**:

#### 4.1 ASCII 와이어프레임
- 화면 레이아웃의 구조적 표현
- 컴포넌트 배치와 계층 구조 시각화
- OWS 컴포넌트 매핑 정보 포함

#### 4.2 HTML 와이어프레임 (실제 화면 재현)
- **실제 이미지와 동일한 스타일과 색상 적용**
- **정확한 레이아웃과 배치 재현**
- **폰트, 아이콘, 버튼 스타일 등 세부사항 포함**
- **Bootstrap 5 + 인라인 CSS로 구현**

**HTML 와이어프레임 생성 규칙**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>[화면명] - HTML Wireframe</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* 실제 이미지의 색상과 스타일을 정확히 재현 */
        /* 배경색, 테두리, 그림자, 폰트 등 모든 시각적 요소 포함 */
    </style>
</head>
<body>
    <!-- 실제 화면과 동일한 HTML 구조 -->
</body>
</html>
```

**생성 내용**:
- ASCII 다이어그램 (구조적 표현)
- HTML 와이어프레임 (시각적 재현)
- OWS 컴포넌트 매핑 테이블
- 반응형 디자인 명세
- 인터랙션 시나리오

### Step 5: 프로그램 사양서 생성

**⚠️ 필수: 코드 생성 전에 반드시 완료되어야 함**

**생성 내용**:
- 시스템 아키텍처
- **Vue3 + OWS 컴포넌트 기술 명세**
  - OWS 컴포넌트 import 및 사용법
  - Pinia store 구조
  - API 통신 모듈
- **백엔드 기술 명세**
  - Spring Boot 3.x 구조
  - MyBatis mapper 설계
  - DTO/Entity 매핑
- API 명세 설계 (OpenAPI 3.0)
- 데이터 모델 설계
- 화면 플로우 및 상태 관리

### Step 6: Pilot 폴더 및 프로덕션 코드 생성 (full 옵션)

**생성 진행 과정**:

1. **pilot 폴더 구조 생성**
   ```
   pilot/
   ├── README-[화면명].md
   ├── docs/
   │   ├── wireframe/
   │   │   ├── [화면명]-ascii.md
   │   │   └── [화면명]-visual.html
   │   └── specification/
   │       └── [화면명]-spec.md
   ├── frontend/
   └── backend/
   ```

2. **설계 문서 생성**
   - ASCII 와이어프레임
   - HTML 와이어프레임 (실제 화면 재현)
   - 프로그램 사양서

3. **Frontend 코드 생성 (Vue3 + OWS)**
   - Vue3 컴포넌트 (Composition API)
   - OWS 공통 컴포넌트 적용
   - Pinia store
   - API 통신 모듈

4. **Backend 코드 생성 (Spring Boot + MyBatis)**
   - REST Controller
   - Service Layer
   - MyBatis Mapper (인터페이스 + XML)
   - DTO/Entity 클래스
   - 공통 응답 클래스

5. **README-[화면명].md 생성**


### Step 7: 결과 출력

```text
🚀 AI Design 분석 완료!

📁 Pilot 프로젝트 위치: ./pilot/

📚 생성된 문서:
  ✅ README-[화면명].md
  ✅ ASCII 와이어프레임 - pilot/docs/wireframe/[화면명]-ascii.md
  ✅ HTML 와이어프레임 - pilot/docs/wireframe/[화면명]-visual.html
  ✅ 프로그램 사양서 - pilot/docs/specification/[화면명]-spec.md

🎯 다음 단계:
  1. HTML 와이어프레임 확인: open pilot/docs/wireframe/[화면명]-visual.html
  2. 설정 파일 검토
  3. 코드 실행 및 테스트
```

---

이제 이미지를 업로드하거나 경로를 제공해주세요. AI가 체계적으로 분석하여 pilot 폴더에 프로덕션 코드를 생성하겠습니다.