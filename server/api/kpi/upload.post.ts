import { readExcelFile } from '../../utils/kpi/excelHandler';
import type { KpiUploadResponse } from '../../utils/kpi/types';
import formidable from 'formidable';
import { promises as fs } from 'fs';

export default defineEventHandler(async (event): Promise<KpiUploadResponse> => {
  console.log('[KPI Upload] Processing file upload request');
  
  try {
    // multipart/form-data 파싱
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB 제한
      allowEmptyFiles: false,
      multiples: false
    });
    
    const [fields, files] = await form.parse(event.node.req);
    
    // 파일 확인
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!uploadedFile) {
      throw createError({
        statusCode: 400,
        statusMessage: '파일이 업로드되지 않았습니다.'
      });
    }
    
    // 파일 읽기
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    
    // 엑셀 파일 파싱
    const { blNumbers, rawData } = readExcelFile(fileBuffer);
    
    // 임시 파일 삭제
    await fs.unlink(uploadedFile.filepath).catch(err => {
      console.error('[KPI Upload] Failed to delete temp file:', err);
    });
    
    console.log(`[KPI Upload] Extracted ${blNumbers.length} BL numbers from ${uploadedFile.originalFilename}`);
    
    // 세션에 원본 데이터 저장 (나중에 결과 엑셀 생성시 사용)
    // Note: 실제 프로덕션에서는 Redis나 DB를 사용하는 것이 좋습니다
    await useStorage().setItem(`kpi:rawData:${event.context.sessionId}`, rawData);
    
    return {
      success: true,
      blNumbers: [...new Set(blNumbers)], // 중복 제거
      fileName: uploadedFile.originalFilename || 'unknown.xlsx',
      rowCount: blNumbers.length
    };
    
  } catch (error: any) {
    console.error('[KPI Upload] Error:', error);
    
    return {
      success: false,
      blNumbers: [],
      fileName: '',
      rowCount: 0,
      error: error.statusMessage || '파일 업로드 중 오류가 발생했습니다.'
    };
  }
});