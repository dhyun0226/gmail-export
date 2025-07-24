// 커스텀 에러 클래스
export class DbmsServerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'DbmsServerError';
  }
}

// 데이터베이스 연결 에러
export class DatabaseConnectionError extends DbmsServerError {
  constructor(message: string) {
    super(message, 'DB_CONNECTION_ERROR', 500);
    this.name = 'DatabaseConnectionError';
  }
}

// 쿼리 실행 에러
export class QueryExecutionError extends DbmsServerError {
  constructor(message: string) {
    super(message, 'QUERY_EXECUTION_ERROR', 400);
    this.name = 'QueryExecutionError';
  }
}

// 유효성 검증 에러
export class ValidationError extends DbmsServerError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

// 일반 데이터베이스 에러
export class DatabaseError extends DbmsServerError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
  }
}

// 권한 에러
export class PermissionError extends DbmsServerError {
  constructor(message: string) {
    super(message, 'PERMISSION_ERROR', 403);
    this.name = 'PermissionError';
  }
}

// 에러 메시지 포맷팅
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}