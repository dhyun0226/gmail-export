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
    return Math.round(diffInDays * 100) / 100;
  } catch {
    return '';
  }
}

/**
 * Import KPI 시트 생성 (17열)
 */
function createImportSheet(
  results: ImportKpiProcessResultExtended[],
  amatWeek: string,
  amatMonth: string
): XLSX.WorkSheet {
  const data: any[][] = [];

  // 헤더
  data.push([
    'AMAT WK', 'AMAT MONTH', 'HAWB', 'DHL Doc', 'Dest.Arrival',
    'Warehouse', 'Submitted to Customs', 'Custom Clearance',
    'KPI(Hour)', 'Actual', 'Diff time', 'Actual(DHL)', 'Diff time(DHL)',
    'Delay Reason Details', 'Controll/Uncontroll', 'Gross', 'Net'
  ]);

  for (const r of results) {
    const jValue = calculateTimeDifferenceInDays(r.importAcceptTime, r.lowerDeclAcceptTime);
    const kValue = typeof jValue === 'number' ? Math.round((jValue - 0.2) * 100) / 100 : '';
    const lValue = calculateTimeDifferenceInDays(r.importAcceptTime, r.mailReceiveTime);
    const mValue = typeof lValue === 'number' ? Math.round((lValue - 0.2) * 100) / 100 : '';

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
 * Export KPI 시트 생성 (15열)
 */
function createExportSheet(
  results: ExportKpiProcessResult[],
  amatWeek: string,
  amatMonth: string
): XLSX.WorkSheet {
  const data: any[][] = [];

  // 헤더
  data.push([
    'AMAT WK', 'AMAT MONTH', 'Export Declaration Number',
    'Customs(Export)', 'Customs Inspection or document Received',
    'Normal Export / Re-Export',
    'All Docs Received', 'Destination Custom Clearance',
    'Required Clearance Time', 'Actual Clearance Time', 'Diff time',
    'Delay Reason Details', 'Controllable or Uncontrollable',
    'Gross', 'Net'
  ]);

  for (const r of results) {
    const actualClearance = calculateTimeDifferenceInDays(r.loadingCompleteTime, r.exportDeclAcceptTime);
    const diffTime = typeof actualClearance === 'number' ? Math.round((actualClearance - 0.0625) * 10000) / 10000 : '';

    const gross = typeof diffTime === 'number' && diffTime > 0 ? 'N' : (typeof diffTime === 'number' ? 'Y' : '');
    const net = gross; // 수출은 사유가 없으므로 Gross와 동일

    data.push([
      amatWeek,
      amatMonth,
      r.declNumber,
      r.customsName || '',
      r.inspectionType || '',
      r.tradeType || '',
      r.exportDeclAcceptTime || '',
      r.loadingCompleteTime || '',
      0.0625,
      actualClearance,
      diffTime,
      '', // Delay Reason - 빈칸
      '', // Controllable - 빈칸
      gross,
      net,
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
 * Summary 시트 생성
 */
function createSummarySheet(
  importResults: ImportKpiProcessResultExtended[],
  exportResults: ExportKpiProcessResult[],
  amatWeek: string,
  amatMonth: string
): XLSX.WorkSheet {
  // Import 통계
  const importTotal = importResults.length;
  const importComplete = importResults.filter(r =>
    r.lowerDeclAcceptTime && r.warehouseEntryTime && r.importDeclTime && r.importAcceptTime
  ).length;
  const importGrossY = importResults.filter(r => r.gross === 'Y').length;
  const importNetY = importResults.filter(r => r.net === 'Y').length;
  const importGrossRate = importTotal > 0 ? Math.round((importGrossY / importTotal) * 10000) / 100 : 0;
  const importNetRate = importTotal > 0 ? Math.round((importNetY / importTotal) * 10000) / 100 : 0;

  // Export 통계 - Gross/Net 직접 계산
  const exportTotal = exportResults.length;
  const exportComplete = exportResults.filter(r =>
    r.exportDeclAcceptTime && r.loadingCompleteTime
  ).length;

  let exportGrossY = 0;
  let exportNetY = 0;
  for (const r of exportResults) {
    const actualClearance = calculateTimeDifferenceInDays(r.loadingCompleteTime, r.exportDeclAcceptTime);
    const diffTime = typeof actualClearance === 'number' ? Math.round((actualClearance - 0.0625) * 10000) / 10000 : null;
    const gross = typeof diffTime === 'number' && diffTime <= 0 ? 'Y' : (typeof diffTime === 'number' ? 'N' : '');
    if (gross === 'Y') exportGrossY++;
    if (gross === 'Y') exportNetY++; // 수출은 사유 없으므로 Gross=Net
  }

  const exportGrossRate = exportTotal > 0 ? Math.round((exportGrossY / exportTotal) * 10000) / 100 : 0;
  const exportNetRate = exportTotal > 0 ? Math.round((exportNetY / exportTotal) * 10000) / 100 : 0;

  const data: any[][] = [
    ['KPI Summary Report'],
    ['AMAT WK', amatWeek],
    ['AMAT MONTH', amatMonth],
    [],
    ['', 'Import', 'Export'],
    ['Total', importTotal, exportTotal],
    ['Complete', importComplete, exportComplete],
    ['Gross Y', importGrossY, exportGrossY],
    ['Net Y', importNetY, exportNetY],
    ['Gross Rate (%)', importGrossRate, exportGrossRate],
    ['Net Rate (%)', importNetRate, exportNetRate],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 18 }, { wch: 15 }, { wch: 15 },
  ];

  return ws;
}

/**
 * 멀티시트 KPI 리포트 엑셀 생성
 * Sheet 1: Import KPI (17열)
 * Sheet 2: Export KPI (15열)
 * Sheet 3: Summary
 */
export function createMultiSheetKpiReport(
  importResults: ImportKpiProcessResultExtended[],
  exportResults: ExportKpiProcessResult[],
  amatWeek: string,
  amatMonth: string
): Buffer {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Import KPI
  if (importResults.length > 0) {
    const importSheet = createImportSheet(importResults, amatWeek, amatMonth);
    XLSX.utils.book_append_sheet(workbook, importSheet, 'Import KPI');
  }

  // Sheet 2: Export KPI
  if (exportResults.length > 0) {
    const exportSheet = createExportSheet(exportResults, amatWeek, amatMonth);
    XLSX.utils.book_append_sheet(workbook, exportSheet, 'Export KPI');
  }

  // Sheet 3: Summary
  const summarySheet = createSummarySheet(importResults, exportResults, amatWeek, amatMonth);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
