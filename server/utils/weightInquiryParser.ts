/**
 * 중량문의 메일 파싱 유틸
 */

export interface WeightInquiryData {
  date: string;
  subject: string;
  hbNumber: string;
  mbNumber: string;
  loadingWeight: string;   // 적하중량
  netWeight: string;       // 순중량
  confirmedByLoading: 'O' | 'X';  // 적하중량 진행 여부
  threadId: string;
}

/**
 * 제목에서 HB 번호 추출
 */
export function extractHbFromSubject(subject: string): string {
  // HB: 4812435711 또는 HB:4812435711
  const hbMatch = subject.match(/HB:\s*(\d+)/i);
  return hbMatch ? hbMatch[1] : '';
}

/**
 * 제목에서 MB 번호 추출
 */
export function extractMbFromSubject(subject: string): string {
  // MB: 297-71116065 또는 MB:297-71116065
  const mbMatch = subject.match(/MB:\s*([\d-]+)/i);
  return mbMatch ? mbMatch[1] : '';
}

/**
 * HTML 태그 제거
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#\d+;/g, '')
    .trim();
}

/**
 * 본문에서 적하중량 추출
 */
export function extractLoadingWeight(body: string): string {
  const text = stripHtml(body);
  // 적하중량 : 1 KG, 적하중량: 1.5 KG, 적하중량 :1KG 등
  const match = text.match(/적하중량\s*[:：]\s*([\d.,]+)\s*KG/i);
  return match ? `${match[1]} KG` : '';
}

/**
 * 본문에서 순중량 추출
 */
export function extractNetWeight(body: string): string {
  const text = stripHtml(body);
  // 순중량 : 1.04 KG, 순중량: 2 KG 등
  const match = text.match(/순중량\s*[:：]\s*([\d.,]+)\s*KG/i);
  return match ? `${match[1]} KG` : '';
}

/**
 * RE: 답변 본문에서 "적하중량 진행" 여부 확인
 */
export function checkLoadingWeightConfirmed(replyBody: string): boolean {
  const text = stripHtml(replyBody);
  // "적하 중량에 맞추어 진행" 또는 "적하중량에 맞추어 진행" 등
  return /적하\s*중량.*진행/.test(text);
}

/**
 * 제목이 중량문의 메일인지 확인
 */
export function isWeightInquirySubject(subject: string): boolean {
  // 중량문의, [중량문의], *중량문의* 등
  return /중량\s*문의/.test(subject);
}

/**
 * 제목이 RE: 답변인지 확인
 */
export function isReplySubject(subject: string): boolean {
  return /\bRE:/i.test(subject);
}
