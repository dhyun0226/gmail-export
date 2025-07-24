/**
 * Oracle 데이터베이스 어댑터
 * Oracle 특화 기능 구현
 */

import oracledb from 'oracledb';
import { BaseAdapter } from '../../base/BaseAdapter.js';
import { OracleQueryBuilder } from './OracleQueryBuilder.js';
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

export class OracleAdapter extends BaseAdapter {
  private pool?: oracledb.Pool;

  constructor(config: DatabaseConnectionConfig) {
    super(config, new OracleQueryBuilder());
    
    // Oracle 클라이언트 초기화 설정
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  async connect(): Promise<void> {
    try {
      const connectionString = this.config.options?.connectionString || 
        `${this.config.host}:${this.config.port}/${this.config.database || 'ORCL'}`;
      
      this.pool = await oracledb.createPool({
        user: this.config.user,
        password: this.config.password,
        connectionString,
        poolMin: this.config.pool?.min || 1,
        poolMax: this.config.pool?.max || 10,
        poolTimeout: (this.config.pool?.idleTimeoutMillis || 30000) / 1000,
        ...this.config.options
      });

      // 연결 테스트
      const connection = await this.pool.getConnection();
      await connection.execute('SELECT 1 FROM DUAL');
      await connection.close();

      this.connected = true;
    } catch (error) {
      this.connected = false;
      this.handleQueryError(error, 'Oracle 연결');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close(0);
        this.pool = undefined;
        this.connected = false;
      }
    } catch (error) {
      this.handleQueryError(error, 'Oracle 연결 종료');
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      
      const connection = await this.pool.getConnection();
      await connection.execute('SELECT 1 FROM DUAL');
      await connection.close();
      return true;
    } catch (error) {
      logger.error(`Oracle ping 실패: ${this.config.id}`, error);
      return false;
    }
  }

  async executeQuery<T = any>(query: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const startTime = Date.now();
    let connection: oracledb.Connection | undefined;

    try {
      this.logQuery(query, params);
      
      connection = await this.pool.getConnection();
      
      // Oracle 바인드 변수 처리
      const bindVars = params ? this.createBindVariables(params) : {};
      
      const result = await connection.execute(
        this.convertQueryPlaceholders(query, params),
        bindVars,
        {
          maxRows: 10000,  // 최대 행 수 제한
          fetchArraySize: 100  // 배치 크기
        }
      );
      
      const executionTime = Date.now() - startTime;
      
      // 결과 변환
      let rows: T[] = [];
      let rowCount = 0;
      
      if (result.rows) {
        rows = result.rows as T[];
        rowCount = rows.length;
      } else if (result.rowsAffected) {
        rowCount = result.rowsAffected;
      }

      return {
        rows,
        rowCount,
        fields: result.metaData?.map(meta => ({
          name: meta.name,
          dataType: this.getOracleFieldType(meta)
        })),
        executionTime
      };
    } catch (error) {
      this.handleQueryError(error, '쿼리 실행');
      throw error; // 반환값 대신 에러를 다시 throw
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T> {
    if (!this.pool) {
      throw new DatabaseError('데이터베이스에 연결되지 않았습니다');
    }

    const connection = await this.pool.getConnection();
    
    try {
      // 자동 커밋 비활성화
      oracledb.autoCommit = false;
      
      const results: any[] = [];
      
      for (const { query, params } of queries) {
        this.logQuery(query, params);
        
        const bindVars = params ? this.createBindVariables(params) : {};
        const result = await connection.execute(
          this.convertQueryPlaceholders(query, params),
          bindVars
        );
        
        results.push(result.rows || result.rowsAffected);
      }
      
      await connection.commit();
      return results as T;
    } catch (error) {
      await connection.rollback();
      this.handleQueryError(error, '트랜잭션 실행');
    } finally {
      oracledb.autoCommit = true;
      await connection.close();
    }
  }

  getType(): DatabaseType {
    return DatabaseType.Oracle;
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
        // Oracle 12c 이상의 IDENTITY 컬럼
        def += ' GENERATED BY DEFAULT AS IDENTITY';
        if (col.identitySeed || col.identityIncrement) {
          def += ` (START WITH ${col.identitySeed || 1} INCREMENT BY ${col.identityIncrement || 1})`;
        }
      }
      
      if (col.defaultValue && !col.isIdentity) {
        def += ` ${this.queryBuilder.formatDefaultValue(col.defaultValue, col.dataType)}`;
      }
      
      if (!col.isNullable) {
        def += ' NOT NULL';
      }
      
      return def;
    });
    
    // 제약조건 추가
    const constraints: string[] = [];
    
    // Primary Key
    const primaryKey = indexes.find(idx => idx.isPrimary);
    if (primaryKey) {
      constraints.push(`  CONSTRAINT ${this.queryBuilder.escapeIdentifier(`PK_${table}`)} PRIMARY KEY (${primaryKey.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`);
    }
    
    // Unique 제약조건
    indexes.filter(idx => idx.isUnique && !idx.isPrimary).forEach(idx => {
      constraints.push(`  CONSTRAINT ${this.queryBuilder.escapeIdentifier(idx.name)} UNIQUE (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')})`);
    });
    
