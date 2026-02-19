import { createDocExtractExcel } from '../../utils/docextract/excelGenerator';
import type { ExtractedDocumentData } from '../../utils/docextract/types';

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  const body = await readBody<{ results: ExtractedDocumentData[] }>(event);

  if (!body.results || body.results.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'results are required'
    });
  }

  try {
    const buffer = await createDocExtractExcel(body.results);

    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="docextract_${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Length': buffer.length.toString()
    });

    return buffer;
  } catch (error: any) {
    console.error('[DocExtract] Excel export error:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate Excel'
    });
  }
});
