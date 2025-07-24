# AI Quick Reference Card
> OWS 컴포넌트 기반 Vue 애플리케이션 변환 빠른 참조

## 🚀 즉시 시작하기

```bash
# AI 작업 요청 예시
"이 UI 이미지를 분석하여 OWS 컴포넌트로 Vue 코드를 생성해주세요.
/mnt/c/guide/ai-design/ai-analysis/references/ai-quick-reference-card.md 참조"
```

---

## 📋 핵심 컴포넌트 매핑

### 입력 요소 → OWS 컴포넌트
| UI 패턴 | OWS 컴포넌트 | 기본 Props |
|---------|--------------|------------|
| 텍스트 입력 | `OwInput` | `v-model`, `placeholder` |
| 날짜 범위 | `OwBizDatePicker` | `v-model`, `:range-unit="'day'"` |
| 드롭다운 | `OwFormSelect` | `v-model`, `:options` |
| 체크박스(상태) | `OwStateFilter` | `v-model`, `:options` |
| 체크박스(일반) | `OwFormCheckbox` | `v-model`, `value` |
| 라디오 | `OwFormRadio` | `v-model`, `:options` |
| 조직 선택 | `OwFormOrg` | `v-model`, `:multiple` |
| 에디터 | `OwTinyEditor` | `v-model`, `:height` |

### 데이터 표시 → OWS 컴포넌트
| UI 패턴 | 컴포넌트 | 주요 설정 |
|---------|----------|-----------|
| 데이터 그리드 | `DxDataGrid` | `:data-source`, `columns` |
| 페이지네이션 | `OwPagination` | `:total-count`, `:page-size` |
| 캘린더 | `OwCalendar` | `v-model`, `@change` |
| 스케줄러 | `OwScheduler` | `:appointments`, `:resources` |

### 레이아웃 → OWS 컴포넌트
| UI 패턴 | 컴포넌트 | 사용법 |
|---------|----------|--------|
| 모달/팝업 | `OwPopup` | `v-model`, `title`, `size` |
| 알림 메시지 | `OwAlert` | `variant`, `:dismissible` |

---

## 🎨 표준 화면 템플릿

### 1. CRUD 목록 화면
```vue
<template>
  <div class="list-screen">
    <!-- 헤더 -->
    <div class="header">
      <h1>{{ title }}</h1>
      <BButton @click="create">추가</BButton>
    </div>
    
    <!-- 필터 -->
    <div class="filters">
      <OwBizDatePicker v-model="filters.dateRange" />
      <OwFormSelect v-model="filters.category" :options="categories" />
      <OwStateFilter v-model="filters.states" :options="stateOptions" />
      <BButton @click="search">조회</BButton>
    </div>
    
    <!-- 그리드 -->
    <DxDataGrid :data-source="data">
      <DxColumn v-for="col in columns" v-bind="col" />
    </DxDataGrid>
    
    <!-- 페이징 -->
    <OwPagination v-model="page" :total-count="total" />
  </div>
</template>
```

### 2. 입력/수정 폼
```vue
<template>
  <div class="form-screen">
    <h1>{{ mode === 'create' ? '등록' : '수정' }}</h1>
    
    <form @submit.prevent="save">
      <div class="form-group">
        <label>제목*</label>
        <OwInput v-model="form.title" required />
      </div>
      
      <div class="form-group">
        <label>분류</label>
        <OwFormSelect v-model="form.category" :options="categories" />
      </div>
      
      <div class="form-group">
        <label>내용</label>
        <OwTinyEditor v-model="form.content" />
      </div>
      
      <div class="form-actions">
        <BButton type="button" variant="secondary" @click="cancel">취소</BButton>
        <BButton type="submit" variant="primary">저장</BButton>
      </div>
    </form>
  </div>
</template>
```

### 3. 상세 보기
```vue
<template>
  <div class="detail-screen">
    <div class="detail-header">
      <h1>{{ data.title }}</h1>
      <div>
        <BButton @click="edit">수정</BButton>
        <BButton variant="danger" @click="remove">삭제</BButton>
      </div>
    </div>
    
    <BCard>
      <dl>
        <dt>등록일</dt>
        <dd>{{ formatDate(data.createdAt) }}</dd>
        <!-- 기타 필드들 -->
      </dl>
    </BCard>
  </div>
</template>
```

