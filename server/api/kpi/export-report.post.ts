import { createMultiSheetKpiReport } from '../../utils/kpi/multiSheetExcelHandler';

export default defineEventHandler(async (event) => {
  console.log('[KPI Report] Processing multi-sheet report request');

  try {
    const body = await readBody<any>(event);
    const { importResults, exportResults, amatWeek, amatMonth } = body;

    if ((!importResults || importResults.length === 0) && (!exportResults || exportResults.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No results to export',
      });
    }

    const fileBuffer = createMultiSheetKpiReport(
      importResults || [],
      exportResults || [],
      amatWeek || '',
      amatMonth || ''
    );

    const fileName = `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

    console.log(`[KPI Report] Generated multi-sheet report: ${fileName}`);

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    setHeader(event, 'Content-Length', fileBuffer.length);

    return fileBuffer;

  } catch (error: any) {
    console.error('[KPI Report] Error:', error);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Report generation failed',
    });
  }
});
