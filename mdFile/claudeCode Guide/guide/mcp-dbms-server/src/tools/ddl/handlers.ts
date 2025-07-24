import { z } from 'zod';
import { getDatabase } from '../../db/connectionHelper.js';
import { logger } from '../../utils/logger.js';
import { QueryExecutionError } from '../../utils/errors.js';

// DDL 도구 핸들러
export async function handleDdlTools(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'generateTableDdl':
      return await handleGenerateTableDdl(args);
    
    case 'generateAllTablesDdl':
      return await handleGenerateAllTablesDdl(args);
    
    case 'generateTablesDdlByPattern':
      return await handleGenerateTablesDdlByPattern(args);
    
    default:
      throw new Error(`Unknown DDL tool: ${name}`);
  }
}

// generateTableDdl 핸들러
async function handleGenerateTableDdl(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
    tableName: z.string().min(1, '테이블 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    const ddl = await db.generateTableDDL(params.schemaName, params.tableName);
    
    // DDL을 직접 반환 (JSON 래핑 없이)
    return {
      content: [
        {
          type: 'text' as const,
          text: `-- 스키마: ${params.schemaName}\n-- 테이블: ${params.tableName}\n\n${ddl}`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('테이블 DDL 생성 실패:', error);
    throw new QueryExecutionError(
      `테이블 DDL 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// generateAllTablesDdl 핸들러 (병렬 처리로 개선)
async function handleGenerateAllTablesDdl(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    
    // 테이블 목록 조회
    const tables = await db.getTables(params.schemaName);
    
    if (tables.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `-- 스키마 '${params.schemaName}'에 테이블이 없습니다.`,
          },
        ],
      };
    }
    
    // 병렬로 각 테이블의 DDL 생성
    const ddlPromises = tables.map(table => 
      db.generateTableDDL(params.schemaName, table.name)
        .then(ddl => ({
          tableName: table.name,
          ddl,
          success: true,
        }))
        .catch(error => {
          logger.error(`테이블 '${table.name}' DDL 생성 실패:`, error);
          return {
            tableName: table.name,
            ddl: `-- 에러: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            success: false,
          };
        })
    );
    
    const results = await Promise.all(ddlPromises);
    
    // DDL을 개별 텍스트 블록으로 반환 (스트리밍 효과)
    const content = [
      {
        type: 'text' as const,
        text: `-- 스키마: ${params.schemaName}\n-- 총 테이블 수: ${tables.length}\n` +
              `-- 성공: ${results.filter(r => r.success).length}, 실패: ${results.filter(r => !r.success).length}\n` +
              `${'='.repeat(60)}\n`,
      },
      ...results.map(({ tableName, ddl }) => ({
        type: 'text' as const,
        text: `\n-- 테이블: ${tableName}\n${'-'.repeat(40)}\n${ddl}\n`,
      })),
    ];
    
    return { content };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('모든 테이블 DDL 생성 실패:', error);
    throw new QueryExecutionError(
      `모든 테이블 DDL 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// generateTablesDdlByPattern 핸들러 (병렬 처리로 개선)
async function handleGenerateTablesDdlByPattern(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    schemaName: z.string().min(1, '스키마 이름은 필수입니다'),
    pattern: z.string().min(1, '패턴은 필수입니다'),
  });

  try {
    const params = paramsSchema.parse(args);
    
    const db = getDatabase(params.connectionId);
    
    // 테이블 목록 조회
    const allTables = await db.getTables(params.schemaName);
    
    // 패턴과 일치하는 테이블 필터링
    const pattern = new RegExp(params.pattern.replace(/\*/g, '.*'), 'i');
    const matchingTables = allTables.filter(table => pattern.test(table.name));
    
    if (matchingTables.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `-- 스키마: ${params.schemaName}\n-- 패턴 '${params.pattern}'과 일치하는 테이블이 없습니다.`,
          },
        ],
      };
    }
    
    // 병렬로 각 테이블의 DDL 생성
    const ddlPromises = matchingTables.map(table => 
      db.generateTableDDL(params.schemaName, table.name)
        .then(ddl => ({
          tableName: table.name,
          ddl,
          success: true,
        }))
        .catch(error => {
          logger.error(`테이블 '${table.name}' DDL 생성 실패:`, error);
          return {
            tableName: table.name,
            ddl: `-- 에러: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            success: false,
          };
        })
    );
    
    const results = await Promise.all(ddlPromises);
    
    // DDL을 개별 텍스트 블록으로 반환
    const content = [
      {
        type: 'text' as const,
        text: `-- 스키마: ${params.schemaName}\n-- 패턴: ${params.pattern}\n` +
              `-- 일치하는 테이블 수: ${matchingTables.length}\n` +
              `-- 성공: ${results.filter(r => r.success).length}, 실패: ${results.filter(r => !r.success).length}\n` +
              `${'='.repeat(60)}\n`,
      },
      ...results.map(({ tableName, ddl }) => ({
        type: 'text' as const,
        text: `\n-- 테이블: ${tableName}\n${'-'.repeat(40)}\n${ddl}\n`,
      })),
    ];
    
    return { content };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('패턴별 테이블 DDL 생성 실패:', error);
    throw new QueryExecutionError(
      `패턴별 테이블 DDL 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}