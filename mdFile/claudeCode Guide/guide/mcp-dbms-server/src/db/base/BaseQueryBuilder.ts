/**
 * 쿼리 빌더 베이스 클래스
 * DBMS별 쿼리 생성의 공통 기능 제공
 */

import { IQueryBuilder } from '../interfaces/IQueryBuilder.js';

export abstract class BaseQueryBuilder implements IQueryBuilder {
  // 추상 메서드 - DBMS별로 구현 필요
  abstract escapeIdentifier(identifier: string): string;
  abstract buildSchemaListQuery(): string;
  abstract buildTableListQuery(schema: string): string;
  abstract buildTableListByPatternQuery(schema: string, pattern: string): string;
  abstract buildColumnInfoQuery(schema: string, table: string): string;
  abstract buildIndexInfoQuery(schema: string, table: string): string;
  abstract buildTableStatsQuery(schema: string, table: string): string;
  abstract buildTableDDLQuery(schema: string, table: string): string;
  abstract buildServerStatsQuery(): string;
  abstract buildVersionQuery(): string;
  abstract formatDataType(column: any): string;
  abstract formatDefaultValue(defaultValue: any, dataType: string): string;

  // 공통 헬퍼 메서드
  protected buildQualifiedTableName(schema: string, table: string): string {
    return `${this.escapeIdentifier(schema)}.${this.escapeIdentifier(table)}`;
  }

  protected convertPatternToLike(pattern: string): string {
    // 간단한 와일드카드를 SQL LIKE 패턴으로 변환
    return pattern.replace(/\*/g, '%').replace(/\?/g, '_');
  }

  protected normalizeColumnType(dbType: string): string {
    // 데이터베이스별 타입을 표준 타입으로 변환
    const typeMap: Record<string, string> = {
      'int': 'INTEGER',
      'bigint': 'BIGINT',
      'smallint': 'SMALLINT',
      'tinyint': 'TINYINT',
      'decimal': 'DECIMAL',
      'numeric': 'NUMERIC',
      'float': 'FLOAT',
      'double': 'DOUBLE',
      'real': 'REAL',
      'varchar': 'VARCHAR',
      'char': 'CHAR',
      'text': 'TEXT',
      'blob': 'BLOB',
      'date': 'DATE',
      'time': 'TIME',
      'datetime': 'DATETIME',
      'timestamp': 'TIMESTAMP',
      'boolean': 'BOOLEAN',
      'bool': 'BOOLEAN'
    };

    const lowerType = dbType.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.startsWith(key)) {
        return value;
      }
    }
    return dbType.toUpperCase();
  }

  protected buildCondition(conditions: Record<string, any>): string {
    const clauses = Object.entries(conditions)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === 'string' && value.includes('%')) {
          return `${this.escapeIdentifier(key)} LIKE '${value}'`;
        }
        return `${this.escapeIdentifier(key)} = '${value}'`;
      });
    
    return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  }
}