# OWS 컴포넌트 상세 레퍼런스
> AI가 정확한 컴포넌트 구현을 위한 상세 명세서
>
> ⚠️ **주의**: 이 문서는 구 버전입니다. 
> 👉 **최신 버전**: [ows-component-complete-reference.md](./ows-component-complete-reference.md)를 참조하세요.
>
> **문서화 완성도**: 23% (14/60+ 컴포넌트)
> **누락된 컴포넌트**: 46개 이상

## 📌 날짜/시간 컴포넌트 (DateTime Components)

### OwBizDatePicker
업무용 날짜 선택 컴포넌트 - 일/주/월/년 단위 선택 지원

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `{ from: string, to: string }` | - | 선택된 날짜 범위 |
| rangeUnit | `'day' \| 'week' \| 'month' \| 'year'` | `'day'` | 날짜 선택 단위 |
| disabledPicker | `boolean` | `false` | 날짜 선택기 비활성화 |
| disabledDouble | `boolean` | `false` | 더블클릭 기능 비활성화 |
| twice | `boolean` | `false` | 트와이스 버튼 표시 여부 |

#### Events
| Event | Payload | Description |
|-------|---------|-------------|
| update:modelValue | `{ from: string, to: string }` | 날짜 변경 시 |
| change | `{ from: string, to: string }` | 날짜 확정 시 |

#### 사용 예제
```vue
<template>
  <OwBizDatePicker
    v-model="dateRange"
    :range-unit="rangeUnit"
    :twice="true"
    @change="handleDateChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { OwBizDatePicker } from '@ows/ui';

const dateRange = ref({
  from: '2024-01-01',
  to: '2024-01-31'
});

const rangeUnit = ref('day');

const handleDateChange = (range) => {
  console.log('날짜 변경:', range);
};
</script>
```

#### AI 인식 패턴
- **시각적 특징**: 달력 아이콘 + 날짜 입력 필드 2개 + 단위 선택 버튼
- **텍스트 키워드**: "조회기간", "기간설정", "날짜범위", "시작일~종료일"
- **일반적 위치**: 필터 영역 상단

---

### OwBizDatePickerRangeExcluedPickVer2
제외 선택 기능이 있는 고급 날짜 범위 선택기 (v2.5.0 신규)

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `{ from: string, to: string }` | - | 선택된 날짜 범위 |
| rangeUnit | `'day' \| 'week' \| 'month' \| 'year'` | `'day'` | 날짜 선택 단위 |
| excludeDates | `string[]` | `[]` | 제외할 날짜 목록 |
| disabledDouble | `boolean` | `false` | 더블클릭 기능 비활성화 |
| disabledPicker | `boolean` | `false` | 날짜 선택기 비활성화 |

#### 특별 기능
- 특정 날짜 제외 선택 가능
- 주말/공휴일 자동 제외 옵션
- 커스텀 제외 규칙 설정

---

## 📌 필터 컴포넌트 (Filter Components)

### OwStateFilter
상태별 필터링을 위한 체크박스 그룹 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string[]` | `[]` | 선택된 상태 코드 배열 |
| options | `StateOption[]` | `[]` | 상태 옵션 목록 |
| disabled | `boolean` | `false` | 전체 비활성화 |

#### Type Definition
```typescript
interface StateOption {
  title: string;      // 표시 텍스트
  stateCount: number; // 개수 표시
  code: string;       // 상태 코드
  disabled?: boolean; // 개별 비활성화
}
```

#### 사용 예제
```vue
<template>
  <OwStateFilter
    v-model="selectedStates"
    :options="stateOptions"
  />
</template>

<script setup>
import { ref } from 'vue';
import { OwStateFilter } from '@ows/ui';

const selectedStates = ref(['DRAFT', 'PENDING']);

const stateOptions = ref([
  { title: '임시저장', stateCount: 2, code: 'DRAFT' },
  { title: '승인대기', stateCount: 5, code: 'PENDING' },
  { title: '승인완료', stateCount: 10, code: 'APPROVED' },
  { title: '반려', stateCount: 1, code: 'REJECTED' }
]);
</script>
```

#### AI 인식 패턴
- **시각적 특징**: 체크박스 + 텍스트 + 숫자(카운트) 조합
- **텍스트 키워드**: "상태", "필터", "선택", "체크"
- **일반적 위치**: 필터 영역 중간

---

### OwFormFilterGroup
복합 필터 그룹 관리 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `FilterGroup[]` | `[]` | 필터 그룹 설정 |
| filterTypes | `FilterType[]` | - | 사용 가능한 필터 타입 |
| maxGroups | `number` | `5` | 최대 그룹 수 |

#### 복합 필터 구성 예제
```vue
<template>
  <OwFormFilterGroup
    v-model="filterGroups"
    :filter-types="availableFilters"
  />
