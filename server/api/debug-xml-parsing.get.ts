import https from 'https';

// Node.js https 모듈을 사용한 요청 함수
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const blNumber = query.bl as string || '1681295055';
  const blYear = query.year as string || '2025';
  
  try {
    // 1. API 호출
    const apiUrl = 'https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo';
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: blNumber
    });
    
    const response = await httpsRequest(`${apiUrl}?${params}`);
    
    // 2. 원본 XML에서 관련 부분만 추출해서 분석
    const xmlBlocks = [];
    const blockRegex = /<cargCsclPrgsInfoDtlQryVo>([\s\S]*?)<\/cargCsclPrgsInfoDtlQryVo>/g;
    let match;
    
    while ((match = blockRegex.exec(response)) !== null) {
      const blockContent = match[1];
      const typeMatch = blockContent.match(/<cargTrcnRelaBsopTpcd>(.*?)<\/cargTrcnRelaBsopTpcd>/);
      const timeMatch = blockContent.match(/<prcsDttm>(\d{14})<\/prcsDttm>/);
      
      if (typeMatch && timeMatch) {
        xmlBlocks.push({
          type: typeMatch[1],
          time: timeMatch[1],
          formattedTime: `${timeMatch[1].substring(0,4)}-${timeMatch[1].substring(4,6)}-${timeMatch[1].substring(6,8)} ${timeMatch[1].substring(8,10)}:${timeMatch[1].substring(10,12)}`,
          rawBlock: blockContent.substring(0, 300) + '...'
        });
      }
    }
    
    // 3. 현재 정규식으로 찾는 방법
    console.log('=== 현재 정규식 테스트 ===');
    
    // 수입신고 시간 찾기 (첫 번째 발견)
    const acceptanceRegex = /<cargTrcnRelaBsopTpcd>수입신고<\/cargTrcnRelaBsopTpcd>[\s\S]*?<prcsDttm>(\d{14})<\/prcsDttm>/;
    const acceptanceMatch = response.match(acceptanceRegex);
    
    // 수입신고수리 시간 찾기
    const clearanceRegex = /<cargTrcnRelaBsopTpcd>수입신고수리<\/cargTrcnRelaBsopTpcd>[\s\S]*?<prcsDttm>(\d{14})<\/prcsDttm>/;
    const clearanceMatch = response.match(clearanceRegex);
    
    console.log('통관접수시간 매치:', acceptanceMatch ? acceptanceMatch[1] : 'NOT FOUND');
    console.log('수리시간 매치:', clearanceMatch ? clearanceMatch[1] : 'NOT FOUND');
    
    // 4. 결과 정리
    const acceptanceTime = acceptanceMatch ? `${acceptanceMatch[1].substring(0,4)}-${acceptanceMatch[1].substring(4,6)}-${acceptanceMatch[1].substring(6,8)} ${acceptanceMatch[1].substring(8,10)}:${acceptanceMatch[1].substring(10,12)}` : '';
    const clearanceTime = clearanceMatch ? `${clearanceMatch[1].substring(0,4)}-${clearanceMatch[1].substring(4,6)}-${clearanceMatch[1].substring(6,8)} ${clearanceMatch[1].substring(8,10)}:${clearanceMatch[1].substring(10,12)}` : '';
    
    return {
      success: true,
      blNumber,
      blYear,
      analysis: {
        totalXmlLength: response.length,
        totalBlocks: xmlBlocks.length,
        allBlockTypes: xmlBlocks.map(block => `${block.type} (${block.formattedTime})`),
        
        // 수입신고 관련 블록들
        importDeclarationBlocks: xmlBlocks.filter(block => block.type.includes('수입신고')),
        
        // 현재 정규식 결과
        currentRegexResults: {
          acceptanceTime: acceptanceTime,
          clearanceTime: clearanceTime,
          acceptanceRaw: acceptanceMatch ? acceptanceMatch[1] : 'NOT FOUND',
          clearanceRaw: clearanceMatch ? clearanceMatch[1] : 'NOT FOUND'
        }
      },
      
      // 디버깅용 원본 XML 일부
      xmlPreview: response.substring(0, 1000) + '...',
      
      // 정규식 패턴 설명
      regexExplanation: {
        acceptancePattern: "/<cargTrcnRelaBsopTpcd>수입신고</cargTrcnRelaBsopTpcd>[\\s\\S]*?<prcsDttm>(\\d{14})</prcsDttm>/",
        clearancePattern: "/<cargTrcnRelaBsopTpcd>수입신고수리</cargTrcnRelaBsopTpcd>[\\s\\S]*?<prcsDttm>(\\d{14})</prcsDttm>/",
        explanation: "이 정규식은 '수입신고' 또는 '수입신고수리' 태그를 찾은 후, 그 다음에 나오는 첫 번째 prcsDttm 값을 추출합니다."
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      blNumber,
      blYear
    };
  }
});