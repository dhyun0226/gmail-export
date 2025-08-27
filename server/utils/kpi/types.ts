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