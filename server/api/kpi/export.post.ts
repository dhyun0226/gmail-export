import { createResultExcel, createResultCSV } from '../../utils/kpi/excelHandler';
import type { KpiExportRequest } from '../../utils/kpi/types';

export default defineEventHandler(async (event) => {
  console.log('[KPI Export] Processing export request');
  
  try {
    // 요청 바디 파싱
    const body = await readBody<KpiExportRequest>(event);
    const { results, originalFileName } = body;
    const format = getQuery(event).format || 'xlsx';
    
    if (!results || results.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No results to export'
      });
    }
    
    // 세션에서 원본 데이터 가져오기 (옵션)
    const rawData = await useStorage().getItem(`kpi:rawData:${event.context.sessionId}`);
    
    let fileBuffer: Buffer;
    let mimeType: string;
    let fileName: string;
    
    if (format === 'csv') {
      // CSV 생성
      const csvContent = createResultCSV(results);
      fileBuffer = Buffer.from(csvContent, 'utf-8');
      mimeType = 'text/csv';
      fileName = `KPI_결과_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // Excel 생성
      fileBuffer = createResultExcel(results, rawData as any[]);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName = `KPI_결과_${new Date().toISOString().split('T')[0]}.xlsx`;
    }
    
    console.log(`[KPI Export] Generated ${format} file: ${fileName}`);
    
    // 파일 응답 설정
    setHeader(event, 'Content-Type', mimeType);
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    setHeader(event, 'Content-Length', fileBuffer.length.toString());
    
    return fileBuffer;
    
  } catch (error: any) {
    console.error('[KPI Export] Error:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Export failed'
    });
  }
});