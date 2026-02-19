/**
 * 이메일 필터링 공통 유틸
 * server/api/email/list.get.ts의 필터링 로직을 재사용 가능하도록 분리
 */

/** 제외할 키워드 목록 */
export const FILTER_KEYWORDS = [
  '순중량 정정요청', '미결안내/용도설명서 요청', 'PENDING LIST',
  '미반출 내역 안내의 건', 'Microsoft OneDrive 확인 코드', '운송리스트 [TOP Customs]',
  'check in Korea HTS', 'BOM 전달', '가산금적용여부문의', '이고요청',
  '중량문의', '중량 문의', '통관 지연 사유 문의', '수입신고필증 전달건', '입항통보건 리스트 안내', '입고요청', 'RATED B/L 요청',
  '스케줄 지연 안내', '원산지 확인요청'
];

/**
 * 이메일 제목이 필터링 대상인지 확인
 * @returns true면 제외해야 하는 메일
 */
export function shouldFilterEmail(subject: string): boolean {
  // 제외 키워드 체크
  if (FILTER_KEYWORDS.some(keyword => subject.includes(keyword))) {
    return true;
  }

  // RE: 답장 필터링 (++CNEE++ CNW Pre-Alert 제외)
  const hasReplyPrefix = /\bRE:/i.test(subject);
  const hasCneeCnwPreAlert = /RE:\s*\+\+CNEE\+\+.*CNW Pre-Alert/i.test(subject);

  if (hasReplyPrefix && !hasCneeCnwPreAlert) {
    return true;
  }

  return false;
}

/**
 * 중첩된 멀티파트 구조에서 본문 추출
 */
export function extractBody(messagePart: any, depth: number = 0): string {
  if (depth > 10) return '';

  if (messagePart?.body?.data) {
    return Buffer.from(messagePart.body.data, 'base64url').toString('utf8');
  }

  if (messagePart?.parts && messagePart.parts.length > 0) {
    for (const part of messagePart.parts) {
      if (part.mimeType === 'text/html') {
        const htmlBody = extractBody(part, depth + 1);
        if (htmlBody) return htmlBody;
      }
    }
    for (const part of messagePart.parts) {
      if (part.mimeType === 'text/plain') {
        const textBody = extractBody(part, depth + 1);
        if (textBody) return textBody;
      }
    }
    for (const part of messagePart.parts) {
      if (part.mimeType?.startsWith('multipart/')) {
        const nestedBody = extractBody(part, depth + 1);
        if (nestedBody) return nestedBody;
      }
    }
  }

  return '';
}
