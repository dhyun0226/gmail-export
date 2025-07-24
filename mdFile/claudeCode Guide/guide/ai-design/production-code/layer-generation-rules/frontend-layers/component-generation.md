# 🎨 Frontend Component 코드 생성 규칙

> UI 컴포넌트의 자동 생성을 위한 프레임워크별 상세 가이드

## 📋 Component 레이어 역할

### **핵심 책임**
- UI 렌더링 및 사용자 인터랙션
- 상태 관리 (로컬/글로벌)
- API 데이터 연동
- 이벤트 처리
- 폼 검증 및 제출
- 접근성(a11y) 구현

### **포함하지 않을 내용**
- 직접적인 API 호출 (서비스 레이어 활용)
- 복잡한 비즈니스 로직
- 라우팅 로직
- 전역 상태 직접 조작

## 🏗️ 프레임워크별 생성 규칙

### **OWS 컴포넌트 우선 적용 원칙**

#### OWS 컴포넌트 필수 사용 규칙
```yaml
컴포넌트_선택_우선순위:
  1순위_OWS_전용:
    - "날짜 필터 → OwBizDatePicker (필수)"
    - "상태 필터 → OwStateFilter"
    - "조직 선택 → OwFormOrg"
    - "폼 입력 → OwFormSelect, OwInput"
    - "팝업 → OwPopup"
    - "페이징 → OwPagination"
  
  2순위_DevExtreme:
    - "데이터 그리드 → DxDataGrid"
    - "차트 → DxChart"
  
  3순위_Bootstrap:
    - "기본 버튼 → BButton"
    - "카드 → BCard"
    - "레이아웃 → BContainer, BRow, BCol"

import_구문_템플릿:
  OWS_컴포넌트: |
    import {
      OwBizDatePicker,
      OwFormSelect, 
      OwStateFilter,
      OwFormOrg,
      OwInput,
      OwPopup,
      OwPagination
    } from '@ows/ui'
  
  DevExtreme: |
    import { DxDataGrid, DxColumn } from 'devextreme-vue/data-grid'
  
  Bootstrap: |
    import { BButton, BCard, BContainer } from 'bootstrap-vue-next'
```

### **Vue 3 Composition API 패턴**

#### 기본 구조
```yaml
파일_구조:
  - "컴포넌트명: {Entity}{Type}.vue"
  - "예시: ProductList.vue, UserForm.vue, DashboardCard.vue"
  
스크립트_섹션:
  - "<script setup lang=\"ts\">"
  - "Composition API 사용"
  - "TypeScript 필수"

템플릿_구조:
  - "<template> 단일 루트 엘리먼트 불필요"
  - "반응형 디자인 고려"
  - "접근성 속성 포함"

스타일_섹션:
  - "<style scoped>" # 스타일 격리
  - "CSS 모듈 또는 CSS-in-JS"
```

#### Composition API 패턴
```yaml
상태_관리:
  - "ref(): 원시값 반응성"
  - "reactive(): 객체 반응성"
  - "computed(): 계산된 속성"
  - "watch(): 상태 감시"

라이프사이클:
  - "onMounted(): 컴포넌트 마운트"
  - "onUnmounted(): 정리 작업"
  - "onUpdated(): 업데이트 후"

Props_정의:
  - "defineProps<{PropType}>()"
  - "withDefaults() 기본값 설정"
  - "TypeScript 인터페이스 활용"

Emits_정의:
  - "defineEmits<{EventType}>()"
  - "타입 안전한 이벤트 발행"
```

### **React Functional Component 패턴**

#### 기본 구조
```yaml
파일_구조:
  - "컴포넌트명: {Entity}{Type}.tsx"
  - "예시: ProductList.tsx, UserForm.tsx"
  
컴포넌트_정의:
  - "React.FC<Props> 타입 또는 직접 함수"
  - "Props 인터페이스 정의"
  - "TypeScript 필수"

Hooks_패턴:
  - "useState(): 상태 관리"
  - "useEffect(): 사이드 이펙트"
  - "useMemo(): 메모이제이션"
  - "useCallback(): 함수 메모이제이션"
  - "useContext(): 컨텍스트 접근"
```

