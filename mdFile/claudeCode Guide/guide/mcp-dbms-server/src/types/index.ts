// 데이터베이스 스키마 타입
export interface Schema {
  schemaName: string;
  defaultCharacterSet?: string;
  defaultCollation?: string;
}

// 테이블 정보 타입
export interface Table {
  tableName: string;
  tableSchema: string;
  tableType: string;
  engine?: string;
  rowFormat?: string;
  tableRows?: number;
  avgRowLength?: number;
  dataLength?: number;
  indexLength?: number;
  createTime?: Date;
  updateTime?: Date;
  tableComment?: string;
}

// 컬럼 정보 타입
export interface Column {
  columnName: string;
  ordinalPosition: number;
  columnDefault?: string;
  isNullable: boolean;
  dataType: string;
  columnType: string;
  characterMaximumLength?: number;
  numericPrecision?: number;
  numericScale?: number;
  columnKey?: string;
  extra?: string;
  columnComment?: string;
}

// 인덱스 정보 타입
export interface Index {
  indexName: string;
  nonUnique: boolean;
  columnName: string;
  seqInIndex: number;
  cardinality?: number;
  nullable: boolean;
  indexType: string;
  comment?: string;
}

// 테이블 통계 타입
export interface TableStats {
  tableName: string;
  tableRows: number;
  dataLength: number;
  indexLength: number;
  dataFree: number;
  avgRowLength: number;
  createTime?: Date;
  updateTime?: Date;
}

// 성능 통계 타입
export interface PerformanceStats {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  slowQueries: number;
  uptime: number;
  bytesReceived: number;
  bytesSent: number;
}

// 쿼리 결과 타입
export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}

// 기본 요청 인터페이스 - connectionId를 포함
export interface BaseRequest {
  connectionId?: string;  // 선택적 - 없으면 기본 연결 사용
}

// 스키마 관련 요청
export interface SchemaRequest extends BaseRequest {
  schemaName: string;
}

// 테이블 관련 요청
export interface TableRequest extends BaseRequest {
  schemaName: string;
  tableName: string;
}

// 패턴 매칭 요청
export interface PatternRequest extends BaseRequest {
  schemaName: string;
  pattern: string;
}

// 쿼리 실행 요청
export interface QueryRequest extends BaseRequest {
  query: string;
  schemaName?: string;
}

// DDL 실행 요청
export interface DDLRequest extends BaseRequest {
  ddl: string;
  schemaName?: string;
}