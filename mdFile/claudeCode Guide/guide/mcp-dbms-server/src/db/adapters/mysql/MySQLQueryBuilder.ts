/**
 * MySQL/MariaDB 쿼리 빌더
 * MySQL 특화 쿼리 생성
 */

import { BaseQueryBuilder } from '../../base/BaseQueryBuilder.js';

export class MySQLQueryBuilder extends BaseQueryBuilder {
  escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  buildSchemaListQuery(): string {
    return `
      SELECT 
        SCHEMA_NAME as name,
        DEFAULT_CHARACTER_SET_NAME as defaultCharacterSet,
        DEFAULT_COLLATION_NAME as defaultCollation
      FROM information_schema.SCHEMATA
      WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
      ORDER BY SCHEMA_NAME
    `;
  }

  buildTableListQuery(schema: string): string {
    return `
      SELECT 
        TABLE_NAME as name,
        TABLE_SCHEMA as \`schema\`,
        TABLE_TYPE as type,
        TABLE_ROWS as \`rows\`,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize,
        DATA_LENGTH + INDEX_LENGTH as totalSize,
        CREATE_TIME as created,
        UPDATE_TIME as modified,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${schema}'
      ORDER BY TABLE_NAME
    `;
  }

  buildTableListByPatternQuery(schema: string, pattern: string): string {
    const likePattern = this.convertPatternToLike(pattern);
    return `
      SELECT 
        TABLE_NAME as name,
        TABLE_SCHEMA as \`schema\`,
        TABLE_TYPE as type,
        TABLE_ROWS as \`rows\`,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize,
        DATA_LENGTH + INDEX_LENGTH as totalSize,
        CREATE_TIME as created,
        UPDATE_TIME as modified,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${schema}'
        AND TABLE_NAME LIKE '${likePattern}'
      ORDER BY TABLE_NAME
    `;
  }

  buildColumnInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as dataType,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        NUMERIC_PRECISION as \`precision\`,
        NUMERIC_SCALE as scale,
        IS_NULLABLE = 'YES' as isNullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_KEY = 'PRI' as isPrimaryKey,
        COLUMN_KEY = 'UNI' as isUnique,
        EXTRA LIKE '%auto_increment%' as isIdentity,
        NULL as identitySeed,
        NULL as identityIncrement,
        COLUMN_COMMENT as comment,
        ORDINAL_POSITION as ordinalPosition
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${schema}'
        AND TABLE_NAME = '${table}'
      ORDER BY ORDINAL_POSITION
    `;
  }

  buildIndexInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        INDEX_NAME as name,
        TABLE_NAME as tableName,
        TABLE_SCHEMA as schemaName,
        CASE 
          WHEN INDEX_NAME = 'PRIMARY' THEN 'PRIMARY'
          WHEN NON_UNIQUE = 0 THEN 'UNIQUE'
          WHEN INDEX_TYPE = 'FULLTEXT' THEN 'FULLTEXT'
          WHEN INDEX_TYPE = 'SPATIAL' THEN 'SPATIAL'
          ELSE 'INDEX'
        END as type,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns,
        NON_UNIQUE = 0 as isUnique,
        INDEX_NAME = 'PRIMARY' as isPrimary,
        INDEX_TYPE = 'BTREE' as isClustered,
        CARDINALITY as cardinality,
        NULL as size,
        INDEX_COMMENT as comment
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = '${schema}'
        AND TABLE_NAME = '${table}'
      GROUP BY INDEX_NAME
      ORDER BY INDEX_NAME
    `;
  }

  buildTableStatsQuery(schema: string, table: string): string {
    return `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_SCHEMA as schemaName,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize,
        DATA_LENGTH + INDEX_LENGTH as totalSize,
        AVG_ROW_LENGTH as avgRowLength,
        UPDATE_TIME as lastAnalyzed,
        AUTO_INCREMENT as autoIncrement
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${schema}'
        AND TABLE_NAME = '${table}'
    `;
  }

  buildTableDDLQuery(schema: string, table: string): string {
    return `SHOW CREATE TABLE ${this.buildQualifiedTableName(schema, table)}`;
  }

  buildServerStatsQuery(): string {
    return `
      SELECT 
        VARIABLE_NAME as name,
        VARIABLE_VALUE as value
      FROM information_schema.SESSION_STATUS
      WHERE VARIABLE_NAME IN (
        'Uptime',
        'Threads_connected',
        'Max_used_connections',
        'Questions',
        'Slow_queries',
        'Bytes_received',
        'Bytes_sent',
        'Threads_running'
      )
    `;
  }

  buildVersionQuery(): string {
    return 'SELECT VERSION() as version';
  }

  formatDataType(column: any): string {
    let type = column.dataType.toUpperCase();
    
    // 길이가 있는 타입
    if (column.maxLength && ['VARCHAR', 'CHAR', 'BINARY', 'VARBINARY'].includes(type)) {
      type += `(${column.maxLength})`;
    }
    // 정밀도가 있는 타입
    else if (column.precision) {
      if (column.scale) {
        type += `(${column.precision},${column.scale})`;
      } else {
        type += `(${column.precision})`;
      }
    }
    
    // 특수 타입 처리
    switch (type) {
      case 'TINYINT(1)':
        return 'BOOLEAN';
      case 'INT':
        return 'INT(11)';
      default:
        return type;
    }
  }

  formatDefaultValue(defaultValue: any, dataType: string): string {
    if (defaultValue === null || defaultValue === undefined) {
      return '';
    }
    
    // MySQL 특수 기본값
    if (defaultValue === 'CURRENT_TIMESTAMP') {
      return 'DEFAULT CURRENT_TIMESTAMP';
    }
    if (defaultValue === 'NULL') {
      return 'DEFAULT NULL';
    }
    
    // 문자열 타입
    if (['VARCHAR', 'CHAR', 'TEXT', 'ENUM', 'SET'].some(type => dataType.toUpperCase().includes(type))) {
      return `DEFAULT '${defaultValue.replace(/'/g, "''")}'`;
    }
    
    // 숫자나 기타 타입
    return `DEFAULT ${defaultValue}`;
  }
}