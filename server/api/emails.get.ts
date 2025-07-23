import moment from 'moment-timezone';
import { extractBlNumber } from '../utils/blExtractor';

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
    const query = `after:${startTimestamp} before:${endTimestamp}`;
    
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

      // B/L 번호 추출
      const blNumber = extractBlNumber(subject);

      // 본문 처리
      let body = '';
      if (payload?.parts) {
        const part = payload.parts.find(p => p.mimeType === 'text/html') || payload.parts.find(p => p.mimeType === 'text/plain');
        if (part?.body?.data) {
          body = Buffer.from(part.body.data, 'base64url').toString('utf8');
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64url').toString('utf8');
      }

      // 한국 시간으로 변환
      const date = moment(dateHeader).tz('Asia/Seoul');

      emailDetails.push({
        id: message.id,
        subject,
        body, // 본문 추가
        blNumber, // B/L 번호 추가
        date: date.format('YYYYMMDD'),
        time: date.format('HH:mm')
      });
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