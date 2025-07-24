#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.js';
import { config, getConnectionConfigs, getDefaultConnectionId } from './config/index.js';
import { registerTools } from './tools/index.js';
import { ConnectionManager } from './db/ConnectionManager.js';
import { setDefaultConnectionId } from './db/connectionHelper.js';

// MCP 서버 인스턴스 생성
const server = new Server(
  {
    name: config.MCP_SERVER_NAME,
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 서버 초기화
async function initializeServer() {
  try {
    // 데이터베이스 연결 초기화
    const connectionManager = ConnectionManager.getInstance();
    const connectionConfigs = getConnectionConfigs();
    
    // 모든 연결 등록
    for (const connConfig of connectionConfigs) {
      try {
        await connectionManager.registerConnection(connConfig);
      } catch (error) {
        logger.error(`데이터베이스 연결 실패: ${connConfig.id}`, error);
        // 연결 실패 시 계속 진행할지 결정
        if (connectionConfigs.length === 1) {
          throw error; // 단일 연결인 경우 종료
        }
      }
    }
    
    // 기본 연결 ID 설정
    const defaultId = getDefaultConnectionId();
    if (defaultId) {
      setDefaultConnectionId(defaultId);
    }
    
    // 활성 연결 확인
    const activeConnections = connectionManager.getConnectionIds();
    if (activeConnections.length === 0) {
      throw new Error('활성 데이터베이스 연결이 없습니다');
    }

    // 도구 등록
    registerTools(server);

    // 전송 계층 설정
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

// 프로세스 종료 처리
process.on('SIGINT', async () => {
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.closeAllConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.closeAllConnections();
  process.exit(0);
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  logger.error('처리되지 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 Promise 거부:', { reason, promise });
  process.exit(1);
});

// 서버 시작
initializeServer();