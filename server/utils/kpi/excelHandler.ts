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
    rowData['D'] = result.mailReceiveTime || '';           // D열: 메일 수신 시간 (공란 처리)
    rowData['E'] = result.lowerDeclAcceptTime || '';      // E열: 하기신고수리일시 (공란 처리)
    rowData['F'] = result.warehouseEntryTime || '';       // F열: 창고반입일시 (공란 처리)
    rowData['G'] = result.importDeclTime || '';           // G열: 수입신고일시 (공란 처리)
    rowData['H'] = result.importAcceptTime || '';         // H열: 수입신고수리일시 (공란 처리)
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
    
    // N열: 메일 수신 시간이 영업시간(09:00~18:00) 외인지 체크
    if (result.mailReceiveTime) {
      try {
        // 메일 수신 시간에서 시간 부분만 추출
        const mailDate = new Date(result.mailReceiveTime);
        const hour = mailDate.getHours();
        
        // 09:00~18:00 범위를 벗어나면 표시
        if (hour < 9 || hour >= 18) {
          rowData['N'] = 'Out of local Customs office hours';
        } else {
          rowData['N'] = '';
        }
      } catch (error) {
        rowData['N'] = '';
      }
    } else {
      rowData['N'] = '';
    }
    
    // 원본 엑셀의 D열 이후 데이터가 있다면 O열부터 추가
    const originalKeys = Object.keys(originalRow).filter(key => 
      key !== 'A' && key !== 'B' && key !== 'C' && key.charCodeAt(0) >= 68
    );
    
    originalKeys.forEach(key => {
      const newColumnIndex = key.charCodeAt(0) - 68 + 79; // D는 68, O는 79 (N열 때문에 한 칸 밀림)
      const newColumnName = String.fromCharCode(newColumnIndex);
      if (newColumnIndex <= 90) { // Z열까지만
        rowData[newColumnName] = originalRow[key];
      }
    });
    
    return rowData;
  });
  
  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData, { header: Object.keys(excelData[0] || {}).sort() });
  
  // 헤더 행 설정 (첫 번째 행)
  const headers = {
    'A1': { v: 'AMAT WK', t: 's' },
    'B1': { v: 'AMAT MONTH', t: 's' },
    'C1': { v: 'HAWB', t: 's' },
    'D1': { v: 'DHL Doc', t: 's' },
    'E1': { v: 'Dest.Arrival', t: 's' },
    'F1': { v: 'Warehouse', t: 's' },
    'G1': { v: 'Submitted to Customs', t: 's' },
    'H1': { v: 'Custom Clearance', t: 's' },
    'I1': { v: 'KPI(Hour)', t: 's' },
    'J1': { v: 'Actual', t: 's' },
    'K1': { v: 'Diff time', t: 's' },
    'L1': { v: 'Actual(DHL)', t: 's' },
    'M1': { v: 'Diff time(DHL)', t: 's' },
    'N1': { v: 'Delay Reason Details', t: 's' }
  };
  
  // 헤더 적용
  Object.assign(worksheet, headers);
  
  // 컬럼 너비 설정
  const columnWidths = [
    { wch: 12 },  // A열: AMAT WK
    { wch: 15 },  // B열: AMAT MONTH
    { wch: 18 },  // C열: HAWB
    { wch: 18 },  // D열: DHL Doc
    { wch: 18 },  // E열: Dest.Arrival
    { wch: 15 },  // F열: Warehouse
    { wch: 22 },  // G열: Submitted to Customs
    { wch: 18 },  // H열: Custom Clearance
    { wch: 12 },  // I열: KPI(Hour)
    { wch: 12 },  // J열: Actual
    { wch: 12 },  // K열: Diff time
    { wch: 15 },  // L열: Actual(DHL)
    { wch: 18 },  // M열: Diff time(DHL)
    { wch: 25 },  // N열: Delay Reason Details
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