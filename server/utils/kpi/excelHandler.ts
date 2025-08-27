import * as XLSX from 'xlsx';
import type { KpiExcelRow, KpiProcessResult } from './types';

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
  const sheetName = workbook.SheetNames[0];
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
 * 처리 결과를 엑셀 파일로 생성
 */
export function createResultExcel(results: KpiProcessResult[], originalData?: any[]): Buffer {
  // 새로운 워크북 생성
  const workbook = XLSX.utils.book_new();
  
  // 결과 데이터 준비 - 원본 A, B, C열 유지하고 새 데이터 추가
  const excelData = results.map((result, index) => {
    const originalRow = originalData?.[index] || {};
    
    // 원본 엑셀의 A, B, C열 데이터를 먼저 배치
    const rowData: any = {};
    
    // 원본 A, B, C열 유지
    if (originalRow['A'] !== undefined) rowData['A'] = originalRow['A'];
    if (originalRow['B'] !== undefined) rowData['B'] = originalRow['B'];
    if (originalRow['C'] !== undefined) rowData['C'] = originalRow['C'];  // BL번호는 C열에 있음
    
    // D열부터 새로운 데이터 추가
    rowData['D'] = result.mailReceiveTime || '-';           // D열: 메일 수신 시간
    rowData['E'] = result.lowerDeclAcceptTime || '-';      // E열: 하기신고수리일시
    rowData['F'] = result.warehouseEntryTime || '-';       // F열: 창고반입일시
    rowData['G'] = result.importDeclTime || '-';           // G열: 수입신고일시
    rowData['H'] = result.importAcceptTime || '-';         // H열: 수입신고수리일시
    rowData['I'] = 0.2;                                     // I열: 무조건 0.2
    
    // J열: H열 - E열 (수입신고수리일시 - 하기신고수리일시) 시간 차이를 일 단위로
    const jValue = calculateTimeDifferenceInDays(result.importAcceptTime, result.lowerDeclAcceptTime);
    rowData['J'] = jValue;
    
    // K열: J열 - I열
    if (typeof jValue === 'number') {
      rowData['K'] = Math.round((jValue - 0.2) * 100) / 100;  // J열(숫자) - I열(0.2)
    } else {
      rowData['K'] = '';  // J열이 공란이면 K열도 공란
    }
    
    // L열: H열 - D열 (수입신고수리일시 - 메일 수신 시간)
    const lValue = calculateTimeDifferenceInDays(result.importAcceptTime, result.mailReceiveTime);
    rowData['L'] = lValue;
    
    // M열: L열 - I열
    if (typeof lValue === 'number') {
      rowData['M'] = Math.round((lValue - 0.2) * 100) / 100;  // L열(숫자) - I열(0.2)
    } else {
      rowData['M'] = '';  // L열이 공란이면 M열도 공란
    }
    
    // 원본 엑셀의 D열 이후 데이터가 있다면 N열부터 추가
    const originalKeys = Object.keys(originalRow).filter(key => 
      key !== 'A' && key !== 'B' && key !== 'C' && key.charCodeAt(0) >= 68
    );
    
    originalKeys.forEach(key => {
      const newColumnIndex = key.charCodeAt(0) - 68 + 78; // D는 68, N은 78
      const newColumnName = String.fromCharCode(newColumnIndex);
      if (newColumnIndex <= 90) { // Z열까지만
        rowData[newColumnName] = originalRow[key];
      }
    });
    
    return rowData;
  });
  
  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData, { header: Object.keys(excelData[0] || {}).sort() });
  
  // 컬럼 너비 설정
  const columnWidths = [
    { wch: 15 },  // A열: 원본 데이터
    { wch: 15 },  // B열: 원본 데이터
    { wch: 20 },  // C열: B/L 번호 (원본)
    { wch: 20 },  // D열: 메일 수신 시간
    { wch: 20 },  // E열: 하기신고수리일시
    { wch: 20 },  // F열: 창고반입일시
    { wch: 20 },  // G열: 수입신고일시
    { wch: 20 },  // H열: 수입신고수리일시
    { wch: 10 },  // I열: 0.2 (고정값)
    { wch: 10 },  // J열: H-E 시간차 (일 단위)
    { wch: 10 },  // K열: J-I 결과
    { wch: 10 },  // L열: H-D 시간차
    { wch: 10 },  // M열: L-I 결과
  ];
  worksheet['!cols'] = columnWidths;
  
  // 워크북에 워크시트 추가
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI 결과');
  
  // 엑셀 파일 버퍼로 생성
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * CSV 형식으로 결과 생성
 */
export function createResultCSV(results: KpiProcessResult[]): string {
  const headers = [
    'B/L 번호',
    '메일 수신 시간',
    '하기신고수리일시',
    '창고반입일시',
    '수입신고일시',
    '수입신고수리일시'
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