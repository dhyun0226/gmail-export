// DDL 도구 정의
export const ddlTools = [
  {
    name: 'generateTableDdl',
    description: '지정된 테이블의 CREATE TABLE DDL을 생성합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
        schemaName: {
          type: 'string' as const,
          description: '스키마 이름',
        },
        tableName: {
          type: 'string' as const,
          description: '테이블 이름',
        },
      },
      required: ['connectionId', 'schemaName', 'tableName'],
    },
  },
  {
    name: 'generateAllTablesDdl',
    description: '지정된 스키마의 모든 테이블에 대한 CREATE TABLE DDL을 생성합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
        schemaName: {
          type: 'string' as const,
          description: '스키마 이름',
        },
      },
      required: ['connectionId', 'schemaName'],
    },
  },
  {
    name: 'generateTablesDdlByPattern',
    description: '지정된 패턴과 일치하는 테이블들의 CREATE TABLE DDL을 생성합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
        schemaName: {
          type: 'string' as const,
          description: '스키마 이름',
        },
        pattern: {
          type: 'string' as const,
          description: '테이블 이름 패턴 (예: user_*, *_log)',
        },
      },
      required: ['connectionId', 'schemaName', 'pattern'],
    },
  },
];