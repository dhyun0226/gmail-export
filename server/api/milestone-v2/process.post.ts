import { defineEventHandler, readMultipartFormData, createError, getCookie } from 'h3';
import * as XLSX from 'xlsx/xlsx.mjs';
import moment from 'moment-timezone';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import { getGmailClient } from '../../utils/google';
import { extractUpsShipmentInfo } from '../../utils/blExtractor';

// Gmail 멀티파트 본문 디코드 (중첩 구조 재귀 탐색)
function extractBody(messagePart: any, depth: number = 0): string {
  if (depth > 10) return '';

  if (messagePart?.body?.data) {
    return Buffer.from(messagePart.body.data, 'base64url').toString('utf8');
  }

  if (messagePart?.parts && messagePart.parts.length > 0) {
    for (const part of messagePart.parts) {
      if (part.mimeType === 'text/html') {
        const b = extractBody(part, depth + 1);
        if (b) return b;
      }
    }
    for (const part of messagePart.parts) {
      if (part.mimeType === 'text/plain') {
        const b = extractBody(part, depth + 1);
        if (b) return b;
      }
    }
    for (const part of messagePart.parts) {
      if (part.mimeType?.startsWith('multipart/')) {
        const b = extractBody(part, depth + 1);
        if (b) return b;
      }
    }
  }

  return '';
}

// HTTPS 요청 함수
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', (error) => { reject(error); });
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 날짜/시간 포맷팅 함수
const formatDate = (dateTimeString: string | number) => {
  if (!dateTimeString) return '';
  const s = String(dateTimeString);
  if (s.length < 8) return '';
  return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
};

const formatTime = (dateTimeString: string | number) => {
  if (!dateTimeString) return '';
  const s = String(dateTimeString);
  if (s.length < 12) return '';
  return `${s.substring(8, 10)}:${s.substring(10, 12)}`;
};

// 유니패스 API 호출 함수
async function fetchUnipassData(blNumber: string, blYear: string) {
  if (!blNumber) return { acceptanceDate: '', acceptanceTime: '', clearanceDate: '', clearanceTime: '' };

  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const config = useRuntimeConfig();
    const params = new URLSearchParams({
      crkyCn: config.unipassApiKey,
      blYy: blYear,
      hblNo: blNumber
    });

    const response = await httpsRequest(`${apiUrl}?${params}`);

    let acceptanceDate = '';
    let acceptanceTime = '';
    let clearanceDate = '';
    let clearanceTime = '';

    const parser = new XMLParser();
    const parsedXml = parser.parse(response);
    const detailsNode = parsedXml?.cargCsclPrgsInfoQryRtnVo?.cargCsclPrgsInfoDtlQryVo;

    if (detailsNode) {
      const detailsList = Array.isArray(detailsNode) ? detailsNode : [detailsNode];
      for (const detail of detailsList) {
        const eventType = detail.cargTrcnRelaBsopTpcd;
        const processTime = detail.prcsDttm;
        if (eventType === '수입신고' && !acceptanceDate) {
          acceptanceDate = formatDate(processTime);
          acceptanceTime = formatTime(processTime);
        }
        if (eventType === '수입신고수리') {
          clearanceDate = formatDate(processTime);
          clearanceTime = formatTime(processTime);
        }
      }
    }

    return { acceptanceDate, acceptanceTime, clearanceDate, clearanceTime };
  } catch (error) {
    console.error(`[Milestone-v2] Unipass error for BL ${blNumber}:`, error);
    return { acceptanceDate: '', acceptanceTime: '', clearanceDate: '', clearanceTime: '' };
  }
}

