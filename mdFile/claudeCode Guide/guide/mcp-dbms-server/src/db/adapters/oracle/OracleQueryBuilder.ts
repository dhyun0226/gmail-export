/**
 * Oracle 쿼리 빌더
 * Oracle 특화 쿼리 생성
 */

import { BaseQueryBuilder } from '../../base/BaseQueryBuilder.js';

export class OracleQueryBuilder extends BaseQueryBuilder {
  escapeIdentifier(identifier: string): string {
    // Oracle은 대소문자 구분이 필요한 경우에만 따옴표 사용
    // 기본적으로 대문자로 변환되므로 일반적인 경우 따옴표 불필요
    if (/[a-z]/.test(identifier) || /[^A-Z0-9_$#]/.test(identifier)) {
      return `"${identifier.replace(/"/g, '""')}"`;
    }
    return identifier;
  }

  buildSchemaListQuery(): string {
    return `
      SELECT 
        username as name,
        username as owner,
        default_tablespace as "defaultCharacterSet",
        NULL as "defaultCollation"
      FROM all_users
      WHERE username NOT IN ('SYS', 'SYSTEM', 'DBSNMP', 'SYSMAN', 'OUTLN', 'FLOWS_FILES',
                             'MDSYS', 'ORDSYS', 'EXFSYS', 'WMSYS', 'APPQOSSYS', 'APEX_030200',
                             'OWBSYS_AUDIT', 'ORDDATA', 'CTXSYS', 'ANONYMOUS', 'XDB', 'ORDPLUGINS',
                             'OWBSYS', 'SI_INFORMTN_SCHEMA', 'OLAPSYS', 'ORACLE_OCM', 'XS$NULL',
                             'BI', 'PM', 'MDDATA', 'IX', 'SH', 'DIP', 'OE', 'APEX_PUBLIC_USER', 'HR')
      ORDER BY username
    `;
  }

  buildTableListQuery(schema: string): string {
    return `
      SELECT 
        table_name as name,
        owner as "schema",
        CASE 
          WHEN table_type = 'TABLE' THEN 'TABLE'
          WHEN table_type = 'VIEW' THEN 'VIEW'
          ELSE table_type
        END as type,
        num_rows as "rows",
        (blocks * 8192) as "dataSize",
        0 as "indexSize",
        (blocks * 8192) as "totalSize",
        NULL as created,
        last_analyzed as modified,
        comments as "comment"
      FROM all_tables t
      LEFT JOIN all_tab_comments c ON t.owner = c.owner AND t.table_name = c.table_name
      WHERE t.owner = UPPER('${schema}')
      ORDER BY table_name
    `;
  }

  buildTableListByPatternQuery(schema: string, pattern: string): string {
    const likePattern = this.convertPatternToLike(pattern);
    return `
      SELECT 
        table_name as name,
        owner as "schema",
        CASE 
          WHEN table_type = 'TABLE' THEN 'TABLE'
          WHEN table_type = 'VIEW' THEN 'VIEW'
          ELSE table_type
        END as type,
        num_rows as "rows",
        (blocks * 8192) as "dataSize",
        0 as "indexSize",
        (blocks * 8192) as "totalSize",
        NULL as created,
        last_analyzed as modified,
        comments as "comment"
      FROM all_tables t
      LEFT JOIN all_tab_comments c ON t.owner = c.owner AND t.table_name = c.table_name
      WHERE t.owner = UPPER('${schema}')
        AND t.table_name LIKE UPPER('${likePattern}')
      ORDER BY table_name
    `;
  }

  buildColumnInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        c.column_name as name,
        c.data_type as "dataType",
        c.data_length as "maxLength",
        c.data_precision as "precision",
        c.data_scale as scale,
        CASE WHEN c.nullable = 'Y' THEN 1 ELSE 0 END as "isNullable",
        c.data_default as "defaultValue",
        CASE WHEN pk.column_name IS NOT NULL THEN 1 ELSE 0 END as "isPrimaryKey",
        CASE WHEN uk.column_name IS NOT NULL THEN 1 ELSE 0 END as "isUnique",
        CASE WHEN c.identity_column = 'YES' THEN 1 ELSE 0 END as "isIdentity",
        NULL as "identitySeed",
        NULL as "identityIncrement",
        cc.comments as "comment",
        c.column_id as "ordinalPosition"
      FROM all_tab_columns c
      LEFT JOIN all_col_comments cc ON c.owner = cc.owner 
        AND c.table_name = cc.table_name AND c.column_name = cc.column_name
      LEFT JOIN (
        SELECT col.column_name
        FROM all_cons_columns col
        JOIN all_constraints con ON col.owner = con.owner 
          AND col.constraint_name = con.constraint_name
        WHERE con.constraint_type = 'P'
          AND con.owner = UPPER('${schema}')
          AND con.table_name = UPPER('${table}')
      ) pk ON c.column_name = pk.column_name
      LEFT JOIN (
        SELECT col.column_name
        FROM all_cons_columns col
        JOIN all_constraints con ON col.owner = con.owner 
          AND col.constraint_name = con.constraint_name
        WHERE con.constraint_type = 'U'
          AND con.owner = UPPER('${schema}')
          AND con.table_name = UPPER('${table}')
      ) uk ON c.column_name = uk.column_name
      WHERE c.owner = UPPER('${schema}')
        AND c.table_name = UPPER('${table}')
      ORDER BY c.column_id
    `;
  }

  buildIndexInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        i.index_name as name,
        i.table_name as "tableName",
        i.owner as "schemaName",
        CASE 
          WHEN c.constraint_type = 'P' THEN 'PRIMARY'
          WHEN i.uniqueness = 'UNIQUE' THEN 'UNIQUE'
          WHEN i.index_type LIKE '%BITMAP%' THEN 'BITMAP'
          ELSE 'INDEX'
        END as type,
        LISTAGG(ic.column_name, ',') WITHIN GROUP (ORDER BY ic.column_position) as columns,
        CASE WHEN i.uniqueness = 'UNIQUE' THEN 1 ELSE 0 END as "isUnique",
        CASE WHEN c.constraint_type = 'P' THEN 1 ELSE 0 END as "isPrimary",
        0 as "isClustered",
        i.distinct_keys as cardinality,
        i.leaf_blocks * 8192 as size,
        NULL as "comment"
      FROM all_indexes i
      JOIN all_ind_columns ic ON i.owner = ic.index_owner AND i.index_name = ic.index_name
      LEFT JOIN all_constraints c ON i.owner = c.owner 
        AND i.index_name = c.index_name AND c.constraint_type IN ('P', 'U')
      WHERE i.table_owner = UPPER('${schema}')
        AND i.table_name = UPPER('${table}')
      GROUP BY i.index_name, i.table_name, i.owner, c.constraint_type, 
               i.uniqueness, i.index_type, i.distinct_keys, i.leaf_blocks
      ORDER BY i.index_name
    `;
  }

