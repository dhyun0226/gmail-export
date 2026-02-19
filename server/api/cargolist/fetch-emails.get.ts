import { getGmailClient } from '../../utils/google';
import { gmail_v1 } from 'googleapis';

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No access token found.',
    });
  }

  try {
    const gmail = await getGmailClient(accessToken);
    const queryParams = getQuery(event);
    const { startDate, endDate } = queryParams;

    let gmailQuery = 'subject:("이고요청e" OR "이고 요청e" OR "이고요청d" OR "이고 요청d" OR "이고요청c" OR "이고 요청c")';

    if (startDate && typeof startDate === 'string') {
      gmailQuery += ` after:${startDate.replace(/-/g, '/')}`;
    }
    if (endDate && typeof endDate === 'string') {
      gmailQuery += ` before:${new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/')}`;
    }

    console.log('Final Gmail Query:', gmailQuery); // 최종 검색어 로그 출력

    const allMessages: gmail_v1.Schema$Message[] = [];
    let nextPageToken: string | undefined | null = undefined;
    let pageCount = 0;
    const MAX_PAGES = 10; // 최대 10페이지 (약 5000개) 까지만 조회하여 무한 루프 방지

    do {
      pageCount++;
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: gmailQuery,
        maxResults: 500,
        pageToken: nextPageToken || undefined,
      });

      const messages = response.data.messages || [];
      allMessages.push(...messages);

      nextPageToken = response.data.nextPageToken;

    } while (nextPageToken && pageCount < MAX_PAGES);


    if (allMessages.length === 0) {
      return [];
    }

    // 각 메일의 상세 정보(id, subject)만 가져오기
    const emailDetails = await Promise.all(
      allMessages.map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['Subject'],
        });

        const subject =
          detail.data.payload?.headers?.find(
            (h) => h.name === 'Subject'
          )?.value || '제목 없음';

        return {
          id: detail.data.id,
          subject: subject,
        };
      })
    );

    return emailDetails;
    
  } catch (error: any) {
    console.error('Cargolist email fetch error:', error);
    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired or invalid.',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cargolist emails.',
    });
  }
});
