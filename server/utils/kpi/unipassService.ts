import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import type { UnipassTimeData, UnipassXMLDetail } from './types';

/**
 * HTTPS 요청 헬퍼 함수
 */
export function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('[KPI Unipass] Making request to:', url);
    
    const req = https.get(url, {
      rejectUnauthorized: false,  // SSL 검증 우회
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('[KPI Unipass] Response received, length:', data.length);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('[KPI Unipass] Request error:', error);
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      console.error('[KPI Unipass] Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 날짜/시간 포맷팅 함수
 */
export function formatDateTime(dateTimeString: string | number): string {
  if (!dateTimeString) return '';
  const s = String(dateTimeString);
  if (s.length < 12) return s;
  
  // YYYYMMDDHHmm 형식을 YYYY-MM-DD HH:mm 형식으로 변환
  return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
}

/**
 * 유니패스 API를 통해 BL 번호의 통관 정보 조회
 */
export async function fetchUnipassTimes(blNumber: string, blYear: string): Promise<UnipassTimeData> {
  if (!blNumber || blNumber === 'N/A') {
    return {};
  }

  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: blNumber
    });
    
    const fullUrl = `${apiUrl}?${params}`;
    const response = await httpsRequest(fullUrl);

    console.log(`[KPI Unipass] Processing BL: ${blNumber}`);

    // XML 파싱
    const parser = new XMLParser();
    const parsedXml = parser.parse(response);
    
    // 결과 초기화
    const result: UnipassTimeData = {};
    
    // 상세 정보 노드 추출
    const detailsNode = parsedXml?.cargCsclPrgsInfoQryRtnVo?.cargCsclPrgsInfoDtlQryVo;
    
    if (detailsNode) {
      const detailsList = Array.isArray(detailsNode) ? detailsNode : [detailsNode];
      
      // 각 이벤트 타입별로 시간 정보 추출
      for (const detail of detailsList) {
        const eventType = detail.cargTrcnRelaBsopTpcd;
        const processTime = detail.prcsDttm;
        
        console.log(`[KPI Unipass] Event: ${eventType}, Time: ${processTime}`);
        
        switch(eventType) {
          case '하기신고 수리':
          case '하기신고수리':
            if (!result.lowerDeclAcceptTime) {
              result.lowerDeclAcceptTime = formatDateTime(processTime);
            }
            break;
            
          case '반입신고':
          case '창고반입':
            if (!result.warehouseEntryTime) {
              result.warehouseEntryTime = formatDateTime(processTime);
            }
            break;
            
          case '수입신고':
            if (!result.importDeclTime) {
              result.importDeclTime = formatDateTime(processTime);
            }
            break;
            
          case '수입신고수리':
          case '수입신고 수리':
            if (!result.importAcceptTime) {
              result.importAcceptTime = formatDateTime(processTime);
            }
            break;
        }
      }
    }
    
    console.log(`[KPI Unipass] Result for BL ${blNumber}:`, result);
    return result;
    
  } catch (error) {
    console.error(`[KPI Unipass] Error for BL ${blNumber}:`, error);
    return {};
  }
}

/**
 * 여러 BL 번호 일괄 조회 (병렬 처리)
 */
export async function fetchMultipleUnipassData(
  blNumbers: string[], 
  blYear: string
): Promise<Map<string, UnipassTimeData>> {
  const resultMap = new Map<string, UnipassTimeData>();
  
  // 병렬 처리 (최대 20개씩 - 대량 처리 최적화)
  const batchSize = 20;
  for (let i = 0; i < blNumbers.length; i += batchSize) {
    const batch = blNumbers.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (blNumber) => {
      try {
        const data = await fetchUnipassTimes(blNumber, blYear);
        return { blNumber, data };
      } catch (error) {
        console.error(`[KPI Unipass] Failed for BL ${blNumber}:`, error);
        return { blNumber, data: {} };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        resultMap.set(result.value.blNumber, result.value.data);
      }
    });
    
    // 다음 배치 전 잠시 대기 (API 부하 방지 - 최적화된 시간)
    if (i + batchSize < blNumbers.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return resultMap;
}