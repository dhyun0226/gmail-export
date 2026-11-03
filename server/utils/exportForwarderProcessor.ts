import * as XLSX from 'xlsx/xlsx.mjs';

export interface ExportDataItem {
  row: number;
  dclNo: string;
  invNo: string;
  rawContract: string;
  forwarder: string;
}

export interface ContractFormatError {
  row: number;
  dclNo: string;
  invNo: string;
  rawContract: string;
  reason: string;
}

export interface DailyInvoiceItem {
  invNo: string;
  forwarder: string;
  sheetName: string;
  row: number;
}

export interface ForwarderCountComparison {
  forwarder: string;
  exportCount: number;
  dailyCount: number;
  diff: number;
  isMatch: boolean;
}

export interface InvoiceDiscrepancy {
  invNo: string;
  dclNo: string;
  exportForwarder: string;
  dailyForwarder: string;
  rawContract?: string;
  type: 'MISMATCH' | 'MISSING_IN_DAILY' | 'MISSING_IN_EXPORT';
  typeLabel: string;
}

export interface ForwarderVerificationResult {
  totalExportRows: number;
  totalDailyRows: number;
  forwarderCounts: ForwarderCountComparison[];
  totalComparison: {
    totalExportCount: number;
    totalDailyCount: number;
    diff: number;
    isMatch: boolean;
  };
  contractFormatErrors: ContractFormatError[];
  discrepancies: InvoiceDiscrepancy[];
  counts: {
    mismatchCount: number;
    missingInDailyCount: number;
    missingInExportCount: number;
    contractErrorCount: number;
  };
  matchedInvoicesCount: number;
  /** 수출데이터에서 동일 인보이스가 여러 신고번호로 등록된 건 (개수 검증 시 1건으로 집계) */
  duplicateInvoices: DuplicateInvoice[];
}

export interface DuplicateInvoice {
  invNo: string;
  forwarder: string;
  dclNos: string[];
  count: number;
}

/**
 * 1번 앤컴 수출데이터 파일 파싱
 * - 컬럼: 신고번호(E 또는 A), 인보이스 번호(AZ), 계약번호1(BD)
 */
export function parseExportDataWorkbook(wb: XLSX.WorkBook): {
  exportList: ExportDataItem[];
  formatErrors: ContractFormatError[];
} {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { exportList: [], formatErrors: [] };

  const ws = wb.Sheets[sheetName];
  if (!ws) return { exportList: [], formatErrors: [] };

  const rows = XLSX.utils.sheet_to_json<any>(ws, { header: 'A', defval: '' });
  if (rows.length <= 1) return { exportList: [], formatErrors: [] };

  // 헤더 분석하여 정확한 컬럼 문자(A, B, C...) 찾기
  const headerRow = rows[0];
  let dclCol = '';
  let invCol = '';
  let contractCol = '';

  for (const [col, val] of Object.entries(headerRow)) {
    const v = String(val).trim();
    if (v === '신고번호') {
      dclCol = col;
    } else if (v.includes('인보이스') && v.includes('번호')) {
      invCol = col;
    } else if (v === '계약번호1' || v.includes('계약번호1')) {
      contractCol = col;
    }
  }

  // 헤더명으로 못 찾았을 경우 기본값 (신고번호: E 또는 A, 인보이스: AZ, 계약번호1: BD)
  if (!dclCol) {
    dclCol = headerRow['E'] ? 'E' : 'A';
  }
  if (!invCol) invCol = 'AZ';
  if (!contractCol) contractCol = 'BD';

  const exportList: ExportDataItem[] = [];
  const formatErrors: ContractFormatError[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const dclNo = String(row[dclCol] !== undefined ? row[dclCol] : '').trim();
    const invNo = cleanInvoiceNumber(row[invCol]);
    const rawContract = String(row[contractCol] !== undefined ? row[contractCol] : '').trim();

    // 완전 빈 행은 건너뜀
    if (!dclNo && !invNo && !rawContract) continue;

    let forwarder = '';
    if (rawContract && rawContract.includes('/')) {
      const parts = rawContract.split('/');
      forwarder = parts[0].trim().toUpperCase();
      if (!forwarder) {
        formatErrors.push({
          row: r + 1,
          dclNo: dclNo || '미기재',
          invNo: invNo || '미기재',
          rawContract,
          reason: '포워더 코드 공란'
        });
      }
    } else {
      formatErrors.push({
        row: r + 1,
        dclNo: dclNo || '미기재',
        invNo: invNo || '미기재',
        rawContract,
        reason: rawContract ? "'/' 구분자 누락" : '계약번호1 공란'
      });
    }

    exportList.push({
      row: r + 1,
      dclNo,
      invNo,
      rawContract,
      forwarder
    });
  }

  return { exportList, formatErrors };
}