  buildTableStatsQuery(schema: string, table: string): string {
    return `
      SELECT 
        table_name as "tableName",
        owner as "schemaName",
        num_rows as "rowCount",
        blocks * 8192 as "dataSize",
        0 as "indexSize",
        blocks * 8192 as "totalSize",
        avg_row_len as "avgRowLength",
        last_analyzed as "lastAnalyzed",
        NULL as "autoIncrement"
      FROM all_tables
      WHERE owner = UPPER('${schema}')
        AND table_name = UPPER('${table}')
    `;
  }

  buildTableDDLQuery(schema: string, table: string): string {
    // Oracle은 DBMS_METADATA 패키지를 사용하여 DDL 추출
    return `
      SELECT DBMS_METADATA.GET_DDL('TABLE', UPPER('${table}'), UPPER('${schema}')) as ddl 
      FROM DUAL
    `;
  }

  buildServerStatsQuery(): string {
    return `
      SELECT 'uptime' as name,
        TO_CHAR((SYSDATE - startup_time) * 86400) as value
      FROM v$instance
      UNION ALL
      SELECT 'current_connections' as name,
        TO_CHAR(COUNT(*)) as value
      FROM v$session
      WHERE type = 'USER'
      UNION ALL
      SELECT 'max_connections' as name,
        TO_CHAR(value) as value
      FROM v$parameter
      WHERE name = 'sessions'
      UNION ALL
      SELECT 'total_queries' as name,
        TO_CHAR(SUM(executions)) as value
      FROM v$sqlstats
      UNION ALL
      SELECT 'bytes_received' as name,
        TO_CHAR(SUM(bytes_received)) as value
      FROM v$session_connect_info
      WHERE network_service_banner LIKE 'TCP/IP%'
      UNION ALL
      SELECT 'bytes_sent' as name,
        TO_CHAR(SUM(bytes_sent)) as value
      FROM v$session_connect_info
      WHERE network_service_banner LIKE 'TCP/IP%'
    `;
  }

