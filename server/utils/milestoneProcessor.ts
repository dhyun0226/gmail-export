import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import * as XLSX from 'xlsx/xlsx.mjs';
import { extractBlNumber } from './blExtractor';
import { shouldFilterEmail } from './emailFilter';

// Keep-alive agent for Unipass requests
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  rejectUnauthorized: false
});

function httpsRequest(url: string, timeoutMs: number = 25000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      rejectUnauthorized: false,
      agent: httpsAgent,
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
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

export function cleanBlNumber(blNumber: string): string {
  if (!blNumber) return '';
  return blNumber.toString().trim().replace(/[\s-]/g, '').toUpperCase();
}

/**
 * 메일 수신일시 파싱 (YYYYMMDDHHmmss 또는 다양한 날짜 문자열)
 */
export function parseMailDate(rawVal: any): {
  date: string;       // YYYYMMDD
  time: string;       // H:mm
  display: string;    // YYYY-MM-DD HH:mm
  rawSortKey: string; // YYYYMMDDHHmmss
} {
  const empty = { date: '', time: '', display: '', rawSortKey: '' };
  if (!rawVal) return empty;

  const str = String(rawVal).trim();
  const digits = str.replace(/\D/g, '');

  if (digits.length >= 12) {
    const y = digits.substring(0, 4);
    const m = digits.substring(4, 6);
    const d = digits.substring(6, 8);
    const hour = parseInt(digits.substring(8, 10), 10);
    const minStr = digits.substring(10, 12);
    const rawSortKey = digits.substring(0, 14);

    return {
      date: `${y}${m}${d}`,
      time: `${hour}:${minStr}`,
      display: `${y}-${m}-${d} ${String(hour).padStart(2, '0')}:${minStr}`,
      rawSortKey
    };
  }

  return empty;
}

/**
 * UPS 엑셀 G열 수신시간 파싱 (엑셀 시리얼 넘버 또는 문자열)
 */
export function parseUpsDate(rawVal: any): {
  date: string;       // YYYYMMDD
  time: string;       // H:mm
  display: string;    // YYYY-MM-DD HH:mm
  rawSortKey: string;
} {
  const empty = { date: '', time: '', display: '', rawSortKey: '' };
  if (!rawVal) return empty;

  // 1. 숫자(엑셀 시리얼 날짜)인 경우
  const num = Number(rawVal);
  if (!isNaN(num) && num > 20000) {
    // 엑셀 1900 윤년 버그 감안 25569 = 1970-01-01
    const ms = Math.round((num - 25569) * 86400 * 1000);
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hour = d.getUTCHours();
    const minStr = String(d.getUTCMinutes()).padStart(2, '0');
    const secStr = String(d.getUTCSeconds()).padStart(2, '0');

    return {
      date: `${y}${m}${day}`,
      time: `${hour}:${minStr}`,
      display: `${y}-${m}-${day} ${String(hour).padStart(2, '0')}:${minStr}`,
      rawSortKey: `${y}${m}${day}${String(hour).padStart(2, '0')}${minStr}${secStr}`
    };
  }

  // 2. 문자열 날짜인 경우
  return parseMailDate(rawVal);
}

/**
 * 유니패스 날짜/시간 파싱 (prcsDttm: 20261019100717)
 */
export function parseUnipassDateTime(dateTimeString: string | number | undefined): {
  date: string;       // YYYYMMDD
  time: string;       // H:mm
  display: string;    // YYYY-MM-DD HH:mm
} {
  const empty = { date: '', time: '', display: '' };
  if (!dateTimeString) return empty;

  const s = String(dateTimeString).replace(/\D/g, '');
  if (s.length < 12) return empty;

  const y = s.substring(0, 4);
  const m = s.substring(4, 6);
  const d = s.substring(6, 8);
  const hour = parseInt(s.substring(8, 10), 10);
  const minute = s.substring(10, 12);

  return {
    date: `${y}${m}${d}`,
    time: `${hour}:${minute}`,
    display: `${y}-${m}-${d} ${String(hour).padStart(2, '0')}:${minute}`
  };
}

/**
 * 유니패스 단발 조회
 */
async function fetchUnipassDataOnce(blNumber: string, blYear: string, apiKey: string) {
  const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
  const params = new URLSearchParams({
    crkyCn: apiKey,
    blYy: blYear,
    hblNo: blNumber
  });

  const response = await httpsRequest(`${apiUrl}?${params}`);
  if (!response || !response.includes('<')) {
    throw new Error(`Invalid response (length=${response?.length || 0})`);
  }

  let acceptanceDate = '';
  let acceptanceTime = '';
  let acceptanceTimeDisplay = '';
  let clearanceDate = '';
  let clearanceTime = '';
  let clearanceTimeDisplay = '';

  const parser = new XMLParser();
  const parsedXml = parser.parse(response);
  const detailsNode = parsedXml?.cargCsclPrgsInfoQryRtnVo?.cargCsclPrgsInfoDtlQryVo;

  if (detailsNode) {
    const detailsList = Array.isArray(detailsNode) ? detailsNode : [detailsNode];
    for (const detail of detailsList) {
      const eventType = detail.cargTrcnRelaBsopTpcd;
      const processTime = detail.prcsDttm;
      if (eventType === '수입신고' && !acceptanceDate) {
        const parsed = parseUnipassDateTime(processTime);
        acceptanceDate = parsed.date;
        acceptanceTime = parsed.time;
        acceptanceTimeDisplay = parsed.display;
      }
      if (eventType === '수입신고수리') {
        const parsed = parseUnipassDateTime(processTime);
        clearanceDate = parsed.date;
        clearanceTime = parsed.time;
        clearanceTimeDisplay = parsed.display;
      }
    }
  }

  return {
    acceptanceDate,
    acceptanceTime,
    acceptanceTimeDisplay,
    clearanceDate,
    clearanceTime,
    clearanceTimeDisplay
  };
}

/**
 * 유니패스 재시도 조회 (최대 3회)
 */
export async function fetchUnipassData(blNumber: string, blYear: string, apiKey: string) {
  const empty = {
    acceptanceDate: '',
    acceptanceTime: '',
    acceptanceTimeDisplay: '',
    clearanceDate: '',
    clearanceTime: '',
    clearanceTimeDisplay: '',
    unipassFailed: false
  };

  if (!blNumber) return empty;

  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fetchUnipassDataOnce(blNumber, blYear, apiKey);
      return { ...result, unipassFailed: false };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }

  console.warn(`[Milestone] Unipass failed for BL ${blNumber} after ${maxAttempts} attempts:`, lastError?.message);
  return { ...empty, unipassFailed: true };
}

