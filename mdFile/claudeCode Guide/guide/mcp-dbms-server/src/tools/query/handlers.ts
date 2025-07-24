import { z } from 'zod';
import { getDatabase } from '../../db/connectionHelper.js';
import { logger } from '../../utils/logger.js';
import { QueryExecutionError, PermissionError } from '../../utils/errors.js';

// 쿼리 도구 핸들러
export async function handleQueryTools(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'executeQuery':
      return await handleExecuteQuery(args);
    
    case 'executeCreateTable':
      return await handleExecuteCreateTable(args);
    
    default:
      throw new Error(`Unknown query tool: ${name}`);
  }
}

// 허용된 SELECT 쿼리인지 검증
function validateSelectQuery(query: string): boolean {
  const trimmedQuery = query.trim().toUpperCase();
  
  // SELECT로 시작하는지 확인
  if (!trimmedQuery.startsWith('SELECT')) {
    return false;
  }
  
  // 위험한 키워드 체크
  const dangerousKeywords = [
    'INTO OUTFILE',
    'INTO DUMPFILE',
    'LOAD_FILE',
  ];
  
  for (const keyword of dangerousKeywords) {
    if (trimmedQuery.includes(keyword)) {
      return false;
    }
  }
  
  return true;
}

// CREATE TABLE 쿼리인지 검증
function validateCreateTableQuery(query: string): boolean {
  const trimmedQuery = query.trim().toUpperCase();
  return trimmedQuery.startsWith('CREATE TABLE') || trimmedQuery.startsWith('CREATE TEMPORARY TABLE');
}

// executeQuery 핸들러
async function handleExecuteQuery(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    query: z.string().min(1, '쿼리는 필수입니다'),
    schemaName: z.string().optional(),
  });

  try {
    const params = paramsSchema.parse(args);
    
    // SELECT 쿼리 검증
    if (!validateSelectQuery(params.query)) {
      throw new PermissionError('SELECT 쿼리만 실행할 수 있습니다');
    }
    
    const db = getDatabase(params.connectionId);
    const result = await db.executeQuery(params.query);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('쿼리 실행 실패:', error);
    throw new QueryExecutionError(
      `쿼리 실행 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// executeCreateTable 핸들러
async function handleExecuteCreateTable(args: Record<string, unknown>) {
  const paramsSchema = z.object({
    connectionId: z.string().min(1, '연결 ID는 필수입니다'),
    ddl: z.string().min(1, 'DDL은 필수입니다'),
    schemaName: z.string().optional(),
  });

  try {
    const params = paramsSchema.parse(args);
    
    // CREATE TABLE 쿼리 검증
    if (!validateCreateTableQuery(params.ddl)) {
      throw new PermissionError('CREATE TABLE 쿼리만 실행할 수 있습니다');
    }
    
    const db = getDatabase(params.connectionId);
    const result = await db.executeQuery(params.ddl);
    
    // CREATE TABLE 쿼리에서 테이블 이름 추출
    const tableNameMatch = params.ddl.match(/CREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?[^`.]+`?\.)?`?([^`\s]+)`?/i);
    const tableName = tableNameMatch ? tableNameMatch[1] : 'unknown';
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            tableName,
            message: `테이블 '${tableName}'이(가) 성공적으로 생성되었습니다.`,
            executionTime: result.executionTime,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('파라미터 검증 실패:', error);
      throw new QueryExecutionError(`파라미터 검증 실패: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    logger.error('테이블 생성 실패:', error);
    throw new QueryExecutionError(
      `테이블 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}