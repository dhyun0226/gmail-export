import * as XLSX from 'xlsx';
import type { KpiExcelRow, KpiProcessResult, ImportKpiProcessResultExtended } from './types';

/**
 * 시간 차이를 일(day) 단위로 계산
 * @param endTime 종료 시간 (H열)
 * @param startTime 시작 시간 (E열)
 * @returns 일 단위 차이 (소수점 2자리) 또는 공란
 */
function calculateTimeDifferenceInDays(endTime: string | undefined, startTime: string | undefined): number | string {
  // 둘 중 하나라도 없으면 공란 반환
  if (!endTime || !startTime || endTime === '-' || startTime === '-') {
    return '';
  }
  
  try {
    // 날짜 문자열을 Date 객체로 변환
    const end = new Date(endTime);
    const start = new Date(startTime);
    
    // 유효한 날짜인지 확인
    if (isNaN(end.getTime()) || isNaN(start.getTime())) {
      return '';
    }
    
    // 시간 차이 계산 (밀리초 단위)
    const diffInMs = end.getTime() - start.getTime();
    
    // 일(day) 단위로 변환
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    // 소수점 2자리로 반올림 (음수도 그대로 유지)
    return Math.round(diffInDays * 100) / 100;
    
  } catch (error) {
    console.error('Time calculation error:', error);
    return '';
  }
}

/**
 * 엑셀 파일을 읽어서 BL 번호 추출
 */
export function readExcelFile(buffer: Buffer): { blNumbers: string[], rawData: any[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0]!;
  const worksheet = workbook.Sheets[sheetName];
  
  // 엑셀을 JSON으로 변환
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
  
  const blNumbers: string[] = [];
  const rawData: any[] = [];
  
  // C열(인덱스 2)에서 BL 번호 추출
  for (let i = 1; i < jsonData.length; i++) { // 헤더 행 제외
    const row = jsonData[i] as any;
    const blNumber = row['C']?.toString().trim();
    
    if (blNumber && blNumber !== '') {
      blNumbers.push(blNumber);
      rawData.push(row);
    }
  }
  
  return { blNumbers, rawData };
}

/**
 * 처리 결과를 엑셀 파일로 생성 (17열: A~Q)
 * 확장된 결과 (delayReason, controllable, gross, net) 지원
 */
export function createResultExcel(results: (KpiProcessResult | ImportKpiProcessResultExtended)[], originalData?: any[]): Buffer {
  const workbook = XLSX.utils.book_new();

  const data: any[][] = [];

  // 헤더
  data.push([
    'AMAT WK', 'AMAT MONTH', 'HAWB', 'DHL Doc', 'Dest.Arrival',
    'Warehouse', 'Submitted to Customs', 'Custom Clearance',
    'KPI(Hour)', 'Actual', 'Diff time', 'Actual(DHL)', 'Diff time(DHL)',
    'Delay Reason Details', 'Controll/Uncontroll', 'Gross', 'Net'
  ]);

  for (const result of results) {
    const ext = result as ImportKpiProcessResultExtended;

    const jValue = calculateTimeDifferenceInDays(result.importAcceptTime, result.lowerDeclAcceptTime);
    const kValue = typeof jValue === 'number' ? Math.round((jValue - 0.2) * 100) / 100 : '';
    const lValue = calculateTimeDifferenceInDays(result.importAcceptTime, result.mailReceiveTime);
    const mValue = typeof lValue === 'number' ? Math.round((lValue - 0.2) * 100) / 100 : '';

    data.push([
      ext.amatWeek || '',
      ext.amatMonth || '',
      result.blNumber,
      result.mailReceiveTime || '',
      result.lowerDeclAcceptTime || '',
      result.warehouseEntryTime || '',
      result.importDeclTime || '',
      result.importAcceptTime || '',
      0.2,
      jValue,
      kValue,
      lValue,
      mValue,
      ext.delayReason || '',
      ext.controllable || '',
      ext.gross || '',
      ext.net || '',
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 12 },  // A: AMAT WK
    { wch: 15 },  // B: AMAT MONTH
    { wch: 18 },  // C: HAWB
    { wch: 18 },  // D: DHL Doc
    { wch: 18 },  // E: Dest.Arrival
    { wch: 15 },  // F: Warehouse
    { wch: 22 },  // G: Submitted to Customs
    { wch: 18 },  // H: Custom Clearance
    { wch: 12 },  // I: KPI(Hour)
    { wch: 12 },  // J: Actual
    { wch: 12 },  // K: Diff time
    { wch: 15 },  // L: Actual(DHL)
    { wch: 18 },  // M: Diff time(DHL)
    { wch: 50 },  // N: Delay Reason Details
    { wch: 22 },  // O: Controll/Uncontroll
    { wch: 8 },   // P: Gross
    { wch: 8 },   // Q: Net
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI 결과');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * CSV 형식으로 결과 생성
 */
export function createResultCSV(results: KpiProcessResult[]): string {
  const headers = [
    'HAWB',
    'DHL Doc',
    'Dest.Arrival',
    'Warehouse',
    'Submitted to Customs',
    'Custom Clearance'
  ];
  
  const rows = results.map(result => [
    result.blNumber,
    result.mailReceiveTime || '',
    result.lowerDeclAcceptTime || '',
    result.warehouseEntryTime || '',
    result.importDeclTime || '',
    result.importAcceptTime || ''
  ]);
  
  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // UTF-8 BOM 추가 (한글 깨짐 방지)
  return '\uFEFF' + csvContent;
}