/**
 * 2번 수출 포워더 검증 DAILY 양식 파일 파싱
 * - 각 Sheet 이름이 포워더
 * - 각 Sheet 내에서 인보이스 번호 추출
 */
export function parseDailyWorkbook(wb: XLSX.WorkBook): {
  dailyMap: Map<string, DailyInvoiceItem>;
  dailyCounts: Record<string, number>;
  sheetNames: string[];
} {
  const dailyMap = new Map<string, DailyInvoiceItem>();
  const dailyCounts: Record<string, number> = {};
  const sheetNames: string[] = [];

  for (const sName of wb.SheetNames) {
    const ws = wb.Sheets[sName];
    if (!ws) continue;

    const sheetFwd = sName.trim().toUpperCase();
    sheetNames.push(sheetFwd);
    dailyCounts[sheetFwd] = 0;

    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
    if (data.length === 0) continue;

    // 인보이스 컬럼 위치 찾기 (보통 A열 0번 인덱스, 또는 'INV' 헤더가 있는 열)
    let invColIndex = 0;
    const firstRow = data[0] || [];
    for (let c = 0; c < firstRow.length; c++) {
      const hStr = String(firstRow[c] || '').toUpperCase();
      if (hStr.includes('INV') || hStr.includes('인보이스')) {
        invColIndex = c;
        break;
      }
    }

    let count = 0;
    for (let r = 0; r < data.length; r++) {
      const rawVal = data[r][invColIndex];
      const invNo = cleanInvoiceNumber(rawVal);

      if (!invNo) continue;
      // 헤더 라벨 제외
      if (
        invNo === 'INV.' ||
        invNo === 'INV' ||
        invNo.toLowerCase().includes('inv.') ||
        invNo.includes('인보이스') ||
        invNo.includes('메일시간') ||
        invNo.includes('특이사항')
      ) {
        continue;
      }

      count++;
      dailyMap.set(invNo, {
        invNo,
        forwarder: sheetFwd,
        sheetName: sName,
        row: r + 1
      });
    }

    dailyCounts[sheetFwd] = count;
  }

  return { dailyMap, dailyCounts, sheetNames };
}

/**
 * 1번과 2번 파일 비교 분석 수행
 */
