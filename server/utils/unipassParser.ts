// xml2js를 동적으로 import하여 SSR 문제 해결
let parseStringPromise: any;

export interface CustomsTimes {
  acceptanceTime?: string; // 통관접수시간
  clearanceTime?: string;  // 수리시간
}

/**
 * Unipass XML 응답에서 통관 시간 정보를 추출합니다.
 * @param xmlData Unipass API로부터 받은 XML 데이터
 * @returns 통관접수시간과 수리시간을 포함하는 객체
 */
export async function extractCustomsTimes(xmlData: any): Promise<CustomsTimes> {
  try {
    // xml2js 동적 import
    if (!parseStringPromise) {
      const xml2js = await import('xml2js');
      parseStringPromise = xml2js.parseStringPromise;
    }

    // XML이 문자열인 경우 파싱
    let parsedData;
    if (typeof xmlData === 'string') {
      parsedData = await parseStringPromise(xmlData);
    } else {
      parsedData = xmlData;
    }

    const result: CustomsTimes = {};

    // XML 구조 탐색: cargCsclPrgsInfoQryRtnVo > cargCsclPrgsInfoDtlQryRtnVo 배열
    const cargCsclPrgsInfoQryRtnVo = parsedData?.cargCsclPrgsInfoQryRtnVo;
    if (!cargCsclPrgsInfoQryRtnVo) {
      console.log('cargCsclPrgsInfoQryRtnVo not found in XML');
      return result;
    }

    const detailArray = cargCsclPrgsInfoQryRtnVo.cargCsclPrgsInfoDtlQryRtnVo;
    if (!Array.isArray(detailArray)) {
      console.log('cargCsclPrgsInfoDtlQryRtnVo is not an array');
      return result;
    }

    // 각 항목을 순회하면서 필요한 시간 정보 추출
    for (const item of detailArray) {
      const cargTrcnRelaBsopTpcd = item.cargTrcnRelaBsopTpcd?.[0]; // XML 파싱 결과는 배열 형태
      const prcsDttm = item.prcsDttm?.[0];

      if (!cargTrcnRelaBsopTpcd || !prcsDttm) {
        continue;
      }

      // 통관접수시간: 첫 번째 "수입신고"
      if (cargTrcnRelaBsopTpcd === '수입신고' && !result.acceptanceTime) {
        result.acceptanceTime = formatDateTime(prcsDttm);
      }

      // 수리시간: "수입신고수리"
      if (cargTrcnRelaBsopTpcd === '수입신고수리') {
        result.clearanceTime = formatDateTime(prcsDttm);
      }
    }

    console.log('Extracted customs times:', result);
    return result;

  } catch (error) {
    console.error('Error parsing Unipass XML:', error);
    return {};
  }
}

/**
 * YYYYMMDDHHMMSS 형식의 시간을 YYYY-MM-DD HH:MM 형식으로 변환
 * @param dateTimeString YYYYMMDDHHMMSS 형식의 문자열
 * @returns YYYY-MM-DD HH:MM 형식의 문자열
 */
function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString || dateTimeString.length !== 14) {
    return dateTimeString;
  }

  const year = dateTimeString.substring(0, 4);
  const month = dateTimeString.substring(4, 6);
  const day = dateTimeString.substring(6, 8);
  const hour = dateTimeString.substring(8, 10);
  const minute = dateTimeString.substring(10, 12);

  return `${year}-${month}-${day} ${hour}:${minute}`;
}