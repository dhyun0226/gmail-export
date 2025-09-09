import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import * as XLSX from 'xlsx/xlsx.mjs';
import ExcelJS from 'exceljs';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';

// HTTPS 요청 함수 (list.get.ts에서 참고)
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('[Excel API] Making HTTPS request to:', url);
    
    const req = https.get(url, {
      rejectUnauthorized: false,  // SSL 검증 우회
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('[Excel API] Response received, length:', data.length);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('[Excel API] HTTPS request error:', error);
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      console.error('[Excel API] Request timeout');
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
  if (!blNumber) {
    return {
      acceptanceDate: '',
      acceptanceTime: '',
      clearanceDate: '',
      clearanceTime: ''
    };
  }

  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: blNumber
    });
    
    const fullUrl = `${apiUrl}?${params}`;
    const response = await httpsRequest(fullUrl);

    console.log(`[Excel API] Unipass response for BL ${blNumber}:`, response.substring(0, 200));

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
    
    return {
      acceptanceDate,
      acceptanceTime,
      clearanceDate,
      clearanceTime
    };

  } catch (error) {
    console.error(`[Excel API] Unipass error for BL ${blNumber}:`, error);
    return {
      acceptanceDate: '',
      acceptanceTime: '',
      clearanceDate: '',
      clearanceTime: ''
    };
  }
}

// BL 번호 정리 함수
function cleanBlNumber(blNumber: string): string {
  if (!blNumber) return '';
  return blNumber.toString().trim().replace(/[\s-]/g, '').toUpperCase();
}

export default defineEventHandler(async (event) => {
  console.log('[Excel API] /api/excel/process: Starting processing');

  try {
    // 1. 파일 업로드 처리 (KPI upload.post.ts 참고)
    const parts = await readMultipartFormData(event);
    const file = parts?.find(p => p.name === 'file' && p.data);
    const blYearPart = parts?.find(p => p.name === 'blYear');
    const blYear = blYearPart?.data?.toString() || new Date().getFullYear().toString();

    if (!file || !(file.data instanceof Uint8Array) || file.data.length === 0) {
      console.error('[Excel API] No file data found');
      throw createError({ 
        statusCode: 400, 
        statusMessage: '엑셀 파일이 업로드되지 않았습니다.' 
      });
    }

    console.log(`[Excel API] File received: ${file.filename}, size: ${file.data.length} bytes`);

    // 2. 엑셀 파일 읽기
    const wb = XLSX.read(file.data, { type: 'buffer', codepage: 65001 });
    const sheetName = wb.SheetNames[0];
    
    if (!sheetName) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: '시트가 비어 있습니다.' 
      });
    }

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '' });

    // 3. A열에서 BL번호 추출
    const blNumbers: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as any;
      const blNumber = row['A']?.toString().trim();
      if (blNumber && blNumber !== '' && i > 0) { // 헤더 제외
        const cleanedBl = cleanBlNumber(blNumber);
        if (cleanedBl) {
          blNumbers.push(cleanedBl);
        }
      }
    }

    console.log(`[Excel API] Extracted ${blNumbers.length} BL numbers`);

    if (blNumbers.length === 0) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'A열에서 BL번호를 찾을 수 없습니다.' 
      });
    }

    // 4. 각 BL번호에 대해 유니패스 조회
    const results = [];
    let processedCount = 0;

    for (const blNumber of blNumbers) {
      console.log(`[Excel API] Processing ${++processedCount}/${blNumbers.length}: ${blNumber}`);
      
      const unipassData = await fetchUnipassData(blNumber, blYear);
      results.push({
        blNumber,
        ...unipassData
      });

      // API 호출 간격 조절 (0.1초)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 5. 결과 엑셀 생성
    const newWorkbook = new ExcelJS.Workbook();
    const newWorksheet = newWorkbook.addWorksheet('유니패스 조회 결과');

    // 헤더 설정
    newWorksheet.columns = [
      { header: 'BL 번호', key: 'blNumber', width: 20 },
      { header: '통관접수 일자', key: 'acceptanceDate', width: 15 },
      { header: '통관접수 시간', key: 'acceptanceTime', width: 15 },
      { header: '수리일자', key: 'clearanceDate', width: 15 },
      { header: '수리시간', key: 'clearanceTime', width: 15 }
    ];

    // 데이터 추가
    results.forEach(result => {
      newWorksheet.addRow(result);
    });

    // 스타일 적용
    newWorksheet.getRow(1).font = { bold: true };
    newWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // 테두리 추가
    newWorksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // 6. 엑셀 파일을 버퍼로 생성
    const buffer = await newWorkbook.xlsx.writeBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    console.log(`[Excel API] Processing completed. Processed ${results.length} BL numbers`);

    return {
      success: true,
      message: `${results.length}개의 BL번호에 대한 유니패스 조회가 완료되었습니다.`,
      fileData: base64Data,
      totalCount: results.length,
      processedCount: results.filter(r => r.acceptanceDate || r.clearanceDate).length
    };

  } catch (error: any) {
    console.error('[Excel API] Processing error:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '엑셀 파일 처리 중 오류가 발생했습니다.'
    });
  }
});