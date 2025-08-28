import { processBlNumbers, generateStatistics } from '../../utils/kpi/dataProcessor';
import type { KpiProcessRequest, KpiProcessResult } from '../../utils/kpi/types';

export default defineEventHandler(async (event) => {
  console.log('[KPI Process] Starting BL processing');
  
  // 인증 확인
  const accessToken = getCookie(event, 'access_token');
  
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please login first'
    });
  }
  
  try {
    // 요청 바디 파싱
    const body = await readBody<KpiProcessRequest>(event);
    const { blNumbers, blYear } = body;
    
    if (!blNumbers || blNumbers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'BL numbers are required'
      });
    }
    
    const year = blYear || new Date().getFullYear().toString();
    
    console.log(`[KPI Process] Processing ${blNumbers.length} BL numbers for year ${year}`);
    
    // Gmail 클라이언트 가져오기
    const gmail = await getGmailClient(accessToken);
    
    // 날짜 범위 설정 (최근 1개월)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    
    // BL 번호 처리 (단순화)
    const processed = await processBlNumbers(
      blNumbers,
      year,
      gmail,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    );
    
    const { results } = processed;
    
    // 통계 생성
    const statistics = generateStatistics(results);
    
    console.log('[KPI Process] Processing completed:', statistics);
    
    return {
      success: true,
      results,
      statistics,
      progress: {
        total: blNumbers.length,
        processed: results.length,
        phase: 'complete',
        message: `처리 완료: ${results.length}개 BL`
      }
    };
    
  } catch (error: any) {
    console.error('[KPI Process] Error:', error);
    
    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired - Please login again'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Processing failed'
    });
  }
});