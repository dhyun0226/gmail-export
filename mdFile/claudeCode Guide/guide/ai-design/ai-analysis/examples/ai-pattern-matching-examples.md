# AI 패턴 매칭 실전 예제
> 실제 화면 이미지를 OWS 컴포넌트로 변환하는 상세 가이드

## 📌 실전 예제: 금칙어 관리 화면

### 1. 이미지 분석 결과
```yaml
화면_분석:
  제목: "금칙어 관리"
  화면_유형: "조회 및 관리 화면"
  
  영역_구분:
    1_헤더:
      - 제목: "금칙어 관리"
      - 액션버튼: ["BO", "CC"] (우상단)
    
    2_필터_섹션:
      섹션1_조회어관리:
        - 라벨: "조회어 관리"
        - 입력필드: 검색어 입력
        - 버튼: "조회"
      
      섹션2_기간조회:
        - 날짜선택: 시작일~종료일
        - 체크박스그룹: 상태별 필터
    
    3_데이터_그리드:
      - 체크박스 컬럼
      - 데이터 컬럼들: [No, 금칙어명, 금칙어설명, 시플영향, 등록자, 등록일시, 수정자, 수정일시]
      - 선택 가능한 행
    
    4_하단_정보:
      - 추가 정보 표시 영역
```

### 2. 컴포넌트 매칭 결과
```javascript
const componentMapping = {
  // 헤더 영역
  header: {
    title: "금칙어 관리",
    buttons: [
      { text: "BO", variant: "primary" },
      { text: "CC", variant: "secondary" }
    ]
  },
  
  // 필터 영역
  filters: [
    {
      component: "OwInput",
      props: {
        placeholder: "조회어를 입력하세요",
        modelValue: "searchKeyword"
      },
      position: "filter-section-1"
    },
    {
      component: "OwBizDatePicker",
      props: {
        rangeUnit: "day",
        modelValue: "dateRange"
      },
      position: "filter-section-2"
    },
    {
      component: "OwStateFilter",
      props: {
        options: "stateOptions",
        modelValue: "selectedStates"
      },
      position: "filter-section-2"
    }
  ],
  
  // 데이터 그리드
  dataGrid: {
    component: "DxDataGrid",
    columns: [
      { type: "selection", width: 50 },
      { dataField: "no", caption: "No", width: 60 },
      { dataField: "keyword", caption: "금칙어명" },
      { dataField: "description", caption: "금칙어설명" },
      { dataField: "impact", caption: "시플영향", width: 100 },
      { dataField: "creator", caption: "등록자", width: 100 },
      { dataField: "createdDate", caption: "등록일시", width: 150 },
      { dataField: "modifier", caption: "수정자", width: 100 },
      { dataField: "modifiedDate", caption: "수정일시", width: 150 }
    ]
  }
};
```

