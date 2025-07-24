// 스키마 도구 정의
export const schemaTools = [
  {
    name: 'getSchemaList',
    description: '데이터베이스의 모든 스키마 목록을 조회합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID (선택사항, 미지정시 기본 연결 사용)',
        },
      },
    },
  },
  {
    name: 'getTableList',
    description: '지정된 스키마의 모든 테이블 목록을 조회합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID (선택사항, 미지정시 기본 연결 사용)',
        },
        schemaName: {
          type: 'string' as const,
          description: '조회할 스키마 이름',
        },
      },
      required: ['schemaName'],
    },
  },
];