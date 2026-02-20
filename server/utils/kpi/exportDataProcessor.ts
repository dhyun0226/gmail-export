import type { ExportKpiProcessResult, ExportCodeMapEntry } from './types';
import { fetchMultipleExportUnipassData } from './exportUnipassService';

// 코드 매핑 테이블
const CUSTOMS_CODE_MAP: Record<string, string> = {
  '016': 'Incheon',
  '021': 'Suwon',
  '030': 'Busan',
  '040': 'Incheon',
};

const CS_TYPE_MAP: Record<string, string> = {
  'A': '',
  'E': '서류제출',
  'L': '적재지검사',
  'P': '서류제출',
  'S': '',
};

const TRADE_TYPE_MAP: Record<string, string> = {
  '11': '일반',
  '72': '원상태',
  '83': '재수입',
  '94': '재수출',
};

/**
 * 수출 신고번호들을 처리하여 KPI 결과 생성
 */
export async function processExportDeclNumbers(
  declNumbers: string[],
  blYear: string,
  exportCodeMap?: Record<string, ExportCodeMapEntry>
): Promise<{ results: ExportKpiProcessResult[] }> {
  console.log(`[KPI Export Processor] Starting process for ${declNumbers.length} declaration numbers`);

  const results: ExportKpiProcessResult[] = [];

  try {
    // 유니패스 수출 데이터 조회
    const unipassDataMap = await fetchMultipleExportUnipassData(declNumbers, blYear);

    console.log('[KPI Export Processor] Unipass data fetched:', unipassDataMap.size);

    for (const declNumber of declNumbers) {
      const unipassData = unipassDataMap.get(declNumber) || {};
      const codeEntry = exportCodeMap?.[declNumber] || {};

      // 코드 매핑 적용
      const customsName = codeEntry.customsCode ? (CUSTOMS_CODE_MAP[codeEntry.customsCode] || codeEntry.customsCode) : '';
      const inspectionType = codeEntry.csType ? (CS_TYPE_MAP[codeEntry.csType] || codeEntry.csType) : '';
      const tradeType = codeEntry.tradeType ? (TRADE_TYPE_MAP[codeEntry.tradeType] || codeEntry.tradeType) : '';

      const result: ExportKpiProcessResult = {
        declNumber,
        customsName,
        inspectionType,
        tradeType,
        exportDeclAcceptTime: unipassData.exportDeclAcceptTime,
        loadingCompleteTime: unipassData.loadingCompleteTime,
      };

      // 데이터가 하나도 없으면 에러 표시
      if (!result.exportDeclAcceptTime && !result.loadingCompleteTime) {
        result.error = '데이터 없음';
      }

      results.push(result);

      console.log(`[KPI Export Processor] Processed Decl ${declNumber}:`, {
        hasExportDecl: !!result.exportDeclAcceptTime,
        hasLoading: !!result.loadingCompleteTime,
      });
    }

    console.log(`[KPI Export Processor] Processing completed. ${results.length} results generated`);

  } catch (error) {
    console.error('[KPI Export Processor] Processing error:', error);

    for (const declNumber of declNumbers) {
      results.push({
        declNumber,
        error: '처리 중 오류 발생: ' + (error instanceof Error ? error.message : String(error)),
      });
    }
  }

  return { results };
}

/**
 * 수출 처리 결과 통계 생성
 */
export function generateExportStatistics(results: ExportKpiProcessResult[]) {
  const stats = {
    total: results.length,
    withExportDeclAccept: 0,
    withLoadingComplete: 0,
    withError: 0,
    complete: 0,
  };

  for (const result of results) {
    if (result.exportDeclAcceptTime) stats.withExportDeclAccept++;
    if (result.loadingCompleteTime) stats.withLoadingComplete++;
    if (result.error) stats.withError++;

    if (result.exportDeclAcceptTime && result.loadingCompleteTime) {
      stats.complete++;
    }
  }

  return stats;
}
