/**
 * MSSQL 쿼리 빌더
 * SQL Server 특화 쿼리 생성
 */

import { BaseQueryBuilder } from '../../base/BaseQueryBuilder.js';

export class MSSQLQueryBuilder extends BaseQueryBuilder {
  escapeIdentifier(identifier: string): string {
    return `[${identifier.replace(/\]/g, ']]')}]`;
  }

  buildSchemaListQuery(): string {
    return `
      SELECT 
        s.name as name,
        p.name as owner,
        NULL as defaultCharacterSet,
        NULL as defaultCollation
      FROM sys.schemas s
      LEFT JOIN sys.database_principals p ON s.principal_id = p.principal_id
      WHERE s.name NOT IN ('sys', 'INFORMATION_SCHEMA', 'guest', 'db_owner', 'db_accessadmin', 
                           'db_securityadmin', 'db_ddladmin', 'db_backupoperator', 
                           'db_datareader', 'db_datawriter', 'db_denydatareader', 'db_denydatawriter')
      ORDER BY s.name
    `;
  }

  buildTableListQuery(schema: string): string {
    return `
      SELECT 
        t.name as name,
        s.name as [schema],
        CASE 
          WHEN t.type = 'U' THEN 'TABLE'
          WHEN t.type = 'V' THEN 'VIEW'
          WHEN t.type = 'S' THEN 'SYSTEM TABLE'
          ELSE t.type_desc
        END as type,
        p.rows as rows,
        SUM(a.used_pages) * 8 * 1024 as dataSize,
        SUM(CASE WHEN i.index_id > 1 THEN a.used_pages ELSE 0 END) * 8 * 1024 as indexSize,
        SUM(a.used_pages) * 8 * 1024 as totalSize,
        t.create_date as created,
        t.modify_date as modified,
        ep.value as comment
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      LEFT JOIN sys.indexes i ON t.object_id = i.object_id
      LEFT JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
      LEFT JOIN sys.allocation_units a ON p.partition_id = a.container_id
      LEFT JOIN sys.extended_properties ep ON t.object_id = ep.major_id 
        AND ep.minor_id = 0 AND ep.name = 'MS_Description'
      WHERE s.name = '${schema}'
      GROUP BY t.name, s.name, t.type, t.type_desc, p.rows, t.create_date, t.modify_date, ep.value
      ORDER BY t.name
    `;
  }

  buildTableListByPatternQuery(schema: string, pattern: string): string {
    const likePattern = this.convertPatternToLike(pattern);
    return `
      SELECT 
        t.name as name,
        s.name as [schema],
        CASE 
          WHEN t.type = 'U' THEN 'TABLE'
          WHEN t.type = 'V' THEN 'VIEW'
          WHEN t.type = 'S' THEN 'SYSTEM TABLE'
          ELSE t.type_desc
        END as type,
        p.rows as rows,
        SUM(a.used_pages) * 8 * 1024 as dataSize,
        SUM(CASE WHEN i.index_id > 1 THEN a.used_pages ELSE 0 END) * 8 * 1024 as indexSize,
        SUM(a.used_pages) * 8 * 1024 as totalSize,
        t.create_date as created,
        t.modify_date as modified,
        ep.value as comment
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      LEFT JOIN sys.indexes i ON t.object_id = i.object_id
      LEFT JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
      LEFT JOIN sys.allocation_units a ON p.partition_id = a.container_id
      LEFT JOIN sys.extended_properties ep ON t.object_id = ep.major_id 
        AND ep.minor_id = 0 AND ep.name = 'MS_Description'
      WHERE s.name = '${schema}'
        AND t.name LIKE '${likePattern}'
      GROUP BY t.name, s.name, t.type, t.type_desc, p.rows, t.create_date, t.modify_date, ep.value
      ORDER BY t.name
    `;
  }

  buildColumnInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        c.name as name,
        TYPE_NAME(c.user_type_id) as dataType,
        c.max_length as maxLength,
        c.precision as precision,
        c.scale as scale,
        c.is_nullable as isNullable,
        dc.definition as defaultValue,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as isPrimaryKey,
        CASE WHEN uk.column_id IS NOT NULL THEN 1 ELSE 0 END as isUnique,
        c.is_identity as isIdentity,
        IDENT_SEED(s.name + '.' + t.name) as identitySeed,
        IDENT_INCR(s.name + '.' + t.name) as identityIncrement,
        ep.value as comment,
        c.column_id as ordinalPosition
      FROM sys.columns c
      INNER JOIN sys.tables t ON c.object_id = t.object_id
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
      LEFT JOIN (
        SELECT ic.object_id, ic.column_id
        FROM sys.index_columns ic
        INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        WHERE i.is_primary_key = 1
      ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
      LEFT JOIN (
        SELECT ic.object_id, ic.column_id
        FROM sys.index_columns ic
        INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        WHERE i.is_unique = 1 AND i.is_primary_key = 0
      ) uk ON c.object_id = uk.object_id AND c.column_id = uk.column_id
      LEFT JOIN sys.extended_properties ep ON c.object_id = ep.major_id 
        AND c.column_id = ep.minor_id AND ep.name = 'MS_Description'
      WHERE s.name = '${schema}' AND t.name = '${table}'
      ORDER BY c.column_id
    `;
  }

  buildIndexInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        i.name as name,
        t.name as tableName,
        s.name as schemaName,
        CASE 
          WHEN i.is_primary_key = 1 THEN 'PRIMARY'
          WHEN i.is_unique = 1 THEN 'UNIQUE'
          WHEN i.type = 3 THEN 'XML'
          WHEN i.type = 4 THEN 'SPATIAL'
          WHEN i.type = 6 THEN 'COLUMNSTORE'
          ELSE 'INDEX'
        END as type,
        STUFF((
          SELECT ',' + c.name
          FROM sys.index_columns ic
          INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
          WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
          ORDER BY ic.key_ordinal
          FOR XML PATH('')
        ), 1, 1, '') as columns,
        i.is_unique as isUnique,
        i.is_primary_key as isPrimary,
        CASE WHEN i.index_id = 1 THEN 1 ELSE 0 END as isClustered,
        NULL as cardinality,
        ps.used_page_count * 8 * 1024 as size,
        NULL as comment
      FROM sys.indexes i
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      LEFT JOIN sys.dm_db_partition_stats ps ON i.object_id = ps.object_id AND i.index_id = ps.index_id
      WHERE s.name = '${schema}' AND t.name = '${table}' AND i.name IS NOT NULL
      ORDER BY i.name
    `;
  }

