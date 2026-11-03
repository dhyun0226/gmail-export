import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseExportDataWorkbook,
  parseDailyWorkbook,
  verifyExportForwarders
} from '../../utils/exportForwarderProcessor';

export default defineEventHandler(async (event) => {
  console.log('[ExportForwarder] Starting validation process');

  try {
    const parts = await readMultipartFormData(event);
    if (!parts || parts.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '업로드된 파일이 없습니다.'
      });
    }

    const exportFilePart = parts.find((p) => p.name === 'exportFile' && p.data && p.data.length > 0);
    const dailyFilePart = parts.find((p) => p.name === 'dailyFile' && p.data && p.data.length > 0);

    if (!exportFilePart) {
      throw createError({
        statusCode: 400,
        statusMessage: '앤컴 수출데이터 파일이 필요합니다.'
      });
    }

    if (!dailyFilePart) {
      throw createError({
        statusCode: 400,
        statusMessage: '수출 포워더 검증 DAILY 양식 파일이 필요합니다.'
      });
    }

    console.log(`[ExportForwarder] Export file: ${exportFilePart.filename}, DAILY file: ${dailyFilePart.filename}`);

    // 1. 앤컴 수출데이터 파일 파싱
    const exportWb = XLSX.read(exportFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
    const { exportList, formatErrors } = parseExportDataWorkbook(exportWb);

    if (exportList.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '수출데이터 파일에서 유효한 데이터 행을 찾을 수 없습니다.'
      });
    }

    // 2. DAILY 양식 파일 파싱
    const dailyWb = XLSX.read(dailyFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
    const { dailyMap, dailyCounts, sheetNames } = parseDailyWorkbook(dailyWb);

    if (dailyMap.size === 0 && sheetNames.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'DAILY 양식 파일에서 유효한 시트나 인보이스를 찾을 수 없습니다.'
      });
    }

    // 3. 포워더 및 계약번호 대조 검증 수행
    const verification = verifyExportForwarders(
      exportList,
      formatErrors,
      dailyMap,
      dailyCounts,
      sheetNames
    );

    console.log(
      `[ExportForwarder] Verified: Export ${verification.totalExportRows} rows, DAILY ${verification.totalDailyRows} rows, ` +
      `Contract Errors: ${verification.counts.contractErrorCount}, Mismatches: ${verification.counts.mismatchCount}`
    );

    return {
      success: true,
      exportFileName: exportFilePart.filename,
      dailyFileName: dailyFilePart.filename,
      ...verification
    };
  } catch (error: any) {
    console.error('[ExportForwarder] Processing error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '검증 처리 중 오류가 발생했습니다.'
    });
  }
});
