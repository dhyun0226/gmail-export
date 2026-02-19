// 문서 추출 관련 타입 정의

/** Gmail에서 찾은 PDF 첨부파일 정보 */
export interface AttachmentInfo {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

/** PDF 첨부파일이 있는 이메일 */
export interface EmailWithAttachments {
  messageId: string;
  subject: string;
  sender: string;
  date: string;
  time: string;
  blNumber: string;
  attachments: AttachmentInfo[];
}

/** AI가 PDF에서 추출한 데이터 */
export interface ExtractedDocumentData {
  messageId: string;
  sourceFilename: string;
  documentType: string;      // Invoice, Packing List, Airbill, Commercial Invoice, 기타
  blNumber: string;           // BL번호 (최종 사용값)
  subjectBlNumber?: string;   // 메일 제목에서 추출한 BL번호
  documentBlNumber?: string;  // 문서(AI)에서 추출한 BL번호
  blMatch?: 'match' | 'mismatch' | 'subject_only' | 'document_only' | 'none';
  productName: string;        // 품명
  quantity: string;           // 수량
  weight: string;             // 중량
  amount: string;             // 금액
  hsCode: string;             // HS코드
  countryOfOrigin: string;    // 원산지
  shipper: string;            // 송하인
  error?: string;
}

/** 첨부파일 조회 응답 */
export interface FetchAttachmentsResponse {
  success: boolean;
  emails: EmailWithAttachments[];
  totalAttachments: number;
}

/** 단일 PDF 추출 요청 */
export interface ExtractSingleRequest {
  messageId: string;
  attachmentId: string;
  filename: string;
  subject: string;
  sender: string;
  blNumber: string;
}

/** Drive 업로드 요청 */
export interface DriveUploadRequest {
  results: ExtractedDocumentData[];
  pdfReferences: {
    messageId: string;
    attachmentId: string;
    filename: string;
    blNumber: string;
  }[];
}

/** Drive 업로드 응답 */
export interface DriveUploadResponse {
  success: boolean;
  uploadedFiles: { filename: string; blNumber: string; webViewLink?: string }[];
  createdFolders: { blNumber: string; folderId: string }[];
  errors: string[];
}

/** 추출 통계 */
export interface ExtractionStatistics {
  totalEmails: number;
  totalPdfs: number;
  successfulExtractions: number;
  failedExtractions: number;
  uniqueBlNumbers: number;
}
