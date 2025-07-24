/**
 * 데이터베이스 팩토리 클래스
 * DBMS 타입에 따라 적절한 어댑터 인스턴스 생성
 */

import { IDatabase, DatabaseConnectionConfig, DatabaseType } from './interfaces/index.js';
import { DatabaseError } from '../utils/errors.js';
import { MySQLAdapter } from './adapters/mysql/MySQLAdapter.js';
import { PostgreSQLAdapter } from './adapters/postgresql/PostgreSQLAdapter.js';
import { MSSQLAdapter } from './adapters/mssql/MSSQLAdapter.js';
import { OracleAdapter } from './adapters/oracle/OracleAdapter.js';

export class DatabaseFactory {
  /**
   * 데이터베이스 타입에 따라 적절한 어댑터 생성
   */
  static create(config: DatabaseConnectionConfig): IDatabase {
    switch (config.type) {
      case DatabaseType.MySQL:
        return new MySQLAdapter(config);

      case DatabaseType.PostgreSQL:
        return new PostgreSQLAdapter(config);

      case DatabaseType.MSSQL:
        return new MSSQLAdapter(config);

      case DatabaseType.Oracle:
        return new OracleAdapter(config);

      default:
        throw new DatabaseError(`지원하지 않는 데이터베이스 타입: ${config.type}`);
    }
  }

  /**
   * 지원하는 데이터베이스 타입 목록
   */
  static getSupportedTypes(): DatabaseType[] {
    return Object.values(DatabaseType);
  }

  /**
   * 데이터베이스 타입 유효성 검사
   */
  static isSupported(type: string): boolean {
    return Object.values(DatabaseType).includes(type as DatabaseType);
  }
}