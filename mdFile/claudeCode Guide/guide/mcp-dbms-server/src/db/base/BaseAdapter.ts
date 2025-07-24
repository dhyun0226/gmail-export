/**
 * 데이터베이스 어댑터 베이스 클래스
 * 모든 DBMS 어댑터의 공통 기능 구현
 */

import { 
  IDatabase, 
  DatabaseType, 
  DatabaseConnectionConfig,
  Schema,
  Table,
  Column,
  Index,
  TableStats,
  ServerStats,
  QueryResult
} from '../interfaces/index.js';
import { IQueryBuilder } from '../interfaces/IQueryBuilder.js';
import { DatabaseError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseAdapter implements IDatabase {
  protected config: DatabaseConnectionConfig;
  protected queryBuilder: IQueryBuilder;
  protected connected: boolean = false;

  constructor(config: DatabaseConnectionConfig, queryBuilder: IQueryBuilder) {
    this.config = config;
    this.queryBuilder = queryBuilder;
  }

  // 추상 메서드 - 각 DBMS별로 구현 필요
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract ping(): Promise<boolean>;
  abstract executeQuery<T = any>(query: string, params?: any[]): Promise<QueryResult<T>>;
  abstract executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T>;
  abstract getType(): DatabaseType;
  abstract getVersion(): Promise<string>;

  isConnected(): boolean {
    return this.connected;
  }

  // 공통 구현 메서드들
  async getSchemas(): Promise<Schema[]> {
    try {
      const query = this.queryBuilder.buildSchemaListQuery();
      const result = await this.executeQuery<Schema>(query);
      return result.rows;
    } catch (error) {
      logger.error(`스키마 목록 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`스키마 목록을 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getTables(schema: string): Promise<Table[]> {
    try {
      const query = this.queryBuilder.buildTableListQuery(schema);
      const result = await this.executeQuery<Table>(query);
      return result.rows;
    } catch (error) {
      logger.error(`테이블 목록 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`테이블 목록을 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getTablesByPattern(schema: string, pattern: string): Promise<Table[]> {
    try {
      const query = this.queryBuilder.buildTableListByPatternQuery(schema, pattern);
      const result = await this.executeQuery<Table>(query);
      return result.rows;
    } catch (error) {
      logger.error(`패턴별 테이블 목록 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`패턴별 테이블 목록을 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getColumns(schema: string, table: string): Promise<Column[]> {
    try {
      const query = this.queryBuilder.buildColumnInfoQuery(schema, table);
      const result = await this.executeQuery<Column>(query);
      return result.rows;
    } catch (error) {
      logger.error(`컬럼 정보 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`컬럼 정보를 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getIndexes(schema: string, table: string): Promise<Index[]> {
    try {
      const query = this.queryBuilder.buildIndexInfoQuery(schema, table);
      const result = await this.executeQuery<Index>(query);
      return result.rows;
    } catch (error) {
      logger.error(`인덱스 정보 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`인덱스 정보를 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getTableStats(schema: string, table: string): Promise<TableStats> {
    try {
      const query = this.queryBuilder.buildTableStatsQuery(schema, table);
      const result = await this.executeQuery<TableStats>(query);
      if (result.rows.length === 0) {
        throw new DatabaseError('테이블 통계를 찾을 수 없습니다');
      }
      return result.rows[0];
    } catch (error) {
      logger.error(`테이블 통계 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`테이블 통계를 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async generateTableDDL(schema: string, table: string): Promise<string> {
    try {
      // 테이블 구조 정보 수집
      const [columns, indexes] = await Promise.all([
        this.getColumns(schema, table),
        this.getIndexes(schema, table)
      ]);

      // DDL 생성
      return this.buildCreateTableStatement(schema, table, columns, indexes);
    } catch (error) {
      logger.error(`테이블 DDL 생성 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`테이블 DDL을 생성할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async generateSchemaScript(schema: string): Promise<string> {
    try {
      const tables = await this.getTables(schema);
      const ddls = await Promise.all(
        tables.map(table => this.generateTableDDL(schema, table.name))
      );
      return ddls.join('\n\n');
    } catch (error) {
      logger.error(`스키마 스크립트 생성 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`스키마 스크립트를 생성할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getServerStats(): Promise<ServerStats> {
    try {
      const query = this.queryBuilder.buildServerStatsQuery();
      const result = await this.executeQuery<any>(query);
      
      // DBMS별로 결과 구조가 다를 수 있으므로 변환 로직 필요
      return this.transformServerStats(result.rows);
    } catch (error) {
      logger.error(`서버 통계 조회 실패 (${this.config.id}):`, error);
      throw new DatabaseError(`서버 통계를 가져올 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 헬퍼 메서드들
  protected abstract buildCreateTableStatement(
    schema: string, 
    table: string, 
    columns: Column[], 
    indexes: Index[]
  ): string;

  protected abstract transformServerStats(rows: any[]): ServerStats;

  protected logQuery(query: string, params?: any[]): void {
    logger.debug(`[${this.config.id}] 쿼리 실행:`, { query, params });
  }

  protected handleQueryError(error: any, operation: string): never {
    logger.error(`[${this.config.id}] ${operation} 실패:`, error);
    throw new DatabaseError(`${operation} 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
  }
}