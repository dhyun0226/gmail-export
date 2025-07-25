import https from 'https';
import { extractCustomsTimes } from '../utils/unipassParser';

// SSL 검증을 우회하는 custom agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const blNumber = query.bl as string || '1681295055';
  const blYear = query.year as string || '2025';
  
  console.log('Testing Unipass API with:', { blNumber, blYear });
  
  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: blNumber
    });
    
    const fullUrl = `${apiUrl}?${params}`;
    console.log('Making test request to:', fullUrl);
    
    const response = await $fetch(fullUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      // @ts-ignore
      agent: httpsAgent,
      timeout: 15000
    });
    
    console.log('Test response received:', response);
    
    // 일단 XML 파싱 없이 원본 응답만 확인
    console.log('Raw response type:', typeof response);
    console.log('Raw response length:', typeof response === 'string' ? response.length : 'not string');
    
    // 간단한 정규식으로 시간 추출 테스트
    let acceptanceTime = '';
    let clearanceTime = '';
    
    if (typeof response === 'string') {
      // 수입신고 시간 찾기
      const acceptanceMatch = response.match(/<cargTrcnRelaBsopTpcd>수입신고<\/cargTrcnRelaBsopTpcd>[\s\S]*?<prcsDttm>(\d{14})<\/prcsDttm>/);
      if (acceptanceMatch) {
        const rawTime = acceptanceMatch[1];
        acceptanceTime = `${rawTime.substring(0,4)}-${rawTime.substring(4,6)}-${rawTime.substring(6,8)} ${rawTime.substring(8,10)}:${rawTime.substring(10,12)}`;
      }
      
      // 수입신고수리 시간 찾기
      const clearanceMatch = response.match(/<cargTrcnRelaBsopTpcd>수입신고수리<\/cargTrcnRelaBsopTpcd>[\s\S]*?<prcsDttm>(\d{14})<\/prcsDttm>/);
      if (clearanceMatch) {
        const rawTime = clearanceMatch[1];
        clearanceTime = `${rawTime.substring(0,4)}-${rawTime.substring(4,6)}-${rawTime.substring(6,8)} ${rawTime.substring(8,10)}:${rawTime.substring(10,12)}`;
      }
    }
    
    const customsTimes = {
      acceptanceTime,
      clearanceTime
    };
    
    console.log('Extracted customs times (regex):', customsTimes);
    
    return {
      success: true,
      url: fullUrl,
      response: typeof response === 'string' ? response.substring(0, 500) + '...' : response, // 응답 일부만
      customsTimes,
      blNumber,
      blYear
    };
    
  } catch (error: any) {
    console.error('Test Unipass API error:', error);
    
    return {
      success: false,
      error: {
        message: error?.message,
        statusCode: error?.statusCode,
        statusMessage: error?.statusMessage,
        data: error?.data
      },
      blNumber,
      blYear,
      url: `${apiUrl}?${new URLSearchParams({
        crkyCn: 'u200k223c072x041e040i000b0',
        blYy: blYear,
        hblNo: blNumber
      })}`
    };
  }
});