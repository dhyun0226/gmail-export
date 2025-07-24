import { z } from 'zod';
import { getDatabase } from '../../db/connectionHelper.js';
import { Index } from '../../db/interfaces/index.js';
import { logger } from '../../utils/logger.js';
import { QueryExecutionError } from '../../utils/errors.js';

// 테이블 도구 핸들러
export async function handleTableTools(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'getColumnInfo':
      return await handleGetColumnInfo(args);
    
    case 'getIndexInfo':
      return await handleGetIndexInfo(args);
    
    case 'getTableStats':
      return await handleGetTableStats(args);
    
    default:
      throw new Error(`Unknown table tool: ${name}`);
  }
}

// getColumnInfo 핸들러
async function handleGetColumnInfo(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
    tableName: z.string().min(1, '테이블 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    const columns = await db.getColumns(params.schemaName, params.tableName);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            schemaName: params.schemaName,
            tableName: params.tableName,
            columns,
            count: columns.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('컬럼 정보 조회 실패:', error);
    throw new QueryExecutionError(
      `컬럼 정보 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// getIndexInfo 핸들러
async function handleGetIndexInfo(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
    tableName: z.string().min(1, '테이블 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    const indexes = await db.getIndexes(params.schemaName, params.tableName);
    
    // 인덱스별로 그룹화
    const indexMap = new Map<string, Index[]>();
    indexes.forEach(index => {
      if (!indexMap.has(index.name)) {
        indexMap.set(index.name, []);
      }
      indexMap.get(index.name)!.push(index);
    });
    
    const groupedIndexes = Array.from(indexMap.entries()).map(([name, indexList]) => ({
      indexName: name,
      columns: indexList[0].columns,
      isUnique: indexList[0].isUnique,
      isPrimary: indexList[0].isPrimary,
      type: indexList[0].type,
    }));
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            schemaName: params.schemaName,
            tableName: params.tableName,
            indexes: groupedIndexes,
            count: groupedIndexes.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('인덱스 정보 조회 실패:', error);
    throw new QueryExecutionError(
      `인덱스 정보 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// getTableStats 핸들러
async function handleGetTableStats(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
    tableName: z.string().min(1, '테이블 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    const stats = await db.getTableStats(params.schemaName, params.tableName);
    
    // 사람이 읽기 쉬운 형식으로 변환
    const formattedStats = {
      ...stats,
      dataSizeMB: (stats.dataSize / 1024 / 1024).toFixed(2),
      indexSizeMB: (stats.indexSize / 1024 / 1024).toFixed(2),
      totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
    };
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            schemaName: params.schemaName,
            tableName: params.tableName,
            stats: formattedStats,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('테이블 통계 정보 조회 실패:', error);
    throw new QueryExecutionError(
      `테이블 통계 정보 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}