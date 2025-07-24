# OWS 프론트엔드 개발 표준 가이드

> OSSTEM IMPLANT OW시스템 프론트엔드 개발을 위한 종합 표준 가이드
> Vue 3 + TypeScript + OWS UI 컴포넌트 기반 프론트엔드 개발 표준

## 📌 목차

1. [개요](#1-개요)
2. [기술 스택](#2-기술-스택)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [Vue 3 개발 표준](#4-vue-3-개발-표준)
5. [OWS 컴포넌트 활용](#5-ows-컴포넌트-활용)
6. [명명 규칙](#6-명명-규칙)
7. [코딩 스타일](#7-코딩-스타일)
8. [주석 작성 규칙](#8-주석-작성-규칙)
9. [접근성 및 웹 표준](#9-접근성-및-웹-표준)
10. [성능 최적화](#10-성능-최적화)

---

## 1. 개요

### 1.1. 문서 목적
본 문서는 OSSTEM IMPLANT OW시스템 프론트엔드 개발의 단일 표준을 제공하여 일관되며 가독성 높은 UI 코드 개발과 효율적인 유지보수를 수행할 수 있는 체계를 제공합니다.

### 1.2. 적용 범위
- **프로젝트**: OSSTEM IMPLANT OW시스템 전체
- **기술 스택**: Vue 3 + TypeScript + OWS UI 컴포넌트
- **개발자**: OW시스템 프론트엔드 개발 참여 인원 전체

---

## 2. 기술 스택

### 2.1. 핵심 기술
- **프레임워크**: Vue 3.4 (Composition API)
- **언어**: TypeScript 5
- **빌드 도구**: Vite 4
- **상태 관리**: Pinia
- **라우터**: Vue Router 4
- **스타일**: SCSS (Sass)

### 2.2. UI 라이브러리
- **@ows/ui v2.5.7**: OWS 컴포넌트 (60개+ 전체 문서화 완료)
- **Bootstrap 5.3**: 기본 스타일 시스템
- **DevExtreme 22.2**: 고급 데이터 그리드 컴포넌트

### 2.3. 개발 도구
- **패키지 관리**: npm/yarn
- **린팅**: ESLint + Prettier
- **테스트**: Vitest (단위 테스트), Cypress/Playwright (E2E)
- **접근성 검사**: Lighthouse, axe-core

---

## 3. 디렉토리 구조

### 3.1. 전체 프로젝트 구조 (WEB 프로젝트)
화면 코딩(정적) 요소에 대한 소스 디렉토리는 `<PROJECT_HOME>/packages/main/src` 이하에 위치합니다.

```
packages/main/src/
├── assets/          # 정적 파일 및 이미지 자원
│   ├── images/      # 이미지 파일
│   ├── fonts/       # 폰트 파일
│   └── icons/       # 아이콘 파일
├── components/      # 재사용 가능한 Vue 컴포넌트
│   ├── common/      # 공통 컴포넌트
│   ├── layout/      # 레이아웃 컴포넌트
│   └── ui/          # UI 컴포넌트
├── composables/     # Composition API 로직
│   ├── api/         # API 관련 composables
│   ├── store/       # Pinia 스토어
│   └── utils/       # 유틸리티 composables
├── pages/           # Vue Router 페이지 컴포넌트
│   ├── {업무코드}/   # 업무별 페이지 (sal, tsk 등)
│   └── common/      # 공통 페이지
├── scss/            # SCSS 스타일 파일
│   ├── abstracts/   # 변수, 믹스인, 함수
│   ├── base/        # 기본 스타일, 리셋
│   ├── components/  # 컴포넌트별 스타일
│   ├── layout/      # 레이아웃 스타일
│   ├── pages/       # 페이지별 스타일
│   └── styles.scss  # 메인 스타일 파일
├── utils/           # 유틸리티 함수 (비상태 관리)
│   ├── api.ts       # API 유틸리티
│   ├── date.ts      # 날짜 유틸리티
│   ├── format.ts    # 포맷 유틸리티
│   └── validation.ts # 검증 유틸리티
└── messages/        # Vue-I18n 메시지
    ├── ko.json      # 한국어 메시지
    └── en.json      # 영어 메시지
```

### 3.2. 디렉토리별 상세 설명

| 디렉토리 | 설명 |
|---------|------|
| `/assets` | 정적 파일 및 이미지 자원들을 저장하는 디렉토리<br>이미지, 폰트 등의 정적인 자원을 보관하는 용도로 사용<br>images/, fonts/ 등과 같은 하위 디렉토리 포함 |
| `/composables` | Composition API를 사용하여 만든 로직들을 저장하는 디렉토리<br>상태 관리를 위한 Pinia도 포함 가능<br>로직이나 훅을 구성하는 파일들 포함 |
| `/components` | Vue 컴포넌트들을 저장하는 디렉토리<br>프로젝트에서 사용되는 각각의 재사용 가능한 컴포넌트들을 위치<br>전역 컴포넌트로 등록한 컴포넌트들은 ./exports/index.js에 등록 |
| `/messages` | Vue-I18n의 메시지를 저장하는 디렉토리 |
| `/pages` | Vue Router에서 사용되는 페이지 컴포넌트를 저장하는 디렉토리<br>각각의 페이지에 해당하는 Vue 파일들이 위치 |
| `/scss` | SCSS(Sass) 파일들을 저장하는 디렉토리<br>프로젝트의 전반적인 스타일링이나 변수, 믹스인을 정의<br>styles.module.scss로 설정하여 CSS Module로 사용 권장 |
| `/utils` | 프로젝트 내부에서 사용되는 유틸리티 함수들이나 헬퍼 함수들을 저장<br>재사용 가능한 함수들을 모아두어 코드의 중복을 방지하고 유지보수성을 높임<br>보통 상태 관리를 하지 않는(비 상태 관리) 함수들을 utils로 생성 |

---

## 4. Vue 3 개발 표준

### 4.1. 기본 원칙
- **Composition API**: `<script setup>` 문법을 기본으로 사용
- **TypeScript**: 모든 컴포넌트는 TypeScript로 작성
- **단일 파일 컴포넌트**: .vue 파일에 template, script, style을 통합
- **반응형 API**: `ref`, `reactive`, `computed`, `watch` 등을 필요에 따라 구분 사용

### 4.2. 컴포넌트 구조 템플릿

```vue
<template>
  <!-- 반드시 루트 요소 하나로 시작 -->
  <section class="employee-detail" role="main">
    <header class="employee-detail__header">
      <h2 class="employee-detail__title">{{ employee.name }}</h2>
    </header>
    
    <main class="employee-detail__content">
      <p class="employee-detail__position">{{ employee.position }}</p>
      
      <!-- OWS 컴포넌트 사용 예시 -->
      <OwInput
        v-model="employee.email"
        placeholder="이메일을 입력하세요"
        :readonly="isReadonly"
      />
      
      <DxDataGrid
        :data-source="employeeList"
        :columns="gridColumns"
        :selection="{ mode: 'single' }"
        @selection-changed="onSelectionChanged"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { OwInput } from '@ows/ui'
import { DxDataGrid } from 'devextreme-vue/data-grid'

// TypeScript 인터페이스 정의
interface Employee {
  id: number
  name: string
  position: string
  email: string
}

// Props 정의
interface Props {
  employeeId: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// Emits 정의
interface Emits {
  (e: 'update', employee: Employee): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

// 반응형 데이터
const employee = ref<Employee>({
  id: 0,
  name: '',
  position: '',
  email: ''
})

const employeeList = ref<Employee[]>([])

// Computed
const isReadonly = computed(() => props.readonly)

const gridColumns = computed(() => [
  { dataField: 'name', caption: '이름' },
  { dataField: 'position', caption: '직급' },
  { dataField: 'email', caption: '이메일' }
])

// 메서드
const fetchEmployee = async (): Promise<void> => {
  try {
    // API 호출 로직
    const response = await employeeApi.getEmployee(props.employeeId)
    employee.value = response.data
  } catch (error) {
    console.error('직원 정보 조회 실패:', error)
  }
}

const onSelectionChanged = (e: any): void => {
  const selectedEmployee = e.selectedRowsData[0]
  if (selectedEmployee) {
    emit('update', selectedEmployee)
  }
}

// 라이프사이클
onMounted(() => {
  fetchEmployee()
})
</script>

<style scoped lang="scss">
.employee-detail {
  padding: 1.25rem; // 20px
  
  &__header {
    margin-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 0.75rem;
  }
  
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  &__position {
    font-size: 1rem;
    color: #6c757d;
    margin: 0;
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .employee-detail {
    padding: 1rem;
    
    &__title {
      font-size: 1.25rem;
    }
  }
}
</style>
```

### 4.3. Composition API 활용 가이드

#### 4.3.1. 반응형 데이터 선택 기준
- **ref**: 원시 타입, 단일 객체
- **reactive**: 복잡한 객체, 배열
- **computed**: 의존성이 있는 계산된 값
- **watch**: 데이터 변경 감지 및 부수 효과

```typescript
// 올바른 사용 예시
const count = ref(0)                    // 원시 타입
const user = ref<User | null>(null)     // 단일 객체
const form = reactive({                 // 복잡한 객체
  name: '',
  email: '',
  age: 0
})

const fullName = computed(() =>         // 계산된 값
  `${form.firstName} ${form.lastName}`
)

watch(count, (newVal, oldVal) => {      // 데이터 변경 감지
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})
```

---

## 5. OWS 컴포넌트 활용

### 5.1. OWS 컴포넌트 import 및 사용

```typescript
// 개별 컴포넌트 import (권장)
import {
  OwInput,
  OwBizDatePicker,
  OwStateFilter,
  OwFormSelect,
  OwPopup,
  OwPagination
} from '@ows/ui'

// DevExtreme 컴포넌트
import { 
  DxDataGrid, 
  DxColumn,
  DxSelection,
  DxPaging
} from 'devextreme-vue/data-grid'

// Bootstrap Vue 컴포넌트
import { 
  BButton,
  BBadge,
  BCard
} from 'bootstrap-vue-next'
```

### 5.2. 주요 OWS 컴포넌트 사용 패턴

#### 5.2.1. 필터 영역 구성
```vue
<template>
  <div class="filter-section">
    <!-- 날짜 범위 선택 -->
    <OwBizDatePicker
      v-model="filters.dateRange"
      :range-unit="'day'"
      :twice="true"
      @change="handleDateChange"
    />
    
    <!-- 상태 필터 -->
    <OwStateFilter
      v-model="filters.selectedStates"
      :options="stateOptions"
    />
    
    <!-- 드롭다운 선택 -->
    <OwFormSelect
      v-model="filters.categoryId"
      :options="categoryOptions"
      placeholder="카테고리 선택"
    />
    
    <!-- 조직 선택 -->
    <OwFormOrg
      v-model="filters.selectedOrg"
      type="user"
      :multiple="false"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const filters = reactive({
  dateRange: {
    from: '2024-01-01',
    to: '2024-01-31'
  },
  selectedStates: ['ACTIVE'],
  categoryId: null,
  selectedOrg: null
})

const stateOptions = [
  { title: '활성', stateCount: 10, code: 'ACTIVE' },
  { title: '비활성', stateCount: 5, code: 'INACTIVE' }
]

const categoryOptions = [
  { text: '전체', value: null },
  { text: '카테고리1', value: 'CAT001' },
  { text: '카테고리2', value: 'CAT002' }
]
</script>
```

#### 5.2.2. 데이터 그리드 구성
```vue
<template>
  <div class="grid-section">
    <DxDataGrid
      :data-source="gridData"
      :columns="gridColumns"
      :selection="{ mode: 'multiple' }"
      :paging="{ pageSize: 20 }"
      :scrolling="{ mode: 'virtual' }"
      @selection-changed="onSelectionChanged"
    >
      <!-- 상태 컬럼 커스텀 템플릿 -->
      <DxColumn 
        data-field="status" 
        caption="상태"
        cell-template="statusTemplate"
      />
      <template #statusTemplate="{ data }">
        <BBadge :variant="getStatusVariant(data.value)">
          {{ getStatusText(data.value) }}
        </BBadge>
      </template>
      
      <!-- 액션 컬럼 -->
      <DxColumn 
        caption="작업"
        :width="120"
        cell-template="actionTemplate"
      />
      <template #actionTemplate="{ data }">
        <BButton 
          size="sm" 
          variant="primary"
          @click="editRow(data.data)"
        >
          수정
        </BButton>
        <BButton 
          size="sm" 
          variant="danger"
          class="ms-1"
          @click="deleteRow(data.data)"
        >
          삭제
        </BButton>
      </template>
    </DxDataGrid>
    
    <!-- 페이지네이션 -->
    <OwPagination
      v-model="currentPage"
      :total-count="totalCount"
      :page-size="pageSize"
      @change="handlePageChange"
    />
  </div>
</template>
```

#### 5.2.3. 팝업 구성
```vue
<template>
  <OwPopup
    v-model="showPopup"
    title="사용자 정보 수정"
    size="lg"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleSave">
      <div class="mb-3">
        <label class="form-label">이름</label>
        <OwInput 
          v-model="form.name" 
          placeholder="이름을 입력하세요"
          :rules="nameRules"
        />
      </div>
      
      <div class="mb-3">
        <label class="form-label">이메일</label>
        <OwInput 
          v-model="form.email" 
          type="email"
          placeholder="이메일을 입력하세요"
          :rules="emailRules"
        />
      </div>
      
      <div class="mb-3">
        <label class="form-label">부서</label>
        <OwFormSelect
          v-model="form.departmentId"
          :options="departmentOptions"
          placeholder="부서를 선택하세요"
        />
      </div>
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

## 6. 명명 규칙

### 6.1. 컴포넌트 명명 규칙
- **PascalCase** 사용 (`MyComponent.vue`)
- 단어는 의미 기반으로, 가능한 **풀네임**을 사용
- 복합어는 CamelCase 사용

| Postfix | 유형 | 사용 예 | 비고 |
|---------|------|---------|------|
| Main | 메인 화면 | `EmployeeMain.vue` | 업무 메인 페이지 |
| List | 목록 조회 | `EmployeeList.vue` | 목록 화면 |
| Detail | 상세 조회 | `EmployeeDetail.vue` | 상세 화면 |
| Form | 등록/수정 | `EmployeeForm.vue` | 폼 화면 |
| Popup | 팝업 | `EmployeePopup.vue` | 팝업 화면 |
| Search | 검색 | `EmployeeSearch.vue` | 검색 화면 |

### 6.2. 변수 및 함수 명명 규칙

#### 6.2.1. 변수명
```typescript
// camelCase 사용
const userId = ref('')
const employeeList = ref([])
const isLoading = ref(false)
const hasPermission = computed(() => true)

// Boolean 변수는 is, has, can, should 등으로 시작
const isVisible = ref(true)
const hasData = computed(() => data.length > 0)
const canEdit = computed(() => user.role === 'admin')
const shouldShow = computed(() => isVisible.value && hasData.value)
```

#### 6.2.2. 함수명
```typescript
// 동사로 시작하는 camelCase 사용
const fetchEmployees = async () => {}
const handleSubmit = () => {}
const validateForm = () => {}
const toggleVisibility = () => {}

// 이벤트 핸들러는 handle 또는 on으로 시작
const handleClick = () => {}
const onInputChange = () => {}
const handleFormSubmit = () => {}
```

### 6.3. CSS 클래스 명명 규칙

#### 6.3.1. BEM 방법론 적용
```scss
// Block-Element-Modifier 패턴
.employee-card {           // Block
  &__header {              // Element
    &--highlighted {       // Modifier
      background: #f8f9fa;
    }
  }
  
  &__content {
    padding: 1rem;
  }
  
  &--compact {             // Block Modifier
    padding: 0.5rem;
  }
}
```

#### 6.3.2. HTML ID/CLASS는 kebab-case
```html
<!-- HTML 속성은 kebab-case -->
<div id="employee-detail" class="employee-card employee-card--compact">
  <header class="employee-card__header employee-card__header--highlighted">
    <h2 class="employee-card__title">직원 정보</h2>
  </header>
</div>
```

---

## 7. 코딩 스타일

### 7.1. 템플릿 스타일
- **태그 들여쓰기**: 2칸 공백 (Space 2)
- **태그 속성**: 한 줄에 1~2개로 제한, 3개 이상이면 줄바꿈
- **태그 속성 따옴표**: 큰따옴표 `"` 사용
- **루트 요소**: 반드시 하나의 루트 요소로 시작
- **WAI-ARIA 속성**: 접근성을 위해 적극 적용

```html
<!-- 올바른 예시 -->
<template>
  <section 
    class="employee-list" 
    role="main"
    aria-label="직원 목록"
  >
    <header class="employee-list__header">
      <h1 class="employee-list__title">직원 관리</h1>
    </header>
    
    <main class="employee-list__content">
      <OwInput
        v-model="searchKeyword"
        placeholder="검색어를 입력하세요"
        aria-label="직원 검색"
        @input="handleSearch"
      />
    </main>
  </section>
</template>
```

### 7.2. 스크립트 스타일
- **script setup 문법**: 기본 사용
- **import 순서**: Vue → 써드파티 → 로컬 순서
- **타입 정의**: 인터페이스를 상단에 정의
- **들여쓰기**: 2칸 공백

```typescript
<script setup lang="ts">
// 1. Vue 관련 import
import { ref, reactive, computed, onMounted } from 'vue'

// 2. 써드파티 라이브러리 import
import { OwInput, OwButton } from '@ows/ui'
import dayjs from 'dayjs'

// 3. 로컬 import
import { employeeApi } from '@/api/employee'
import { useAuth } from '@/composables/auth'

// 4. 타입 정의
interface Employee {
  id: number
  name: string
  email: string
}

interface Props {
  initialData?: Employee[]
}

// 5. Props 및 Emits
const props = withDefaults(defineProps<Props>(), {
  initialData: () => []
})

const emit = defineEmits<{
  (e: 'update', employees: Employee[]): void
}>()

// 6. Composables
const { user, hasPermission } = useAuth()

// 7. 반응형 데이터
const employees = ref<Employee[]>([])
const isLoading = ref(false)

// 8. Computed
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => emp.name.includes(searchKeyword.value))
})

// 9. 메서드
const fetchEmployees = async (): Promise<void> => {
  // 구현...
}

// 10. 라이프사이클
onMounted(() => {
  fetchEmployees()
})
</script>
```

### 7.3. 스타일 가이드
- **CSS 전처리기**: SCSS (Sass) 사용 권장
- **Scoped CSS**: 컴포넌트별 스타일 격리
- **CSS-in-JS 지양**: 가능하면 SCSS 분리 사용
- **단위**: rem 기반 레이아웃, px 고정 영역, vw/vh 반응형

```scss
<style scoped lang="scss">
// 변수 정의
$primary-color: #007bff;
$border-radius: 0.375rem;
$spacing-base: 1rem;

.employee-list {
  padding: $spacing-base * 1.25; // 20px
  
  &__header {
    margin-bottom: $spacing-base;
    padding-bottom: $spacing-base * 0.75;
    border-bottom: 1px solid #e9ecef;
  }
  
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }
  
  &__content {
    display: grid;
    gap: $spacing-base;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .employee-list {
    padding: $spacing-base;
    
    &__content {
      grid-template-columns: 1fr;
    }
  }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
  .employee-list {
    background-color: #1a1a1a;
    color: #ffffff;
  }
}
</style>
```

---

## 8. 주석 작성 규칙

### 8.1. 주석 작성 원칙
- 반드시 **의미 있는 설명**을 남길 것
- `//` 단일 라인, `/** */` 블록 주석 형식 모두 허용
- 한국어로 작성 (기술 용어는 한글과 영어 병기)

### 8.2. 스크립트 주석
```typescript
// 사용자 이름 초기화
const userName = ref('')

/**
 * 유저 정보를 서버에서 불러옵니다.
 * 
 * @param userId - 사용자 ID
 * @returns Promise<User> 사용자 정보
 */
const fetchUser = async (userId: string): Promise<User> => {
  try {
    const response = await userApi.getUser(userId)
    return response.data
  } catch (error) {
    // TODO: 에러 처리 개선 필요
    console.error('사용자 조회 실패:', error)
    throw error
  }
}

// 계산된 속성: 사용자 전체 이름 (성 + 이름)
const fullName = computed(() => {
  return `${user.value.lastName} ${user.value.firstName}`
})
```

### 8.3. 템플릿 주석
```html
<template>
  <div class="user-profile">
    <!-- 사용자 프로필 헤더 -->
    <header class="user-profile__header">
      <h2>{{ user.name }}</h2>
    </header>
    
    <!-- 사용자 상세 정보 카드 -->
    <UserProfileCard :user="user" />
    
    <!-- TODO: 사용자 권한 관리 섹션 추가 예정 -->
  </div>
</template>
```

### 8.4. TODO/FIXME 형식
향후 작업 항목은 `TODO`, 수정 필요 지점은 `FIXME`로 명시

```typescript
// TODO: 입력값 유효성 검사 추가
const validateInput = (value: string) => {
  return value.length > 0
}

// FIXME: 오류 발생 시 로딩 스피너 중지되지 않음
const handleError = (error: Error) => {
  isLoading.value = false // 이 부분이 실행되지 않는 케이스 있음
  console.error(error)
}
```

---

## 9. 접근성 및 웹 표준

### 9.1. 접근성 기본 원칙
- **WAI-ARIA 속성** 적극 적용
- **시맨틱 HTML** 요소 사용
- **키보드 네비게이션** 지원
- **스크린 리더** 호환성 확보

### 9.2. ARIA 속성 활용
```html
<template>
  <nav class="main-navigation" role="navigation" aria-label="주 메뉴">
    <ul>
      <li>
        <a 
          href="/employees" 
          aria-current="page"
          aria-describedby="nav-help"
        >
          직원 관리
        </a>
      </li>
    </ul>
  </nav>
  
  <main role="main" aria-labelledby="page-title">
    <h1 id="page-title">직원 목록</h1>
    
    <section aria-label="검색 필터">
      <OwInput
        v-model="searchKeyword"
        placeholder="직원 이름을 입력하세요"
        aria-label="직원 검색"
        aria-describedby="search-help"
      />
      <div id="search-help" class="sr-only">
        직원 이름의 일부만 입력해도 검색됩니다
      </div>
    </section>
    
    <section aria-live="polite" aria-label="검색 결과">
      <div v-if="isLoading" aria-live="assertive">
        검색 중입니다...
      </div>
      
      <div v-else-if="employees.length === 0">
        검색 결과가 없습니다.
      </div>
      
      <ul v-else role="list">
        <li v-for="employee in employees" :key="employee.id" role="listitem">
          {{ employee.name }}
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
/* 스크린 리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

### 9.3. 키보드 네비게이션
```vue
<template>
  <div class="modal" @keydown.esc="closeModal">
    <div 
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
      ref="modalRef"
    >
      <h2 id="modal-title">모달 제목</h2>
      
      <div class="modal-body">
        <button 
          ref="firstFocusableElement"
          @click="handleAction"
          @keydown.tab="handleTabKey"
        >
          첫 번째 버튼
        </button>
        
        <button 
          ref="lastFocusableElement"
          @click="closeModal"
          @keydown.tab.shift="handleShiftTabKey"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

const modalRef = ref<HTMLElement>()
const firstFocusableElement = ref<HTMLElement>()
const lastFocusableElement = ref<HTMLElement>()

const closeModal = () => {
  emit('close')
}

const handleTabKey = (event: KeyboardEvent) => {
  if (event.target === lastFocusableElement.value) {
    event.preventDefault()
    firstFocusableElement.value?.focus()
  }
}

const handleShiftTabKey = (event: KeyboardEvent) => {
  if (event.target === firstFocusableElement.value) {
    event.preventDefault()
    lastFocusableElement.value?.focus()
  }
}

onMounted(async () => {
  await nextTick()
  firstFocusableElement.value?.focus()
})
</script>
```

### 9.4. 접근성 검사 도구
- **Lighthouse**: 성능 및 접근성 자동 검사
- **axe-core**: 상세한 접근성 검사
- **WAVE**: 웹 접근성 평가 도구

> **중요**: K-WAH는 SPA에 적합하지 않으므로 Lighthouse 및 axe-core 기반 접근성 검사 도구를 사용합니다.

---

## 10. 성능 최적화

### 10.1. 컴포넌트 최적화

#### 10.1.1. Lazy Loading
```typescript
// 페이지 컴포넌트 지연 로딩
const routes = [
  {
    path: '/employees',
    component: () => import('@/pages/employee/EmployeeList.vue')
  },
  {
    path: '/employees/:id',
    component: () => import('@/pages/employee/EmployeeDetail.vue')
  }
]

// 컴포넌트 조건부 로딩
<template>
  <div>
    <Suspense>
      <template #default>
        <AsyncComponent v-if="shouldLoad" />
      </template>
      <template #fallback>
        <div>로딩 중...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)
</script>
```

#### 10.1.2. 메모화 및 최적화
```typescript
// computed 메모화 활용
const expensiveValue = computed(() => {
  // 복잡한 계산 로직
  return heavyCalculation(props.data)
})

// v-memo를 활용한 템플릿 메모화
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.name]">
    <ExpensiveChildComponent :data="item" />
  </div>
</template>

// shallowRef를 활용한 대용량 데이터 최적화
import { shallowRef } from 'vue'

const largeDataSet = shallowRef([])

// 불필요한 반응성 제거
const staticData = markRaw({
  config: { /* 정적 설정 */ }
})
```

### 10.2. 번들 최적화

#### 10.2.1. 코드 스플리팅
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ows: ['@ows/ui'],
          devextreme: ['devextreme-vue']
        }
      }
    }
  }
})
```

#### 10.2.2. Tree Shaking 최적화
```typescript
// 필요한 컴포넌트만 import
import { OwInput, OwButton } from '@ows/ui'

// 전체 라이브러리 import 지양
// import * as OwsUI from '@ows/ui' // ❌

// 유틸리티 함수도 개별 import
import { debounce } from 'lodash-es/debounce'
// import _ from 'lodash' // ❌
```

### 10.3. 이미지 및 에셋 최적화

```vue
<template>
  <!-- 반응형 이미지 -->
  <picture>
    <source 
      media="(max-width: 767px)" 
      srcset="/images/hero-mobile.webp"
      type="image/webp"
    >
    <source 
      media="(min-width: 768px)" 
      srcset="/images/hero-desktop.webp"
      type="image/webp"
    >
    <img 
      src="/images/hero-fallback.jpg" 
      alt="메인 이미지"
      loading="lazy"
      decoding="async"
    >
  </picture>
  
  <!-- 아이콘은 SVG 스프라이트 활용 -->
  <svg class="icon">
    <use href="#icon-user" />
  </svg>
</template>

<style scoped>
/* CSS 변수를 활용한 동적 스타일링 */
.dynamic-component {
  --primary-color: v-bind(primaryColor);
  --spacing: v-bind(spacing + 'px');
  
  color: var(--primary-color);
  padding: var(--spacing);
}
</style>
```

---

## 부록: 추가 고려사항

### A.1. 개발 도구 설정

#### A.1.1. ESLint 설정
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'warn'
  }
}
```

#### A.1.2. Prettier 설정
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "vueIndentScriptAndStyle": true
}
```

### A.2. 테스트 가이드라인

#### A.2.1. 단위 테스트 (Vitest)
```typescript
// EmployeeCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import EmployeeCard from '@/components/EmployeeCard.vue'

describe('EmployeeCard', () => {
  it('직원 정보를 올바르게 표시한다', () => {
    const employee = {
      id: 1,
      name: '홍길동',
      position: '개발자'
    }
    
    const wrapper = mount(EmployeeCard, {
      props: { employee }
    })
    
    expect(wrapper.text()).toContain('홍길동')
    expect(wrapper.text()).toContain('개발자')
  })
})
```

### A.3. 보안 고려사항

#### A.3.1. XSS 방지
```vue
<template>
  <!-- 사용자 입력 데이터는 항상 이스케이프 -->
  <div>{{ userInput }}</div>
  
  <!-- v-html 사용 시 주의 -->
  <div v-html="sanitizedHtml"></div>
</template>

<script setup>
import DOMPurify from 'dompurify'

const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(rawHtml.value)
})
</script>
```

#### A.3.2. 민감 정보 처리
```typescript
// 민감 정보는 환경 변수로 관리
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY

// 로컬 스토리지에 민감 정보 저장 금지
// sessionStorage.setItem('password', password) // ❌

// 토큰은 httpOnly 쿠키 또는 메모리에만 보관
const token = ref('')
```

---

이 가이드를 기반으로 일관되고 품질 높은 OW시스템 프론트엔드 코드를 개발하시기 바랍니다.