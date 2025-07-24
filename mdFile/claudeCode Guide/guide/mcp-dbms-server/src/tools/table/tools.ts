// 테이블 도구 정의
export const tableTools = [
  {
    name: 'getColumnInfo',
    description: '지정된 테이블의 컬럼 정보를 조회합니다',
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
    name: 'getIndexInfo',
    description: '지정된 테이블의 인덱스 정보를 조회합니다',
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
    name: 'getTableStats',
    description: '지정된 테이블의 통계 정보를 조회합니다',
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
];