// KPI 관련 타입 정의
export interface KpiExcelRow {
  blNumber: string;
  originalData?: any;
}

export interface UnipassTimeData {
  lowerDeclAcceptTime?: string;  // 하기신고수리일시
  warehouseEntryTime?: string;   // 창고반입일시
  importDeclTime?: string;        // 수입신고일시
  importAcceptTime?: string;      // 수입신고수리일시
}

export interface GmailData {
  mailReceiveTime?: string;       // 메일 수신 시간
  sender?: string;
  subject?: string;
}

export interface KpiProcessResult {
  blNumber: string;
  mailReceiveTime?: string;       // 메일 수신 시간
  lowerDeclAcceptTime?: string;  // 하기신고수리일시
  warehouseEntryTime?: string;   // 창고반입일시
  importDeclTime?: string;        // 수입신고일시
  importAcceptTime?: string;      // 수입신고수리일시
  error?: string;
}

export interface KpiUploadResponse {
  success: boolean;
  blNumbers: string[];
  fileName: string;
  rowCount: number;
  error?: string;
}

export interface KpiProcessRequest {
  blNumbers: string[];
  blYear: string;
}

export interface KpiExportRequest {
  results: KpiProcessResult[];
  originalFileName: string;
}

export interface UnipassXMLDetail {
  cargTrcnRelaBsopTpcd: string;  // 이벤트 타입
  prcsDttm: string | number;      // 처리일시
}

// === KPI 고도화 타입 ===

export type KpiMode = 'import' | 'export';

// 수출 유니패스 시간 데이터
export interface ExportUnipassTimeData {
  exportDeclAcceptTime?: string;  // 수출신고수리일시
  loadingCompleteTime?: string;   // 적재완료일시
}

// 수출 KPI 처리 결과
export interface ExportKpiProcessResult {
  declNumber: string;              // 신고번호
  customsName?: string;            // 세관 영문명
  inspectionType?: string;         // C/S구분 매핑
  tradeType?: string;              // 거래구분 매핑
  exportDeclAcceptTime?: string;   // 수출신고수리일시
  loadingCompleteTime?: string;    // 적재완료일시
  error?: string;
}

// 수출 코드 매핑 항목
export interface ExportCodeMapEntry {
  customsCode?: string;   // B열: 세관코드
  csType?: string;         // L열: C/S구분
  tradeType?: string;      // M열: 거래구분
}

// 수입 KPI 확장 결과 (AMAT, 사유, Gross/Net 포함)
export interface ImportKpiProcessResultExtended extends KpiProcessResult {
  amatWeek?: string;
  amatMonth?: string;
  delayReason?: string;
  controllable?: string;
  gross?: string;
  net?: string;
}

// Exception Code 항목 (사유 키워드 매칭)
export interface DelayReasonEntry {
  code: string;
  priority: number;
  keywords: string[];
  englishReason: string;
  controllable: 'Controllable' | 'Uncontrollable';
}

// 수출 처리 요청
export interface ExportProcessRequest {
  declNumbers: string[];
  blYear: string;
  amatWeek?: string;
  amatMonth?: string;
  exportCodeMap?: Record<string, ExportCodeMapEntry>;
}

// 수입 처리 요청 (확장)
export interface ImportProcessRequest extends KpiProcessRequest {
  amatWeek?: string;
  amatMonth?: string;
  reasonMap?: Record<string, string>;  // BL번호 → K열 특이사항 텍스트
}