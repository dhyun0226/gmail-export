/**
 * 연결 관리 인터페이스
 * 데이터베이스 연결 생명주기 관리
 */

export interface IConnection<T = any> {
  // 연결 상태
  id: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date;
  
  // 기본 연결 객체 접근
  getRawConnection(): T;
  
  // 연결 관리
  release(): Promise<void>;
  destroy(): Promise<void>;
  validate(): Promise<boolean>;
  
  // 쿼리 실행
  query<R = any>(sql: string, params?: any[]): Promise<R>;
  
  // 트랜잭션
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface IConnectionPool<T = any> {
  // 풀 정보
  name: string;
  size: number;
  activeCount: number;
  idleCount: number;
  waitingCount: number;
  
  // 연결 관리
  acquire(): Promise<IConnection<T>>;
  release(connection: IConnection<T>): Promise<void>;
  destroy(connection: IConnection<T>): Promise<void>;
  
  // 풀 관리
  drain(): Promise<void>;
  clear(): Promise<void>;
  
  // 상태 확인
  getStats(): ConnectionPoolStats;
}

export interface ConnectionPoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  created: number;
  destroyed: number;
  errors: number;
  avgWaitTime: number;
  maxWaitTime: number;
}