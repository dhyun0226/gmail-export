import moment from 'moment-timezone';
import { extractBlNumber, extractUpsShipmentInfo } from '../blExtractor';
import { shouldFilterEmail } from '../emailFilter';
import type { EmailWithAttachments, AttachmentInfo } from './types';

/**
 * MIME 파트를 재귀 탐색하여 PDF 첨부파일 정보 추출
 */
function findPdfAttachments(parts: any[], result: AttachmentInfo[] = []): AttachmentInfo[] {
  if (!parts) return result;

  for (const part of parts) {
    if (part.mimeType === 'application/pdf' && part.body?.attachmentId) {
      result.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename || 'unknown.pdf',
        mimeType: part.mimeType,
        size: part.body.size || 0
      });
    }

    // 중첩 파트 탐색
    if (part.parts) {
      findPdfAttachments(part.parts, result);
    }
  }

  return result;
}

/**
 * Gmail에서 날짜 범위 내 PDF 첨부파일이 있는 메일 조회
 * 기존 email/list.get.ts의 필터링 로직을 동일하게 적용
 */
export async function fetchEmailsWithPdfAttachments(
  gmail: any,
  startDate: string,
  endDate: string
): Promise<EmailWithAttachments[]> {
  const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
  const query = `after:${startTimestamp} before:${endTimestamp} has:attachment filename:pdf`;

  console.log('[DocExtract] Searching emails with query:', query);

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 500
  });

  const messages = response.data.messages || [];
  console.log(`[DocExtract] Found ${messages.length} emails with PDF attachments`);

  const results: EmailWithAttachments[] = [];

  for (const message of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
      format: 'full'
    });

    const { payload } = detail.data;
    const headers = payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '제목 없음';
    const sender = headers.find((h: any) => h.name === 'From')?.value || '';
    const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';

    // 기존 필터링 로직 적용
    if (shouldFilterEmail(subject)) {
      continue;
    }

    // PDF 첨부파일 찾기
    const attachments = findPdfAttachments(payload?.parts || []);
    if (attachments.length === 0) continue;

    // BL 번호 추출
    const blNumber = extractBlNumber(subject, sender);

    // 한국 시간 변환
    const date = moment(dateHeader).tz('Asia/Seoul');

    results.push({
      messageId: message.id!,
      subject,
      sender,
      date: date.format('YYYYMMDD'),
      time: date.format('HH:mm'),
      blNumber: blNumber || 'N/A',
      attachments
    });
  }

  console.log(`[DocExtract] After filtering: ${results.length} emails, ${results.reduce((sum, e) => sum + e.attachments.length, 0)} PDFs`);
  return results;
}

/**
 * Gmail에서 첨부파일 바이너리 다운로드
 */
export async function downloadAttachment(
  gmail: any,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const response = await gmail.users.messages.attachments.get({
    userId: 'me',
    id: attachmentId,
    messageId: messageId
  });

  // Gmail API는 base64url 인코딩으로 반환
  return Buffer.from(response.data.data, 'base64url');
}
