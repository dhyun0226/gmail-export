import moment from 'moment-timezone';
import { getGmailClient } from '../../utils/google';
import { extractBody } from '../../utils/emailFilter';
import { extractBlNumber } from '../../utils/blExtractor';
import {
  extractMbFromSubject,
  extractLoadingWeight,
  extractNetWeight,
  checkLoadingWeightConfirmed,
  isWeightInquirySubject,
  isReplySubject,
  type WeightInquiryData,
} from '../../utils/weightInquiryParser';

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token');
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const gmail = await getGmailClient(accessToken);

    // 쿼리 파라미터에서 날짜 범위 받기 (기본값: 6개월)
    const query_ = getQuery(event);
    const startDate = query_.startDate
      ? new Date(query_.startDate as string)
      : (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d; })();
    const endDate = query_.endDate
      ? new Date(new Date(query_.endDate as string).getTime() + 86400000) // 종료일 포함
      : new Date();

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const query = `중량문의 after:${startTimestamp} before:${endTimestamp}`;
    console.log('[Weight Inquiry] Searching with query:', query);

    // 모든 메일 ID 수집 (페이지네이션)
    let pageToken: string | undefined;
    const allMessages: any[] = [];

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500,
        pageToken,
      });

      const messages = response.data.messages || [];
      allMessages.push(...messages);
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    console.log(`[Weight Inquiry] Found ${allMessages.length} messages`);

    // 스레드별로 그룹핑
    const threadMap = new Map<string, { original: any | null; replies: any[] }>();

    // 배치로 메일 상세 조회 (20개씩)
    const batchSize = 20;
    for (let i = 0; i < allMessages.length; i += batchSize) {
      const batch = allMessages.slice(i, i + batchSize);

      const details = await Promise.all(
        batch.map((msg) =>
          gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          })
        )
      );

      for (const detail of details) {
        const headers = detail.data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
        const threadId = detail.data.threadId || '';

        if (!isWeightInquirySubject(subject)) continue;

        const body = extractBody(detail.data.payload);

        if (!threadMap.has(threadId)) {
          threadMap.set(threadId, { original: null, replies: [] });
        }

        const thread = threadMap.get(threadId)!;

        if (isReplySubject(subject)) {
          thread.replies.push({ subject, dateHeader, body });
        } else {
          thread.original = { subject, dateHeader, body };
        }
      }

      // API 제한 방지
      if (i + batchSize < allMessages.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // 결과 생성
    const results: WeightInquiryData[] = [];

    for (const [threadId, thread] of threadMap) {
      // 원본 메일이 없으면 RE: 중에서 중량 데이터가 있는 것을 원본으로 사용
      let source = thread.original;
      if (!source && thread.replies.length > 0) {
        // RE: 답변 중 적하중량/순중량이 있는 것 찾기
        for (const reply of thread.replies) {
          if (extractLoadingWeight(reply.body) || extractNetWeight(reply.body)) {
            source = reply;
            break;
          }
        }
        if (!source) continue;
      }
      if (!source) continue;

      // RE: 접두사 제거 후 BL 추출
      const cleanSubject = source.subject.replace(/^(RE:\s*)+/i, '');
      const hbNumber = extractBlNumber(cleanSubject);
      const mbNumber = extractMbFromSubject(cleanSubject);
      const loadingWeight = extractLoadingWeight(source.body);
      const netWeight = extractNetWeight(source.body);

      // 중량 데이터가 없으면 건너뛰기
      if (!loadingWeight && !netWeight) continue;

      // RE: 답변에서 적하중량 진행 확인
      let confirmedByLoading: 'O' | 'X' = 'X';
      for (const reply of thread.replies) {
        if (checkLoadingWeightConfirmed(reply.body)) {
          confirmedByLoading = 'O';
          break;
        }
      }

      const date = moment(source.dateHeader).tz('Asia/Seoul').format('YYYY-MM-DD');

      results.push({
        date,
        subject: source.subject,
        hbNumber,
        mbNumber,
        loadingWeight,
        netWeight,
        confirmedByLoading,
        threadId,
      });
    }

    // 날짜 내림차순 정렬
    results.sort((a, b) => b.date.localeCompare(a.date));

    console.log(`[Weight Inquiry] Processed ${results.length} weight inquiry threads`);

    return {
      success: true,
      results,
      total: results.length,
    };
  } catch (error: any) {
    console.error('[Weight Inquiry] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Search failed',
    });
  }
});