export interface ParsedShipment {
  id: string;
  blNumber: string;
  trackingNumber: string;
  subject: string;
  sender: string;
  emailDate: string;
  emailTime: string;
  emailDateTimeDisplay: string;
  rawSortKey?: string;
  isUps: boolean;
}

/**
 * 메일 목록 엑셀 파싱 및 중복 제거(최소 시간)
 */
export function parseMailListWorkbook(wb: XLSX.WorkBook, hasUpsFile: boolean): ParsedShipment[] {
  // 데이터가 있는 시트 찾기
  let targetSheet: XLSX.WorkSheet | null = null;
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (ws && ws['!ref']) {
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (rows.length > 1) {
        targetSheet = ws;
        break;
      }
    }
  }

  if (!targetSheet) {
    return [];
  }

  const rawRows: any[][] = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: '' });
  if (rawRows.length <= 1) return [];

  // 헤더 분석 (0행)
  // [ '수신일시', '메일제목', '발신자', '확인' ] 형태 또는 컬럼 인덱스 기반
  let dateCol = 0;
  let titleCol = 1;
  let senderCol = 2;

  const header = rawRows[0].map((c) => String(c).trim());
  const hDateIdx = header.findIndex((h) => h.includes('수신일시') || h.includes('날짜') || h.includes('일시'));
  const hTitleIdx = header.findIndex((h) => h.includes('제목'));
  const hSenderIdx = header.findIndex((h) => h.includes('발신') || h.includes('보낸'));

  if (hDateIdx !== -1) dateCol = hDateIdx;
  if (hTitleIdx !== -1) titleCol = hTitleIdx;
  if (hSenderIdx !== -1) senderCol = hSenderIdx;

  const blMap = new Map<string, ParsedShipment>();

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rawDate = row[dateCol];
    const subject = String(row[titleCol] || '').trim();
    const sender = String(row[senderCol] || '').trim();

    if (!subject) continue;

    // 제외 키워드 필터링
    if (shouldFilterEmail(subject)) continue;

    // UPS Pre-Alert 메일의 경우: 별도 UPS 파일이 제공되면 스킵 (중복 방지)
    const isUpsPreAlert = (sender.toLowerCase().includes('ups') || subject.includes('[Pre-Alert]')) && subject.includes('[Pre-Alert]');
    if (isUpsPreAlert && hasUpsFile) {
      continue;
    }

    const rawBl = extractBlNumber(subject, sender);
    const blNumber = cleanBlNumber(rawBl);
    if (!blNumber || blNumber === 'N/A') continue;

    const parsedDate = parseMailDate(rawDate);
    if (!parsedDate.date) continue;

    const shipment: ParsedShipment = {
      id: `mail-${blNumber}`,
      blNumber,
      trackingNumber: '',
      subject,
      sender,
      emailDate: parsedDate.date,
      emailTime: parsedDate.time,
      emailDateTimeDisplay: parsedDate.display,
      rawSortKey: parsedDate.rawSortKey,
      isUps: false
    };

    if (!blMap.has(blNumber)) {
      blMap.set(blNumber, shipment);
    } else {
      // 가장 빠른 수신일시 기준 선택
      const existing = blMap.get(blNumber)!;
      if (parsedDate.rawSortKey && existing.rawSortKey && parsedDate.rawSortKey < existing.rawSortKey) {
        blMap.set(blNumber, shipment);
      }
    }
  }

  return Array.from(blMap.values());
}

/**
 * UPS 업로드 엑셀 파싱 (B열: BL, C열: Tracking, G열: 수신시간)
 */
export function parseUpsWorkbook(wb: XLSX.WorkBook): ParsedShipment[] {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];

  const ws = wb.Sheets[sheetName];
  if (!ws) return [];

  // rawRows: B열(idx 1), C열(idx 2), G열(idx 6)
  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (rawRows.length <= 1) return [];

  const upsList: ParsedShipment[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rawBl = String(row[1] || '').trim();
    const trackingNumber = String(row[2] || '').trim();
    const rawDate = row[6];

    const blNumber = cleanBlNumber(rawBl);
    if (!blNumber) continue;

    const parsedDate = parseUpsDate(rawDate);

    upsList.push({
      id: `ups-${blNumber}-${trackingNumber || i}`,
      blNumber,
      trackingNumber,
      subject: `UPS [${trackingNumber || blNumber}]`,
      sender: 'UPS',
      emailDate: parsedDate.date,
      emailTime: parsedDate.time,
      emailDateTimeDisplay: parsedDate.display,
      rawSortKey: parsedDate.rawSortKey,
      isUps: true
    });
  }

  return upsList;
}