## 🎯 컴포넌트 타입별 생성 규칙

### **1. 목록(List) 컴포넌트**

#### 기본 구조
```yaml
데이터_관리:
  - "페이징 상태: currentPage, pageSize, totalCount"
  - "정렬 상태: sortField, sortDirection"
  - "필터 상태: searchCriteria, filters"
  - "로딩 상태: isLoading, error"

UI_구성요소:
  - "검색/필터 영역"
  - "액션 버튼 영역 (추가, 삭제, 내보내기)"
  - "데이터 테이블/그리드"
  - "페이징 네비게이션"

상호작용:
  - "항목 선택 (단일/다중)"
  - "정렬 변경"
  - "페이지 이동"
  - "검색/필터 적용"
```

#### Vue 구현 예시 구조
```yaml
스크립트_구성:
  - "API 서비스 import"
  - "상태 관리 store import"
  - "UI 컴포넌트 import"
  - "타입 정의 import"

템플릿_구성:
  - "SearchFilter 컴포넌트"
  - "ActionButtons 컴포넌트"
  - "DataTable 컴포넌트"
  - "Pagination 컴포넌트"

메서드_정의:
  - "fetchData(): 데이터 조회"
  - "handleSearch(): 검색 처리"
  - "handleSort(): 정렬 처리"
  - "handlePageChange(): 페이지 변경"
```

### **2. 폼(Form) 컴포넌트**

#### 폼 검증 규칙
```yaml
검증_전략:
  - "실시간 검증: input 이벤트"
  - "제출시 검증: submit 이벤트"
  - "필드별 검증 규칙"
  - "커스텀 검증 함수"

오류_처리:
  - "필드별 오류 메시지"
  - "전역 오류 메시지"
  - "서버 검증 오류 처리"

상태_관리:
  - "폼 데이터 상태"
  - "검증 상태"
  - "제출 상태 (로딩, 성공, 실패)"
```

#### 접근성 요구사항
```yaml
필수_속성:
  - "aria-label, aria-describedby"
  - "role 속성"
  - "tabindex 순서"
  - "키보드 네비게이션"

스크린_리더:
  - "aria-live 영역"
  - "오류 메시지 음성 안내"
  - "폼 완료 상태 안내"
```

### **3. 대시보드(Dashboard) 컴포넌트**

#### 레이아웃 구조
```yaml
그리드_시스템:
  - "반응형 그리드 레이아웃"
  - "위젯 크기 조절"
  - "드래그 앤 드롭 지원"

위젯_타입:
  - "차트 위젯"
  - "테이블 위젯"
  - "메트릭 위젯"
  - "필터 위젯"

실시간_업데이트:
  - "WebSocket 연결"
  - "주기적 데이터 갱신"
  - "사용자 액션 기반 업데이트"
```

### **4. 모달(Modal/Dialog) 컴포넌트**

#### 모달 관리
```yaml
상태_관리:
  - "isOpen: 모달 표시 상태"
  - "modalData: 모달 전달 데이터"
  - "modalType: 모달 유형"

이벤트_처리:
  - "ESC 키 닫기"
  - "백드롭 클릭 닫기"
  - "확인/취소 버튼"
  - "포커스 트랩"

접근성:
  - "aria-modal=\"true\""
  - "role=\"dialog\""
  - "초기 포커스 설정"
```

## 🎨 UI 라이브러리별 특화 규칙

### **OWS (Vue) 컴포넌트**
```yaml
컴포넌트_매핑:
  - "OwButton → 버튼 액션"
  - "OwDataGrid → 데이터 테이블"
  - "OwFormInput → 입력 필드"
  - "OwDatePicker → 날짜 선택"
  - "OwModal → 모달 다이얼로그"

테마_설정:
  - "CSS 변수 활용"
  - "다크모드 지원"
  - "브랜드 컬러 적용"
```

