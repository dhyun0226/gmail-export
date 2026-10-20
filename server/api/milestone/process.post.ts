import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseMailListWorkbook,
  parseUpsWorkbook,
  parseMissingWorkbook,
  fetchUnipassData,
  calculateNextMissingTag,
  ParsedShipment
} from '../../utils/milestoneProcessor';

export default defineEventHandler(async (event) => {
  console.log('[Milestone] Starting file-based milestone process');

  try {
    const parts = await readMultipartFormData(event);
    if (!parts || parts.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '업로드된 파일이 없습니다.'
      });
    }

    const mailFilePart = parts.find((p) => p.name === 'mailFile' && p.data && p.data.length > 0);
    const upsFilePart = parts.find((p) => p.name === 'upsFile' && p.data && p.data.length > 0);
    const missingFilePart = parts.find((p) => p.name === 'missingFile' && p.data && p.data.length > 0);
    const blYearPart = parts.find((p) => p.name === 'blYear');
    const blYear = blYearPart?.data?.toString().trim() || new Date().getFullYear().toString();

    // 메일목록 파일 또는 누락건 파일 중 적어도 하나는 필요
    if (!mailFilePart && !missingFilePart) {
      throw createError({
        statusCode: 400,
        statusMessage: '메일 목록 파일 또는 전일 누락건 파일이 필요합니다.'
      });
    }

    console.log(`[Milestone] Mail file: ${mailFilePart?.filename || 'None'}, UPS file: ${upsFilePart?.filename || 'None'}, Missing file: ${missingFilePart?.filename || 'None'}, Year: ${blYear}`);

    // 1. 메일 목록 파일 파싱
    let mailShipments: ParsedShipment[] = [];
    if (mailFilePart) {
      const mailWb = XLSX.read(mailFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
      const hasUpsFile = !!upsFilePart;
      mailShipments = parseMailListWorkbook(mailWb, hasUpsFile);
      console.log(`[Milestone] Extracted ${mailShipments.length} unique shipments from mail file`);
    }

    // 2. UPS 파일 파싱 (업로드된 경우)
    let upsShipments: ParsedShipment[] = [];
    if (upsFilePart) {
      const upsWb = XLSX.read(upsFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
      upsShipments = parseUpsWorkbook(upsWb);
      console.log(`[Milestone] Extracted ${upsShipments.length} shipments from UPS file`);
    }

    // 3. 전일 누락건 파일 파싱 (업로드된 경우)
    let missingShipments: ParsedShipment[] = [];
    if (missingFilePart) {
      const missingWb = XLSX.read(missingFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
      missingShipments = parseMissingWorkbook(missingWb);
      console.log(`[Milestone] Extracted ${missingShipments.length} shipments from missing file`);
    }

    // 4. 세 데이터 병합
    // 전일 누락건을 먼저 넣고, 그 위에 메일목록과 UPS를 덮어씀 (신규 메일이 우선)
    const combinedMap = new Map<string, ParsedShipment>();

    for (const item of missingShipments) {
      combinedMap.set(item.blNumber, item);
    }

    for (const item of mailShipments) {
      combinedMap.set(item.blNumber, item);
    }

    for (const item of upsShipments) {
      // UPS 건은 메일 목록에 동일 BL이 있어도 UPS의 Tracking Number와 수신시간을 우선시함
      combinedMap.set(item.blNumber, item);
    }

    const allShipments = Array.from(combinedMap.values());
    console.log(`[Milestone] Total merged shipments: ${allShipments.length}`);

    if (allShipments.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '추출 가능한 유효한 BL 번호를 찾지 못했습니다.'
      });
    }

    // 5. 유니패스 API 조회
    const config = useRuntimeConfig();
    const apiKey = config.unipassApiKey || process.env.UNIPASS_API_KEY || '';

    if (!apiKey) {
      console.warn('[Milestone] Warning: UNIPASS_API_KEY is missing');
    }

    const results = [];
    const concurrency = 5;

    for (let i = 0; i < allShipments.length; i += concurrency) {
      const chunk = allShipments.slice(i, i + concurrency);
      const chunkResults = await Promise.all(
        chunk.map(async (shipment) => {
          let unipass = {
            acceptanceDate: '',
            acceptanceTime: '',
            acceptanceTimeDisplay: '',
            clearanceDate: '',
            clearanceTime: '',
            clearanceTimeDisplay: '',
            unipassFailed: false
          };

          if (apiKey && shipment.blNumber) {
            unipass = await fetchUnipassData(shipment.blNumber, blYear, apiKey);
          }

          const combined = {
            ...shipment,
            ...unipass
          };

          // 차기 누락 태그 계산
          const nextTag = calculateNextMissingTag(combined);

          return {
            ...combined,
            nextMissingTag: nextTag // null: 완료, 'SC,CT': 신고/수리 누락, 'CT': 수리 누락
          };
        })
      );

      results.push(...chunkResults);

      if (i + concurrency < allShipments.length) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    const unipassFailures = results.filter((r) => r.unipassFailed).map((r) => r.blNumber);
    const missingCount = results.filter((r) => r.nextMissingTag !== null).length;

    console.log(`[Milestone] Processing complete. Total: ${results.length}, Still missing: ${missingCount}, Unipass failures: ${unipassFailures.length}`);

    return {
      success: true,
      message: `총 ${results.length}건 처리 완료 (완료: ${results.length - missingCount}건, 누락/재조회대상: ${missingCount}건)` +
        (unipassFailures.length > 0 ? ` [유니패스 실패: ${unipassFailures.length}건]` : ''),
      results,
      totalCount: results.length,
      mailCount: mailShipments.length,
      upsCount: upsShipments.length,
      missingInputCount: missingShipments.length,
      missingCount,
      unipassFailures
    };
  } catch (error: any) {
    console.error('[Milestone] Processing error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '마일스톤 처리 중 오류가 발생했습니다.'
    });
  }
});
