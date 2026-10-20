import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  parseMailListWorkbook,
  parseUpsWorkbook,
  fetchUnipassData,
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
    const blYearPart = parts.find((p) => p.name === 'blYear');
    const blYear = blYearPart?.data?.toString().trim() || new Date().getFullYear().toString();

    if (!mailFilePart) {
      throw createError({
        statusCode: 400,
        statusMessage: '메일 목록 파일이 필요합니다.'
      });
    }

    console.log(`[Milestone] Mail file: ${mailFilePart.filename}, UPS file: ${upsFilePart?.filename || 'None'}, Year: ${blYear}`);

    // 1. 메일 목록 파일 파싱
    const mailWb = XLSX.read(mailFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
    const hasUpsFile = !!upsFilePart;
    const mailShipments = parseMailListWorkbook(mailWb, hasUpsFile);
    console.log(`[Milestone] Extracted ${mailShipments.length} unique shipments from mail file`);

    // 2. UPS 파일 파싱 (업로드된 경우)
    let upsShipments: ParsedShipment[] = [];
    if (upsFilePart) {
      const upsWb = XLSX.read(upsFilePart.data, { type: 'buffer', codepage: 65001, cellDates: false });
      upsShipments = parseUpsWorkbook(upsWb);
      console.log(`[Milestone] Extracted ${upsShipments.length} shipments from UPS file`);
    }

    // 3. 두 데이터 병합 (동일 BL이 메일목록과 UPS 둘 다 있으면 UPS 정보를 우선 적용)
    const combinedMap = new Map<string, ParsedShipment>();

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

    // 4. 유니패스 API 조회
    const config = useRuntimeConfig();
    const apiKey = config.unipassApiKey || process.env.UNIPASS_API_KEY || '';

    if (!apiKey) {
      console.warn('[Milestone] Warning: UNIPASS_API_KEY is missing');
    }

    // Unipass 병렬 조회 (동시 처리 5개씩)
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

          return {
            ...shipment,
            ...unipass
          };
        })
      );

      results.push(...chunkResults);

      // 과도한 동시 호출 방지 딜레이
      if (i + concurrency < allShipments.length) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    const unipassFailures = results.filter((r) => r.unipassFailed).map((r) => r.blNumber);
    console.log(`[Milestone] Processing complete. Total: ${results.length}, Unipass failures: ${unipassFailures.length}`);

    return {
      success: true,
      message: `총 ${results.length}건의 마일스톤 데이터 처리가 완료되었습니다.` +
        (unipassFailures.length > 0 ? ` (유니패스 조회 실패: ${unipassFailures.length}건)` : ''),
      results,
      totalCount: results.length,
      mailCount: mailShipments.length,
      upsCount: upsShipments.length,
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