---

## 💡 필수 Import 구문

```javascript
// Vue 3
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// OWS 컴포넌트
import {
  OwInput,
  OwBizDatePicker,
  OwFormSelect,
  OwStateFilter,
  OwFormCheckbox,
  OwFormRadio,
  OwFormOrg,
  OwPopup,
  OwAlert,
  OwPagination,
  OwTinyEditor
} from '@ows/ui';

// DevExtreme
import { DxDataGrid, DxColumn } from 'devextreme-vue/data-grid';

// Bootstrap Vue
import { BButton, BBadge, BCard, BRow, BCol } from 'bootstrap-vue-next';

// 유틸리티
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
```

---

## 🔧 공통 패턴

### 필터 상태 관리
```javascript
const filters = reactive({
  dateRange: {
    from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD')
  },
  keyword: '',
  category: null,
  states: []
});
```

### API 호출 패턴
```javascript
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await api.get('/endpoint', { params: filters });
    data.value = response.data;
  } catch (error) {
    console.error('Error:', error);
    // 에러 처리
  } finally {
    loading.value = false;
  }
};
```

### 페이지네이션
```javascript
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

watch(() => pagination.page, () => {
  fetchData();
});
```

---

## ⚡ 성능 최적화

### 1. 컴포넌트 레이지 로딩
```javascript
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);
```

### 2. 디바운싱
```javascript
const debouncedSearch = debounce(handleSearch, 300);
```

### 3. 가상 스크롤
```vue
<DxDataGrid
  :data-source="largeData"
  :scrolling="{ mode: 'virtual' }"
/>
```

---

## 🎯 화면 타입별 체크리스트

### CRUD 화면
- [ ] 필터 영역 (날짜, 상태, 검색어)
- [ ] 데이터 그리드
- [ ] 페이지네이션
- [ ] 추가/수정/삭제 액션
- [ ] 엑셀 다운로드

### 대시보드
- [ ] KPI 카드
- [ ] 차트 (라인, 파이, 바)
- [ ] 요약 테이블
- [ ] 실시간 갱신

### 입력 폼
- [ ] 필수 항목 표시
- [ ] 유효성 검증
- [ ] 저장/취소 버튼
- [ ] 임시저장 기능

---

## 🚨 주의사항

### DO's ✅
- OWS 컴포넌트 우선 사용
- v-model 양방향 바인딩
- reactive/ref 적절히 구분
- 에러 처리 필수
- 로딩 상태 표시

### DON'Ts ❌
- 인라인 스타일 사용
- 동기 API 호출
- 전역 변수 사용
- console.log 남기기
- 하드코딩 값

---

## 📊 컴포넌트 신뢰도

| 컴포넌트 | 신뢰도 | 대체 옵션 |
|----------|--------|-----------|
| OwBizDatePicker | 98% | OwDatePicker |
| DxDataGrid | 97% | BTable |
| OwStateFilter | 95% | OwFormCheckboxGroup |
| OwFormSelect | 93% | BFormSelect |
| OwPopup | 92% | BModal |

---

## 🔗 상세 가이드 링크

1. **전체 워크플로우**: [ai-image-analysis-workflow.md](../core/ai-image-analysis-workflow.md)
2. **화면 패턴 20+**: [enterprise-screen-patterns-guide.md](./enterprise-screen-patterns-guide.md)
3. **컴포넌트 상세**: [ows-component-detailed-reference.md](./ows-component-detailed-reference.md)
4. **네비게이션**: [screen-navigation-integration-guide.md](./screen-navigation-integration-guide.md)

---

## 🎬 즉시 실행 코드

### 빈 화면 템플릿
```vue
<template>
  <div class="screen-container">
    <!-- 여기에 화면 구성 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
// imports...

// state
const data = ref([]);

// methods
const init = async () => {
  // 초기화 로직
};

// lifecycle
onMounted(() => {
  init();
});
</script>

<style scoped>
.screen-container {
  /* 스타일 */
}
</style>
```

---

**버전**: 1.0.0 | **OWS**: v2.5.7 | **최종 업데이트**: 2024-01-15