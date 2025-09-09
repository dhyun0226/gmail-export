import { defineEventHandler, readBody, createError, setHeader } from 'h3';

export default defineEventHandler(async (event) => {
  console.log('[Excel API] /api/excel/download: Download request received');

  try {
    const body = await readBody(event);
    const { fileData } = body;

    if (!fileData) {
      throw createError({
        statusCode: 400,
        statusMessage: '다운로드할 파일 데이터가 없습니다.'
      });
    }

    // Base64 디코딩
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    console.log(`[Excel API] File buffer size: ${fileBuffer.length} bytes`);

    // 파일명 생성 (현재 날짜 포함)
    const today = new Date().toISOString().split('T')[0];
    const filename = `유니패스_조회결과_${today}.xlsx`;

    // 응답 헤더 설정
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    setHeader(event, 'Content-Length', fileBuffer.length.toString());
    setHeader(event, 'Cache-Control', 'no-cache');

    console.log(`[Excel API] Sending file: ${filename}`);

    return fileBuffer;

  } catch (error: any) {
    console.error('[Excel API] Download error:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '파일 다운로드 중 오류가 발생했습니다.'
    });
  }
});