import { processBlNumbers, generateStatistics } from '../../utils/kpi/dataProcessor';
import { matchDelayReason } from '../../utils/kpi/delayReasonMatcher';
import type { ImportProcessRequest, ImportKpiProcessResultExtended } from '../../utils/kpi/types';

export default defineEventHandler(async (event) => {
  console.log('[KPI Process] Starting BL processing');

  // 인증 확인
  const accessToken = getCookie(event, 'access_token');

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please login first',
    });
  }

  try {
    // 요청 바디 파싱
    const body = await readBody<ImportProcessRequest>(event);
    const { blNumbers, blYear, amatWeek, amatMonth, reasonMap } = body;

    if (!blNumbers || blNumbers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'BL numbers are required',
      });
    }

    const year = blYear || new Date().getFullYear().toString();

    console.log(`[KPI Process] Processing ${blNumbers.length} BL numbers for year ${year}`);

    // Gmail 클라이언트 가져오기
    const gmail = await getGmailClient(accessToken);

    // 날짜 범위 설정 (최근 1개월)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    // BL 번호 처리
    const processed = await processBlNumbers(
      blNumbers,
      year,
      gmail,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }
    );

    const { results } = processed;

    // 사유 키워드 매칭 + Gross/Net 계산 (확장 결과 생성)
    const extendedResults: ImportKpiProcessResultExtended[] = results.map((result) => {
      const remarkText = reasonMap?.[result.blNumber] || '';

      // 사유 매칭
      const delayMatch = matchDelayReason(remarkText, result);

      // KPI 차이 계산 (Diff time = K열)
      let diffTime: number | null = null;
      if (result.importAcceptTime && result.lowerDeclAcceptTime) {
        const end = new Date(result.importAcceptTime);
        const start = new Date(result.lowerDeclAcceptTime);
        if (!isNaN(end.getTime()) && !isNaN(start.getTime())) {
          const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          diffTime = Math.round((diffDays - 0.2) * 100) / 100;
        }
      }

      // Gross: K열(Diff time) > 0 이면 "N", 아니면 "Y"
      let gross = '';
      if (diffTime !== null) {
        gross = diffTime > 0 ? 'N' : 'Y';
      }

      // Net: O열(controllable)이 "Uncontrollable"이면 "Y", 아니면 Gross와 동일
      let net = gross;
      if (delayMatch && delayMatch.controllable === 'Uncontrollable') {
        net = 'Y';
      }

      return {
        ...result,
        amatWeek: amatWeek || '',
        amatMonth: amatMonth || '',
        delayReason: delayMatch?.reason || '',
        controllable: delayMatch?.controllable || '',
        gross,
        net,
      };
    });

    // 통계 생성
    const statistics = generateStatistics(results);

    console.log('[KPI Process] Processing completed:', statistics);

    return {
      success: true,
      results: extendedResults,
      statistics,
      progress: {
        total: blNumbers.length,
        processed: results.length,
        phase: 'complete',
        message: `처리 완료: ${results.length}개 BL`,
      },
    };

  } catch (error: any) {
    console.error('[KPI Process] Error:', error);

    if (error.code === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired - Please login again',
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Processing failed',
    });
  }
});
