/**
 * MySQL/MariaDB 데이터베이스 어댑터
 * MySQL 특화 기능 구현
 */

import mysql from 'mysql2/promise';
import { BaseAdapter } from '../../base/BaseAdapter.js';
import { MySQLQueryBuilder } from './MySQLQueryBuilder.js';
import { 
  DatabaseType, 
  DatabaseConnectionConfig,
  QueryResult,
  Column,
  Index,
  ServerStats
} from '../../interfaces/index.js';
import { DatabaseError } from '../../../utils/errors.js';
import { logger } from '../../../utils/logger.js';

export class MySQLAdapter extends BaseAdapter {
  private pool?: mysql.Pool;

  constructor(config: DatabaseConnectionConfig) {
    super(config, new MySQLQueryBuilder());
  }

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: this.config.pool?.max || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ...this.config.options
      });

      // 연결 테스트
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.connected = true;
    } catch (error) {
      this.connected = false;
      this.handleQueryError(error, 'MySQL 연결');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = undefined;
        this.connected = false;
      }
    } catch (error) {
      this.handleQueryError(error, 'MySQL 연결 종료');
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      logger.error(`MySQL ping 실패: ${this.config.id}`, error);
      return false;
    }
  }

  async executeQuery<T = any>(query: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const startTime = Date.now();
    let connection: mysql.PoolConnection | undefined;

    try {
      this.logQuery(query, params);
      
      connection = await this.pool.getConnection();
      const [rows, fields] = await connection.execute(query, params);
      
      const executionTime = Date.now() - startTime;
      
      // 결과 변환
      let resultRows: T[];
      let rowCount: number;
      
      if (Array.isArray(rows)) {
        resultRows = rows as T[];
        rowCount = resultRows.length;
      } else {
        // INSERT, UPDATE, DELETE 등의 경우
        resultRows = [];
        rowCount = (rows as any).affectedRows || 0;
      }

      return {
        rows: resultRows,
        rowCount,
        fields: fields?.map(field => ({
          name: field.name,
          dataType: this.getMySQLFieldType(field)
        })),
        executionTime
      };
    } catch (error) {
      this.handleQueryError(error, '쿼리 실행');
      throw error; // 반환값 대신 에러를 다시 throw
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T> {
    if (!this.pool) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results: any[] = [];
      
      for (const { query, params } of queries) {
        this.logQuery(query, params);
        const [result] = await connection.execute(query, params);
        results.push(result);
      }
      
      await connection.commit();
      return results as T;
    } catch (error) {
      await connection.rollback();
      this.handleQueryError(error, '트랜잭션 실행');
    } finally {
      connection.release();
    }
  }

  getType(): DatabaseType {
    return DatabaseType.MySQL;
  }

  async getVersion(): Promise<string> {
    const result = await this.executeQuery<{ version: string }>(
      this.queryBuilder.buildVersionQuery()
    );
    return result.rows[0]?.version || 'Unknown';
  }

  protected buildCreateTableStatement(
    schema: string,
    table: string,
    columns: Column[],
    indexes: Index[]
  ): string {
    const parts: string[] = [];
    
    // 테이블명
    parts.push(`CREATE TABLE ${this.queryBuilder.escapeIdentifier(schema)}.${this.queryBuilder.escapeIdentifier(table)} (`);
    
    // 컬럼 정의
    const columnDefs = columns.map(col => {
      let def = `  ${this.queryBuilder.escapeIdentifier(col.name)} ${this.queryBuilder.formatDataType(col)}`;
      
      if (!col.isNullable) {
        def += ' NOT NULL';
      }
      
      if (col.isIdentity) {
        def += ' AUTO_INCREMENT';
      }
      
      if (col.defaultValue) {
        def += ` ${this.queryBuilder.formatDefaultValue(col.defaultValue, col.dataType)}`;
      }
      
      if (col.comment) {
        def += ` COMMENT '${col.comment.replace(/'/g, "''")}'`;
      }
      
      return def;
    });
    
    parts.push(columnDefs.join(',\n'));
    
    // 인덱스 정의
    const indexDefs = indexes.map(idx => {
      if (idx.isPrimary) {
        return `  PRIMARY KEY (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`;
      } else if (idx.isUnique) {
        return `  UNIQUE KEY ${this.queryBuilder.escapeIdentifier(idx.name)} (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`;
      } else {
        let indexType = '';
        if (idx.type === 'FULLTEXT') indexType = 'FULLTEXT ';
        if (idx.type === 'SPATIAL') indexType = 'SPATIAL ';
        return `  ${indexType}KEY ${this.queryBuilder.escapeIdentifier(idx.name)} (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`;
      }
    });
    
    if (indexDefs.length > 0) {
      parts.push(',\n' + indexDefs.join(',\n'));
    }
    
    parts.push('\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
    
    return parts.join('');
  }

  protected transformServerStats(rows: any[]): ServerStats {
    const stats: Record<string, any> = {};
    
    // MySQL 상태 변수를 객체로 변환
    rows.forEach(row => {
      stats[row.name] = row.value;
    });
    
    return {
      uptime: parseInt(stats.Uptime || '0'),
      version: '',  // 별도 쿼리로 조회
      currentConnections: parseInt(stats.Threads_connected || '0'),
      maxConnections: parseInt(stats.Max_used_connections || '0'),
      totalQueries: parseInt(stats.Questions || '0'),
      slowQueries: parseInt(stats.Slow_queries || '0'),
      bytesReceived: parseInt(stats.Bytes_received || '0'),
      bytesSent: parseInt(stats.Bytes_sent || '0'),
      threadsRunning: parseInt(stats.Threads_running || '0'),
      additionalMetrics: stats
    };
  }

  private getMySQLFieldType(field: any): string {
    // MySQL 필드 타입을 문자열로 변환
    const typeMap: Record<number, string> = {
      0: 'DECIMAL',
      1: 'TINYINT',
      2: 'SMALLINT',
      3: 'INT',
      4: 'FLOAT',
      5: 'DOUBLE',
      8: 'BIGINT',
      246: 'DECIMAL',
      252: 'TEXT',
      253: 'VARCHAR',
      254: 'CHAR'
    };
    
    return typeMap[field.type] || 'UNKNOWN';
  }

  // MySQL 특화 메서드 - SHOW CREATE TABLE 사용
  async generateTableDDL(schema: string, table: string): Promise<string> {
    try {
      const query = this.queryBuilder.buildTableDDLQuery(schema, table);
      const result = await this.executeQuery<any>(query);
      
      if (result.rows.length > 0) {
        // SHOW CREATE TABLE 결과에서 DDL 추출
        const row = result.rows[0];
        const ddl = row['Create Table'] || row['CREATE TABLE'] || '';
        return ddl;
      }
      
      // SHOW CREATE TABLE이 실패하면 기본 구현 사용
      return super.generateTableDDL(schema, table);
    } catch (error) {
      logger.warn(`SHOW CREATE TABLE 실패, 기본 DDL 생성 사용: ${error}`);
      return super.generateTableDDL(schema, table);
    }
  }
}