</template>

<script setup>
const filterGroups = ref([
  {
    id: 'group1',
    operator: 'AND',
    filters: [
      { field: 'status', operator: 'IN', value: ['ACTIVE'] },
      { field: 'date', operator: 'BETWEEN', value: { from: '2024-01-01', to: '2024-12-31' } }
    ]
  }
]);
</script>
```

---

## 📌 폼 입력 컴포넌트 (Form Components)

### OwInput
기본 텍스트 입력 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string \| number` | `''` | 입력 값 |
| placeholder | `string` | `''` | 플레이스홀더 |
| disabled | `boolean` | `false` | 비활성화 |
| readonly | `boolean` | `false` | 읽기 전용 |
| maxlength | `number` | - | 최대 입력 길이 |
| type | `string` | `'text'` | 입력 타입 |

#### Validation 지원
```vue
<template>
  <OwInput
    v-model="inputValue"
    :rules="validationRules"
    :error-message="errorMessage"
  />
</template>

<script setup>
const validationRules = [
  { required: true, message: '필수 입력 항목입니다.' },
  { min: 3, message: '최소 3자 이상 입력하세요.' },
  { pattern: /^[A-Za-z]+$/, message: '영문만 입력 가능합니다.' }
];
</script>
```

---

### OwFormSelect
드롭다운 선택 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `any` | `null` | 선택된 값 |
| options | `SelectOption[]` | `[]` | 옵션 목록 |
| placeholder | `string` | `'선택'` | 미선택 시 표시 텍스트 |
| multiple | `boolean` | `false` | 다중 선택 여부 |
| searchable | `boolean` | `false` | 검색 기능 사용 |

#### Type Definition
```typescript
interface SelectOption {
  text: string;   // 표시 텍스트
  value: any;     // 실제 값
  disabled?: boolean; // 비활성화
  group?: string; // 그룹명 (옵션 그룹화)
}
```

#### 그룹화된 옵션 예제
```vue
<template>
  <OwFormSelect
    v-model="selected"
    :options="groupedOptions"
    :searchable="true"
  />
</template>

<script setup>
const groupedOptions = [
  { text: '서울', value: 'SEL', group: '수도권' },
  { text: '경기', value: 'GYG', group: '수도권' },
  { text: '부산', value: 'BSN', group: '경상권' },
  { text: '대구', value: 'DGU', group: '경상권' }
];
</script>
```

---

### OwFormCheckbox / OwFormCheckboxGroup
체크박스 및 체크박스 그룹 컴포넌트

#### OwFormCheckbox Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `boolean \| any[]` | `false` | 체크 상태 |
| value | `any` | - | 체크박스 값 (그룹에서 사용) |
| label | `string` | - | 표시 레이블 |
| disabled | `boolean` | `false` | 비활성화 |

#### OwFormCheckboxGroup Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `any[]` | `[]` | 선택된 값 배열 |
| options | `CheckboxOption[]` | `[]` | 체크박스 옵션 |
| inline | `boolean` | `false` | 가로 배치 |

#### 사용 예제
```vue
<template>
  <!-- 단일 체크박스 -->
  <OwFormCheckbox
    v-model="agreeTerms"
    label="약관에 동의합니다"
  />
  
  <!-- 체크박스 그룹 -->
  <OwFormCheckboxGroup
    v-model="selectedHobbies"
    :options="hobbyOptions"
    :inline="true"
  />
</template>

<script setup>
const agreeTerms = ref(false);
const selectedHobbies = ref(['reading', 'gaming']);

const hobbyOptions = [
  { text: '독서', value: 'reading' },
  { text: '게임', value: 'gaming' },
  { text: '운동', value: 'sports' },
  { text: '음악', value: 'music' }
];
</script>
```

---

### OwFormOrg
조직/담당자 선택 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `OrgData \| OrgData[]` | - | 선택된 조직/사용자 |
| type | `'org' \| 'user' \| 'both'` | `'both'` | 선택 타입 |
| multiple | `boolean` | `false` | 다중 선택 |
| showTree | `boolean` | `true` | 조직도 트리 표시 |

