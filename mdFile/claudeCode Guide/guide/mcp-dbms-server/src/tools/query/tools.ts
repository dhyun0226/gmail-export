// 쿼리 도구 정의
export const queryTools = [
  {
    name: 'executeQuery',
    description: 'SELECT 쿼리를 실행하고 결과를 반환합니다 (읽기 전용)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
        query: {
          type: 'string' as const,
          description: '실행할 SELECT 쿼리',
        },
        schemaName: {
          type: 'string' as const,
          description: '쿼리를 실행할 스키마 이름 (선택사항)',
        },
      },
      required: ['connectionId', 'query'],
    },
  },
  {
    name: 'executeCreateTable',
    description: 'CREATE TABLE DDL을 실행하여 새 테이블을 생성합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
        ddl: {
          type: 'string' as const,
          description: '실행할 CREATE TABLE DDL',
        },
        schemaName: {
          type: 'string' as const,
          description: '테이블을 생성할 스키마 이름 (선택사항)',
        },
      },
      required: ['connectionId', 'ddl'],
    },
  },
];