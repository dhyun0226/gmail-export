import type { KpiProcessResult } from './types';
import { fetchMultipleUnipassData } from './unipassService';
import { searchMultipleDHLMails, getAllDHLMails } from './gmailService';

/**
 * BL 번호들을 처리하여 모든 시간 정보를 수집
 */
export async function processBlNumbers(
  blNumbers: string[],
  blYear: string,
  gmail: any,
  options?: {
    startDate?: string;
    endDate?: string;
    useOptimizedGmailSearch?: boolean;
  }
): Promise<KpiProcessResult[]> {
  console.log(`[KPI Processor] Starting process for ${blNumbers.length} BL numbers`);
  
  const results: KpiProcessResult[] = [];
  
  try {
    // 1. 유니패스 데이터 일괄 조회
    console.log('[KPI Processor] Fetching Unipass data...');
    const unipassDataMap = await fetchMultipleUnipassData(blNumbers, blYear);
    
    // 2. Gmail DHL 메일 조회
    console.log('[KPI Processor] Fetching Gmail data...');
    let gmailDataMap;
    
    if (options?.useOptimizedGmailSearch && options.startDate && options.endDate) {
      // 최적화: 날짜 범위의 모든 DHL 메일을 한번에 조회
      gmailDataMap = await getAllDHLMails(gmail, options.startDate, options.endDate);
    } else {
      // 개별 BL 번호별로 조회
      gmailDataMap = await searchMultipleDHLMails(
        gmail, 
        blNumbers, 
        options?.startDate, 
        options?.endDate
      );
    }
    
    // 3. 결과 통합
    for (const blNumber of blNumbers) {
      const unipassData = unipassDataMap.get(blNumber) || {};
      const gmailData = gmailDataMap.get(blNumber) || {};
      
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
    
    // 에러 발생시 빈 결과 반환
    for (const blNumber of blNumbers) {
      results.push({
        blNumber,
        error: '처리 중 오류 발생'
      });
    }
  }
  
  return results;
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
    
    // 모든 데이터가 있으면 완료로 처리
    if (result.mailReceiveTime && 
        result.lowerDeclAcceptTime && 
        result.warehouseEntryTime && 
        result.importDeclTime && 
        result.importAcceptTime) {
      stats.complete++;
    }
  }
  
  return stats;
}