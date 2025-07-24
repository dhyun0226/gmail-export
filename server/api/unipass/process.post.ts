import { getDriveClient } from '~/server/utils/google';

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token');
  
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
  
  const { originalBLNumber, newBLNumber, productName, productCode, quantity } = await readBody(event);

  if (!originalBLNumber || !newBLNumber || !productName || !quantity) {
    throw createError({
      statusCode: 400,
      statusMessage: '필수 정보가 누락되었습니다.'
    });
  }

  try {
    // Google Drive에서 파일 검색
    const drive = await getDriveClient(accessToken);
    
    // 물품명 폴더 검색
    const folderQuery = `name='${productName}' and mimeType='application/vnd.google-apps.folder'`;
    const foldersResponse = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name)'
    });

    if (!foldersResponse.data.files || foldersResponse.data.files.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `물품명 '${productName}' 폴더를 찾을 수 없습니다.`
      });
    }

    const folderId = foldersResponse.data.files[0].id;

    // 폴더 내 파일 검색
    const filesQuery = `'${folderId}' in parents and trashed=false`;
    const filesResponse = await drive.files.list({
      q: filesQuery,
      fields: 'files(id, name, mimeType, size)'
    });

    const productFiles = filesResponse.data.files || [];

    // 공통 서류 검색 (사업자등록증 등)
    const commonDocsQuery = `name contains '사업자등록증' and mimeType!='application/vnd.google-apps.folder'`;
    const commonDocsResponse = await drive.files.list({
      q: commonDocsQuery,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 5
    });

    const commonFiles = commonDocsResponse.data.files || [];

    // 모든 파일 정보 수집
    const allFiles = [...productFiles, ...commonFiles];

    // TODO: 실제 유니패스 전송 로직 구현
    // 1. 신고서 복사
    // 2. 채번 생성
    // 3. BL번호 교체
    // 4. 수량 수정
    // 5. 파일 첨부
    // 6. 전송

    return {
      success: true,
      message: `${allFiles.length}개 파일을 찾았습니다. 새 BL번호 ${newBLNumber}로 처리를 완료했습니다.`,
      files: allFiles.map(file => ({
        name: file.name,
        id: file.id,
        type: file.mimeType
      }))
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '처리 중 오류가 발생했습니다.'
    });
  }
});