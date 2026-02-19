import { downloadAttachment } from '../../utils/docextract/gmailAttachmentService';
import { extractDataFromPdf } from '../../utils/docextract/extractorInterface';
import type { ExtractSingleRequest, ExtractedDocumentData } from '../../utils/docextract/types';

export default defineEventHandler(async (event): Promise<ExtractedDocumentData> => {
  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  const body = await readBody<ExtractSingleRequest>(event);

  if (!body.messageId || !body.attachmentId || !body.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'messageId, attachmentId, filename are required'
    });
  }

  try {
    const gmail = await getGmailClient(accessToken);

    // 1. Gmail에서 PDF 다운로드
    console.log(`[DocExtract] Downloading: ${body.filename}`);
    const pdfBuffer = await downloadAttachment(gmail, body.messageId, body.attachmentId);
    console.log(`[DocExtract] Downloaded: ${body.filename} (${Math.round(pdfBuffer.length / 1024)}KB)`);

    // 2. AI로 데이터 추출
    const result = await extractDataFromPdf(pdfBuffer, body.filename, body.messageId);

    // 3. BL번호 더블체크: 제목 vs 문서
    const subjectBl = body.blNumber && body.blNumber !== 'N/A' ? body.blNumber : '';
    const documentBl = result.blNumber || '';

    result.subjectBlNumber = subjectBl;
    result.documentBlNumber = documentBl;

    if (subjectBl && documentBl) {
      // 둘 다 있으면 비교 (공백/하이픈 제거 후 비교)
      const normalize = (s: string) => s.replace(/[\s\-]/g, '').toUpperCase();
      result.blMatch = normalize(subjectBl) === normalize(documentBl) ? 'match' : 'mismatch';
    } else if (subjectBl && !documentBl) {
      result.blMatch = 'subject_only';
    } else if (!subjectBl && documentBl) {
      result.blMatch = 'document_only';
    } else {
      result.blMatch = 'none';
    }

    // 최종 BL번호: 문서 추출 우선, 없으면 제목에서 가져옴
    result.blNumber = documentBl || subjectBl;

    return result;
  } catch (error: any) {
    console.error(`[DocExtract] Extract error for ${body.filename}:`, error);

    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to extract: ${body.filename}`
    });
  }
});
