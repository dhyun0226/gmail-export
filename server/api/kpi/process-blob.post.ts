// server/api/kpi/process-blob.post.ts
import { list } from '@vercel/blob';
import * as XLSX from 'xlsx';
import { Redis } from "@upstash/redis";
import { processBlNumbers, generateStatistics } from '../../utils/kpi/dataProcessor';

// cpexcel.js 의존성 제거를 위한 설정
import 'xlsx/dist/cpexcel.js';

// Redis 클라이언트 초기화 (Vercel 환경 변수를 자동으로 읽어옴)
const redis = Redis.fromEnv();

export default defineEventHandler(async (event) => {
  console.log('[KPI Process-Blob] Starting unified processing');

  const accessToken = getCookie(event, 'access_token');
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const { pathname, blYear } = await readBody(event);
    if (!pathname || !blYear) {
      throw createError({ statusCode: 400, statusMessage: 'pathname and blYear are required.' });
    }

    const blobData = await list({ prefix: pathname });
    const fileInfo = blobData.blobs.find(b => b.pathname === pathname);
    if (!fileInfo) {
      throw createError({ statusCode: 404, statusMessage: 'Blob file not found.' });
    }
    const response = await fetch(fileInfo.url);
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    const workbook = XLSX.read(fileBuffer, { type: 'buffer', codepage: 65001 });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '' });

    // [수정] @upstash/redis를 사용하여 원본 데이터 저장 (1시간 후 만료)
    const storageKey = `kpi:rawData:${event.context.sessionId}`;
    await redis.set(storageKey, JSON.stringify(jsonData), { ex: 3600 });

    const blNumbers: string[] = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const blNumber = row['C']?.toString().trim();
      if (blNumber) {
        blNumbers.push(blNumber);
      }
    }
    
    if (blNumbers.length === 0) {
        return { success: true, results: [], statistics: generateStatistics([]) };
    }

    console.log(`[KPI Process-Blob] Extracted ${blNumbers.length} BL numbers. Year: ${blYear}`);

    const gmail = await getGmailClient(accessToken);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const results = await processBlNumbers(
      [...new Set(blNumbers)],
      blYear,
      gmail,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        useOptimizedGmailSearch: blNumbers.length > 10
      }
    );

    const statistics = generateStatistics(results);
    console.log('[KPI Process-Blob] Processing completed:', statistics);

    return {
      success: true,
      results,
      statistics
    };

  } catch (error: any) {
    console.error('[KPI Process-Blob] Error:', error);
    if (error.code === 401 || error.statusCode === 401) {
      throw createError({ statusCode: 401, statusMessage: 'Token expired or invalid' });
    }
    throw createError({ statusCode: 500, statusMessage: error.message || 'Processing failed' });
  }
});