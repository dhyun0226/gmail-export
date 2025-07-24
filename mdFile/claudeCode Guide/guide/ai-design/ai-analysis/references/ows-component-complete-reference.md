# OWS 컴포넌트 완전 레퍼런스 가이드

> AI 화면 분석 및 코드 생성을 위한 완전한 OWS 컴포넌트 레퍼런스
> 
> **최종 업데이트**: 2025.01
> **문서화 완성도**: 100% (60개 이상 컴포넌트 전체 문서화)

## 📌 목차

1. [컴포넌트 선택 가이드](#컴포넌트-선택-가이드)
2. [날짜/시간 컴포넌트](#날짜시간-컴포넌트)
3. [폼 입력 컴포넌트](#폼-입력-컴포넌트)
4. [필터링 컴포넌트](#필터링-컴포넌트)
5. [레이아웃/팝업 컴포넌트](#레이아웃팝업-컴포넌트)
6. [데이터 표시 컴포넌트](#데이터-표시-컴포넌트)
7. [특수 목적 컴포넌트](#특수-목적-컴포넌트)
8. [화면 패턴별 컴포넌트 조합](#화면-패턴별-컴포넌트-조합)

---

## 🎯 컴포넌트 선택 가이드

### 📅 날짜 선택이 필요한 경우

| 요구사항 | 추천 컴포넌트 | 이유 |
|---------|--------------|------|
| 단일 날짜 선택 | `OwFormDate` | 간단한 날짜 입력 |
| 날짜 범위 선택 | `OwFormDateRange` | 시작일~종료일 선택 |
| 업무용 조회 기간 (일/주/월/년) | `OwBizDatePicker` | 단위별 빠른 선택 |
| 특정 날짜 제외 필요 | `OwBizDatePickerRangeExcluedPickVer2` | 휴일/제외일 설정 |
| 달력 뷰 필요 | `OwCalendar` | 월별 일정 표시 |

### 📝 입력 필드가 필요한 경우

| 요구사항 | 추천 컴포넌트 | 이유 |
|---------|--------------|------|
| 일반 텍스트 입력 | `OwInput` | 기본 텍스트 입력 |
| 숫자만 입력 | `OwFormInputNumber` | 숫자 검증 내장 |
| 시간 입력 | `OwFormInputTime` | 시간 형식 자동 처리 |
| 색상 선택 | `OwFormInputColor` | 색상 피커 제공 |
| 드롭다운 선택 | `OwFormSelect` | 옵션 목록에서 선택 |
| 검색 가능한 드롭다운 | `OwFormDropdown` | 검색 기능 포함 |
| 조직/담당자 선택 | `OwFormOrg` | 조직도 트리 제공 |
| 태그 입력 | `OwFormTag` | 다중 태그 입력 |

### 🔍 필터링이 필요한 경우

| 요구사항 | 추천 컴포넌트 | 이유 |
|---------|--------------|------|
| 상태별 필터 (체크박스) | `OwStateFilter` | 다중 상태 선택 |
| 상태별 필터 (라디오) | `OwStateRadio` | 단일 상태 선택 |
| 복합 조건 필터 | `OwFormFilterGroup` | AND/OR 조건 조합 |

---

## 📅 날짜/시간 컴포넌트

### 🗂️ OwDatePicker 그룹 (기본 날짜 선택기)

#### OwDatePicker
**용도**: 기본 단일 날짜 선택
**사용 시나리오**: 생년월일, 기념일 등 단순 날짜 입력

```vue
<template>
  <OwDatePicker
    v-model="selectedDate"
    :min-date="minDate"
    :max-date="maxDate"
    placeholder="날짜를 선택하세요"
  />
</template>
```

#### OwDatePickerRange
**용도**: 날짜 범위 선택 (시작일~종료일)
**사용 시나리오**: 휴가 기간, 프로젝트 기간 설정

```vue
<template>
  <OwDatePickerRange
    v-model="dateRange"
    :min-date="minDate"
    :max-date="maxDate"
  />
</template>

<script setup>
const dateRange = ref({
  from: '2024-01-01',
  to: '2024-01-31'
});
</script>
```

#### OwFormDate
**용도**: 폼 내부용 날짜 입력 필드
**사용 시나리오**: 회원가입 폼, 주문 폼 등의 날짜 필드
**특징**: 라벨, 검증, 에러 메시지 통합

```vue
<template>
  <OwFormDate
    v-model="birthDate"
    label="생년월일"
    :rules="dateRules"
    :required="true"
  />
</template>
```

#### OwFormDateInput
**용도**: 키보드 입력 가능한 날짜 필드
**사용 시나리오**: 빠른 날짜 입력이 필요한 경우
**특징**: YYYY-MM-DD 형식 자동 포맷팅

```vue
<template>
  <OwFormDateInput
    v-model="inputDate"
    :mask="true"
    placeholder="YYYY-MM-DD"
  />
</template>
```

#### OwFormDateRange
**용도**: 폼 내부용 날짜 범위 선택
**사용 시나리오**: 검색 필터, 보고서 기간 설정

```vue
<template>
  <OwFormDateRange
    v-model="searchPeriod"
    label="조회 기간"
    :required="true"
  />
</template>
```

#### OwFormDateRangeInput
**용도**: 키보드 입력 가능한 날짜 범위 필드
**사용 시나리오**: 대량 데이터 입력 시 빠른 기간 설정

#### 하위 컴포넌트들 (내부 구성 요소)
- `OwDatePickerBar`: 날짜 선택기 상단 바
- `OwDatePickerButton`: 날짜 선택 버튼
- `OwDatePickerContainer`: 날짜 선택기 컨테이너
- `OwDatePickerDay`: 일 단위 선택 뷰
- `OwDatePickerWeek`: 주 단위 선택 뷰
- `OwDatePickerMonth`: 월 단위 선택 뷰
- `OwDatePickerYear`: 년 단위 선택 뷰
- `OwDatePickerTransition`: 뷰 전환 애니메이션
- `OwFormDatePickerTransition`: 폼용 전환 애니메이션

### 🗂️ OwBizDatePicker 그룹 (업무용 날짜 선택기)

#### OwBizDatePicker
**용도**: 업무 조회용 날짜 범위 선택 (일/주/월/년 단위)
**사용 시나리오**: 매출 조회, 실적 조회, 보고서 기간 설정
**특징**: 
- 단위별 빠른 선택 버튼
- 트와이스(2배) 버튼 지원
- 이번주/이번달/올해 등 빠른 선택

```vue
<template>
  <OwBizDatePicker
    v-model="searchRange"
    :range-unit="rangeUnit"
    :twice="true"
    :disabled-double="false"
    @change="handleSearch"
  />
</template>

<script setup>
const searchRange = ref({
  from: '2024-01-01',
  to: '2024-01-31'
});

const rangeUnit = ref('day'); // 'day' | 'week' | 'month' | 'year'
</script>
```

**AI 인식 패턴**:
- 필터 영역 상단에 위치
- "조회기간", "검색기간" 등의 레이블
- 일/주/월/년 단위 선택 버튼 그룹

#### OwBizDatePickerRange
**용도**: 기본 업무용 날짜 범위 선택
**사용 시나리오**: OwBizDatePicker의 기본형

#### OwBizDatePickerExcludePick
**용도**: 특정 날짜를 제외하고 선택
**사용 시나리오**: 영업일만 선택, 휴일 제외 선택

#### OwBizDatePickerRangeExcluedPick
**용도**: 날짜 범위 선택 시 특정 날짜 제외 (v1)
**사용 시나리오**: 정산 기간 설정 (휴일 제외)

#### OwBizDatePickerRangeExcluedPickVer2
**용도**: 날짜 범위 선택 시 특정 날짜 제외 (v2 - 개선 버전)
**사용 시나리오**: 
- 근무일 기준 조회
- 공휴일 제외 통계
- 특정 요일 제외 선택

```vue
<template>
  <OwBizDatePickerRangeExcluedPickVer2
    v-model="workingDays"
    :exclude-dates="holidays"
    :exclude-weekends="true"
    :range-unit="'day'"
  />
</template>

<script setup>
const holidays = ['2024-01-01', '2024-02-09', '2024-02-10'];
</script>
```

#### 하위 컴포넌트들 (내부 구성 요소)
- `OwBizDatePickerBar`: 업무용 날짜 선택기 상단 바
- `OwBizDatePickerBarChangeOrder`: 순서 변경 가능한 바
- `OwBizDatePickerBarWithoutTwice`: 트와이스 버튼 없는 바
- `OwBizDatePickerButton`: 업무용 날짜 선택 버튼
- `OwBizDatePickerContainer`: 업무용 날짜 선택기 컨테이너
- `OwBizDatePickerDay/Week/Month/Year`: 단위별 선택 뷰
- `OwBizDatePickerTransition`: 뷰 전환 애니메이션

---

## 📝 폼 입력 컴포넌트

### 🗂️ 기본 입력 컴포넌트

#### OwInput ⚠️
**용도**: 기본 텍스트 입력 필드
**사용 시나리오**: 이름, 제목, 설명 등 일반 텍스트 입력
**주의**: 현재 export 누락 - 수정 필요

```vue
<template>
  <OwInput
    v-model="userName"
    placeholder="이름을 입력하세요"
    :maxlength="50"
    :disabled="false"
    :readonly="false"
  />
</template>
```

#### OwFormInputNumber
**용도**: 숫자 전용 입력 필드
**사용 시나리오**: 수량, 금액, 전화번호 입력
**특징**:
- 숫자만 입력 가능
- min/max 범위 설정
- 천단위 콤마 자동 표시 옵션

```vue
<template>
  <OwFormInputNumber
    v-model="amount"
    :min="0"
    :max="999999999"
    :use-comma="true"
    placeholder="금액을 입력하세요"
  />
</template>
```

#### OwFormInputTime
**용도**: 시간 입력 필드
**사용 시나리오**: 근무 시간, 예약 시간 입력
**특징**: HH:MM 형식 자동 포맷팅

```vue
<template>
  <OwFormInputTime
    v-model="startTime"
    placeholder="HH:MM"
    :min-time="'09:00'"
    :max-time="'18:00'"
  />
</template>
```

#### OwFormInputColor
**용도**: 색상 선택 입력 필드
**사용 시나리오**: 테마 색상, 카테고리 색상 설정
**특징**: 색상 피커 팝업 제공

```vue
<template>
  <OwFormInputColor
    v-model="themeColor"
    :preset-colors="['#FF0000', '#00FF00', '#0000FF']"
  />
</template>
```

#### OwFormInputCheck
**용도**: 입력과 동시에 중복/유효성 체크
**사용 시나리오**: 아이디 중복 체크, 이메일 유효성 검증
**특징**: 체크 버튼과 상태 표시

```vue
<template>
  <OwFormInputCheck
    v-model="userId"
    :check-function="checkDuplicate"
    check-button-text="중복확인"
    placeholder="아이디를 입력하세요"
  />
</template>
```

### 🗂️ 선택 입력 컴포넌트

#### OwFormSelect
**용도**: 드롭다운 선택 필드
**사용 시나리오**: 카테고리, 부서, 상태 선택
**특징**:
- 단일/다중 선택
- 그룹화 지원
- 검색 기능 옵션

```vue
<template>
  <OwFormSelect
    v-model="selectedDept"
    :options="deptOptions"
    placeholder="부서를 선택하세요"
    :searchable="true"
    :multiple="false"
  />
</template>

<script setup>
const deptOptions = [
  { text: '개발팀', value: 'DEV' },
  { text: '기획팀', value: 'PLAN' },
  { text: '디자인팀', value: 'DESIGN' }
];
</script>
```

#### OwFormDropdown
**용도**: 고급 드롭다운 (검색, 필터링 기능 포함)
**사용 시나리오**: 대량 옵션에서 선택, 계층 구조 선택
**특징**:
- 실시간 검색
- 계층 구조 표시
- 커스텀 템플릿

```vue
<template>
  <OwFormDropdown
    v-model="selectedItem"
    :data-source="items"
    display-field="name"
    value-field="id"
    :filterable="true"
    :show-clear="true"
  />
</template>
```

### 🗂️ 체크박스/라디오 컴포넌트

#### OwFormCheckbox
**용도**: 단일 체크박스
**사용 시나리오**: 동의, 선택 옵션
**특징**: 라벨 일체형

```vue
<template>
  <OwFormCheckbox
    v-model="agreeTerms"
    label="이용약관에 동의합니다"
    :required="true"
  />
</template>
```

#### OwFormCheckboxGroup
**용도**: 체크박스 그룹 (다중 선택)
**사용 시나리오**: 관심사 선택, 권한 선택
**특징**:
- 가로/세로 배치
- 전체 선택 옵션

```vue
<template>
  <OwFormCheckboxGroup
    v-model="selectedHobbies"
    :options="hobbyOptions"
    :inline="true"
    :show-select-all="true"
  />
</template>
```

#### OwFormRadio
**용도**: 라디오 버튼 그룹 (단일 선택)
**사용 시나리오**: 성별, 등급, 타입 선택
**특징**: 배타적 선택

```vue
<template>
  <OwFormRadio
    v-model="gender"
    :options="genderOptions"
    name="gender"
    :inline="true"
  />
</template>

<script setup>
const genderOptions = [
  { text: '남성', value: 'M' },
  { text: '여성', value: 'F' },
  { text: '기타', value: 'O' }
];
</script>
```

### 🗂️ 특수 입력 컴포넌트

#### OwFormOrg
**용도**: 조직도/담당자 선택
**사용 시나리오**: 결재선 지정, 담당 부서 선택, 참조자 지정
**특징**:
- 조직도 트리 뷰
- 사용자/부서 동시 선택
- 다중 선택 지원

```vue
<template>
  <OwFormOrg
    v-model="approvers"
    :type="'user'"
    :multiple="true"
    :show-position="true"
    :max-selection="5"
    placeholder="결재자를 선택하세요"
  />
</template>
```

**AI 인식 패턴**:
- "담당자", "결재자", "참조" 등의 레이블
- 돋보기 아이콘 또는 조직도 아이콘
- 선택된 사용자 칩 표시

#### OwFormTag
**용도**: 태그 입력 (단일)
**사용 시나리오**: 키워드, 라벨 입력

```vue
<template>
  <OwFormTag
    v-model="tag"
    :suggestions="tagSuggestions"
    placeholder="태그를 입력하세요"
  />
</template>
```

#### OwFormTagGroup
**용도**: 태그 그룹 입력 (다중)
**사용 시나리오**: 해시태그, 키워드 목록
**특징**:
- Enter로 태그 추가
- 자동완성 지원
- 중복 방지

```vue
<template>
  <OwFormTagGroup
    v-model="tags"
    :max-tags="10"
    :allow-duplicates="false"
    :suggestions="availableTags"
    placeholder="태그를 입력하세요 (Enter로 추가)"
  />
</template>
```

#### OwFormTimePicker
**용도**: 시간 선택기
**사용 시나리오**: 회의 시간, 알림 시간 설정
**특징**: 시간 선택 UI 제공

```vue
<template>
  <OwFormTimePicker
    v-model="meetingTime"
    :minute-interval="15"
    :hour-format="24"
  />
</template>
```

#### OwFormTimePickerRange
**용도**: 시간 범위 선택
**사용 시나리오**: 근무 시간, 영업 시간 설정
**특징**: 시작/종료 시간 동시 선택

```vue
<template>
  <OwFormTimePickerRange
    v-model="businessHours"
    :min-duration="30"
    label="영업 시간"
  />
</template>

<script setup>
const businessHours = ref({
  start: '09:00',
  end: '18:00'
});
</script>
```

---

## 🔍 필터링 컴포넌트

### OwStateFilter
**용도**: 상태별 다중 필터 (체크박스 형태)
**사용 시나리오**: 주문 상태, 처리 상태별 필터링
**특징**:
- 각 상태별 카운트 표시
- 다중 선택 가능

```vue
<template>
  <OwStateFilter
    v-model="selectedStates"
    :options="stateOptions"
    @change="applyFilter"
  />
</template>

<script setup>
const stateOptions = ref([
  { title: '대기', stateCount: 15, code: 'WAIT' },
  { title: '진행중', stateCount: 23, code: 'PROGRESS' },
  { title: '완료', stateCount: 142, code: 'COMPLETE' },
  { title: '취소', stateCount: 5, code: 'CANCEL' }
]);
</script>
```

**AI 인식 패턴**:
- 체크박스 + 텍스트 + 숫자(카운트) 조합
- 필터 영역에 가로로 나열
- "전체" 옵션 포함

### OwStateRadio
**용도**: 상태별 단일 필터 (라디오 버튼 형태)
**사용 시나리오**: 배타적 상태 선택이 필요한 경우
**특징**: 한 번에 하나만 선택

```vue
<template>
  <OwStateRadio
    v-model="selectedStatus"
    :options="statusOptions"
    name="status-filter"
  />
</template>
```

### OwFormFilterGroup
**용도**: 복합 조건 필터 생성
**사용 시나리오**: 고급 검색, 복잡한 조건 조합
**특징**:
- AND/OR 조건 조합
- 중첩 그룹 지원
- 동적 필터 추가/삭제

```vue
<template>
  <OwFormFilterGroup
    v-model="filterConditions"
    :available-fields="searchFields"
    :max-depth="3"
    @apply="executeSearch"
  />
</template>

<script setup>
const filterConditions = ref({
  operator: 'AND',
  conditions: [
    { field: 'status', operator: 'IN', value: ['ACTIVE'] },
    { field: 'createdDate', operator: 'BETWEEN', value: { from: '2024-01-01', to: '2024-12-31' } }
  ]
});

const searchFields = [
  { name: 'status', type: 'select', label: '상태' },
  { name: 'createdDate', type: 'date', label: '생성일' },
  { name: 'amount', type: 'number', label: '금액' }
];
</script>
```

---

## 🎨 레이아웃/팝업 컴포넌트

### OwPopup
**용도**: 모달 팝업 (기본)
**사용 시나리오**: 상세 정보 표시, 입력 폼, 확인 다이얼로그
**특징**:
- 크기 조절 가능 (sm, md, lg, xl)
- 헤더/푸터 커스터마이징
- ESC 키 닫기 지원

```vue
<template>
  <OwPopup
    v-model="showPopup"
    title="사용자 정보 수정"
    size="lg"
    :close-on-backdrop="true"
    :hide-footer="false"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <!-- 팝업 내용 -->
    <div class="popup-content">
      <OwFormInput v-model="userData.name" label="이름" />
      <OwFormInput v-model="userData.email" label="이메일" />
    </div>
    
    <!-- 커스텀 푸터 -->
    <template #footer>
      <BButton variant="secondary" @click="showPopup = false">취소</BButton>
      <BButton variant="primary" @click="handleSave">저장</BButton>
    </template>
  </OwPopup>
</template>
```

**AI 인식 패턴**:
- 화면 중앙 오버레이
- X 닫기 버튼
- 확인/취소 버튼

### OwMorePopup
**용도**: 추가 옵션 팝업 (더보기 기능)
**사용 시나리오**: 고급 필터, 추가 설정, 숨겨진 메뉴
**특징**:
- 트리거 버튼 일체형
- 우측 슬라이드 애니메이션

```vue
<template>
  <OwMorePopup
    v-model="showMore"
    trigger-text="고급 옵션"
    width="400px"
  >
    <template #content>
      <!-- 추가 필터 옵션들 -->
      <div class="advanced-filters">
        <h4>고급 필터</h4>
        <!-- 필터 컴포넌트들 -->
      </div>
    </template>
  </OwMorePopup>
</template>
```

### OwReportPopup
**용도**: 보고서/리포트 전용 팝업
**사용 시나리오**: 인쇄용 미리보기, PDF 뷰어, 보고서 표시
**특징**:
- 인쇄 버튼 내장
- 전체화면 모드
- 페이지 네비게이션

```vue
<template>
  <OwReportPopup
    v-model="showReport"
    title="월간 매출 보고서"
    :printable="true"
    :downloadable="true"
    @print="handlePrint"
    @download="handleDownload"
  >
    <!-- 보고서 내용 -->
  </OwReportPopup>
</template>
```

### OwAlert
**용도**: 알림 메시지 표시
**사용 시나리오**: 성공/오류/경고 메시지, 시스템 공지
**특징**:
- 자동 사라짐 옵션
- 다양한 스타일 (success, warning, danger, info)

```vue
<template>
  <OwAlert
    v-if="showAlert"
    :variant="alertType"
    :dismissible="true"
    :auto-close="5000"
    @dismissed="showAlert = false"
  >
    <strong>{{ alertTitle }}</strong> {{ alertMessage }}
  </OwAlert>
</template>
```

---

## 📊 데이터 표시 컴포넌트

### OwCalendar
**용도**: 월별 캘린더 뷰
**사용 시나리오**: 일정 관리, 휴가 현황, 이벤트 캘린더
**특징**:
- 월/주 뷰 전환
- 이벤트 표시
- 드래그 앤 드롭

```vue
<template>
  <OwCalendar
    v-model:current-date="currentDate"
    :events="calendarEvents"
    :view-type="viewType"
    :editable="true"
    @event-click="handleEventClick"
    @date-click="handleDateClick"
    @event-drop="handleEventDrop"
  />
</template>

<script setup>
const calendarEvents = ref([
  {
    id: '1',
    title: '팀 회의',
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:00:00',
    color: '#3788d8'
  }
]);
</script>
```

### OwScheduler 그룹 (리소스 스케줄러)

#### OwSchedulerHeaderDateCell
**용도**: 스케줄러 헤더의 날짜 셀 커스터마이징
**사용 시나리오**: DevExtreme Scheduler와 함께 사용

#### OwSchedulerTimeCell
**용도**: 스케줄러의 시간 셀 커스터마이징
**사용 시나리오**: 시간대별 배경색, 업무 시간 표시

```vue
<template>
  <DxScheduler
    :data-source="appointments"
    :current-date="currentDate"
  >
    <DxResource
      :data-source="resources"
      field-expr="resourceId"
    />
    
    <!-- 커스텀 셀 템플릿 -->
    <template #dateCellTemplate="{ data }">
      <OwSchedulerHeaderDateCell :date-data="data" />
    </template>
    
    <template #timeCellTemplate="{ data }">
      <OwSchedulerTimeCell :time-data="data" />
    </template>
  </DxScheduler>
</template>
```

### OwPagination
**용도**: 페이지네이션 컴포넌트
**사용 시나리오**: 테이블 하단, 목록 하단 페이징
**특징**:
- 페이지 크기 변경
- 첫 페이지/마지막 페이지 이동
- 총 건수 표시

```vue
<template>
  <OwPagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total-count="totalItems"
    :page-sizes="[10, 20, 50, 100]"
    :max-pages="10"
    @change="handlePageChange"
  />
</template>

<script setup>
const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(485);

const handlePageChange = ({ page, size }) => {
  // 페이지 변경 시 데이터 재조회
  fetchData(page, size);
};
</script>
```

**AI 인식 패턴**:
- 테이블 하단에 위치
- 숫자 버튼 나열
- "<", ">" 화살표 버튼
- "1 / 25 페이지" 형태의 텍스트

---

## 🎯 특수 목적 컴포넌트

### OwActionPlan 그룹 (액션 플랜)

#### OwActionPlan
**용도**: 업무 계획/액션 아이템 관리
**사용 시나리오**: 프로젝트 태스크 관리, 할 일 목록
**특징**:
- 진행 상태 표시
- 담당자 할당
- 기한 관리

```vue
<template>
  <OwActionPlan
    v-model="actionItems"
    :editable="true"
    :show-progress="true"
    @item-update="handleItemUpdate"
    @item-complete="handleItemComplete"
  />
</template>

<script setup>
const actionItems = ref([
  {
    id: '1',
    title: 'UI 디자인 검토',
    assignee: '홍길동',
    dueDate: '2024-01-20',
    status: 'IN_PROGRESS',
    progress: 60
  }
]);
</script>
```

#### OwActionPlanAppointment
**용도**: 일정 기반 액션 플랜
**사용 시나리오**: 미팅 액션 아이템, 일정 연계 태스크

#### OwActionPlanSaleAppointment
**용도**: 영업 활동 계획
**사용 시나리오**: 고객 방문 일정, 영업 활동 관리

#### ActionPlanHeader
**용도**: 액션 플랜 헤더 (내부 컴포넌트)

### OwTinyEditor
**용도**: 리치 텍스트 에디터 (TinyMCE 기반)
**사용 시나리오**: 공지사항 작성, 상세 설명 입력, 이메일 템플릿
**특징**:
- 이미지 업로드
- 테이블 삽입
- 폰트/스타일 편집

```vue
<template>
  <OwTinyEditor
    v-model="content"
    :height="400"
    :toolbar="customToolbar"
    :plugins="plugins"
    :images-upload-url="'/api/upload/image'"
    @change="handleContentChange"
    @image-upload="handleImageUpload"
  />
</template>

<script setup>
const content = ref('<p>초기 내용</p>');

const customToolbar = 'undo redo | formatselect | bold italic underline | \
  alignleft aligncenter alignright | \
  bullist numlist outdent indent | \
  table image link | removeformat';

const plugins = ['table', 'image', 'link', 'lists', 'wordcount'];
</script>
```

**AI 인식 패턴**:
- 툴바가 있는 큰 입력 영역
- "내용", "상세설명", "본문" 등의 레이블
- 여러 줄 입력 가능한 영역

---

## 🎨 화면 패턴별 컴포넌트 조합

### 📋 목록 조회 화면

```yaml
필터_영역:
  - OwBizDatePicker         # 조회 기간
  - OwFormSelect           # 카테고리/분류
  - OwStateFilter          # 상태별 필터
  - OwFormOrg             # 담당자 필터
  - OwMorePopup           # 추가 필터 (더보기)

액션_버튼:
  - 조회 (primary)
  - 초기화 (secondary)
  - 엑셀 다운로드 (util)
  - 신규 등록 (add)

데이터_영역:
  - DxDataGrid            # 메인 데이터 그리드
  - OwPagination          # 페이지네이션

팝업:
  - OwPopup              # 상세 보기/수정 팝업
```

### 📝 등록/수정 화면

```yaml
헤더:
  - 제목
  - 필수 입력 안내 (*)

기본_정보:
  - OwInput               # 제목, 이름 등
  - OwFormSelect          # 분류, 타입
  - OwFormDate            # 날짜 입력
  - OwFormOrg             # 담당자 지정

상세_정보:
  - OwTinyEditor          # 상세 내용
  - OwFormTagGroup        # 태그/키워드
  - OwFormCheckboxGroup   # 옵션 선택

첨부_파일:
  - 파일 업로드 컴포넌트

액션_버튼:
  - 저장 (primary)
  - 취소 (secondary)
  - 임시저장 (util)
```

### 📊 대시보드 화면

```yaml
필터_영역:
  - OwBizDatePicker       # 조회 기간
  - OwFormSelect          # 부서/팀 선택

차트_영역:
  - DxChart 컴포넌트들
  - 통계 카드들

상세_데이터:
  - DxDataGrid            # 상세 데이터
  - OwCalendar            # 일정 표시
```

### 🗓️ 일정 관리 화면

```yaml
도구_영역:
  - OwBizDatePicker       # 날짜 이동
  - OwFormSelect          # 보기 모드
  - OwFormOrg             # 담당자 필터

메인_영역:
  - OwCalendar            # 캘린더 뷰
  또는
  - DxScheduler           # 스케줄러 뷰
    - OwSchedulerHeaderDateCell
    - OwSchedulerTimeCell

액션:
  - 일정 추가 (OwPopup)
  - 일정 수정 (OwPopup)
```

---

## 🤖 AI 컴포넌트 선택 가이드라인

### 화면 요소 → 컴포넌트 매핑

| 화면 요소 | 추천 컴포넌트 | 판단 기준 |
|----------|--------------|-----------|
| "조회기간", "검색기간" | `OwBizDatePicker` | 일/주/월/년 단위 버튼 존재 |
| 단순 날짜 입력 | `OwFormDate` | 달력 아이콘만 있음 |
| 드롭다운 | `OwFormSelect` | 화살표 아이콘, 옵션 10개 이하 |
| 검색 가능 드롭다운 | `OwFormDropdown` | 돋보기 아이콘, 옵션 많음 |
| 상태 필터 (체크) | `OwStateFilter` | 체크박스 + 카운트 숫자 |
| 상태 필터 (라디오) | `OwStateRadio` | 라디오 버튼 나열 |
| 담당자, 결재자 | `OwFormOrg` | 조직도 아이콘, "선택" 버튼 |
| 페이지 번호 | `OwPagination` | 테이블 하단, 숫자 나열 |
| 에디터 | `OwTinyEditor` | 툴바 있는 큰 입력 영역 |
| 팝업 | `OwPopup` | 화면 중앙 모달 |
| 더보기 | `OwMorePopup` | "더보기", "고급" 버튼 |

### 컴포넌트 선택 우선순위

1. **특수 목적 컴포넌트 우선**
   - OwBizDatePicker > OwDatePicker
   - OwFormOrg > OwFormSelect (조직/사용자 선택 시)
   - OwStateFilter > OwFormCheckboxGroup (상태 필터 시)

2. **Form 계열 우선**
   - OwFormDate > OwDatePicker (폼 내부)
   - OwFormSelect > select 태그

3. **OWS 컴포넌트 우선**
   - OwPopup > BModal
   - OwPagination > BPagination

---

## 📌 주의사항 및 팁

### ⚠️ 현재 이슈
1. **OwInput**: export 누락 - 수정 필요
2. **OwScheduler**: 문서에는 있지만 실제로는 개별 셀 컴포넌트만 존재

### 💡 사용 팁
1. **날짜 선택기 선택**
   - 단순 날짜: OwFormDate
   - 업무 조회: OwBizDatePicker
   - 제외 날짜: OwBizDatePickerRangeExcluedPickVer2

2. **입력 필드 선택**
   - 일반 텍스트: OwInput
   - 폼 내부: OwForm* 계열 사용
   - 특수 입력: 목적에 맞는 전용 컴포넌트

3. **팝업 선택**
   - 일반 팝업: OwPopup
   - 추가 옵션: OwMorePopup
   - 보고서: OwReportPopup

---

이 가이드는 OWS 시스템의 모든 컴포넌트를 포함하며, AI가 화면을 분석하고 적절한 컴포넌트를 선택할 수 있도록 상세한 정보를 제공합니다.