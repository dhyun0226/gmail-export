import { Readable } from 'stream';

/**
 * 폴더 찾기 또는 생성
 */
export async function findOrCreateFolder(
  drive: any,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  // 기존 폴더 검색
  let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchResult = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  if (searchResult.data.files && searchResult.data.files.length > 0) {
    console.log(`[Drive] Found existing folder: ${folderName} (${searchResult.data.files[0].id})`);
    return searchResult.data.files[0].id;
  }

  // 새 폴더 생성
  const folderMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    folderMetadata.parents = [parentFolderId];
  }

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: 'id'
  });

  console.log(`[Drive] Created folder: ${folderName} (${folder.data.id})`);
  return folder.data.id;
}

/**
 * 파일을 Google Drive에 업로드
 */
export async function uploadFileToDrive(
  drive: any,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  parentFolderId: string
): Promise<{ fileId: string; webViewLink: string }> {
  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId]
  };

  const media = {
    mimeType,
    body: Readable.from(fileBuffer)
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });

  console.log(`[Drive] Uploaded: ${fileName} (${file.data.id})`);
  return {
    fileId: file.data.id,
    webViewLink: file.data.webViewLink || ''
  };
}

/**
 * BL별 폴더 구조 생성 및 PDF 업로드
 */
export async function uploadPdfsByBl(
  drive: any,
  gmail: any,
  pdfReferences: { messageId: string; attachmentId: string; filename: string; blNumber: string }[]
): Promise<{
  uploadedFiles: { filename: string; blNumber: string; webViewLink?: string }[];
  createdFolders: { blNumber: string; folderId: string }[];
  errors: string[];
}> {
  const uploadedFiles: { filename: string; blNumber: string; webViewLink?: string }[] = [];
  const createdFolders: { blNumber: string; folderId: string }[] = [];
  const errors: string[] = [];

  // 루트 폴더 생성 (문서추출_YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const rootFolderName = `문서추출_${today}`;

  let rootFolderId: string;
  try {
    rootFolderId = await findOrCreateFolder(drive, rootFolderName);
  } catch (error) {
    console.error('[Drive] Failed to create root folder:', error);
    errors.push('루트 폴더 생성 실패');
    return { uploadedFiles, createdFolders, errors };
  }

  // BL별로 그룹화
  const blGroups = new Map<string, typeof pdfReferences>();
  for (const ref of pdfReferences) {
    const bl = ref.blNumber || 'UNKNOWN';
    if (!blGroups.has(bl)) {
      blGroups.set(bl, []);
    }
    blGroups.get(bl)!.push(ref);
  }

  // 각 BL 폴더 생성 및 업로드
  for (const [blNumber, refs] of blGroups) {
    try {
      const blFolderId = await findOrCreateFolder(drive, blNumber, rootFolderId);
      createdFolders.push({ blNumber, folderId: blFolderId });

      for (const ref of refs) {
        try {
          // Gmail에서 첨부파일 다운로드
          const { downloadAttachment } = await import('./gmailAttachmentService');
          const pdfBuffer = await downloadAttachment(gmail, ref.messageId, ref.attachmentId);

          // Drive에 업로드
          const result = await uploadFileToDrive(
            drive,
            ref.filename,
            'application/pdf',
            pdfBuffer,
            blFolderId
          );

          uploadedFiles.push({
            filename: ref.filename,
            blNumber,
            webViewLink: result.webViewLink
          });

          // API 제한 방지
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`[Drive] Failed to upload ${ref.filename}:`, error);
          errors.push(`${ref.filename} 업로드 실패`);
        }
      }
    } catch (error) {
      console.error(`[Drive] Failed to create folder for BL ${blNumber}:`, error);
      errors.push(`BL ${blNumber} 폴더 생성 실패`);
    }
  }

  return { uploadedFiles, createdFolders, errors };
}
