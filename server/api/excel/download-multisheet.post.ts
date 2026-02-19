import { defineEventHandler, readBody } from 'h3';
import * as XLSX from 'xlsx';

/**
 * 요청 본문의 타입 정의
 */
interface SheetData {
  name: string;
  data: Record<string, any>[];
}

interface RequestBody {
  filename?: string;
  sheets: SheetData[];
}

export default defineEventHandler(async (event) => {
  try {
    const { filename = 'export.xlsx', sheets } = await readBody<RequestBody>(event);

    if (!Array.isArray(sheets) || sheets.length === 0) {
      event.res.statusCode = 400;
      return { success: false, error: 'Invalid input: sheets array is required.' };
    }

    // 1. 새로운 워크북(엑셀 파일) 생성
    const wb = XLSX.utils.book_new();

    // 2. 요청받은 시트 정보를 순회하며 워크북에 추가
    for (const sheet of sheets) {
      if (sheet.name && Array.isArray(sheet.data)) {
        // JSON 데이터를 워크시트로 변환
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        // 워크북에 워크시트 추가 (시트 이름 지정)
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      }
    }

    // 3. 워크북을 버퍼(파일 데이터)로 변환
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 4. HTTP 응답 헤더 설정
    event.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    event.res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    // 5. 파일 버퍼를 응답으로 전송
    return buffer;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    event.res.statusCode = 500;
    return {
      success: false,
      error: message,
    };
  }
});
