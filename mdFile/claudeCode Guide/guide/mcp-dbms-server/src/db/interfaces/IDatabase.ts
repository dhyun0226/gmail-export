/**
 * 데이터베이스 추상 인터페이스
 * 모든 DBMS 어댑터가 구현해야 하는 공통 인터페이스
 */

export interface Schema {
  name: string;
  owner?: string;
  defaultCharacterSet?: string;
  defaultCollation?: string;
}

export interface Table {
  name: string;
  schema: string;
  type: 'TABLE' | 'VIEW' | 'SYSTEM TABLE';
  rows?: number;
  dataSize?: number;
  indexSize?: number;
  totalSize?: number;
  created?: Date;
  modified?: Date;
  comment?: string;
}

export interface Column {
  name: string;
  dataType: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isIdentity: boolean;
  identitySeed?: number;
  identityIncrement?: number;
  comment?: string;
  ordinalPosition: number;
}

export interface Index {
  name: string;
  tableName: string;
  schemaName: string;
  type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT' | 'SPATIAL' | 'BITMAP';
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  isClustered?: boolean;
  cardinality?: number;
  size?: number;
  comment?: string;
}

export interface TableStats {
  tableName: string;
  schemaName: string;
  rowCount: number;
  dataSize: number;
  indexSize: number;
  totalSize: number;
  avgRowLength?: number;
  lastAnalyzed?: Date;
  autoIncrement?: number;
}

export interface ServerStats {
  uptime: number;
  version: string;
  currentConnections: number;
  maxConnections: number;
  totalQueries: number;
  slowQueries: number;
  bytesReceived: number;
  bytesSent: number;
  threadsRunning?: number;
  additionalMetrics?: Record<string, any>;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields?: Array<{
    name: string;
    dataType: string;
  }>;
  executionTime?: number;
}

export interface IDatabase {
  // 연결 관리
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ping(): Promise<boolean>;
  
  // 스키마 관련
  getSchemas(): Promise<Schema[]>;
  getTables(schema: string): Promise<Table[]>;
  getTablesByPattern(schema: string, pattern: string): Promise<Table[]>;
  
  // 테이블 메타데이터
  getColumns(schema: string, table: string): Promise<Column[]>;
  getIndexes(schema: string, table: string): Promise<Index[]>;
  getTableStats(schema: string, table: string): Promise<TableStats>;
  
  // DDL 생성
  generateTableDDL(schema: string, table: string): Promise<string>;
  generateSchemaScript(schema: string): Promise<string>;
  
  // 쿼리 실행
  executeQuery<T = any>(query: string, params?: any[]): Promise<QueryResult<T>>;
  executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T>;
  
  // 서버 통계
  getServerStats(): Promise<ServerStats>;
  
  // DBMS 타입
  getType(): DatabaseType;
  getVersion(): Promise<string>;
}

export enum DatabaseType {
  MySQL = 'mysql',
  PostgreSQL = 'postgresql',
  MSSQL = 'mssql',
  Oracle = 'oracle'
}

export interface DatabaseConnectionConfig {
  id: string;
  type: DatabaseType;
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
  ssl?: boolean;
  connectionTimeout?: number;
  requestTimeout?: number;
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };
  options?: Record<string, any>;
}