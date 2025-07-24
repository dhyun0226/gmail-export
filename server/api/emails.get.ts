import moment from 'moment-timezone';
import { extractBlNumber, extractUpsBlNumbers } from '../utils/blExtractor';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  
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

      // UPS 메일 처리 (여러 BL 번호 가능)
      if (sender.toLowerCase().includes('ups') && subject.includes('[Pre-Alert]')) {
        const upsBlNumbers = extractUpsBlNumbers(body, subject);
        
        if (upsBlNumbers.length > 0) {
          // 각 BL 번호마다 별도의 row 생성
          for (const blNumber of upsBlNumbers) {
            emailDetails.push({
              id: message.id,
              subject,
              body,
              blNumber,
              date: date.format('YYYYMMDD'),
              time: date.format('HH:mm'),
              sender
            });
          }
        } else {
          // BL 번호가 없는 경우에도 하나의 row 생성
          emailDetails.push({
            id: message.id,
            subject,
            body,
            blNumber: 'N/A',
            date: date.format('YYYYMMDD'),
            time: date.format('HH:mm'),
            sender
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
          date: date.format('YYYYMMDD'),
          time: date.format('HH:mm'),
          sender
        });
      }
    }
    
    // 날짜 기준 정렬 (최신순)
    emailDetails.sort((a, b) => {
      const dateA = parseInt(a.date + a.time.replace(':', ''));
      const dateB = parseInt(b.date + b.time.replace(':', ''));
      return dateB - dateA;
    });
    
    return emailDetails;
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