  buildVersionQuery(): string {
    return `SELECT banner as version FROM v$version WHERE ROWNUM = 1`;
  }

  formatDataType(column: any): string {
    let type = column.dataType.toUpperCase();
    
    // Oracle 특수 타입 처리
    switch (type) {
      case 'VARCHAR2':
        return `VARCHAR2(${column.maxLength || 4000})`;
      case 'NVARCHAR2':
        return `NVARCHAR2(${column.maxLength || 2000})`;
      case 'CHAR':
        return `CHAR(${column.maxLength || 1})`;
      case 'NCHAR':
        return `NCHAR(${column.maxLength || 1})`;
      case 'NUMBER':
        if (column.precision) {
          if (column.scale) {
            return `NUMBER(${column.precision},${column.scale})`;
          }
          return `NUMBER(${column.precision})`;
        }
        return 'NUMBER';
      case 'FLOAT':
        return column.precision ? `FLOAT(${column.precision})` : 'FLOAT';
      case 'RAW':
        return `RAW(${column.maxLength || 2000})`;
      case 'CLOB':
      case 'NCLOB':
      case 'BLOB':
      case 'BFILE':
      case 'DATE':
      case 'TIMESTAMP':
      case 'TIMESTAMP WITH TIME ZONE':
      case 'TIMESTAMP WITH LOCAL TIME ZONE':
      case 'INTERVAL YEAR TO MONTH':
      case 'INTERVAL DAY TO SECOND':
        return type;
      default:
        return type;
    }
  }

  formatDefaultValue(defaultValue: any, dataType: string): string {
    if (defaultValue === null || defaultValue === undefined) {
      return '';
    }
    
    // Oracle 기본값 정리 (공백 및 줄바꿈 제거)
    let cleanValue = defaultValue.toString().trim();
    
    // 이미 DEFAULT가 포함된 경우
    if (cleanValue.toUpperCase().startsWith('DEFAULT')) {
      return cleanValue;
    }
    
    // NULL
    if (cleanValue.toUpperCase() === 'NULL') {
      return 'DEFAULT NULL';
    }
    
    // 시스템 함수
    if (cleanValue.toUpperCase() === 'SYSDATE' || 
        cleanValue.toUpperCase() === 'SYSTIMESTAMP' ||
        cleanValue.toUpperCase() === 'USER' ||
        cleanValue.includes('SYS_GUID')) {
      return `DEFAULT ${cleanValue}`;
    }
    
    // 시퀀스
    if (cleanValue.includes('.NEXTVAL')) {
      return `DEFAULT ${cleanValue}`;
    }
    
    // 문자열 타입
    if (['VARCHAR2', 'NVARCHAR2', 'CHAR', 'NCHAR', 'CLOB', 'NCLOB'].some(type => 
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