### 3. 생성된 Vue 컴포넌트
```vue
<template>
  <div class="keyword-management-screen">
    <!-- 헤더 영역 -->
    <div class="screen-header">
      <h2 class="screen-title">금칙어 관리</h2>
      <div class="header-actions">
        <BButton variant="primary">BO</BButton>
        <BButton variant="secondary">CC</BButton>
      </div>
    </div>

    <!-- 필터 영역 -->
    <div class="filter-container">
      <!-- 섹션 1: 조회어 관리 -->
      <div class="filter-section">
        <div class="section-title">
          <span class="bullet">1</span>
          <span>조회어 관리</span>
        </div>
        <div class="filter-content">
          <div class="filter-group">
            <label>검색어</label>
            <OwInput
              v-model="filters.searchKeyword"
              placeholder="조회어를 입력하세요"
              @keyup.enter="handleSearch"
            />
            <BButton variant="primary" @click="handleSearch">
              조회
            </BButton>
          </div>
        </div>
      </div>

      <!-- 섹션 2: 기간 및 상태 조회 -->
      <div class="filter-section">
        <div class="section-title">
          <span class="bullet">2</span>
          <span>기간 및 상태 조회</span>
        </div>
        <div class="filter-content">
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
              v-model="filters.selectedStates"
              :options="stateFilterOptions"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 데이터 그리드 영역 -->
    <div class="data-grid-container">
      <div class="grid-header">
        <div class="grid-title">검색 결과</div>
        <div class="grid-actions">
          <BButton variant="success" size="sm" @click="handleExcelExport">
            <i class="bi bi-file-excel"></i> 엑셀 다운로드
          </BButton>
        </div>
      </div>
      
      <DxDataGrid
        ref="dataGrid"
        :data-source="gridData"
        :show-borders="true"
        :row-alternation-enabled="true"
        :column-auto-width="true"
        :selection="{ mode: 'multiple', showCheckBoxesMode: 'always' }"
        @selection-changed="onSelectionChanged"
      >
        <DxColumn
          :width="50"
          :fixed="true"
          :allow-fixing="false"
          data-type="boolean"
        />
        <DxColumn
          data-field="no"
          caption="No"
          :width="60"
          alignment="center"
        />
        <DxColumn
          data-field="keyword"
          caption="금칙어명"
          :min-width="150"
        />
        <DxColumn
          data-field="description"
          caption="금칙어설명"
          :min-width="200"
        />
        <DxColumn
          data-field="impact"
          caption="시플영향"
          :width="100"
          alignment="center"
        />
        <DxColumn
          data-field="creator"
          caption="등록자"
          :width="100"
        />
        <DxColumn
          data-field="createdDate"
          caption="등록일시"
          :width="150"
          data-type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
        />
        <DxColumn
          data-field="modifier"
          caption="수정자"
          :width="100"
        />
        <DxColumn
          data-field="modifiedDate"
          caption="수정일시"
          :width="150"
          data-type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
        />
      </DxDataGrid>
    </div>

    <!-- 하단 정보 영역 -->
    <div class="bottom-info-section">
      <div class="info-title">
        <i class="bi bi-info-circle"></i> 참고사항
      </div>
      <ul class="info-list">
        <li>금칙어로 등록된 금칙어가 FO에서 입력된 경우, FO/BO에서 차단됩니다.</li>
        <li>필터링 대상항목: 상품명, 상품설명, 검색태그 1+1문구</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  OwInput,
  OwBizDatePicker,
  OwStateFilter
} from '@ows/ui';
import {
  DxDataGrid,
  DxColumn
} from 'devextreme-vue/data-grid';
import { BButton } from 'bootstrap-vue-next';
import dayjs from 'dayjs';

// 필터 상태 관리
const filters = reactive({
  searchKeyword: '',
  dateRange: {
    from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD')
  },
  selectedStates: []
});

// 상태 필터 옵션
const stateFilterOptions = ref([
  { title: '사용중', stateCount: 234, code: 'USE' },
  { title: '미사용', stateCount: 12, code: 'NOTUSE' },
  { title: '삭제', stateCount: 5, code: 'DELETE' }
]);

// 그리드 데이터
const gridData = ref([]);
const selectedRows = ref([]);

// 그리드 참조
const dataGrid = ref(null);

// 조회 함수
const handleSearch = async () => {
  try {
    // API 호출
    const response = await api.getKeywords({
      keyword: filters.searchKeyword,
      startDate: filters.dateRange.from,
      endDate: filters.dateRange.to,
      states: filters.selectedStates
    });
    
    gridData.value = response.data.map((item, index) => ({
      ...item,
      no: index + 1
    }));
  } catch (error) {
    console.error('조회 실패:', error);
    // 에러 처리
  }
};

// 엑셀 다운로드
const handleExcelExport = () => {
  const gridInstance = dataGrid.value.instance;
  gridInstance.exportToExcel({
    fileName: `금칙어목록_${dayjs().format('YYYYMMDD')}`,
    customizeCell: ({ gridCell, excelCell }) => {
      // 날짜 형식 커스터마이징
      if (gridCell.column.dataType === 'datetime') {
        excelCell.value = dayjs(gridCell.value).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  });
};

// 선택 변경 이벤트
const onSelectionChanged = (e) => {
  selectedRows.value = e.selectedRowsData;
};

// 초기 데이터 로드
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.keyword-management-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

/* 헤더 스타일 */
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.screen-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 필터 영역 스타일 */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.filter-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
}

.bullet {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 14px;
}

.filter-content {
  padding: 16px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  min-width: 80px;
  font-weight: 500;
  color: #495057;
}

/* 그리드 영역 스타일 */
.data-grid-container {
  flex: 1;
  margin: 0 16px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  overflow: hidden;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.grid-title {
  font-weight: 600;
  font-size: 16px;
}

/* 하단 정보 스타일 */
.bottom-info-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
  font-size: 14px;
}

.info-list li {
  margin-bottom: 4px;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-group label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>
```

