import { XMLParser } from 'fast-xml-parser';
import { httpsRequest, formatDateTime } from './unipassService';
import type { ExportUnipassTimeData } from './types';

/**
 * 유니패스 API를 통해 수출 신고번호의 통관 정보 조회
 */
export async function fetchExportUnipassTimes(
  declNumber: string,
  blYear: string
): Promise<ExportUnipassTimeData> {
  if (!declNumber || declNumber === 'N/A') {
    return {};
  }

  try {
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      expDclrNo: declNumber
    });

    const fullUrl = `${apiUrl}?${params}`;
    const response = await httpsRequest(fullUrl);

    console.log(`[KPI Export Unipass] Processing Decl: ${declNumber}`);

    const parser = new XMLParser();
    const parsedXml = parser.parse(response);

    const result: ExportUnipassTimeData = {};

    const detailsNode = parsedXml?.cargCsclPrgsInfoQryRtnVo?.cargCsclPrgsInfoDtlQryVo;

    if (detailsNode) {
      const detailsList = Array.isArray(detailsNode) ? detailsNode : [detailsNode];

      for (const detail of detailsList) {
        const eventType = detail.cargTrcnRelaBsopTpcd;
        const processTime = detail.prcsDttm;

        console.log(`[KPI Export Unipass] Event: ${eventType}, Time: ${processTime}`);

        switch (eventType) {
          case '수출신고수리':
          case '수출신고 수리':
            if (!result.exportDeclAcceptTime) {
              result.exportDeclAcceptTime = formatDateTime(processTime);
            }
            break;

          case '적재완료':
          case '선적':
            if (!result.loadingCompleteTime) {
              result.loadingCompleteTime = formatDateTime(processTime);
            }
            break;
        }
      }
    }

    console.log(`[KPI Export Unipass] Result for Decl ${declNumber}:`, result);
    return result;

  } catch (error) {
    console.error(`[KPI Export Unipass] Error for Decl ${declNumber}:`, error);
    return {};
  }
}

/**
 * 여러 수출 신고번호 일괄 조회 (병렬 처리)
 */
export async function fetchMultipleExportUnipassData(
  declNumbers: string[],
  blYear: string
): Promise<Map<string, ExportUnipassTimeData>> {
  const resultMap = new Map<string, ExportUnipassTimeData>();

  const batchSize = 20;
  for (let i = 0; i < declNumbers.length; i += batchSize) {
    const batch = declNumbers.slice(i, i + batchSize);

    const batchPromises = batch.map(async (declNumber) => {
      try {
        const data = await fetchExportUnipassTimes(declNumber, blYear);
        return { declNumber, data };
      } catch (error) {
        console.error(`[KPI Export Unipass] Failed for Decl ${declNumber}:`, error);
        return { declNumber, data: {} };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        resultMap.set(result.value.declNumber, result.value.data);
      }
    });

    if (i + batchSize < declNumbers.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return resultMap;
}