    parts.push([...columnDefs, ...constraints].join(',\n'));
    parts.push('\n);');
    
    // 인덱스 생성
    const indexStatements = indexes
      .filter(idx => !idx.isPrimary && !idx.isUnique)
      .map(idx => {
        let indexType = '';
        if (idx.type === 'BITMAP') indexType = 'BITMAP ';
        
        return `CREATE ${indexType}INDEX ${this.queryBuilder.escapeIdentifier(idx.name)} ON ${this.queryBuilder.escapeIdentifier(schema)}.${this.queryBuilder.escapeIdentifier(table)} (${idx.columns.map(c => this.queryBuilder.escapeIdentifier(c)).join(', ')});`;
      });
    
    if (indexStatements.length > 0) {
      parts.push('\n' + indexStatements.join('\n'));
    }
    
    // 코멘트 추가
    const commentStatements: string[] = [];
    
    columns.filter(col => col.comment).forEach(col => {
      commentStatements.push(`COMMENT ON COLUMN ${this.queryBuilder.escapeIdentifier(schema)}.${this.queryBuilder.escapeIdentifier(table)}.${this.queryBuilder.escapeIdentifier(col.name)} IS '${col.comment?.replace(/'/g, "''")}';`);
    });
    
    if (commentStatements.length > 0) {
      parts.push('\n' + commentStatements.join('\n'));
    }
    
    return parts.join('\n');
  }

  protected transformServerStats(rows: any[]): ServerStats {
    const stats: Record<string, any> = {};
    
    // Oracle 통계를 객체로 변환
    rows.forEach(row => {
      stats[row.name] = row.value;
    });
    
    return {
      uptime: parseInt(stats.uptime || '0'),
      version: '',  // 별도 쿼리로 조회
      currentConnections: parseInt(stats.current_connections || '0'),
      maxConnections: parseInt(stats.max_connections || '0'),
      totalQueries: parseInt(stats.total_queries || '0'),
      slowQueries: 0,  // Oracle은 별도 설정 필요
      bytesReceived: parseInt(stats.bytes_received || '0'),
      bytesSent: parseInt(stats.bytes_sent || '0'),
      threadsRunning: 0,
      additionalMetrics: stats
    };
  }

  private getOracleFieldType(meta: any): string {
    // Oracle 데이터 타입 매핑
    const dbType = meta.dbType;
    
    // oracledb 타입 상수를 숫자로 매핑
    const typeMap = new Map<number, string>([
      [2003, 'VARCHAR2'],    // DB_TYPE_VARCHAR
      [2004, 'NVARCHAR2'],   // DB_TYPE_NVARCHAR  
      [2002, 'CHAR'],        // DB_TYPE_CHAR
      [2005, 'NCHAR'],       // DB_TYPE_NCHAR
      [2010, 'NUMBER'],      // DB_TYPE_NUMBER
      [2011, 'DATE'],        // DB_TYPE_DATE
      [2012, 'TIMESTAMP'],   // DB_TYPE_TIMESTAMP
      [2013, 'TIMESTAMP WITH TIME ZONE'],      // DB_TYPE_TIMESTAMP_TZ
      [2014, 'TIMESTAMP WITH LOCAL TIME ZONE'], // DB_TYPE_TIMESTAMP_LTZ
      [2017, 'CLOB'],        // DB_TYPE_CLOB
      [2018, 'NCLOB'],       // DB_TYPE_NCLOB
      [2019, 'BLOB'],        // DB_TYPE_BLOB
      [2006, 'RAW'],         // DB_TYPE_RAW
      [2008, 'LONG'],        // DB_TYPE_LONG
      [2007, 'LONG RAW']     // DB_TYPE_LONG_RAW
    ]);
    
    return typeMap.get(dbType) || 'UNKNOWN';
  }

  private createBindVariables(params: any[]): Record<string, any> {
    const bindVars: Record<string, any> = {};
    params.forEach((param, index) => {
      bindVars[`p${index + 1}`] = param;
    });
    return bindVars;
  }

  private convertQueryPlaceholders(query: string, params?: any[]): string {
    if (!params || params.length === 0) return query;
    
    // ? 플레이스홀더를 :p1, :p2 등으로 변환
    let paramIndex = 1;
    return query.replace(/\?/g, () => `:p${paramIndex++}`);
  }

  // Oracle 특화 메서드 - DBMS_METADATA 사용
  async generateTableDDL(schema: string, table: string): Promise<string> {
    try {
      const query = this.queryBuilder.buildTableDDLQuery(schema, table);
      const result = await this.executeQuery<{ ddl: string }>(query);
      
      if (result.rows.length > 0 && result.rows[0].ddl) {
        return result.rows[0].ddl;
      }
      
      // DBMS_METADATA가 실패하면 기본 구현 사용
      return super.generateTableDDL(schema, table);
    } catch (error) {
      logger.warn(`DBMS_METADATA 실패, 기본 DDL 생성 사용: ${error}`);
      return super.generateTableDDL(schema, table);
    }
  }
}