### 4. 생성된 프로그램 사양서
```markdown
# 금칙어 관리 화면 사양서

## 1. 화면 개요
- **화면 ID**: MGMT_KEYWORD_001
- **화면명**: 금칙어 관리
- **화면 유형**: 조회 및 관리 화면
- **주요 기능**: 금칙어/금칙어 조회, 등록, 수정, 삭제

## 2. 화면 레이아웃
### 2.1 전체 구조
```
┌─────────────────────────────────────────────┐
│  금칙어 관리                    [BO] [CC]    │
├─────────────────────────────────────────────┤
│  ① 조회어 관리                              │
│     검색어 [_______________] [조회]          │
├─────────────────────────────────────────────┤
│  ② 기간 및 상태 조회                        │
│     조회기간 [시작일] ~ [종료일]             │
│     상태 □ 사용중(234) □ 미사용(12) □ 삭제(5) │
├─────────────────────────────────────────────┤
│  검색 결과                    [엑셀다운로드] │
│  ┌─────────────────────────────────────┐   │
│  │ □ | No | 금칙어명 | 설명 | ... | 수정일시 │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  ℹ 참고사항                                 │
│  • 금칙어로 등록된 금칙어가...               │
└─────────────────────────────────────────────┘
```

### 2.2 영역별 구성
| 영역 | 구성 요소 | 설명 |
|------|-----------|------|
| 헤더 | 제목, 액션버튼 | 화면 제목 및 주요 액션 |
| 필터1 | OwInput, 조회버튼 | 키워드 검색 |
| 필터2 | OwBizDatePicker, OwStateFilter | 기간 및 상태 필터 |
| 그리드 | DxDataGrid | 검색 결과 표시 |
| 하단정보 | 정보 텍스트 | 사용 안내사항 |

## 3. 컴포넌트 상세
### 3.1 조회 조건 영역
#### 검색어 입력 (OwInput)
- **용도**: 금칙어 키워드 검색
- **설정값**: 
  ```javascript
  {
    placeholder: "조회어를 입력하세요",
    maxlength: 50,
    @keyup.enter: "handleSearch"
  }
  ```

#### 조회 기간 (OwBizDatePicker)
- **용도**: 등록/수정일 기준 기간 조회
- **설정값**:
  ```javascript
  {
    rangeUnit: "day",
    defaultRange: 7, // 최근 7일
    maxRange: 365   // 최대 1년
  }
  ```

#### 상태 필터 (OwStateFilter)
- **용도**: 금칙어 상태별 필터링
- **옵션**:
  - 사용중 (USE)
  - 미사용 (NOTUSE)
  - 삭제 (DELETE)

### 3.2 데이터 그리드
#### 컬럼 구성
| 컬럼명 | 필드명 | 타입 | 너비 | 정렬 | 설명 |
|-------|--------|------|------|------|------|
| 선택 | - | checkbox | 50 | center | 다중선택 |
| No | no | number | 60 | center | 순번 |
| 금칙어명 | keyword | string | auto | left | 금지 키워드 |
| 금칙어설명 | description | string | auto | left | 설명 |
| 시플영향 | impact | string | 100 | center | 영향도 |
| 등록자 | creator | string | 100 | left | 등록자명 |
| 등록일시 | createdDate | datetime | 150 | center | YYYY-MM-DD HH:mm:ss |
| 수정자 | modifier | string | 100 | left | 수정자명 |
| 수정일시 | modifiedDate | datetime | 150 | center | YYYY-MM-DD HH:mm:ss |

## 4. 기능 명세
### 4.1 조회 기능
1. 조회 조건 설정 (선택적)
   - 검색어: 금칙어명 부분 일치 검색
   - 기간: 등록일시 기준
   - 상태: 다중 선택 가능

2. 조회 버튼 클릭 또는 Enter 키
   - 유효성 검증
   - API 호출
   - 결과 그리드 바인딩

3. 조회 결과
   - 기본 정렬: 등록일시 내림차순
   - 페이징: 서버사이드 (20건/페이지)

### 4.2 엑셀 다운로드
- 현재 조회 조건의 전체 데이터 다운로드
- 파일명: 금칙어목록_YYYYMMDD.xlsx
- 다운로드 이력 저장

### 4.3 상태 변경 (일괄처리)
- 그리드에서 다중 선택
- 상태 변경 액션 실행
- 변경 이력 저장

## 5. API 연동
### 5.1 금칙어 조회 API
- **URL**: `/api/keyword/list`
- **Method**: POST
- **Request**:
  ```json
  {
    "keyword": "검색어",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "states": ["USE", "NOTUSE"],
    "page": 1,
    "size": 20
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "keyword": "금칙어1",
        "description": "설명",
        "impact": "HIGH",
        "status": "USE",
        "creator": "홍길동",
        "createdDate": "2024-01-15 10:30:00",
        "modifier": "김철수",
        "modifiedDate": "2024-01-20 14:20:00"
      }
    ],
    "totalCount": 234,
    "page": 1,
    "size": 20
  }
  ```

### 5.2 엑셀 다운로드 API
- **URL**: `/api/keyword/excel`
- **Method**: POST
- **Request**: 조회 API와 동일 (page, size 제외)
- **Response**: Binary (Excel file)

## 6. 화면 동작 시나리오
### 6.1 초기 진입
1. 화면 로드 시 최근 7일 데이터 자동 조회
2. 상태는 '사용중'만 기본 선택
3. 그리드에 조회 결과 표시

### 6.2 조건 조회
1. 사용자가 조회 조건 입력/선택
2. 조회 버튼 클릭
3. 로딩 인디케이터 표시
4. 조회 결과 그리드 갱신
5. 건수 정보 업데이트

### 6.3 엑셀 다운로드
1. 엑셀 다운로드 버튼 클릭
2. 현재 조회 조건으로 전체 데이터 요청
3. 파일 다운로드 진행률 표시
4. 다운로드 완료 알림

## 7. 유효성 검증
- 조회 기간: 시작일 ≤ 종료일
- 조회 기간: 최대 1년 제한
- 검색어: 최소 2자 이상
- 필수 선택: 상태 최소 1개 이상

## 8. 권한 및 보안
- 화면 접근 권한: ROLE_KEYWORD_ADMIN
- 데이터 조회 권한: ROLE_KEYWORD_READ
- 엑셀 다운로드 권한: ROLE_KEYWORD_EXPORT
- 개인정보 마스킹: 등록자/수정자 이름 부분 마스킹

## 9. 성능 요구사항
- 조회 응답시간: 3초 이내
- 엑셀 다운로드: 10,000건 기준 10초 이내
- 동시 사용자: 100명
```

