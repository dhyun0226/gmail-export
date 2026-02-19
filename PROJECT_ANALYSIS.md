# Gmail Export & KPI 프로젝트 분석 보고서

**날짜:** 2025년 12월 1일
**프레임워크:** Nuxt 3 (Vue 3 + Nitro)
**스타일링:** Tailwind CSS

## 1. 개요 (Executive Summary)

이 프로젝트는 화물 통관 효율성을 추적하고 분석하기 위해 설계된 전문 물류 대시보드입니다. **Google Gmail API**(DHL 도착 통지 검색)와 **유니패스(Unipass, 관세청)**를 연동하여 특정 선하증권(B/L) 번호에 대한 타임라인 이벤트를 생성합니다. 핵심 가치는 "메일 수신 시간"과 "통관 단계별 마일스톤(신고, 반입, 수리)" 간의 시차를 자동으로 비교 분석하는 데 있습니다.

## 2. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

### 핵심 스택
*   **프론트엔드:** Nuxt 3 (Vue 3 Composition API), Tailwind CSS.
*   **백엔드:** Nitro (Nuxt의 서버 엔진).
*   **데이터베이스:** 별도의 DB 없음 (파일 업로드 및 실시간 API 쿼리에 기반한 상태 비저장 처리).
*   **상태 관리:** 컴포넌트 내 `ref`/`reactive` 사용; 인증 토큰은 쿠키로 관리.

### 주요 의존성 라이브러리
*   `googleapis`: Gmail API와의 상호작용을 위해 사용.
*   `xlsx`: 업로드된 엑셀 파일에서 B/L 번호를 파싱하기 위해 사용.
*   `fast-xml-parser`: 유니패스 API의 XML 응답을 파싱하기 위해 사용.
*   `moment-timezone`: 날짜 및 시간 변환 처리 (KPI 시간 차이 계산에 필수).

## 3. 주요 기능 분석 (Feature Analysis)

### A. 인증 (Google OAuth)
*   **흐름:**
    1.  **로그인:** 사용자가 `/api/auth/google` 접속 -> 구글 동의 화면으로 리다이렉트.
    2.  **콜백:** 구글 인증 후 `/api/auth/callback`으로 리다이렉트.
    3.  **토큰 저장:** Access/Refresh 토큰을 HTTP-only 쿠키에 저장.
    4.  **미들웨어:** `server/utils/google.ts`에서 이 쿠키를 사용하여 인증된 클라이언트 객체를 생성.

### B. KPI 처리 시스템 (핵심 로직)
이 애플리케이션의 가장 복잡한 부분으로, `pages/gongjusaranghae.vue` (KPI 대시보드)와 `server/api/kpi/`를 중심으로 동작합니다.

**워크플로우:**
1.  **입력:** 사용자가 엑셀 파일을 업로드합니다.
2.  **추출:** `server/api/kpi/upload.post.ts`가 `xlsx`를 사용하여 파일에서 B/L 번호 목록을 추출합니다.
3.  **처리 요청:** `server/api/kpi/process.post.ts`가 B/L 목록과 기준 연도를 받습니다.
4.  **데이터 집계 (병렬 실행):**
    *   **Gmail 소스 (`gmailService.ts`):**
        *   `from:dhl` 조건과 제목에 B/L 번호가 포함된 메일을 검색합니다.
        *   답장(`RE:`)은 무시합니다.
        *   "Date" 헤더를 추출하여 한국 시간(KST)으로 변환합니다.
    *   **유니패스 소스 (`unipassService.ts`):**
        *   `https://unipass.customs.go.kr...`로 직접 HTTPS 요청을 보냅니다.
        *   **참고:** 정부 사이트의 SSL 문제 우회를 위해 `rejectUnauthorized: false` 옵션을 사용합니다.
        *   XML을 파싱하여 `하기신고`, `창고반입`, `수입신고`, `수입신고수리` 타임스탬프를 추출합니다.
5.  **병합:** `dataProcessor.ts`가 두 소스의 데이터를 하나의 결과 객체로 병합합니다.
6.  **출력:** 시간 차이 통계와 상세 행이 포함된 JSON 응답을 반환합니다.

### C. 화물/물류 추적 (Cargo Tracking)
*   **로직:** `server/utils/blExtractor.ts`에는 다양한 텍스트 입력(제목, 본문, 엑셀 셀)에서 B/L 번호를 정확하게 식별하고 정제하기 위한 정규식 로직이 포함되어 있습니다.

## 4. 디렉토리 구조 및 주요 파일

```
/
├── components/
│   └── kpi/                # 대시보드용 UI 컴포넌트
│       ├── KpiExcelUploader.vue   # 엑셀 업로드
│       ├── KpiProcessingStatus.vue # 진행 상태 표시
│       └── KpiResultTable.vue      # 결과 테이블
├── pages/
│   ├── gongjusaranghae.vue # 메인 KPI 대시보드 페이지 (특이한 파일명)
│   └── cargolist.vue       # 보조 화물 추적 뷰
├── server/
│   ├── api/
│   │   ├── auth/           # Google OAuth 엔드포인트
│   │   ├── kpi/            # KPI 관련 엔드포인트 (업로드, 처리)
│   │   └── unipass/        # 관세청 API 프록시
│   └── utils/
│       ├── google.ts       # 구글 클라이언트 팩토리
│       └── kpi/
│           ├── dataProcessor.ts # Mail + 관세청 데이터 병합 로직
│           ├── gmailService.ts  # Gmail 검색 및 파싱 로직
│           └── unipassService.ts # 관세청 XML 스크래퍼
```

## 5. 주요 구현 사항 및 관찰 (Observations)

1.  **유니패스 SSL 우회:** `unipassService.ts`의 코드는 SSL 검증을 비활성화(`rejectUnauthorized: false`)하고 있습니다. 이는 레거시 정부 API 연동 시 흔한 해결책이지만, 보안상 인지하고 있어야 할 부분입니다.
2.  **배치 처리 (Batch Processing):** 시스템은 Google API와 유니패스 서버의 속도 제한(Rate Limit)을 피하기 위해 배치 크기 20과 지연(`setTimeout`)을 적용하여 처리합니다.
3.  **명명 규칙:** `gongjusaranghae.vue`("공주사랑해")라는 페이지가 실제 프로덕션 KPI 대시보드 역할을 합니다. 이는 내부 코드명이거나 특정 사용자를 위한 페이지로 추정됩니다.
4.  **메모리 사용:** 애플리케이션이 데이터를 인메모리에서 처리합니다. 대용량 엑셀 파일(수천 행)의 경우 Vercel과 같은 서버리스 환경에서는 실행 시간 제한(Timeout) 문제가 발생할 수 있습니다.

## 6. 개선 제안 (Recommendations)

1.  **에러 처리 강화:** 유니패스 스크래퍼가 다소 취약해 보입니다(XML 파싱, 직접 HTTP 호출 등). 네트워크 불안정에 대비한 재시도(Retry) 로직 추가를 권장합니다.
2.  **큐 시스템 도입:** 대용량 파일 처리를 위해 동기식 API 호출(`process.post.ts`)에서 비동기 작업 큐(BullMQ 등) 또는 DB 기반의 상태 조회 방식으로 변경하면 브라우저 타임아웃을 방지할 수 있습니다.
3.  **타입 안전성:** Google API 응답 등 여러 곳에서 `any` 타입이 사용되고 있습니다. TypeScript 정의를 보강하면 유지보수성이 향상될 것입니다.