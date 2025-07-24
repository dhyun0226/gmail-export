import { z } from 'zod';
import { getDatabase } from '../../db/connectionHelper.js';
import { logger } from '../../utils/logger.js';
import { QueryExecutionError } from '../../utils/errors.js';

// 통계 도구 핸들러
export async function handleStatsTools(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'getPerformanceStats':
      return await handleGetPerformanceStats(args);
    
    default:
      throw new Error(`Unknown stats tool: ${name}`);
  }
}

// getPerformanceStats 핸들러
async function handleGetPerformanceStats(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    const stats = await db.getServerStats();
    
    // 사람이 읽기 쉬운 형식으로 변환
    const formattedStats = {
      version: stats.version,
      connections: {
        current: stats.currentConnections,
        max: stats.maxConnections,
      },
      queries: {
        total: stats.totalQueries,
        slow: stats.slowQueries,
        averagePerSecond: stats.uptime > 0 ? (stats.totalQueries / stats.uptime).toFixed(2) : '0',
      },
      uptime: {
        seconds: stats.uptime,
        hours: (stats.uptime / 3600).toFixed(2),
        days: (stats.uptime / 86400).toFixed(2),
      },
      network: {
        bytesReceived: stats.bytesReceived,
        bytesSent: stats.bytesSent,
        mbReceived: (stats.bytesReceived / 1024 / 1024).toFixed(2),
        mbSent: (stats.bytesSent / 1024 / 1024).toFixed(2),
      },
      additionalMetrics: stats.additionalMetrics,
    };
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(formattedStats, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('성능 통계 조회 실패:', error);
    throw new QueryExecutionError(
      `성능 통계 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}