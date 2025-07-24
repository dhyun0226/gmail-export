/**
 * MSSQL(SQL Server) 데이터베이스 어댑터
 * SQL Server 특화 기능 구현
 */

import mssql from 'mssql';
import { BaseAdapter } from '../../base/BaseAdapter.js';
import { MSSQLQueryBuilder } from './MSSQLQueryBuilder.js';
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

export class MSSQLAdapter extends BaseAdapter {
  private pool?: mssql.ConnectionPool;

  constructor(config: DatabaseConnectionConfig) {
    super(config, new MSSQLQueryBuilder());
  }

  async connect(): Promise<void> {
    try {
      const poolConfig: mssql.config = {
        server: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: this.config.ssl !== false,
          trustServerCertificate: true,
          enableArithAbort: true
        },
        pool: {
          max: this.config.pool?.max || 10,
          min: this.config.pool?.min || 0,
          idleTimeoutMillis: this.config.pool?.idleTimeoutMillis || 30000
        },
        connectionTimeout: this.config.connectionTimeout || 15000,
        requestTimeout: this.config.requestTimeout || 15000,
        ...this.config.options
      };

      this.pool = new mssql.ConnectionPool(poolConfig);
      await this.pool.connect();

      // 연결 테스트
      const request = this.pool.request();
      await request.query('SELECT 1');

      this.connected = true;
    } catch (error) {
      this.connected = false;
      this.handleQueryError(error, 'MSSQL 연결');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = undefined;
        this.connected = false;
      }
    } catch (error) {
      this.handleQueryError(error, 'MSSQL 연결 종료');
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.pool || !this.pool.connected) return false;
      
      const request = this.pool.request();
      await request.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error(`MSSQL ping 실패: ${this.config.id}`, error);
      return false;
    }
  }

  async executeQuery<T = any>(query: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool || !this.pool.connected) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const startTime = Date.now();

    try {
      this.logQuery(query, params);
      
      const request = this.pool.request();
      
      // 파라미터 바인딩
      if (params && params.length > 0) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
        
        // 쿼리의 ? 를 @param0, @param1 등으로 변경
        let paramIndex = 0;
        query = query.replace(/\?/g, () => `@param${paramIndex++}`);
      }
      
      const result = await request.query(query);
      const executionTime = Date.now() - startTime;
      
      // 결과 변환
      let rows: T[];
      let rowCount: number;
      
      if (result.recordset) {
        rows = result.recordset as T[];
        rowCount = rows.length;
      } else {
        rows = [];
        rowCount = result.rowsAffected[0] || 0;
      }

      return {
        rows,
        rowCount,
        fields: result.recordset ? Object.keys(result.recordset[0] || {}).map(name => ({
          name,
          dataType: this.getMSSQLFieldType(result.recordset[0][name])
        })) : undefined,
        executionTime
      };
    } catch (error) {
      this.handleQueryError(error, '쿼리 실행');
    }
  }

  async executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T> {
    if (!this.pool || !this.pool.connected) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const transaction = new mssql.Transaction(this.pool);
    
    try {
      await transaction.begin();
      
      const results: any[] = [];
      
      for (const { query, params } of queries) {
        this.logQuery(query, params);
        
        const request = new mssql.Request(transaction);
        
        // 파라미터 바인딩
        let processedQuery = query;
        if (params && params.length > 0) {
          params.forEach((param, index) => {
            request.input(`param${index}`, param);
          });
          
          let paramIndex = 0;
          processedQuery = query.replace(/\?/g, () => `@param${paramIndex++}`);
        }
        
        const result = await request.query(processedQuery);
        results.push(result.recordset || result.rowsAffected);
      }
      
      await transaction.commit();
      return results as T;
    } catch (error) {
      await transaction.rollback();
      this.handleQueryError(error, '트랜잭션 실행');
    }
  }

  getType(): DatabaseType {
    return DatabaseType.MSSQL;
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
      
      if (col.isIdentity) {
        def += ` IDENTITY(${col.identitySeed || 1},${col.identityIncrement || 1})`;
      }
      
      if (!col.isNullable) {
        def += ' NOT NULL';
      } else {
        def += ' NULL';
      }
      
      if (col.defaultValue && !col.isIdentity) {
        def += ` ${this.queryBuilder.formatDefaultValue(col.defaultValue, col.dataType)}`;
      }
      
      return def;
    });
    
    // Primary Key 제약조건을 컬럼 정의에 추가
    const primaryKey = indexes.find(idx => idx.isPrimary);
    if (primaryKey) {
      columnDefs.push(`  CONSTRAINT ${this.queryBuilder.escapeIdentifier(`PK_${table}`)} PRIMARY KEY ${primaryKey.isClustered ? 'CLUSTERED' : 'NONCLUSTERED'} (${primaryKey.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`);
    }
    
    parts.push(columnDefs.join(',\n'));
    parts.push('\n);');
    
    // GO 구분자
    parts.push('GO');
    
    // 인덱스 생성
    const indexStatements = indexes
      .filter(idx => !idx.isPrimary)
      .map(idx => {
        let createIndex = 'CREATE';
        if (idx.isUnique) createIndex += ' UNIQUE';
        if (idx.isClustered) createIndex += ' CLUSTERED';
        else createIndex += ' NONCLUSTERED';
        
        return `${createIndex} INDEX ${this.queryBuilder.escapeIdentifier(idx.name)} ON ${this.queryBuilder.escapeIdentifier(schema)}.${this.queryBuilder.escapeIdentifier(table)} (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')});`;
      });
    
    if (indexStatements.length > 0) {
      parts.push('\n' + indexStatements.join('\nGO\n'));
      parts.push('GO');
    }
    
    // 확장 속성 (코멘트) 추가
    const commentStatements: string[] = [];
    
    columns.filter(col => col.comment).forEach(col => {
      commentStatements.push(`EXEC sp_addextendedproperty 'MS_Description', '${col.comment?.replace(/'/g, "''")}', 'SCHEMA', '${schema}', 'TABLE', '${table}', 'COLUMN', '${col.name}';`);
    });
    
    if (commentStatements.length > 0) {
      parts.push('\n' + commentStatements.join('\nGO\n'));
      parts.push('GO');
    }
    
    return parts.join('\n');
  }

  protected transformServerStats(rows: any[]): ServerStats {
    const stats: Record<string, any> = {};
    
    // SQL Server 통계를 객체로 변환
    rows.forEach(row => {
      stats[row.name] = row.value;
    });
    
    return {
      uptime: parseInt(stats.uptime || '0'),
      version: '',  // 별도 쿼리로 조회
      currentConnections: parseInt(stats.current_connections || '0'),
      maxConnections: parseInt(stats.max_connections || '0'),
      totalQueries: parseInt(stats.total_queries || '0'),
      slowQueries: 0,  // SQL Server는 별도 설정 필요
      bytesReceived: parseInt(stats.bytes_received || '0'),
      bytesSent: parseInt(stats.bytes_sent || '0'),
      threadsRunning: 0,
      additionalMetrics: stats
    };
  }

  private getMSSQLFieldType(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    
    const type = typeof value;
    switch (type) {
      case 'string':
        return 'NVARCHAR';
      case 'number':
        return Number.isInteger(value) ? 'INT' : 'FLOAT';
      case 'boolean':
        return 'BIT';
      case 'object':
        if (value instanceof Date) return 'DATETIME';
        if (Buffer.isBuffer(value)) return 'VARBINARY';
        return 'NVARCHAR';
      default:
        return 'NVARCHAR';
    }
  }
}