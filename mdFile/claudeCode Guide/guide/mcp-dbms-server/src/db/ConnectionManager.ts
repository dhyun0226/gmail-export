/**
 * 다중 데이터베이스 연결 관리자
 * 여러 DBMS 연결을 통합 관리
 */

import { IDatabase, DatabaseConnectionConfig, DatabaseType } from './interfaces/index.js';
import { DatabaseFactory } from './DatabaseFactory.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, IDatabase> = new Map();
  private configs: Map<string, DatabaseConnectionConfig> = new Map();

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * 새로운 데이터베이스 연결 등록
   */
  async registerConnection(config: DatabaseConnectionConfig): Promise<void> {
    if (this.connections.has(config.id)) {
      throw new DatabaseError(`연결 ID '${config.id}'가 이미 존재합니다`);
    }

    try {
      // 데이터베이스 인스턴스 생성
      const database = DatabaseFactory.create(config);
      
      // 연결 시도
      await database.connect();
      
      // 연결 저장
      this.connections.set(config.id, database);
      this.configs.set(config.id, config);
    } catch (error) {
      logger.error(`데이터베이스 연결 실패: ${config.id}`, error);
      throw new DatabaseError(`데이터베이스 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 연결 ID로 데이터베이스 인스턴스 가져오기
   */
  getConnection(connectionId: string): IDatabase {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new DatabaseError(`연결 ID '${connectionId}'를 찾을 수 없습니다`);
    }
    return connection;
  }

  /**
   * 모든 활성 연결 ID 목록 가져오기
   */
  getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * 연결 정보 가져오기
   */
  getConnectionInfo(connectionId: string): DatabaseConnectionConfig {
    const config = this.configs.get(connectionId);
    if (!config) {
      throw new DatabaseError(`연결 ID '${connectionId}'의 설정을 찾을 수 없습니다`);
    }
    return { ...config };
  }

  /**
   * 모든 연결 정보 가져오기
   */
  getAllConnectionsInfo(): Array<{ id: string; type: DatabaseType; host: string; database?: string }> {
    return Array.from(this.configs.values()).map(config => ({
      id: config.id,
      type: config.type,
      host: config.host,
      database: config.database
    }));
  }

  /**
   * 특정 연결 종료
   */
  async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      logger.warn(`종료할 연결을 찾을 수 없습니다: ${connectionId}`);
      return;
    }

    try {
      await connection.disconnect();
      this.connections.delete(connectionId);
      this.configs.delete(connectionId);
    } catch (error) {
      logger.error(`데이터베이스 연결 종료 실패: ${connectionId}`, error);
      throw new DatabaseError(`연결 종료 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 모든 연결 종료
   */
  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map(connectionId =>
      this.closeConnection(connectionId).catch(error => {
        logger.error(`연결 종료 실패: ${connectionId}`, error);
      })
    );

    await Promise.all(closePromises);
  }

  /**
   * 연결 상태 확인
   */
  async checkConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = this.getConnection(connectionId);
      return await connection.ping();
    } catch (error) {
      logger.error(`연결 상태 확인 실패: ${connectionId}`, error);
      return false;
    }
  }

  /**
   * 모든 연결 상태 확인
   */
  async checkAllConnections(): Promise<Record<string, boolean>> {
    const statuses: Record<string, boolean> = {};
    
    for (const connectionId of this.connections.keys()) {
      statuses[connectionId] = await this.checkConnection(connectionId);
    }
    
    return statuses;
  }

  /**
   * 연결 재시작
   */
  async restartConnection(connectionId: string): Promise<void> {
    const config = this.getConnectionInfo(connectionId);
    
    // 기존 연결 종료
    await this.closeConnection(connectionId);
    
    // 새로 연결
    await this.registerConnection(config);
  }

  /**
   * 여러 연결 일괄 등록
   */
  async registerMultipleConnections(configs: DatabaseConnectionConfig[]): Promise<void> {
    const results = await Promise.allSettled(
      configs.map(config => this.registerConnection(config))
    );

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      const errorMessages = failures.map((failure, index) => 
        `${configs[index].id}: ${(failure as PromiseRejectedResult).reason}`
      ).join(', ');
      
      throw new DatabaseError(`일부 연결 등록 실패: ${errorMessages}`);
    }
  }
}