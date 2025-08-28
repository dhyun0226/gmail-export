import type { KpiProcessResult } from './types';
import { fetchMultipleUnipassData } from './unipassService';
import { getAllDHLMails } from './gmailService';

/**
 * BL 번호들을 처리하여 모든 시간 정보를 수집 (단순화)
 */
export async function processBlNumbers(
  blNumbers: string[],
  blYear: string,
  gmail: any,
  options: {
    startDate: string;
    endDate: string;
  }
): Promise<{ results: KpiProcessResult[] }> {
  console.log(`[KPI Processor] Starting simple process for ${blNumbers.length} BL numbers`);
  
  const results: KpiProcessResult[] = [];
  
  try {
    // Gmail과 Unipass 데이터를 병렬로 처리 (단순화)
    console.log('[KPI Processor] Fetching Gmail and Unipass data in parallel...');
    
    const [gmailDataMap, unipassDataMap] = await Promise.all([
      getAllDHLMails(gmail, options.startDate, options.endDate),
      fetchMultipleUnipassData(blNumbers, blYear)
    ]);
    
    console.log('[KPI Processor] Data fetching completed - Gmail:', gmailDataMap?.size || 0, 'Unipass:', unipassDataMap?.size || 0);
    
    // 결과 통합
    console.log('[KPI Processor] Starting result merge, gmailDataMap size:', gmailDataMap?.size || 0);
    console.log('[KPI Processor] unipassDataMap size:', unipassDataMap?.size || 0);
    
    for (const blNumber of blNumbers) {
      const unipassData = unipassDataMap?.get(blNumber) || {};
      const gmailData = gmailDataMap?.get(blNumber) || {};
      
      const result: KpiProcessResult = {
        blNumber,
        mailReceiveTime: gmailData.mailReceiveTime,
        lowerDeclAcceptTime: unipassData.lowerDeclAcceptTime,
        warehouseEntryTime: unipassData.warehouseEntryTime,
        importDeclTime: unipassData.importDeclTime,
        importAcceptTime: unipassData.importAcceptTime
      };
      
      // 데이터가 하나도 없으면 에러 표시
      if (!result.mailReceiveTime && 
          !result.lowerDeclAcceptTime && 
          !result.warehouseEntryTime && 
          !result.importDeclTime && 
          !result.importAcceptTime) {
        result.error = '데이터 없음';
      }
      
      results.push(result);
      
      console.log(`[KPI Processor] Processed BL ${blNumber}:`, {
        hasMailData: !!result.mailReceiveTime,
        hasUnipassData: !!(result.lowerDeclAcceptTime || result.warehouseEntryTime || result.importDeclTime || result.importAcceptTime)
      });
    }
    
    console.log(`[KPI Processor] Processing completed. ${results.length} results generated`);
    
  } catch (error) {
    console.error('[KPI Processor] Processing error:', error);
    console.error('[KPI Processor] Error details:', error instanceof Error ? error.message : error);
    console.error('[KPI Processor] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // 에러 발생시 빈 결과 반환
    for (const blNumber of blNumbers) {
      results.push({
        blNumber,
        error: '처리 중 오류 발생: ' + (error instanceof Error ? error.message : String(error))
      });
    }
  }
  
  return { results };
}

/**
 * 처리 결과 통계 생성
 */
export function generateStatistics(results: KpiProcessResult[]) {
  const stats = {
    total: results.length,
    withMailData: 0,
    withLowerDeclAccept: 0,
    withWarehouseEntry: 0,
    withImportDecl: 0,
    withImportAccept: 0,
    withError: 0,
    complete: 0
  };
  
  for (const result of results) {
    if (result.mailReceiveTime) stats.withMailData++;
    if (result.lowerDeclAcceptTime) stats.withLowerDeclAccept++;
    if (result.warehouseEntryTime) stats.withWarehouseEntry++;
    if (result.importDeclTime) stats.withImportDecl++;
    if (result.importAcceptTime) stats.withImportAccept++;
    if (result.error) stats.withError++;
    
    // 유니패스 데이터가 모두 있으면 완료로 처리 (메일은 선택적)
    if (result.lowerDeclAcceptTime && 
        result.warehouseEntryTime && 
        result.importDeclTime && 
        result.importAcceptTime) {
      stats.complete++;
    }
  }
  
  return stats;
}