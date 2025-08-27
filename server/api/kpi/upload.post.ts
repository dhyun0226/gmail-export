import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  console.log('[KPI Upload] Processing file upload request');
  
  try {
    // 클라이언트가 업로드할 파일의 원본 이름을 요청 body로 보냈다고 가정합니다.
    const { filename } = await readBody(event);

    if (!filename || typeof filename !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: '파일 이름(filename)이 필요합니다.',
      });
    }

    // Vercel Blob에 저장될 경로 생성 (예: kpi-uploads/data_2023-10-27.xlsx)
    const blobPathname = `kpi-uploads/${nanoid(8)}_${filename}`;

    const blob = await put(blobPathname, {
      access: 'private', // 'private'으로 설정하여 아무나 접근 못하게 함
    });

    // 클라이언트에게 업로드 URL과 최종 파일 경로를 반환
    return {
      success: true,
      uploadUrl: blob.uploadUrl, // 클라이언트가 파일을 PUT할 URL
      pathname: blob.pathname,   // 업로드 완료 후 파일이 저장된 경로
    };
  } catch (error: any) {
    console.error('[KPI Upload] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '파일 업로드 URL 생성에 실패했습니다.',
    });
  }
});
