import https from 'https';
import { XMLParser } from 'fast-xml-parser';

export interface ExchangeRateInfo {
  cntySgn: string;      // 국가부호
  mtryUtNm: string;     // 화폐단위명
  fxrt: number;         // 환율
  currSgn: string;      // 통화부호
  aplyBgnDt: string;    // 적용개시일자
  imexTp: string;       // 수출입구분
}

/**
 * HTTPS 요청 헬퍼 함수
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('[Unipass ExchangeRate] Making request to:', url);

    const req = https.get(url, {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('[Unipass ExchangeRate] Response received, length:', data.length);
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('[Unipass ExchangeRate] Request error:', error);
      reject(error);
    });

    req.setTimeout(15000, () => {
      console.error('[Unipass ExchangeRate] Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 유니패스 API012 - 관세환율 정보 조회
 * @param qryYymmDd 조회년월일 (YYYYMMDD)
 * @param imexTp 수출입구분 (1:수출, 2:수입)
 */
export async function fetchExchangeRates(
  qryYymmDd: string,
  imexTp: '1' | '2' = '2'
): Promise<ExchangeRateInfo[]> {
  const apiUrl = 'https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo';
  const config = useRuntimeConfig();
  const crkyCn = config.unipassExchangeRateKey;

  if (!crkyCn) {
    throw new Error('UNIPASS_EXCHANGE_RATE_KEY가 설정되지 않았습니다');
  }

  const params = new URLSearchParams({
    crkyCn,
    qryYymmDd,
    imexTp
  });

  const fullUrl = `${apiUrl}?${params}`;
  const response = await httpsRequest(fullUrl);

  const parser = new XMLParser();
  const parsed = parser.parse(response);

  const node = parsed?.trifFxrtInfoQryRtnVo?.trifFxrtInfoQryRsltVo;
  if (!node) return [];

  const list = Array.isArray(node) ? node : [node];

  return list.map((item: any) => ({
    cntySgn: item.cntySgn || '',
    mtryUtNm: item.mtryUtNm || '',
    fxrt: parseFloat(item.fxrt) || 0,
    currSgn: item.currSgn || '',
    aplyBgnDt: String(item.aplyBgnDt || ''),
    imexTp: String(item.imexTp || '')
  }));
}

/**
 * 특정 통화의 환율 조회
 * @param currSgn 통화부호 (USD, EUR, JPY 등)
 * @param qryYymmDd 조회년월일 (YYYYMMDD)
 * @param imexTp 수출입구분 (1:수출, 2:수입)
 */
export async function fetchExchangeRate(
  currSgn: string,
  qryYymmDd: string,
  imexTp: '1' | '2' = '2'
): Promise<ExchangeRateInfo | null> {
  const rates = await fetchExchangeRates(qryYymmDd, imexTp);
  return rates.find(r => r.currSgn === currSgn.toUpperCase()) || null;
}