---

## 📌 패턴별 인식 규칙

### 1. 필터 영역 인식 규칙
```javascript
const filterPatternRules = {
  // 날짜 범위 선택
  "날짜입력필드_2개_물결표시(~)": {
    component: "OwBizDatePicker",
    props: { rangeUnit: "day" },
    confidence: 0.95
  },
  
  // 단일 날짜 선택
  "날짜입력필드_1개": {
    component: "OwFormDate",
    confidence: 0.90
  },
  
  // 드롭다운
  "선택박스_하향화살표": {
    component: "OwFormSelect",
    confidence: 0.85
  },
  
  // 체크박스 그룹 (상태)
  "체크박스_여러개_숫자포함": {
    component: "OwStateFilter",
    confidence: 0.90
  },
  
  // 라디오 버튼 그룹
  "원형선택_단일선택": {
    component: "OwFormRadio",
    confidence: 0.85
  },
  
  // 조직/사용자 선택
  "입력필드_조직아이콘": {
    component: "OwFormOrg",
    confidence: 0.88
  }
};
```

### 2. 그리드 영역 인식 규칙
```javascript
const gridPatternRules = {
  // 기본 데이터 그리드
  "표형태_헤더있음_다중행": {
    component: "DxDataGrid",
    features: {
      hasCheckbox: "체크박스 컬럼 존재",
      hasPaging: "하단 페이징 존재",
      hasActions: "액션 버튼 컬럼"
    },
    confidence: 0.95
  },
  
  // 트리 그리드
  "계층구조_들여쓰기": {
    component: "DxTreeList",
    confidence: 0.90
  },
  
  // 간트 차트
  "시간축_막대그래프": {
    component: "DxGantt",
    confidence: 0.92
  }
};
```

