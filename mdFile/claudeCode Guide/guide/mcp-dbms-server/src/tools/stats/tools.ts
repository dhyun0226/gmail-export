// 통계 도구 정의
export const statsTools = [
  {
    name: 'getPerformanceStats',
    description: '데이터베이스 서버의 성능 통계를 조회합니다',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectionId: {
          type: 'string' as const,
          description: '데이터베이스 연결 ID',
        },
      },
      required: ['connectionId'],
    },
  },
];