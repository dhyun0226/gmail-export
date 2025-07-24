import { z } from 'zod';
import { getDatabase } from '../../db/connectionHelper.js';
import { logger } from '../../utils/logger.js';
import { QueryExecutionError } from '../../utils/errors.js';

// 스키마 도구 핸들러
export async function handleSchemaTools(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'getSchemaList':
      return await handleGetSchemaList(args);
    
    case 'getTableList':
      return await handleGetTableList(args);
    
    default:
      throw new Error(`Unknown schema tool: ${name}`);
  }
}

// getSchemaList 핸들러
async function handleGetSchemaList(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().optional(),
  });

  try {
    const params = paramsSchema.parse(args);
    const database = getDatabase(params.connectionId);
    
    const schemas = await database.getSchemas();
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            connectionId: params.connectionId,
            schemas,
            count: schemas.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('스키마 목록 조회 실패:', error);
    throw new QueryExecutionError(
      `스키마 목록 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// getTableList 핸들러
async function handleGetTableList(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().optional(),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    const database = getDatabase(params.connectionId);
    
    const tables = await database.getTables(params.schemaName);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            connectionId: params.connectionId,
            schemaName: params.schemaName,
            tables,
            count: tables.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('테이블 목록 조회 실패:', error);
    throw new QueryExecutionError(
      `테이블 목록 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}