#### Type Definition
```typescript
interface OrgData {
  type: 'org' | 'user';
  id: string;
  name: string;
  deptName?: string;  // 부서명 (사용자인 경우)
  position?: string;  // 직급 (사용자인 경우)
  parentId?: string;  // 상위 조직 ID
}
```

#### 사용 예제
```vue
<template>
  <OwFormOrg
    v-model="selectedOrg"
    type="user"
    :multiple="true"
    @change="handleOrgChange"
  />
</template>

<script setup>
const selectedOrg = ref([]);

const handleOrgChange = (selected) => {
  console.log('선택된 조직/사용자:', selected);
};
</script>
```

---

## 📌 데이터 표시 컴포넌트 (Data Display Components)

### DxDataGrid (DevExtreme)
고성능 데이터 그리드 컴포넌트

#### 기본 설정
```vue
<template>
  <DxDataGrid
    :data-source="dataSource"
    :columns="columns"
    :selection="{ mode: 'multiple' }"
    :paging="{ pageSize: 20 }"
    :scrolling="{ mode: 'virtual' }"
    @selection-changed="onSelectionChanged"
  >
    <!-- 컬럼 정의 -->
    <DxColumn 
      data-field="id" 
      caption="번호"
      :width="80"
      alignment="center"
      :allow-editing="false"
    />
    
    <!-- 커스텀 셀 템플릿 -->
    <DxColumn 
      data-field="status" 
      caption="상태"
      cell-template="statusTemplate"
    />
    <template #statusTemplate="{ data }">
      <BBadge :variant="getStatusVariant(data.value)">
        {{ data.value }}
      </BBadge>
    </template>
    
    <!-- 액션 컬럼 -->
    <DxColumn 
      caption="작업"
      :width="100"
      cell-template="actionTemplate"
    />
    <template #actionTemplate="{ data }">
      <BButton size="sm" @click="editRow(data)">수정</BButton>
    </template>
  </DxDataGrid>
</template>

<script setup>
import { DxDataGrid, DxColumn } from 'devextreme-vue/data-grid';

const columns = [
  { dataField: 'id', caption: '번호', width: 80 },
  { dataField: 'name', caption: '이름' },
  { dataField: 'email', caption: '이메일' },
  { dataField: 'status', caption: '상태', width: 100 }
];

const dataSource = ref([
  { id: 1, name: '홍길동', email: 'hong@example.com', status: 'ACTIVE' }
]);
</script>
```

#### 고급 기능
```javascript
// 필터링
const filterValue = [
  ['status', '=', 'ACTIVE'],
  'and',
  ['createdDate', '>=', '2024-01-01']
];

// 정렬
const sortInfo = [
  { selector: 'name', desc: false },
  { selector: 'createdDate', desc: true }
];

// 그룹화
const grouping = {
  autoExpandAll: false,
  selector: 'department'
};
```

---

### OwScheduler
일정 관리 스케줄러 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| appointments | `Appointment[]` | `[]` | 일정 데이터 |
| resources | `Resource[]` | `[]` | 리소스 목록 |
| currentDate | `Date` | `new Date()` | 현재 표시 날짜 |
| view | `'day' \| 'week' \| 'month'` | `'week'` | 보기 모드 |

#### Type Definition
```typescript
interface Appointment {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  resourceId?: string;
  recurrence?: string;
  allDay?: boolean;
}

interface Resource {
  id: string;
  text: string;
  color: string;
}
```

---

## 📌 레이아웃/팝업 컴포넌트 (Layout Components)

### OwPopup
모달 팝업 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `boolean` | `false` | 팝업 표시 여부 |
| title | `string` | `''` | 팝업 제목 |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 팝업 크기 |
| hideFooter | `boolean` | `false` | 푸터 숨김 |
| closeOnBackdrop | `boolean` | `true` | 배경 클릭 시 닫기 |

#### Slots
| Slot | Description |
|------|-------------|
| default | 팝업 본문 내용 |
| header | 커스텀 헤더 |
| footer | 커스텀 푸터 |

#### 사용 예제
```vue
<template>
  <OwPopup
    v-model="showPopup"
    title="사용자 정보 수정"
    size="lg"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <!-- 팝업 내용 -->
    <form>
      <OwInput v-model="userData.name" label="이름" />
      <OwInput v-model="userData.email" label="이메일" />
    </form>
    
    <!-- 커스텀 푸터 -->
    <template #footer>
      <BButton variant="secondary" @click="showPopup = false">
        취소
      </BButton>
      <BButton variant="primary" @click="handleSave">
        저장
      </BButton>
    </template>
  </OwPopup>
</template>
```

