import { fetchExchangeRates } from '../../utils/unipass/exchangeRateService';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const qryYymmDd = query.date as string;
  const imexTp = (query.imexTp as '1' | '2') || '2';

  if (!qryYymmDd) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회년월일(date)이 필요합니다. (YYYYMMDD 형식)'
    });
  }

  try {
    const rates = await fetchExchangeRates(qryYymmDd, imexTp);

    return {
      success: true,
      date: qryYymmDd,
      imexTp,
      count: rates.length,
      rates
    };
  } catch (error: any) {
    console.error('[ExchangeRate API] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '환율 정보 조회 실패'
    });
  }
});
