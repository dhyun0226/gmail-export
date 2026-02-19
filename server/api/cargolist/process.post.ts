import { defineEventHandler, readBody } from 'h3';
import { extractBlNumber } from '../../utils/blExtractor';

/**
 * 프론트엔드에서 받을 이메일 데이터의 타입 정의
 */
interface EmailData {
  id: string;
  subject: string;
  // 필요시 다른 필드(from, date 등) 추가 가능
}

export default defineEventHandler(async (event) => {
  try {
    // 1. 프론트엔드에서 보낸 이메일 목록을 읽어옵니다.
    const emails = await readBody<EmailData[]>(event);

    if (!Array.isArray(emails)) {
      // 400 Bad Request
      event.res.statusCode = 400;
      return { success: false, error: 'Invalid input: Expected an array of emails.' };
    }

    // 2. B/L 번호를 그룹별로 저장할 객체 및 실패 목록을 초기화합니다.
    const categorizedBls = {
      expeditors: [] as string[],
      dgf: [] as string[],
      ceva: [] as string[],
    };
    const unclassifiedEmails: { subject: string, reason: string }[] = [];

    // 3. 각 이메일을 순회하며 분류합니다.
    for (const email of emails) {
      const subjectForCheck = email.subject.toLowerCase().replace(/\s/g, '');
      let group: keyof typeof categorizedBls | null = null;

      if (subjectForCheck.includes('이고요청e')) {
        group = 'expeditors';
      } else if (subjectForCheck.includes('이고요청d')) {
        group = 'dgf';
      } else if (subjectForCheck.includes('이고요청c')) {
        group = 'ceva';
      }

      if (group) {
        const blNumber = extractBlNumber(email.subject);
        if (blNumber !== 'N/A') {
          categorizedBls[group].push(blNumber);
        } else {
          // 그룹은 찾았지만 B/L 번호 추출에 실패한 경우
          unclassifiedEmails.push({ subject: email.subject, reason: 'B/L 번호 추출 실패' });
        }
      } else {
        // 그룹 자체를 찾지 못한 경우
        unclassifiedEmails.push({ subject: email.subject, reason: '분류 키워드 없음' });
      }
    }

    // 4. 중복 B/L 번호 제거
    const uniqueExpeditors = [...new Set(categorizedBls.expeditors)];
    const uniqueDgf = [...new Set(categorizedBls.dgf)];
    const uniqueCeva = [...new Set(categorizedBls.ceva)];

    // 5. 분류된 B/L 번호 목록과 실패 목록을 결과로 반환합니다.
    return {
      success: true,
      data: {
        expeditors: uniqueExpeditors,
        dgf: uniqueDgf,
        ceva: uniqueCeva,
        unclassifiedEmails: unclassifiedEmails,
      },
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    // 500 Internal Server Error
    event.res.statusCode = 500;
    return {
      success: false,
      error: message,
    };
  }
});