---

### OwAlert
알림 메시지 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'info'` | 알림 타입 |
| dismissible | `boolean` | `false` | 닫기 버튼 표시 |
| show | `boolean` | `true` | 표시 여부 |
| fade | `boolean` | `true` | 페이드 효과 |

#### 사용 예제
```vue
<template>
  <OwAlert
    v-if="showAlert"
    :variant="alertType"
    :dismissible="true"
    @dismissed="showAlert = false"
  >
    <strong>{{ alertTitle }}</strong> {{ alertMessage }}
  </OwAlert>
</template>
```

---

## 📌 유틸리티 컴포넌트

### OwPagination
페이지네이션 컴포넌트

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `number` | `1` | 현재 페이지 |
| totalCount | `number` | `0` | 전체 항목 수 |
| pageSize | `number` | `20` | 페이지당 항목 수 |
| maxPages | `number` | `10` | 표시할 최대 페이지 수 |

#### Events
| Event | Payload | Description |
|-------|---------|-------------|
| update:modelValue | `number` | 페이지 변경 시 |
| change | `{ page: number, size: number }` | 페이지 또는 사이즈 변경 시 |

---

### OwTinyEditor
TinyMCE 기반 리치 텍스트 에디터

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string` | `''` | 에디터 내용 |
| height | `number` | `300` | 에디터 높이 |
| toolbar | `string` | 기본 툴바 | 툴바 구성 |
| readonly | `boolean` | `false` | 읽기 전용 |

#### 사용 예제
```vue
<template>
  <OwTinyEditor
    v-model="content"
    :height="400"
    :toolbar="customToolbar"
    @change="handleContentChange"
  />
</template>

<script setup>
const content = ref('');

const customToolbar = 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image';

const handleContentChange = (newContent) => {
  console.log('에디터 내용 변경:', newContent);
};
</script>
```

---

## 📌 화면 패턴별 컴포넌트 조합 가이드

### 1. 조회 화면 패턴
```yaml
구성_요소:
  필터_영역:
    - OwBizDatePicker (조회 기간)
    - OwFormSelect (카테고리 선택)
    - OwStateFilter (상태 필터)
    - OwFormOrg (담당자 선택)
  
  액션_버튼:
    - 조회 버튼 (우상단)
    - 엑셀 다운로드 버튼
    - 초기화 버튼
  
  데이터_영역:
    - DxDataGrid (메인 그리드)
    - OwPagination (하단 페이징)
  
  추가_기능:
    - OwMorePopup (더보기 필터)
    - 일괄 처리 버튼
```

### 2. 입력/수정 화면 패턴
```yaml
구성_요소:
  헤더_영역:
    - 화면 제목
    - 필수 입력 안내
  
  입력_폼:
    - OwInput (텍스트 입력)
    - OwFormDate (날짜 입력)
    - OwFormSelect (선택 입력)
    - OwFormCheckbox (옵션 선택)
    - OwTinyEditor (상세 내용)
  
  액션_버튼:
    - 저장 버튼
    - 취소 버튼
    - 임시저장 버튼
```

### 3. 팝업 화면 패턴
```yaml
구성_요소:
  팝업_프레임:
    - OwPopup (기본 컨테이너)
  
  팝업_내용:
    - 간단한 폼 구성
    - 조회 결과 표시
    - 확인 메시지
  
  팝업_액션:
    - 확인/취소 버튼
    - 추가 액션 버튼
```

---

## 📋 AI 활용 체크리스트

### 컴포넌트 선택 시 확인사항:
- [ ] 화면 유형 파악 (조회/입력/상세/팝업)
- [ ] 필요한 기능 목록 확인
- [ ] 적절한 컴포넌트 매칭
- [ ] Props 설정값 결정
- [ ] 이벤트 핸들러 구현
- [ ] 레이아웃 구성 확인

### 코드 생성 시 필수사항:
- [ ] Vue 3 Composition API 사용
- [ ] TypeScript 타입 정의
- [ ] 컴포넌트 import 정확성
- [ ] v-model 양방향 바인딩
- [ ] 이벤트 핸들러 구현
- [ ] 스타일 scoped 적용

### 사양서 작성 시 포함사항:
- [ ] 화면 개요 및 목적
- [ ] 컴포넌트 구성 상세
- [ ] 데이터 모델 정의
- [ ] API 연동 명세
- [ ] 동작 시나리오
- [ ] 검증 규칙