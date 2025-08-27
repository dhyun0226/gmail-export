import { createResultExcel, createResultCSV } from '../../utils/kpi/excelHandler';
import type { KpiExportRequest } from '../../utils/kpi/types';
import { Redis } from "@upstash/redis";

// Redis 클라이언트 초기화
const redis = Redis.fromEnv();

export default defineEventHandler(async (event) => {
  console.log('[KPI Export] Processing export request');
  
  try {
    const body = await readBody<KpiExportRequest>(event);
    const { results, originalFileName } = body;
    const format = getQuery(event).format || 'xlsx';
    
    if (!results || results.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No results to export' });
    }
    
    // [수정] @upstash/redis를 사용하여 원본 데이터 가져오기
    const storageKey = `kpi:rawData:${event.context.sessionId}`;
    const rawDataString = await redis.get<string>(storageKey);
    const rawData = rawDataString ? JSON.parse(rawDataString) : [];
    
    let fileBuffer: Buffer;
    let mimeType: string;
    let fileName: string;
    
    if (format === 'csv') {
      const csvContent = createResultCSV(results);
      fileBuffer = Buffer.from(csvContent, 'utf-8');
      mimeType = 'text/csv';
      fileName = `KPI_결과_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      fileBuffer = createResultExcel(results, rawData as any[]);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName = `KPI_결과_${new Date().toISOString().split('T')[0]}.xlsx`;
    }
    
    console.log(`[KPI Export] Generated ${format} file: ${fileName}`);
    
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