### 3. 입력 폼 인식 규칙
```javascript
const formPatternRules = {
  // 레이블-입력 쌍
  "레이블_입력필드_세로정렬": {
    layout: "form-vertical",
    components: ["OwInput", "OwFormDate", "OwFormSelect"]
  },
  
  // 가로 정렬 폼
  "레이블_입력필드_가로정렬": {
    layout: "form-horizontal",
    labelWidth: "20%"
  },
  
  // 에디터
  "툴바있는_텍스트영역": {
    component: "OwTinyEditor",
    confidence: 0.93
  }
};
```

### 4. 액션 버튼 인식 규칙
```javascript
const buttonPatternRules = {
  // 위치별 버튼 타입
  "우상단_버튼그룹": ["조회", "초기화", "엑셀"],
  "우하단_버튼그룹": ["저장", "취소", "삭제"],
  "팝업하단_버튼": ["확인", "취소"],
  
  // 버튼 변형
  "primary": ["조회", "저장", "확인"],
  "secondary": ["취소", "닫기"],
  "success": ["엑셀", "다운로드"],
  "danger": ["삭제", "초기화"]
};
```

---

## 📋 AI 체크리스트

### 이미지 분석 시:
1. [ ] 화면 전체 레이아웃 파악
2. [ ] 각 영역 구분 및 용도 식별
3. [ ] 컴포넌트 시각적 패턴 매칭
4. [ ] 텍스트 레이블 분석
5. [ ] 데이터 타입 추론

### 컴포넌트 매칭 시:
1. [ ] 시각적 유사도 확인
2. [ ] 기능적 목적 일치 확인
3. [ ] 대체 컴포넌트 고려
4. [ ] Props 설정값 결정
5. [ ] 이벤트 핸들러 필요성 판단

### 코드 생성 시:
1. [ ] Vue 3 Composition API 사용
2. [ ] 정확한 import 구문
3. [ ] 반응형 데이터 구조
4. [ ] 이벤트 핸들러 구현
5. [ ] 스타일 적용

### 사양서 작성 시:
1. [ ] 화면 목적 명확히 기술
2. [ ] 모든 컴포넌트 상세 명세
3. [ ] API 연동 사양 포함
4. [ ] 동작 시나리오 작성
5. [ ] 유효성 검증 규칙 정의