export function verifyExportForwarders(
  exportList: ExportDataItem[],
  formatErrors: ContractFormatError[],
  dailyMap: Map<string, DailyInvoiceItem>,
  dailyCounts: Record<string, number>,
  dailySheetNames: string[]
): ForwarderVerificationResult {
  // (1) 1번 수출데이터 포워더별 건수 집계 (인보이스 기준: 동일 인보이스는 1건으로 집계)
  const exportCounts: Record<string, number> = {};
  const invGroups = new Map<string, { forwarder: string; dclNos: string[] }>();
  for (const item of exportList) {
    if (!item.forwarder) continue;
    const key = item.invNo ? `${item.forwarder}|${item.invNo}` : `${item.forwarder}|#row${item.row}`;
    const g = invGroups.get(key);
    if (g) {
      g.dclNos.push(item.dclNo);
      continue;
    }
    invGroups.set(key, { forwarder: item.forwarder, dclNos: [item.dclNo] });
    exportCounts[item.forwarder] = (exportCounts[item.forwarder] || 0) + 1;
  }
  const duplicateInvoices: DuplicateInvoice[] = [];
  for (const [key, g] of invGroups.entries()) {
    if (g.dclNos.length > 1) {
      duplicateInvoices.push({
        invNo: key.split('|')[1],
        forwarder: g.forwarder,
        dclNos: g.dclNos,
        count: g.dclNos.length
      });
    }
  }

  // 모든 포워더 목록 (수출데이터 + DAILY 시트)
  const allForwarderSet = new Set<string>();
  Object.keys(exportCounts).forEach((f) => allForwarderSet.add(f));
  Object.keys(dailyCounts).forEach((f) => allForwarderSet.add(f));
  dailySheetNames.forEach((f) => allForwarderSet.add(f));

  // 포워더별 개수 검증 목록
  const forwarderCounts: ForwarderCountComparison[] = [];
  let totalExportCount = 0;
  let totalDailyCount = 0;

  for (const fwd of Array.from(allForwarderSet)) {
    const expCnt = exportCounts[fwd] || 0;
    const dlyCnt = dailyCounts[fwd] || 0;
    const diff = expCnt - dlyCnt;
    totalExportCount += expCnt;
    totalDailyCount += dlyCnt;

    forwarderCounts.push({
      forwarder: fwd,
      exportCount: expCnt,
      dailyCount: dlyCnt,
      diff,
      isMatch: diff === 0
    });
  }

  // 건수 많은 순 + 이름 순 정렬
  forwarderCounts.sort((a, b) => (b.exportCount + b.dailyCount) - (a.exportCount + a.dailyCount) || a.forwarder.localeCompare(b.forwarder));

  const totalComparison = {
    totalExportCount,
    totalDailyCount,
    diff: totalExportCount - totalDailyCount,
    isMatch: totalExportCount === totalDailyCount
  };

  // (3) 포워더 불일치 및 누락 검증
  const discrepancies: InvoiceDiscrepancy[] = [];
  const matchedInvoices = new Set<string>();

  // 1) 수출데이터 기준으로 DAILY 대조
  const seenExportInv = new Set<string>();
  for (const item of exportList) {
    if (!item.invNo) continue;
    // 동일 인보이스(분할신고 등)는 1회만 대조
    if (seenExportInv.has(item.invNo)) continue;
    seenExportInv.add(item.invNo);

    const dailyItem = dailyMap.get(item.invNo);
    if (!dailyItem) {
      // DAILY에 없음
      discrepancies.push({
        invNo: item.invNo,
        dclNo: item.dclNo,
        exportForwarder: item.forwarder || '(형식오류)',
        dailyForwarder: '(DAILY 미등록)',
        rawContract: item.rawContract,
        type: 'MISSING_IN_DAILY',
        typeLabel: 'DAILY 누락'
      });
    } else if (item.forwarder && item.forwarder !== dailyItem.forwarder) {
      // 포워더 불일치
      discrepancies.push({
        invNo: item.invNo,
        dclNo: item.dclNo,
        exportForwarder: item.forwarder,
        dailyForwarder: dailyItem.forwarder,
        rawContract: item.rawContract,
        type: 'MISMATCH',
        typeLabel: '포워더 불일치'
      });
    } else {
      matchedInvoices.add(item.invNo);
    }
  }

  // 2) DAILY 기준 수출데이터에 없는 인보이스 대조
  const exportInvMap = new Map<string, ExportDataItem>();
  exportList.forEach((e) => {
    if (e.invNo) exportInvMap.set(e.invNo, e);
  });

  for (const [invNo, dItem] of dailyMap.entries()) {
    if (!exportInvMap.has(invNo)) {
      discrepancies.push({
        invNo,
        dclNo: '-',
        exportForwarder: '(수출데이터 미신고)',
        dailyForwarder: dItem.forwarder,
        rawContract: '-',
        type: 'MISSING_IN_EXPORT',
        typeLabel: '수출데이터 누락'
      });
    }
  }

  const mismatchCount = discrepancies.filter((d) => d.type === 'MISMATCH').length;
  const missingInDailyCount = discrepancies.filter((d) => d.type === 'MISSING_IN_DAILY').length;
  const missingInExportCount = discrepancies.filter((d) => d.type === 'MISSING_IN_EXPORT').length;

  return {
    totalExportRows: exportList.length,
    totalDailyRows: dailyMap.size,
    forwarderCounts,
    totalComparison,
    contractFormatErrors: formatErrors,
    discrepancies,
    counts: {
      mismatchCount,
      missingInDailyCount,
      missingInExportCount,
      contractErrorCount: formatErrors.length
    },
    matchedInvoicesCount: matchedInvoices.size,
    duplicateInvoices
  };
}

/**
 * 인보이스 번호 문자열 정제
 */
export function cleanInvoiceNumber(val: any): string {
  if (val === undefined || val === null) return '';
  const s = String(val).trim();
  // 소수점 0 제거 (.0)
  if (s.endsWith('.0')) {
    return s.slice(0, -2);
  }
  return s;
}
