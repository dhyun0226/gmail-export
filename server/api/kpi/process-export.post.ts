import { processExportDeclNumbers, generateExportStatistics } from '../../utils/kpi/exportDataProcessor';
import type { ExportProcessRequest } from '../../utils/kpi/types';

export default defineEventHandler(async (event) => {
  console.log('[KPI Export Process] Starting export declaration processing');

  try {
    const body = await readBody<ExportProcessRequest>(event);
    const { declNumbers, blYear, amatWeek, amatMonth, exportCodeMap } = body;

    if (!declNumbers || declNumbers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Export declaration numbers are required',
      });
    }

    const year = blYear || new Date().getFullYear().toString();

    console.log(`[KPI Export Process] Processing ${declNumbers.length} declaration numbers for year ${year}`);

    const processed = await processExportDeclNumbers(declNumbers, year, exportCodeMap);
    const { results } = processed;

    const statistics = generateExportStatistics(results);

    console.log('[KPI Export Process] Processing completed:', statistics);

    return {
      success: true,
      results,
      statistics,
      progress: {
        total: declNumbers.length,
        processed: results.length,
        phase: 'complete',
        message: `처리 완료: ${results.length}개 신고번호`,
      },
    };

  } catch (error: any) {
    console.error('[KPI Export Process] Error:', error);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Export processing failed',
    });
  }
});
