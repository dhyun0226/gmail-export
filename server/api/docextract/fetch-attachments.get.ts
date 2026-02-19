import { fetchEmailsWithPdfAttachments } from '../../utils/docextract/gmailAttachmentService';
import type { FetchAttachmentsResponse } from '../../utils/docextract/types';

export default defineEventHandler(async (event): Promise<FetchAttachmentsResponse> => {
  const query = getQuery(event);
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Start date and end date are required'
    });
  }

  try {
    const gmail = await getGmailClient(accessToken);
    const emails = await fetchEmailsWithPdfAttachments(gmail, startDate, endDate);
    const totalAttachments = emails.reduce((sum, e) => sum + e.attachments.length, 0);

    return {
      success: true,
      emails,
      totalAttachments
    };
  } catch (error: any) {
    console.error('[DocExtract] Fetch attachments error:', error);

    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch attachments'
    });
  }
});
