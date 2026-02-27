import * as XLSX from 'xlsx';
import type { ImportKpiProcessResultExtended, ExportKpiProcessResult } from './types';

/**
 * 시간 차이를 일(day) 단위로 계산
 */
function calculateTimeDifferenceInDays(endTime: string | undefined, startTime: string | undefined): number | string {
  if (!endTime || !startTime || endTime === '-' || startTime === '-') return '';
  try {
    const end = new Date(endTime);
    const start = new Date(startTime);
    if (isNaN(end.getTime()) || isNaN(start.getTime())) return '';
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(diffInDays * 10000) / 10000;
  } catch {
    return '';
  }
}

/**
 * Import KPI 시트 생성/병합 (17열)
 */
function createImportSheet(
  results: ImportKpiProcessResultExtended[],
  amatWeek: string,
  amatMonth: string,
  baseData: any[] = []
): XLSX.WorkSheet {
  let data: any[][] = [];

  // 기존 데이터가 있으면 헤더 포함 그대로 사용
  if (baseData && baseData.length > 0) {
    data = JSON.parse(JSON.stringify(baseData));
  } else {
    // 헤더 생성
    data.push([
      'AMAT WK', 'AMAT MONTH', 'HAWB', 'DHL Doc', 'Dest.Arrival',
      'Warehouse', 'Submitted to Customs', 'Custom Clearance',
      'KPI(Hour)', 'Actual', 'Diff time', 'Actual(DHL)', 'Diff time(DHL)',
      'Delay Reason Details', 'Controll/Uncontroll', 'Gross', 'Net'
    ]);
  }

  // 새 데이터 추가
  for (const r of results) {
    const jValue = calculateTimeDifferenceInDays(r.importAcceptTime, r.lowerDeclAcceptTime);
    const kValue = typeof jValue === 'number' ? Math.round((jValue - 0.2) * 100) / 100 : '';
    const lValue = r.dhlDiffTime ?? '';
    const mValue = r.dhlKpiDiff ?? '';

    data.push([
      r.amatWeek || amatWeek,
      r.amatMonth || amatMonth,
      r.blNumber,
      r.mailReceiveTime || '',
      r.lowerDeclAcceptTime || '',
      r.warehouseEntryTime || '',
      r.importDeclTime || '',
      r.importAcceptTime || '',
      0.2,
      jValue,
      kValue,
      lValue,
      mValue,
      r.delayReason || '',
      r.controllable || '',
      r.gross || '',
      r.net || '',
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 22 }, { wch: 18 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
    { wch: 50 }, { wch: 22 }, { wch: 8 }, { wch: 8 },
  ];

  return ws;
}

/**
 * Export KPI 시트 생성/병합 (15열)
 */
function createExportSheet(
  results: ExportKpiProcessResult[],
  amatWeek: string,
  amatMonth: string,
  baseData: any[] = []
): XLSX.WorkSheet {
  let data: any[][] = [];

  // 기존 데이터가 있으면 사용
  if (baseData && baseData.length > 0) {
    data = JSON.parse(JSON.stringify(baseData));
  } else {
    // 헤더 생성
    data.push([
      'AMAT WK', 'AMAT MONTH', 'Export Declaration Number',
      'Customs(Export)', 'Customs Inspection or document Received',
      'Normal Export / Re-Export',
      'All Docs Received', 'Destination Custom Clearance',
      'Required Clearance Time', 'Actual Clearance Time', 'Diff time',
      'Delay Reason Details', 'Controllable or Uncontrollable',
      'Gross', 'Net'
    ]);
  }

  // 새 데이터 추가
  for (const r of results) {
    data.push([
      amatWeek,
      amatMonth,
      r.declNumber,
      r.customsName || '',
      r.inspectionType || '',
      r.tradeType || '',
      r.allDocsReceivedTime || '',
      r.exportDeclAcceptTime || '',
      0.0625,
      r.actualClearanceTime ?? '',
      r.diffTime ?? '',
      '', 
      '', 
      r.gross || '',
      r.net || '',
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 25 },
    { wch: 16 }, { wch: 40 },
    { wch: 22 },
    { wch: 20 }, { wch: 28 },
    { wch: 22 }, { wch: 22 }, { wch: 12 },
    { wch: 30 }, { wch: 28 },
    { wch: 8 }, { wch: 8 },
  ];

  return ws;
}

/**
 * Summary 시트 생성 (병합된 데이터 기준)
 */
function createSummarySheetFromRaw(
  importSheetData: any[][],
  exportSheetData: any[][],
  amatWeek: string,
  amatMonth: string
): XLSX.WorkSheet {
  // 헤더 제외 데이터 필터링
  const importRows = importSheetData.slice(1).filter(row => row[2]); // HAWB 존재 여부
  const exportRows = exportSheetData.slice(1).filter(row => row[2]); // 신고번호 존재 여부

  // Import 통계
  const importTotal = importRows.length;
  const importGrossY = importRows.filter(row => row[15] === 'Y').length;
  const importNetY = importRows.filter(row => row[16] === 'Y').length;
  const importGrossRate = importTotal > 0 ? Math.round((importGrossY / importTotal) * 10000) / 100 : 0;
  const importNetRate = importTotal > 0 ? Math.round((importNetY / importTotal) * 10000) / 100 : 0;

  // Export 통계
  const exportTotal = exportRows.length;
  const exportGrossY = exportRows.filter(row => row[13] === 'Y').length;
  const exportNetY = exportRows.filter(row => row[14] === 'Y').length;
  const exportGrossRate = exportTotal > 0 ? Math.round((exportGrossY / exportTotal) * 10000) / 100 : 0;
  const exportNetRate = exportTotal > 0 ? Math.round((exportNetY / exportTotal) * 10000) / 100 : 0;

  const data: any[][] = [
    ['KPI Summary Report'],
    ['AMAT WK', amatWeek],
    ['AMAT MONTH', amatMonth],
    [],
    ['', 'Import', 'Export'],
    ['Total', importTotal, exportTotal],
    ['Gross Y', importGrossY, exportGrossY],
    ['Net Y', importNetY, exportNetY],
    ['Gross Rate (%)', importGrossRate, exportGrossRate],
    ['Net Rate (%)', importNetRate, exportNetRate],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 15 }];
  return ws;
}

/**
 * 멀티시트 KPI 리포트 엑셀 생성 (누적 병합 지원)
 */
export function createMultiSheetKpiReport(
  importResults: ImportKpiProcessResultExtended[],
  exportResults: ExportKpiProcessResult[],
  amatWeek: string,
  amatMonth: string,
  baseReportData?: { importData: any[], exportData: any[] }
): Buffer {
  const workbook = XLSX.utils.book_new();

  // 1. Import 시트 생성 및 병합
  const importSheet = createImportSheet(importResults, amatWeek, amatMonth, baseReportData?.importData);
  const importSheetData = XLSX.utils.sheet_to_json(importSheet, { header: 1 }) as any[][];
  XLSX.utils.book_append_sheet(workbook, importSheet, 'Import KPI');

  // 2. Export 시트 생성 및 병합
  const exportSheet = createExportSheet(exportResults, amatWeek, amatMonth, baseReportData?.exportData);
  const exportSheetData = XLSX.utils.sheet_to_json(exportSheet, { header: 1 }) as any[][];
  XLSX.utils.book_append_sheet(workbook, exportSheet, 'Export KPI');

  // 3. Summary 시트 생성 (병합된 전체 데이터 기준)
  const summarySheet = createSummarySheetFromRaw(importSheetData, exportSheetData, amatWeek, amatMonth);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
