import { uploadPdfsByBl } from '../../utils/docextract/driveUploader';
import type { DriveUploadRequest, DriveUploadResponse } from '../../utils/docextract/types';

export default defineEventHandler(async (event): Promise<DriveUploadResponse> => {
  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  const body = await readBody<DriveUploadRequest>(event);

  if (!body.pdfReferences || body.pdfReferences.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'pdfReferences are required'
    });
  }

  try {
    const gmail = await getGmailClient(accessToken);
    const drive = await getDriveClient(accessToken);

    console.log(`[DocExtract] Uploading ${body.pdfReferences.length} PDFs to Drive`);
    const result = await uploadPdfsByBl(drive, gmail, body.pdfReferences);

    return {
      success: true,
      ...result
    };
  } catch (error: any) {
    console.error('[DocExtract] Drive upload error:', error);

    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload to Drive'
    });
  }
});
