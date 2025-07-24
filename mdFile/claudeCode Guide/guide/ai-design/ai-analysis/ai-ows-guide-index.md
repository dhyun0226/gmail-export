# OWS AI 통합 가이드 인덱스
> AI가 UI 와이어프레임 분석 및 프로그램 사양서 생성 시 참조하는 마스터 가이드

## 🎯 Quick Start for AI

### Step 1: 이미지/와이어프레임 분석
1. 화면 영역 구분 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#1-ui-패턴-인식-가이드)
2. 시각적 패턴 인식 → [ai-pattern-matching-examples.md](./examples/ai-pattern-matching-examples.md#패턴별-인식-규칙)
3. 컴포넌트 매칭 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#4-컴포넌트-매칭-규칙)

### Step 2: 컴포넌트 선택
1. 컴포넌트 카탈로그 확인 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#2-컴포넌트-카탈로그)
2. 상세 Props/Events 확인 → [ows-component-detailed-reference.md](./references/ows-component-detailed-reference.md)
3. 화면 패턴별 조합 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#3-화면-구성-패턴)

### Step 3: 코드 생성
1. Vue 컴포넌트 템플릿 → [ai-pattern-matching-examples.md](./examples/ai-pattern-matching-examples.md#3-생성된-vue-컴포넌트)
2. 컴포넌트 사용 예제 → [ows-component-detailed-reference.md](./references/ows-component-detailed-reference.md)
3. 레이아웃 구성 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#3-화면-구성-패턴)

### Step 4: 사양서 생성
1. 사양서 템플릿 → [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md#5-사양서-생성-템플릿)
2. 실제 사양서 예시 → [ai-pattern-matching-examples.md](./examples/ai-pattern-matching-examples.md#4-생성된-프로그램-사양서)

---

## 📊 컴포넌트 빠른 참조

### 필터/검색 영역
| 용도 | 컴포넌트 | 키워드 | 시각적 특징 |
|------|----------|---------|-------------|
| 날짜 범위 | `OwBizDatePicker` | 기간, 조회기간, 시작일~종료일 | 달력아이콘 + 날짜필드 2개 |
| 상태 필터 | `OwStateFilter` | 상태, 필터, 체크 | 체크박스 + 숫자 |
| 드롭다운 | `OwFormSelect` | 선택, 콤보박스 | ▼ 화살표 |
| 조직 선택 | `OwFormOrg` | 조직, 부서, 담당자 | 조직도 아이콘 |

### 데이터 표시
| 용도 | 컴포넌트 | 키워드 | 시각적 특징 |
|------|----------|---------|-------------|
| 데이터 그리드 | `DxDataGrid` | 목록, 리스트, 테이블 | 표 형태 + 헤더 |
| 페이징 | `OwPagination` | 페이지, 이전/다음 | < 1 2 3 > |
| 캘린더 | `OwCalendar` | 달력, 일정 | 월 단위 달력 |
| 스케줄러 | `OwScheduler` | 일정, 스케줄 | 시간축 + 일정바 |

### 입력 폼
| 용도 | 컴포넌트 | 키워드 | 시각적 특징 |
|------|----------|---------|-------------|
| 텍스트 입력 | `OwInput` | 입력, 텍스트 | 사각형 입력필드 |
| 체크박스 | `OwFormCheckbox` | 체크, 선택 | □ 사각형 |
| 라디오 | `OwFormRadio` | 선택, 단일선택 | ◯ 원형 |
| 에디터 | `OwTinyEditor` | 에디터, 내용입력 | 툴바 + 텍스트영역 |

### 레이아웃
| 용도 | 컴포넌트 | 키워드 | 시각적 특징 |
|------|----------|---------|-------------|
| 팝업 | `OwPopup` | 팝업, 모달, 다이얼로그 | 오버레이 + 중앙창 |
| 알림 | `OwAlert` | 알림, 경고, 메시지 | 색상배경 + 메시지 |

---

## 🔧 프로젝트 구조 참조

```
ows-master/
├── packages/main/          # @ows/ui 라이브러리
│   └── src/
│       ├── components/     # 45개 컴포넌트
│       ├── types/         # TypeScript 타입 정의
│       └── composables/   # Vue Composables
├── apps/web/              # 가이드 웹사이트
│   └── src/pages/         # 컴포넌트 예제 페이지
└── docs/                  # AI 가이드 문서
    ├── ai-component-recognition-guide.md
    ├── ows-component-detailed-reference.md
    ├── ai-pattern-matching-examples.md
    └── ai-ows-guide-index.md (현재 파일)
```

---

## 💡 AI 활용 팁

### 1. 이미지 분석 우선순위
1. **레이아웃 구조** 파악 (상단/중단/하단)
2. **영역별 용도** 식별 (필터/데이터/액션)
3. **컴포넌트 패턴** 매칭
4. **세부 속성** 결정

### 2. 컴포넌트 선택 원칙
- **정확성**: 용도에 정확히 맞는 컴포넌트 선택
- **일관성**: 동일 패턴은 동일 컴포넌트 사용
- **확장성**: 향후 기능 추가 고려
- **성능**: 대용량 데이터는 DxDataGrid 사용

### 3. 코드 생성 규칙
```javascript
// 필수 import 순서
import { ref, reactive, computed, onMounted } from 'vue';
import { Ow컴포넌트들 } from '@ows/ui';
import { Dx컴포넌트들 } from 'devextreme-vue/...';
import { B컴포넌트들 } from 'bootstrap-vue-next';

// 컴포넌트 명명 규칙
const filters = reactive({...});      // 필터 상태
const gridData = ref([]);             // 그리드 데이터
const handleSearch = async () => {}   // 이벤트 핸들러
```

### 4. 사양서 필수 항목
- [ ] 화면 ID 및 명칭
- [ ] 주요 기능 설명
- [ ] 컴포넌트별 상세 명세
- [ ] API 연동 사양
- [ ] 화면 동작 시나리오
- [ ] 유효성 검증 규칙

---

## 📝 체크리스트

### 이미지 → 컴포넌트 변환
```yaml
입력: UI 와이어프레임 이미지
처리:
  1. 영역 분석:
     - 제목/헤더 영역 확인
     - 필터 조건 영역 식별
     - 데이터 표시 영역 파악
     - 액션 버튼 위치 확인
  
  2. 컴포넌트 매칭:
     - 각 영역의 시각적 패턴 분석
     - 적합한 OWS 컴포넌트 선택
     - Props 및 이벤트 정의
  
  3. 코드 생성:
     - Vue 3 템플릿 생성
     - 스크립트 로직 구현
     - 스타일 적용

출력: Vue 컴포넌트 코드 + 사양서
```

### 품질 확인 항목
- [ ] 모든 UI 요소가 컴포넌트로 변환되었는가?
- [ ] 컴포넌트 Props가 올바르게 설정되었는가?
- [ ] 이벤트 핸들러가 구현되었는가?
- [ ] 반응형 데이터 구조가 적절한가?
- [ ] 사양서가 완전하고 명확한가?

---

## 🚀 Quick Reference

### 자주 사용되는 컴포넌트 조합
```javascript
// 1. 필터 + 그리드 조합
const standardFilterGrid = {
  filters: ['OwBizDatePicker', 'OwFormSelect', 'OwStateFilter'],
  grid: 'DxDataGrid',
  pagination: 'OwPagination',
  actions: ['조회', '엑셀다운로드']
};

// 2. 입력 폼 조합
const standardForm = {
  inputs: ['OwInput', 'OwFormDate', 'OwFormSelect'],
  options: ['OwFormCheckbox', 'OwFormRadio'],
  editor: 'OwTinyEditor',
  actions: ['저장', '취소']
};

// 3. 팝업 폼 조합
const popupForm = {
  container: 'OwPopup',
  content: ['OwInput', 'OwFormSelect'],
  actions: ['확인', '취소']
};
```

### Import 템플릿
```javascript
// 기본 import
import { ref, reactive, computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';

// OWS 컴포넌트
import {
  OwInput,
  OwBizDatePicker,
  OwStateFilter,
  OwFormSelect,
  OwFormCheckbox,
  OwFormRadio,
  OwFormOrg,
  OwPopup,
  OwAlert,
  OwPagination,
  OwTinyEditor
} from '@ows/ui';

// DevExtreme 컴포넌트
import { 
  DxDataGrid, 
  DxColumn,
  DxSelection,
  DxPaging
} from 'devextreme-vue/data-grid';

// Bootstrap Vue
import { 
  BButton,
  BBadge,
  BCard
} from 'bootstrap-vue-next';
```

---

## 📞 추가 참조

- **✨ 전체 컴포넌트 가이드 (60개+)**: [ows-component-complete-reference.md](./references/ows-component-complete-reference.md)
- **컴포넌트 상세 (부분)**: [ows-component-detailed-reference.md](./references/ows-component-detailed-reference.md)
- **패턴 예제**: [ai-pattern-matching-examples.md](./examples/ai-pattern-matching-examples.md)
- **인식 가이드**: [ai-component-recognition-guide.md](./core/ai-component-recognition-guide.md)
- **프로젝트 설정**: [../CLAUDE.md](../CLAUDE.md)