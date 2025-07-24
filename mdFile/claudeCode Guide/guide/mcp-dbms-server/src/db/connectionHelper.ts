/**
 * 연결 헬퍼 유틸리티
 * 연결 ID 기반 데이터베이스 접근 지원
 */

import { ConnectionManager } from './ConnectionManager.js';
import { IDatabase } from './interfaces/index.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// 기본 연결 ID
let defaultConnectionId: string | null = null;

/**
 * 연결 ID로 데이터베이스 인스턴스 가져오기
 * connectionId가 없으면 기본 연결 사용
 */
export function getDatabase(connectionId?: string): IDatabase {
  const manager = ConnectionManager.getInstance();
  
  // connectionId가 제공되면 해당 연결 사용
  if (connectionId) {
    return manager.getConnection(connectionId);
  }
  
  // 기본 연결 ID가 설정되어 있으면 사용
  if (defaultConnectionId) {
    return manager.getConnection(defaultConnectionId);
  }
  
  // 활성 연결이 하나만 있으면 자동으로 사용
  const connectionIds = manager.getConnectionIds();
  if (connectionIds.length === 1) {
    logger.debug(`기본 연결 자동 선택: ${connectionIds[0]}`);
    return manager.getConnection(connectionIds[0]);
  }
  
  // 연결이 없거나 여러 개인 경우 오류
  if (connectionIds.length === 0) {
    throw new DatabaseError('활성 데이터베이스 연결이 없습니다');
  }
  
  throw new DatabaseError('connectionId를 지정해야 합니다. 활성 연결: ' + connectionIds.join(', '));
}

/**
 * 기본 연결 ID 설정
 */
export function setDefaultConnectionId(connectionId: string): void {
  const manager = ConnectionManager.getInstance();
  
  // 연결이 존재하는지 확인
  manager.getConnection(connectionId);
  
  defaultConnectionId = connectionId;
}

/**
 * 기본 연결 ID 가져오기
 */
export function getDefaultConnectionId(): string | null {
  return defaultConnectionId;
}

/**
 * 기본 연결 ID 초기화
 */
export function clearDefaultConnectionId(): void {
  defaultConnectionId = null;
}