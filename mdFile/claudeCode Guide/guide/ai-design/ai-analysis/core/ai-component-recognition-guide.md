# OWS AI 컴포넌트 인식 가이드
> AI가 UI 와이어프레임을 분석하여 적절한 OWS 컴포넌트를 매칭하고 프로그램 사양서를 생성하기 위한 체계적 가이드

## 📌 목차
1. [UI 패턴 인식 가이드](#1-ui-패턴-인식-가이드)
2. [컴포넌트 카탈로그](#2-컴포넌트-카탈로그)
3. [화면 구성 패턴](#3-화면-구성-패턴)
4. [컴포넌트 매칭 규칙](#4-컴포넌트-매칭-규칙)
5. [사양서 생성 템플릿](#5-사양서-생성-템플릿)
6. [실제 적용 예시](#6-실제-적용-예시)

---

## 1. UI 패턴 인식 가이드

### 1.1 화면 영역 구분
```
┌─────────────────────────────────────────────┐
│  제목 영역 (Title Section)                   │
├─────────────────────────────────────────────┤
│  조회 조건 영역 (Filter Section)             │
│  ┌─────────────┐ ┌─────────────┐           │
│  │ 필터 그룹 1  │ │ 필터 그룹 2  │           │
│  └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────┤
│  데이터 영역 (Data Section)                  │
│  ┌─────────────────────────────────────┐   │
│  │         그리드 / 테이블               │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  추가 정보 영역 (Additional Info)            │
└─────────────────────────────────────────────┘
```

### 1.2 영역별 식별 키워드
| 영역 | 한글 키워드 | 영문 키워드 | 시각적 특징 |
|------|------------|-------------|------------|
| 제목 | 관리, 조회, 등록 | Management, Search, Register | 상단 굵은 텍스트 |
| 필터 | 조회조건, 검색조건, 기간 | Filter, Search, Period | 가로 배치 입력필드 |
| 그리드 | 목록, 결과, 데이터 | List, Result, Grid | 표 형태, 체크박스 |
| 버튼 | 조회, 저장, 취소, 엑셀 | Search, Save, Cancel, Excel | 우상단/우하단 배치 |

---

## 2. 컴포넌트 카탈로그

### 2.1 필터/검색 컴포넌트
```yaml
OwBizDatePicker:
  category: "DateTime"
  usage: "업무용 날짜 범위 선택"
  visual_pattern: "달력 아이콘 + 날짜 입력 필드 2개"
  keywords: ["기간", "날짜", "일자", "시작일", "종료일"]
  props:
    rangeUnit: "day | week | month | year"
    disabledPicker: "boolean"
    disabledDouble: "boolean"
  example_code: |
    <OwBizDatePicker 
      v-model="dateRange"
      :range-unit="'day'"
    />

OwStateFilter:
  category: "Filter"
  usage: "상태별 필터링 (체크박스 그룹)"
  visual_pattern: "체크박스 + 레이블 + 숫자"
  keywords: ["상태", "필터", "체크", "선택"]
  props:
    options: "Array<{title, stateCount, code}>"
    modelValue: "Array<string>"
  example_code: |
    <OwStateFilter 
      v-model="selectedStates"
      :options="stateOptions"
    />

OwFormSelect:
  category: "Form"
  usage: "드롭다운 선택"
  visual_pattern: "▼ 화살표가 있는 선택 박스"
  keywords: ["선택", "콤보", "드롭다운", "셀렉트"]
  props:
    options: "Array<{text, value}>"
    modelValue: "string | number"
  example_code: |
    <OwFormSelect
      v-model="selected"
      :options="selectOptions"
    />

OwFormRadio:
  category: "Form"
  usage: "단일 선택 라디오 버튼"
  visual_pattern: "◯ 원형 버튼 + 레이블"
  keywords: ["라디오", "선택", "옵션", "단일선택"]
  props:
    options: "Array<{text, value}>"
    modelValue: "string | number"
  example_code: |
    <OwFormRadio
      v-model="selectedOption"
      :options="radioOptions"
    />
```

### 2.2 데이터 표시 컴포넌트
```yaml
DxDataGrid:
  category: "DataDisplay"
  usage: "대용량 데이터 그리드"
  visual_pattern: "표 형태, 헤더, 정렬 아이콘"
  keywords: ["그리드", "목록", "테이블", "리스트"]
  required_imports: ["devextreme-vue/data-grid"]
  props:
    dataSource: "Array | Store"
    columns: "Array<Column>"
    selection: "{ mode: 'single' | 'multiple' }"
  example_code: |
    <DxDataGrid
      :data-source="gridData"
      :selection="{ mode: 'multiple' }"
    >
      <DxColumn data-field="id" caption="번호" />
      <DxColumn data-field="name" caption="이름" />
    </DxDataGrid>

OwPagination:
  category: "Navigation"
  usage: "페이지 네비게이션"
  visual_pattern: "< 1 2 3 4 5 > 형태"
  keywords: ["페이지", "페이징", "이전", "다음"]
  props:
    totalCount: "number"
    pageSize: "number"
    currentPage: "number"
  example_code: |
    <OwPagination
      v-model="currentPage"
      :total-count="totalCount"
      :page-size="20"
    />
```

### 2.3 폼 입력 컴포넌트
```yaml
OwInput:
  category: "Form"
  usage: "텍스트 입력 필드"
  visual_pattern: "사각형 입력 박스"
  keywords: ["입력", "텍스트", "문자", "필드"]
  props:
    modelValue: "string"
    placeholder: "string"
    disabled: "boolean"
  example_code: |
    <OwInput
      v-model="inputValue"
      placeholder="입력하세요"
    />

OwFormCheckbox:
  category: "Form"
  usage: "체크박스 (다중 선택)"
  visual_pattern: "□ 사각형 체크박스"
  keywords: ["체크", "선택", "다중선택", "체크박스"]
  props:
    modelValue: "boolean | Array"
    value: "any"
  example_code: |
    <OwFormCheckbox
      v-model="checked"
      value="option1"
    />

OwFormOrg:
  category: "Form"
  usage: "조직/담당자 선택"
  visual_pattern: "조직도 아이콘 + 입력필드"
  keywords: ["조직", "부서", "담당자", "사용자"]
  props:
    modelValue: "Object"
    multiple: "boolean"
  example_code: |
    <OwFormOrg
      v-model="selectedOrg"
      :multiple="false"
    />
```

### 2.4 레이아웃/팝업 컴포넌트
```yaml
OwPopup:
  category: "Layout"
  usage: "모달 팝업 창"
  visual_pattern: "오버레이 + 중앙 팝업"
  keywords: ["팝업", "모달", "다이얼로그", "창"]
  props:
    visible: "boolean"
    title: "string"
    size: "sm | md | lg | xl"
  example_code: |
    <OwPopup
      v-model="showPopup"
      title="팝업 제목"
      size="lg"
    >
      <!-- 팝업 내용 -->
    </OwPopup>

OwAlert:
  category: "Feedback"
  usage: "알림 메시지"
  visual_pattern: "색상 배경 + 메시지"
  keywords: ["알림", "경고", "메시지", "안내"]
  props:
    variant: "primary | success | warning | danger"
    dismissible: "boolean"
  example_code: |
    <OwAlert
      variant="warning"
      :dismissible="true"
    >
      알림 메시지 내용
    </OwAlert>
```

---

## 3. 화면 구성 패턴

### 3.1 필터 + 그리드 패턴 (가장 일반적)
```typescript
interface FilterGridPattern {
  layout: "vertical-sections",
  sections: [
    {
      type: "filter",
      components: [
        "OwBizDatePicker",      // 조회 기간
        "OwFormSelect",         // 드롭다운 선택
        "OwStateFilter",        // 상태 필터
        "OwFormOrg"            // 조직 선택
      ],
      arrangement: "horizontal-wrap"
    },
    {
      type: "action-buttons",
      position: "right",
      components: ["BButton"]   // 조회, 엑셀 버튼
    },
    {
      type: "data-display",
      components: [
        "DxDataGrid",          // 데이터 그리드
        "OwPagination"         // 페이지네이션
      ]
    }
  ]
}
```

### 3.2 입력 폼 패턴
```typescript
interface FormPattern {
  layout: "form-layout",
  sections: [
    {
      type: "form-header",
      components: ["title", "required-mark"]
    },
    {
      type: "form-body",
      components: [
        "OwInput",             // 텍스트 입력
        "OwFormDate",          // 날짜 입력
        "OwFormSelect",        // 선택 박스
        "OwFormCheckbox",      // 체크박스
        "OwTinyEditor"         // 에디터
      ],
      arrangement: "label-input-pairs"
    },
    {
      type: "form-actions",
      position: "bottom-right",
      components: ["save-button", "cancel-button"]
    }
  ]
}
```

### 3.3 대시보드 패턴
```typescript
interface DashboardPattern {
  layout: "grid-layout",
  sections: [
    {
      type: "summary-cards",
      components: ["stat-cards", "charts"]
    },
    {
      type: "data-tables",
      components: ["DxDataGrid", "OwScheduler"]
    }
  ]
}
```

---

## 4. OWS 컴포넌트 매칭 규칙 (최우선 적용)

### 4.1 OWS 컴포넌트 우선 선택 원칙

```yaml
우선순위_1_OWS_전용_컴포넌트:
  날짜_관련:
    - "조회기간, 검색기간 → OwBizDatePicker (필수)"
    - "단순 날짜 → OwFormDate"
    - "날짜 범위 → OwFormDateRange"
  
  필터_관련:
    - "상태 필터 → OwStateFilter (체크박스형)"
    - "상태 선택 → OwStateRadio (라디오형)"
    - "조직/담당자 → OwFormOrg (필수)"
  
  입력_관련:
    - "텍스트 입력 → OwInput"
    - "드롭다운 → OwFormSelect"
    - "검색 드롭다운 → OwFormDropdown"

우선순위_2_통합_컴포넌트:
  - "팝업/모달 → OwPopup"
  - "페이징 → OwPagination"
  - "더보기 → OwMorePopup"

우선순위_3_DevExtreme:
  - "데이터 그리드 → DxDataGrid"
  - "차트 → DxChart"
  - "스케줄러 → DxScheduler"
```

### 4.2 UI 패턴별 OWS 컴포넌트 자동 매핑

#### CRUD 목록 화면 표준 패턴
```yaml
화면_구성:
  헤더_영역:
    title: "h1 태그"
    actions: ["BButton (추가)", "BButton (엑셀)"]
  
  필터_영역:
    조회기간: "OwBizDatePicker (필수)"
    카테고리: "OwFormSelect"
    상태필터: "OwStateFilter"
    담당자: "OwFormOrg"
    검색어: "OwInput"
    버튼: "BButton (조회, 초기화)"
  
  데이터_영역:
    그리드: "DxDataGrid"
    페이징: "OwPagination"
  
  팝업_영역:
    상세보기: "OwPopup"
    등록수정: "OwPopup"
```

#### 대시보드 화면 표준 패턴
```yaml
화면_구성:
  필터_영역:
    조회기간: "OwBizDatePicker"
    부서선택: "OwFormOrg"
  
  차트_영역:
    차트: "DxChart"
    KPI카드: "BCard + 사용자정의"
  
  상세_영역:
    상세그리드: "DxDataGrid"
    캘린더: "OwCalendar"
```

## 5. 컴포넌트 매칭 규칙

### 4.1 시각적 패턴 매칭
```javascript
const visualPatternRules = {
  // 날짜 입력 패턴
  "달력아이콘_날짜필드_2개": {
    component: "OwBizDatePicker",
    confidence: 0.95,
    alternativeKeywords: ["기간", "시작일", "종료일", "조회기간"]
  },
  
  // 체크박스 그룹 패턴
  "체크박스_레이블_숫자": {
    component: "OwStateFilter",
    confidence: 0.90,
    alternativeKeywords: ["상태", "필터", "선택"]
  },
  
  // 그리드 패턴
  "표_헤더_다중행": {
    component: "DxDataGrid",
    confidence: 0.95,
    features: ["체크박스컬럼", "정렬아이콘", "페이징"]
  },
  
  // 드롭다운 패턴
  "박스_하향화살표": {
    component: "OwFormSelect",
    confidence: 0.85,
    alternativeKeywords: ["선택", "콤보박스"]
  }
};
```

### 4.2 텍스트 기반 매칭
```javascript
const textPatternRules = {
  // 기능 키워드 매칭
  "조회_조건": ["OwBizDatePicker", "OwFormSelect", "OwStateFilter"],
  "등록_입력": ["OwInput", "OwFormDate", "OwFormCheckbox"],
  "목록_결과": ["DxDataGrid", "OwPagination"],
  "팝업_모달": ["OwPopup", "OwAlert"],
  
  // 액션 키워드 매칭
  "조회하다": "search-button",
  "저장하다": "save-button",
  "엑셀다운로드": "excel-export",
  "추가하다": "add-button"
};
```

### 4.3 위치 기반 매칭
```javascript
const positionRules = {
  // 상단 영역
  "top-section": {
    likely: ["filter-components", "search-conditions"],
    components: ["OwBizDatePicker", "OwFormSelect", "OwStateFilter"]
  },
  
  // 중앙 영역
  "middle-section": {
    likely: ["data-display", "grid", "content"],
    components: ["DxDataGrid", "OwScheduler", "form-components"]
  },
  
  // 하단 영역
  "bottom-section": {
    likely: ["pagination", "summary", "actions"],
    components: ["OwPagination", "action-buttons"]
  }
};
```

---

## 5. 사양서 생성 템플릿

### 5.1 화면 사양서 기본 구조
```markdown
# {화면명} 화면 사양서

## 1. 화면 개요
- **화면 ID**: {SCREEN_ID}
- **화면명**: {화면명}
- **화면 유형**: {조회화면|입력화면|상세화면|팝업화면}
- **주요 기능**: {기능 요약}

## 2. 화면 레이아웃
### 2.1 전체 구조
```
{레이아웃 다이어그램}
```

### 2.2 영역별 구성
| 영역 | 구성 요소 | 설명 |
|------|-----------|------|
| 조회 조건 | {컴포넌트 목록} | {설명} |
| 데이터 영역 | {컴포넌트 목록} | {설명} |

## 3. 컴포넌트 상세
### 3.1 조회 조건 영역
#### {컴포넌트명}
- **컴포넌트**: {OWS 컴포넌트명}
- **용도**: {사용 목적}
- **설정값**: 
  ```javascript
  {props 설정}
  ```

### 3.2 데이터 표시 영역
#### {그리드명}
- **컴포넌트**: DxDataGrid
- **컬럼 구성**:
  | 컬럼명 | 필드명 | 타입 | 너비 | 정렬 |
  |-------|--------|------|------|------|
  | {컬럼} | {field} | {type} | {width} | {align} |

## 4. 기능 명세
### 4.1 조회 기능
{기능 상세 설명}

### 4.2 저장 기능
{기능 상세 설명}

## 5. API 연동
### 5.1 조회 API
- **URL**: {API_URL}
- **Method**: GET/POST
- **Parameters**: 
  ```json
  {
    "param1": "value1"
  }
  ```

## 6. 화면 동작 시나리오
1. {시나리오 1}
2. {시나리오 2}
```

### 5.2 컴포넌트별 Props 명세
```typescript
// 자동 생성용 타입 정의
interface ComponentSpec {
  componentName: string;
  props: Record<string, any>;
  events: string[];
  slots?: string[];
  validation?: ValidationRule[];
}

// 예시: OwBizDatePicker 명세
const datePickerSpec: ComponentSpec = {
  componentName: "OwBizDatePicker",
  props: {
    modelValue: { type: "DateRange", required: true },
    rangeUnit: { type: "string", default: "day" },
    disabledPicker: { type: "boolean", default: false }
  },
  events: ["update:modelValue", "change"],
  validation: [
    { rule: "required", message: "기간을 선택하세요" },
    { rule: "dateRange", message: "시작일이 종료일보다 늦을 수 없습니다" }
  ]
};
```

---

## 6. 실제 적용 예시

### 6.1 이미지 분석 → 컴포넌트 매칭
```yaml
입력_이미지_분석:
  화면_제목: "금지어 관리"
  
  영역_1_필터:
    식별된_요소:
      - 텍스트: "조회어 관리"
      - 입력필드: 2개 (날짜 형태)
      - 체크박스그룹: "상태별 필터"
    
    매칭된_컴포넌트:
      - component: "OwBizDatePicker"
        reason: "날짜 입력 필드 2개 + 기간 선택"
        confidence: 0.95
      
      - component: "OwStateFilter"  
        reason: "체크박스 + 숫자 표시"
        confidence: 0.90
  
  영역_2_그리드:
    식별된_요소:
      - 표 형태 데이터
      - 체크박스 컬럼
      - 여러 행의 데이터
    
    매칭된_컴포넌트:
      - component: "DxDataGrid"
        reason: "표 형태 + 다중 선택"
        confidence: 0.95
```

### 6.2 생성된 Vue 컴포넌트 코드
```vue
<template>
  <div class="screen-container">
    <!-- 제목 영역 -->
    <div class="title-section">
      <h2>급취어 관리</h2>
      <div class="action-buttons">
        <BButton variant="primary" @click="handleSearch">
          <i class="bi bi-search"></i> 조회
        </BButton>
        <BButton variant="success" @click="handleExcelExport">
          <i class="bi bi-file-excel"></i> 엑셀
        </BButton>
      </div>
    </div>

    <!-- 조회 조건 영역 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>조회 기간</label>
        <OwBizDatePicker
          v-model="filters.dateRange"
          :range-unit="'day'"
        />
      </div>
      
      <div class="filter-group">
        <label>상태</label>
        <OwStateFilter
          v-model="filters.states"
          :options="stateOptions"
        />
      </div>
    </div>

    <!-- 데이터 그리드 영역 -->
    <div class="data-section">
      <DxDataGrid
        :data-source="gridData"
        :selection="{ mode: 'multiple' }"
        @selection-changed="onSelectionChanged"
      >
        <DxColumn 
          data-field="id" 
          caption="번호" 
          :width="80"
          alignment="center"
        />
        <DxColumn 
          data-field="keyword" 
          caption="급취어" 
        />
        <DxColumn 
          data-field="category" 
          caption="카테고리" 
          :width="150"
        />
        <DxColumn 
          data-field="status" 
          caption="상태" 
          :width="100"
          cell-template="statusTemplate"
        />
        <DxColumn 
          data-field="createdDate" 
          caption="등록일" 
          :width="150"
          data-type="date"
        />
      </DxDataGrid>
      
      <OwPagination
        v-model="pagination.currentPage"
        :total-count="pagination.totalCount"
        :page-size="pagination.pageSize"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  OwBizDatePicker, 
  OwStateFilter, 
  OwPagination 
} from '@ows/ui';
import { 
  DxDataGrid, 
  DxColumn 
} from 'devextreme-vue/data-grid';

// 필터 상태
const filters = reactive({
  dateRange: {
    from: '',
    to: ''
  },
  states: []
});

// 상태 옵션
const stateOptions = ref([
  { title: '임시저장', stateCount: 2, code: 'DRAFT' },
  { title: '승인대기', stateCount: 5, code: 'PENDING' },
  { title: '승인완료', stateCount: 10, code: 'APPROVED' }
]);

// 그리드 데이터
const gridData = ref([]);

// 페이지네이션
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  totalCount: 0
});

// 조회 함수
const handleSearch = async () => {
  try {
    const response = await api.searchKeywords({
      ...filters,
      page: pagination.currentPage,
      size: pagination.pageSize
    });
    
    gridData.value = response.data;
    pagination.totalCount = response.totalCount;
  } catch (error) {
    console.error('조회 실패:', error);
  }
};

// 초기 로드
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.screen-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```

---

## 📋 AI 활용 가이드라인

### AI가 이 문서를 활용하는 방법:

1. **이미지 분석 시**
   - 화면 영역을 구분하고 각 영역의 시각적 패턴 식별
   - visualPatternRules를 참조하여 컴포넌트 매칭
   - confidence 점수로 매칭 정확도 판단

2. **컴포넌트 선택 시**
   - 컴포넌트 카탈로그에서 용도와 키워드 확인
   - 화면 구성 패턴 참조하여 적절한 조합 구성
   - props와 example_code 활용하여 구현

3. **사양서 생성 시**
   - 사양서 템플릿 구조 준수
   - 식별된 컴포넌트와 기능을 체계적으로 문서화
   - API 연동 및 동작 시나리오 포함

4. **코드 생성 시**
   - Vue 3 Composition API 사용
   - OWS 컴포넌트 import 정확히 수행
   - 표준 코딩 컨벤션 준수

### 주의사항:
- 항상 최신 버전의 컴포넌트 사용 (현재 v2.5.7)
- TypeScript 타입 정의 활용
- 접근성과 반응형 디자인 고려
- 한국어 레이블과 메시지 사용