import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import { DatabaseConnectionConfig, DatabaseType } from '../db/interfaces/index.js';

// .env 파일 로드
dotenvConfig();

// 환경 변수 스키마 정의
const envSchema = z.object({
  // 로깅 설정
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  MCP_SERVER_NAME: z.string().default('mcp-dbms-server'),
  
  // 기본 연결 설정 (하위 호환성)
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_TYPE: z.string().optional(),
  DB_DATABASE: z.string().optional(),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  
  // 다중 연결 설정
  DB_CONNECTIONS: z.string().optional(), // JSON 형식의 연결 설정
  DEFAULT_CONNECTION_ID: z.string().optional(),
});

// 환경 변수 검증 및 파싱
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('환경 변수 검증 실패:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;

// 데이터베이스 연결 설정 파싱
export function getConnectionConfigs(): DatabaseConnectionConfig[] {
  const configs: DatabaseConnectionConfig[] = [];
  
  // 다중 연결 설정이 있는 경우
  if (config.DB_CONNECTIONS) {
    try {
      const connections = JSON.parse(config.DB_CONNECTIONS);
      
      if (Array.isArray(connections)) {
        configs.push(...connections.map(conn => validateConnectionConfig(conn)));
      } else if (typeof connections === 'object') {
        // 객체 형식인 경우 각 키를 connectionId로 사용
        Object.entries(connections).forEach(([id, conn]: [string, any]) => {
          configs.push(validateConnectionConfig({ ...conn, id }));
        });
      }
    } catch (error) {
      console.error('DB_CONNECTIONS 파싱 실패:', error);
    }
  }
  
  // 기본 연결 설정 (하위 호환성)
  if (config.DB_HOST && configs.length === 0) {
    const dbType = config.DB_TYPE?.toLowerCase() || 'mysql';
    
    if (!isValidDatabaseType(dbType)) {
      console.error(`지원하지 않는 데이터베이스 타입: ${dbType}`);
      process.exit(1);
    }
    
    configs.push({
      id: 'default',
      type: dbType as DatabaseType,
      host: config.DB_HOST,
      port: config.DB_PORT || getDefaultPort(dbType as DatabaseType),
      user: config.DB_USER || 'root',
      password: config.DB_PASSWORD || '',
      database: config.DB_DATABASE,
      pool: {
        max: config.DB_CONNECTION_LIMIT,
      },
    });
  }
  
  if (configs.length === 0) {
    console.error('데이터베이스 연결 설정이 없습니다. DB_CONNECTIONS 또는 DB_HOST를 설정해주세요.');
    process.exit(1);
  }
  
  return configs;
}

// 연결 설정 유효성 검증
function validateConnectionConfig(config: any): DatabaseConnectionConfig {
  const schema = z.object({
    id: z.string(),
    type: z.enum(['mysql', 'postgresql', 'mssql', 'oracle']),
    host: z.string(),
    port: z.number().optional(),
    user: z.string(),
    password: z.string(),
    database: z.string().optional(),
    ssl: z.boolean().optional(),
    connectionTimeout: z.number().optional(),
    requestTimeout: z.number().optional(),
    pool: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      idleTimeoutMillis: z.number().optional(),
    }).optional(),
    options: z.record(z.any()).optional(),
  });
  
  const result = schema.safeParse(config);
  
  if (!result.success) {
    throw new Error(`연결 설정 검증 실패 (${config.id}): ${result.error.message}`);
  }
  
  // 포트가 없으면 기본값 설정
  if (!result.data.port) {
    result.data.port = getDefaultPort(result.data.type as DatabaseType);
  }
  
  return result.data as DatabaseConnectionConfig;
}

// 데이터베이스 타입 유효성 검증
function isValidDatabaseType(type: string): boolean {
  return Object.values(DatabaseType).includes(type as DatabaseType);
}

// 데이터베이스별 기본 포트
function getDefaultPort(type: DatabaseType): number {
  switch (type) {
    case DatabaseType.MySQL:
      return 3306;
    case DatabaseType.PostgreSQL:
      return 5432;
    case DatabaseType.MSSQL:
      return 1433;
    case DatabaseType.Oracle:
      return 1521;
    default:
      return 3306;
  }
}

// 기본 연결 ID 가져오기
export function getDefaultConnectionId(): string | undefined {
  return config.DEFAULT_CONNECTION_ID;
}