### **Ant Design (React/Vue)**
```yaml
컴포넌트_활용:
  - "Table → 데이터 테이블"
  - "Form → 폼 구성"
  - "DatePicker → 날짜 선택"
  - "Modal → 모달 창"
  - "Drawer → 사이드 패널"

국제화:
  - "i18n 설정"
  - "로케일 적용"
  - "다국어 지원"
```

### **Bootstrap Vue/React Bootstrap**
```yaml
레이아웃_시스템:
  - "Container, Row, Col"
  - "반응형 브레이크포인트"
  - "유틸리티 클래스"

컴포넌트_조합:
  - "Card → 콘텐츠 카드"
  - "Nav → 네비게이션"
  - "Navbar → 상단 바"
  - "Pagination → 페이징"
```

## 🔍 성능 최적화 규칙

### **렌더링 최적화**
```yaml
Vue_최적화:
  - "v-memo: 조건부 렌더링 최적화"
  - "v-once: 일회성 렌더링"
  - "computed: 계산된 속성 캐싱"
  - "lazy loading: 동적 import"

React_최적화:
  - "React.memo: 컴포넌트 메모이제이션"
  - "useMemo: 값 메모이제이션"
  - "useCallback: 함수 메모이제이션"
  - "lazy: 코드 스플리팅"
```

### **데이터 관리 최적화**
```yaml
가상_스크롤링:
  - "대용량 리스트 최적화"
  - "윈도잉 기법"
  - "무한 스크롤"

캐싱_전략:
  - "API 응답 캐싱"
  - "컴포넌트 수준 캐싱"
  - "브라우저 캐시 활용"
```

## 📱 반응형 디자인 규칙

### **브레이크포인트 정의**
```yaml
디바이스_분류:
  - "mobile: < 768px"
  - "tablet: 768px ~ 1024px"
  - "desktop: > 1024px"
  - "wide: > 1440px"

적응형_레이아웃:
  - "모바일 우선 설계"
  - "터치 친화적 인터페이스"
  - "읽기 가능한 폰트 크기"
```

### **네비게이션 패턴**
```yaml
모바일_네비게이션:
  - "햄버거 메뉴"
  - "탭 네비게이션"
  - "스와이프 제스처"

데스크톱_네비게이션:
  - "사이드바 메뉴"
  - "상단 네비게이션"
  - "브레드크럼"
```

## 🧪 테스트 생성 규칙

### **단위 테스트**
```yaml
컴포넌트_테스트:
  - "렌더링 테스트"
  - "이벤트 처리 테스트"
  - "Props 전달 테스트"
  - "상태 변화 테스트"

Mock_데이터:
  - "API 응답 모킹"
  - "사용자 이벤트 시뮬레이션"
  - "외부 의존성 모킹"
```

### **통합 테스트**
```yaml
E2E_테스트:
  - "사용자 시나리오 테스트"
  - "크로스 브라우저 테스트"
  - "성능 테스트"
  - "접근성 테스트"
```

## 🔧 생성 시 고려사항

### **코드 품질**
```yaml
정적_분석:
  - "ESLint 규칙 준수"
  - "TypeScript 타입 체크"
  - "코드 복잡도 관리"

일관성_유지:
  - "네이밍 컨벤션"
  - "폴더 구조"
  - "임포트 순서"
  - "코드 포맷팅"
```

### **유지보수성**
```yaml
모듈화:
  - "재사용 가능한 컴포넌트"
  - "Props 인터페이스 정의"
  - "이벤트 타입 정의"

문서화:
  - "JSDoc 주석"
  - "Props 설명"
  - "사용 예시"
  - "Storybook 스토리"
```

이 규칙을 바탕으로 AI가 프레임워크와 UI 라이브러리에 맞는 최적화된 컴포넌트 코드를 자동 생성합니다.