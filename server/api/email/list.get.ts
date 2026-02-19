import moment from 'moment-timezone';
import { extractBlNumber, extractUpsShipmentInfo } from '../../utils/blExtractor';
// import { extractCustomsTimes } from '../utils/unipassParser';
import https from 'https';

import { XMLParser } from 'fast-xml-parser';

// SSL 검증은 httpsRequest 함수 내부에서 처리

// Node.js https 모듈을 사용한 요청 함수
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Making HTTPS request to:', url);
    
    const req = https.get(url, {
      rejectUnauthorized: false,  // ✅ SSL 검증 우회
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
        console.log('Response received, length:', data.length);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('HTTPS request error:', error);
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Unipass API 호출 함수 (Node.js https 사용)
async function fetchUnipassData(blNumber: string, blYear: string) {
  if (!blNumber || blNumber === 'N/A') {
    return null;
  }

  // 날짜/시간 포맷팅 함수를 먼저 정의합니다.
  const formatDateTime = (dateTimeString: string | number) => {
    if (!dateTimeString) return '';
    const s = String(dateTimeString);
    if (s.length < 12) return s;
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
  };

  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: blNumber
    });
    
    const fullUrl = `${apiUrl}?${params}`;
    const response = await httpsRequest(fullUrl);

    console.log('Unipass Raw XML Response:', response); // 디버깅 로그 추가

    let acceptanceTime = '';
    let clearanceTime = '';

    const parser = new XMLParser();
    const parsedXml = parser.parse(response);
    console.log('Unipass Parsed XML Object:', JSON.stringify(parsedXml, null, 2)); // 디버깅 로그 추가

    const detailsNode = parsedXml?.cargCsclPrgsInfoQryRtnVo?.cargCsclPrgsInfoDtlQryVo;
    console.log('Unipass detailsNode:', JSON.stringify(detailsNode, null, 2)); // 디버깅 로그 추가

    if (detailsNode) {
      const detailsList = Array.isArray(detailsNode) ? detailsNode : [detailsNode];
      console.log('Unipass detailsList (as Array):', JSON.stringify(detailsList, null, 2)); // 디버깅 로그 추가

      for (const detail of detailsList) {
        const eventType = detail.cargTrcnRelaBsopTpcd;
        const processTime = detail.prcsDttm;
        console.log(`Processing detail: eventType=${eventType}, processTime=${processTime}`); // 디버깅 로그 추가

        if (eventType === '수입신고' && !acceptanceTime) {
          acceptanceTime = formatDateTime(processTime);
        }
        if (eventType === '수입신고수리') {
          clearanceTime = formatDateTime(processTime);
        }
      }
    }
    
    return {
      originalData: response,
      customsTimes: { acceptanceTime, clearanceTime }
    };

  } catch (error) {
    console.error(`Unipass API error for BL ${blNumber} (Year: ${blYear}):`, error);
    return null; // 오류 발생 시 null 반환
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const blYear = query.blYear as string || new Date().getFullYear().toString();
  
  const accessToken = getCookie(event, 'access_token');
  
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
  
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Start date and end date are required'
    });
  }
  
  try {
    const gmail = await getGmailClient(accessToken);
    
    // Gmail 검색 쿼리 생성 (Unix 타임스탬프 사용)
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    const query = `after:${startTimestamp} before:${endTimestamp} has:attachment`;
    
    // 메일 목록 가져오기
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500
    });
    
    const messages = response.data.messages || [];
    const emailDetails = [];
    
    // 각 메일의 상세 정보 가져오기
    for (const message of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full'  // 본문 포함
      });

      const { payload } = detail.data;
      const headers = payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || '제목 없음';
      const dateHeader = headers.find(h => h.name === 'Date')?.value || '';
      const sender = headers.find(h => h.name === 'From')?.value || '';

      // 이메일 제목 필터링
      const keywordsToFilter = [
        '순중량 정정요청', '미결안내/용도설명서 요청', 'PENDING LIST', 
        '미반출 내역 안내의 건', 'Microsoft OneDrive 확인 코드', '운송리스트 [TOP Customs]',
        'check in Korea HTS', 'BOM 전달', '가산금적용여부문의', '이고요청',
        '중량문의', '중량 문의', '통관 지연 사유 문의', '수입신고필증 전달건', '입항통보건 리스트 안내', '입고요청', 'RATED B/L 요청', 
        '스케줄 지연 안내', '원산지 확인요청'
      ];

      // RE: 답장 메일 필터링 (++CNEE++ CNW Pre-Alert 제외)
      const hasReplyPrefix = /\bRE:/i.test(subject);
      const hasCneeCnwPreAlert = /RE:\s*\+\+CNEE\+\+.*CNW Pre-Alert/i.test(subject);
      
      const shouldBeFiltered = keywordsToFilter.some(keyword => subject.includes(keyword)) || (hasReplyPrefix && !hasCneeCnwPreAlert);
      if (shouldBeFiltered) {
        continue; // 이 이메일은 건너뜁니다.
      }

      // 본문 처리 - 중첩된 멀티파트 구조도 처리
      const extractBody = (messagePart: any, depth: number = 0): string => {
        // 깊이 제한 (무한 재귀 방지)
        if (depth > 10) {
          console.warn(`깊이 제한 초과: ${subject}`);
          return '';
        }
        
        // 직접 body.data가 있는 경우
        if (messagePart?.body?.data) {
          return Buffer.from(messagePart.body.data, 'base64url').toString('utf8');
        }
        
        // parts가 있는 경우 재귀적으로 탐색
        if (messagePart?.parts && messagePart.parts.length > 0) {
          // HTML 본문 우선 탐색
          for (const part of messagePart.parts) {
            if (part.mimeType === 'text/html') {
              const htmlBody = extractBody(part, depth + 1);
              if (htmlBody) return htmlBody;
            }
          }
          
          // 텍스트 본문 탐색
          for (const part of messagePart.parts) {
            if (part.mimeType === 'text/plain') {
              const textBody = extractBody(part, depth + 1);
              if (textBody) return textBody;
            }
          }
          
          // multipart/* 타입들도 재귀적으로 탐색
          for (const part of messagePart.parts) {
            if (part.mimeType?.startsWith('multipart/')) {
              const nestedBody = extractBody(part, depth + 1);
              if (nestedBody) return nestedBody;
            }
          }
        }
        
        return '';
      };
      
      let body = '';
      try {
        body = extractBody(payload);
        if (!body) {
          console.log(`본문을 찾을 수 없음 - 제목: ${subject}, MIME 구조:`, JSON.stringify({
            mimeType: payload?.mimeType,
            hasBody: !!payload?.body?.data,
            hasParts: !!payload?.parts,
            partsCount: payload?.parts?.length || 0,
            partTypes: payload?.parts?.map((p: any) => p.mimeType) || []
          }, null, 2));
          body = '본문 없음';
        }
      } catch (bodyError) {
        console.error(`본문 추출 오류 - 제목: ${subject}`, bodyError);
        body = '본문 추출 실패';
      }

      // 한국 시간으로 변환
      const date = moment(dateHeader).tz('Asia/Seoul');

      // UPS 메일 처리 (여러 BL 번호와 Tracking 번호 가능)
      if (sender.toLowerCase().includes('ups') && subject.includes('[Pre-Alert]')) {
        const upsShipments = extractUpsShipmentInfo(body, subject);
        
        if (upsShipments.length > 0) {
          // 각 shipment마다 별도의 row 생성
          for (const shipment of upsShipments) {
            emailDetails.push({
              id: message.id,
              subject,
              body,
              blNumber: shipment.blNumber,
              trackingNumber: shipment.trackingNumber || 'N/A',
              date: date.format('YYYYMMDD'),
              time: date.format('HH:mm'),
              sender,
              acceptanceTime: '',
              clearanceTime: ''
            });
          }
        } else {
          // shipment 정보가 없는 경우에도 하나의 row 생성
          emailDetails.push({
            id: message.id,
            subject,
            body,
            blNumber: 'N/A',
            trackingNumber: 'N/A',
            date: date.format('YYYYMMDD'),
            time: date.format('HH:mm'),
            sender,
            acceptanceTime: '',
            clearanceTime: ''
          });
        }
      } else {
        // 일반 메일 처리 (하나의 BL 번호)
        const blNumber = extractBlNumber(subject, sender);
        
        emailDetails.push({
          id: message.id,
          subject,
          body,
          blNumber,
          trackingNumber: 'N/A',
          date: date.format('YYYYMMDD'),
          time: date.format('HH:mm'),
          sender,
          acceptanceTime: '',
          clearanceTime: ''
        });
      }
    }
    
    // 제목별로 그룹화한 후 날짜 기준 정렬
    emailDetails.sort((a, b) => {
      // 먼저 제목으로 정렬
      // if (a.subject !== b.subject) {
      //   return a.subject.localeCompare(b.subject);
      // }
      // 같은 제목이면 날짜 기준 정렬 (최신순)
      const dateA = parseInt(a.date + a.time.replace(':', ''));
      const dateB = parseInt(b.date + b.time.replace(':', ''));
      return dateB - dateA;
    });
    
    // 각 BL 번호에 대해 Unipass 데이터 조회
    const uniqueBLNumbers = [...new Set(emailDetails.map(e => e.blNumber).filter(bl => bl && bl !== 'N/A'))];
    console.log('Unique BL Numbers to query:', uniqueBLNumbers);
    console.log('BL Year:', blYear);
    
    const unipassDataMap: Record<string, any> = {};
    
    // 병렬로 Unipass 데이터 조회 (에러가 발생해도 다른 요청은 계속 진행)
    const unipassPromises = uniqueBLNumbers.map(async (blNumber) => {
      try {
        console.log(`Fetching Unipass data for BL: ${blNumber}, Year: ${blYear}`);
        const data = await fetchUnipassData(blNumber, blYear);
        if (data) {
          console.log(`Unipass data received for BL ${blNumber}:`, data);
          unipassDataMap[blNumber] = data;
        } else {
          console.log(`No Unipass data for BL ${blNumber}`);
        }
      } catch (error) {
        console.error(`Failed to fetch Unipass data for BL ${blNumber}:`, error);
      }
    });
    
    await Promise.allSettled(unipassPromises);
    console.log('Unipass data map:', unipassDataMap);
    
    // 이메일 상세 정보에 Unipass 데이터 및 통관 시간 추가
    const emailsWithUnipass = emailDetails.map(email => {
      const unipassData = email.blNumber && email.blNumber !== 'N/A' ? unipassDataMap[email.blNumber] || null : null;
      const customsTimes = unipassData?.customsTimes || {};
      
      return {
        ...email,
        unipassData,
        acceptanceTime: customsTimes.acceptanceTime || '',
        clearanceTime: customsTimes.clearanceTime || ''
      };
    });
    
    return emailsWithUnipass;
  } catch (error: any) {
    console.error('Email fetch error:', error);
    
    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch emails'
    });
  }
});