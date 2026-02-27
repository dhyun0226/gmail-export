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

    // 추가 계산: 서류수신(G) 대비 수리(H) KPI (1.5시간 기준)
    const finalResults: ExportKpiProcessResult[] = results.map(result => {
      const codeEntry = exportCodeMap?.[result.declNumber];
      if (!codeEntry) return result;

      // G열: All Docs Received (BE열: 계약번호 2)
      // H열: 수출신고 수리일시 (ED열)
      const gTimeStr = codeEntry.contractNo2; // "2026-01-28 10:47:18"
      const hTimeStr = codeEntry.acceptTime;   // "202601281051"

      if (!gTimeStr || !hTimeStr) return result;

      try {
        // H열 포맷팅 (YYYYMMDDHHmm -> Date)
        const hYear = hTimeStr.substring(0, 4);
        const hMonth = hTimeStr.substring(4, 6);
        const hDay = hTimeStr.substring(6, 8);
        const hHour = hTimeStr.substring(8, 10);
        const hMin = hTimeStr.substring(10, 12);
        const hDate = new Date(`${hYear}-${hMonth}-${hDay}T${hHour}:${hMin}:00`);
        
        const gDate = new Date(gTimeStr);

        if (!isNaN(hDate.getTime()) && !isNaN(gDate.getTime())) {
          // J열: 실제 이행시간 (H - G)
          const diffInMs = hDate.getTime() - gDate.getTime();
          const actualClearanceTime = Math.round((diffInMs / (1000 * 60 * 60 * 24)) * 10000) / 10000;
          
          // K열: 기준 차이 (J - 0.0625)
          const diffTime = Math.round((actualClearanceTime - 0.0625) * 10000) / 10000;
          
          // N, O열: Gross/Net
          const gross = diffTime > 0 ? 'N' : 'Y';
          const net = gross;

          return {
            ...result,
            allDocsReceivedTime: gTimeStr,
            exportDeclAcceptTime: hDate.toISOString().replace('T', ' ').substring(0, 16),
            actualClearanceTime,
            diffTime,
            gross,
            net
          };
        }
      } catch (e) {
        console.error(`Calc error for ${result.declNumber}:`, e);
      }
      
      return result;
    });

    const statistics = generateExportStatistics(finalResults);

    console.log('[KPI Export Process] Processing completed:', statistics);

    return {
      success: true,
      results: finalResults,
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