  buildTableStatsQuery(schema: string, table: string): string {
    return `
      SELECT 
        t.name as tableName,
        s.name as schemaName,
        SUM(p.rows) as rowCount,
        SUM(a.data_pages) * 8 * 1024 as dataSize,
        SUM(CASE WHEN i.index_id > 1 THEN a.used_pages ELSE 0 END) * 8 * 1024 as indexSize,
        SUM(a.used_pages) * 8 * 1024 as totalSize,
        CASE 
          WHEN SUM(p.rows) > 0 THEN (SUM(a.data_pages) * 8 * 1024) / SUM(p.rows)
          ELSE 0
        END as avgRowLength,
        STATS_DATE(t.object_id, 1) as lastAnalyzed,
        IDENT_CURRENT(s.name + '.' + t.name) as autoIncrement
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN sys.indexes i ON t.object_id = i.object_id
      INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
      INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
      WHERE s.name = '${schema}' AND t.name = '${table}'
      GROUP BY t.name, s.name, t.object_id
    `;
  }

  buildTableDDLQuery(schema: string, table: string): string {
    // SQL Server는 직접적인 SHOW CREATE TABLE이 없으므로 sp_helptext 사용 시도
    return `EXEC sp_helptext '${schema}.${table}'`;
  }

  buildServerStatsQuery(): string {
    return `
      SELECT 'uptime' as name, 
        CAST(DATEDIFF(SECOND, sqlserver_start_time, GETDATE()) AS VARCHAR) as value
      FROM sys.dm_os_sys_info
      UNION ALL
      SELECT 'current_connections' as name, 
        CAST(COUNT(*) AS VARCHAR) as value
      FROM sys.dm_exec_connections
      UNION ALL
      SELECT 'max_connections' as name,
        CAST(value_in_use AS VARCHAR) as value
      FROM sys.configurations
      WHERE name = 'user connections'
      UNION ALL
      SELECT 'total_queries' as name,
        CAST(SUM(execution_count) AS VARCHAR) as value
      FROM sys.dm_exec_query_stats
      UNION ALL
      SELECT 'bytes_received' as name, '0' as value
      UNION ALL
      SELECT 'bytes_sent' as name, '0' as value
    `;
  }

  buildVersionQuery(): string {
    return 'SELECT @@VERSION as version';
  }

  formatDataType(column: any): string {
    let type = column.dataType.toUpperCase();
    
    // SQL Server 특수 타입 처리
    switch (type) {
      case 'NVARCHAR':
        return column.maxLength === -1 ? 'NVARCHAR(MAX)' : `NVARCHAR(${column.maxLength / 2})`;
      case 'VARCHAR':
        return column.maxLength === -1 ? 'VARCHAR(MAX)' : `VARCHAR(${column.maxLength})`;
      case 'NCHAR':
        return `NCHAR(${column.maxLength / 2})`;
      case 'CHAR':
        return `CHAR(${column.maxLength})`;
      case 'BINARY':
      case 'VARBINARY':
        return column.maxLength === -1 ? `${type}(MAX)` : `${type}(${column.maxLength})`;
      case 'DECIMAL':
      case 'NUMERIC':
        return `${type}(${column.precision},${column.scale})`;
      case 'FLOAT':
        return column.precision ? `FLOAT(${column.precision})` : 'FLOAT';
      default:
        return type;
    }
  }

  formatDefaultValue(defaultValue: any, dataType: string): string {
    if (defaultValue === null || defaultValue === undefined) {
      return '';
    }
    
    // SQL Server 기본값 정리 (괄호 제거)
    let cleanValue = defaultValue.toString();
    if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      cleanValue = cleanValue.slice(1, -1);
    }
    if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      cleanValue = cleanValue.slice(1, -1);
    }
    
    // 함수 호출
    if (cleanValue.includes('()') || cleanValue.toUpperCase() === 'GETDATE()' || 
        cleanValue.toUpperCase() === 'NEWID()') {
      return `DEFAULT ${cleanValue}`;
    }
    
    // NULL
    if (cleanValue.toUpperCase() === 'NULL') {
      return 'DEFAULT NULL';
    }
    
    // 문자열 타입
    if (['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT'].some(type => 
        dataType.toUpperCase().includes(type))) {
      // 이미 따옴표가 있는 경우
      if (cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
        return `DEFAULT ${cleanValue}`;
      }
      return `DEFAULT '${cleanValue.replace(/'/g, "''")}'`;
    }
    
    return `DEFAULT ${cleanValue}`;
  }
}