// Gmail에서 BL번호로 메일 수신시간 + (UPS Pre-Alert일 경우) Tracking 번호 조회
async function fetchEmailInfo(
  gmail: any,
  blNumber: string
): Promise<{ emailDate: string; emailTime: string; trackingNumber: string }> {
  const empty = { emailDate: '', emailTime: '', trackingNumber: '' };
  try {
    // BL번호로 Gmail 검색
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `subject:${blNumber}`,
      maxResults: 1
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) {
      return empty;
    }

    // 첫 번째 매칭 메일의 상세 정보 (본문 포함)
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: messages[0].id!,
      format: 'full'
    });

    const payload = detail.data.payload;
    const headers = payload?.headers || [];
    const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const sender = headers.find((h: any) => h.name === 'From')?.value || '';

    if (!dateHeader) return empty;

    const date = moment(dateHeader).tz('Asia/Seoul');
    const emailDate = date.format('YYYYMMDD');
    const emailTime = date.format('H:mm');

    // UPS Pre-Alert 메일인 경우 본문에서 Tracking 번호 추출
    let trackingNumber = '';
    if (sender.toLowerCase().includes('ups') && subject.includes('[Pre-Alert]')) {
      try {
        const body = extractBody(payload);
        if (body) {
          const shipments = extractUpsShipmentInfo(body, subject);
          // 동일 BL번호가 있으면 해당 shipment, 없으면 첫 번째 shipment의 tracking 사용
          const match = shipments.find(s => s.blNumber === blNumber) || shipments[0];
          if (match?.trackingNumber) trackingNumber = match.trackingNumber;
        }
      } catch (bodyErr) {
        console.error(`[Milestone-v2] Body extraction error for BL ${blNumber}:`, bodyErr);
      }
    }

    return { emailDate, emailTime, trackingNumber };
  } catch (error) {
    console.error(`[Milestone-v2] Gmail search error for BL ${blNumber}:`, error);
    return empty;
  }
}

// BL 번호 정리 함수
function cleanBlNumber(blNumber: string): string {
  if (!blNumber) return '';
  return blNumber.toString().trim().replace(/[\s-]/g, '').toUpperCase();
}

export default defineEventHandler(async (event) => {
  console.log('[Milestone-v2] Starting processing');

  const accessToken = getCookie(event, 'access_token');
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' });
  }

  try {
    // 1. 파일 업로드 처리
    const parts = await readMultipartFormData(event);
    const file = parts?.find(p => p.name === 'file' && p.data);
    const blYearPart = parts?.find(p => p.name === 'blYear');
    const blYear = blYearPart?.data?.toString() || new Date().getFullYear().toString();

    if (!file || !(file.data instanceof Uint8Array) || file.data.length === 0) {
      throw createError({ statusCode: 400, statusMessage: '엑셀 파일이 업로드되지 않았습니다.' });
    }

    console.log(`[Milestone-v2] File: ${file.filename}, size: ${file.data.length} bytes`);

    // 2. 엑셀 파일 읽기 - F열(BL번호), R열(Load ID), S열(Carrier Code)
    const wb = XLSX.read(file.data, { type: 'buffer', codepage: 65001 });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      throw createError({ statusCode: 400, statusMessage: '시트가 비어 있습니다.' });
    }

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '' });

    // 3. F열(BL번호), R열(Load ID), S열(Carrier Code) 추출
    const entries: Array<{ blNumber: string; loadId: string; carrierCode: string }> = [];
    for (let i = 1; i < rows.length; i++) { // 헤더(0행) 제외
      const row = rows[i] as any;
      const blNumber = cleanBlNumber(row['F']?.toString() || '');
      const loadId = (row['R']?.toString() || '').trim();
      const carrierCode = (row['S']?.toString() || '').trim();

      if (blNumber) {
        entries.push({ blNumber, loadId, carrierCode });
      }
    }

    console.log(`[Milestone-v2] Extracted ${entries.length} entries`);

    if (entries.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'F열에서 BL번호를 찾을 수 없습니다.' });
    }

    // 4. Gmail 클라이언트 생성
    const gmail = await getGmailClient(accessToken);

    // 5. 각 BL번호에 대해 Gmail 조회 + 유니패스 조회
    const results = [];
    let processedCount = 0;

    for (const entry of entries) {
      console.log(`[Milestone-v2] Processing ${++processedCount}/${entries.length}: ${entry.blNumber}`);

      // Gmail 조회와 유니패스 조회를 병렬로 실행
      const [emailInfoResult, unipassResult] = await Promise.all([
        fetchEmailInfo(gmail, entry.blNumber),
        fetchUnipassData(entry.blNumber, blYear)
      ]);

      results.push({
        blNumber: entry.blNumber,
        loadId: entry.loadId,
        carrierCode: entry.carrierCode,
        emailDate: emailInfoResult.emailDate,
        emailTime: emailInfoResult.emailTime,
        trackingNumber: emailInfoResult.trackingNumber,
        ...unipassResult
      });

      // API 호출 간격 조절 (0.1초)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Milestone-v2] Completed. ${results.length} entries processed`);

    return {
      success: true,
      message: `${results.length}개의 BL번호에 대한 조회가 완료되었습니다.`,
      results,
      totalCount: results.length,
      processedCount: results.filter(r => r.emailDate || r.acceptanceDate || r.clearanceDate).length
    };

  } catch (error: any) {
    console.error('[Milestone-v2] Processing error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '처리 중 오류가 발생했습니다.'
    });
  }
});
