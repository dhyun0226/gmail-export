/**
 * PostgreSQL 쿼리 빌더
 * PostgreSQL 특화 쿼리 생성
 */

import { BaseQueryBuilder } from '../../base/BaseQueryBuilder.js';

export class PostgreSQLQueryBuilder extends BaseQueryBuilder {
  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  buildSchemaListQuery(): string {
    return `
      SELECT 
        schema_name as name,
        schema_owner as owner,
        NULL as "defaultCharacterSet",
        NULL as "defaultCollation"
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
  }

  buildTableListQuery(schema: string): string {
    return `
      SELECT 
        t.table_name as name,
        t.table_schema as schema,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 'TABLE'
          WHEN t.table_type = 'VIEW' THEN 'VIEW'
          ELSE t.table_type
        END as type,
        ps.n_live_tup as rows,
        pg_size_pretty(pg_relation_size(c.oid)) as "dataSize",
        pg_size_pretty(pg_indexes_size(c.oid)) as "indexSize",
        pg_size_pretty(pg_total_relation_size(c.oid)) as "totalSize",
        NULL as created,
        NULL as modified,
        obj_description(c.oid) as comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name 
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
      LEFT JOIN pg_stat_user_tables ps ON ps.schemaname = t.table_schema 
        AND ps.relname = t.table_name
      WHERE t.table_schema = '${schema}'
      ORDER BY t.table_name
    `;
  }

  buildTableListByPatternQuery(schema: string, pattern: string): string {
    const likePattern = this.convertPatternToLike(pattern);
    return `
      SELECT 
        t.table_name as name,
        t.table_schema as schema,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 'TABLE'
          WHEN t.table_type = 'VIEW' THEN 'VIEW'
          ELSE t.table_type
        END as type,
        ps.n_live_tup as rows,
        pg_relation_size(c.oid) as "dataSize",
        pg_indexes_size(c.oid) as "indexSize",
        pg_total_relation_size(c.oid) as "totalSize",
        NULL as created,
        NULL as modified,
        obj_description(c.oid) as comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name 
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
      LEFT JOIN pg_stat_user_tables ps ON ps.schemaname = t.table_schema 
        AND ps.relname = t.table_name
      WHERE t.table_schema = '${schema}'
        AND t.table_name LIKE '${likePattern}'
      ORDER BY t.table_name
    `;
  }

  buildColumnInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        c.column_name as name,
        c.data_type as "dataType",
        c.character_maximum_length as "maxLength",
        c.numeric_precision as precision,
        c.numeric_scale as scale,
        c.is_nullable = 'YES' as "isNullable",
        c.column_default as "defaultValue",
        EXISTS (
          SELECT 1 FROM information_schema.key_column_usage k
          JOIN information_schema.table_constraints tc 
            ON k.constraint_name = tc.constraint_name
          WHERE k.table_schema = c.table_schema 
            AND k.table_name = c.table_name 
            AND k.column_name = c.column_name
            AND tc.constraint_type = 'PRIMARY KEY'
        ) as "isPrimaryKey",
        EXISTS (
          SELECT 1 FROM information_schema.key_column_usage k
          JOIN information_schema.table_constraints tc 
            ON k.constraint_name = tc.constraint_name
          WHERE k.table_schema = c.table_schema 
            AND k.table_name = c.table_name 
            AND k.column_name = c.column_name
            AND tc.constraint_type = 'UNIQUE'
        ) as "isUnique",
        c.is_identity = 'YES' OR c.column_default LIKE 'nextval%' as "isIdentity",
        CASE 
          WHEN c.is_identity = 'YES' THEN c.identity_start::int
          ELSE NULL
        END as "identitySeed",
        CASE 
          WHEN c.is_identity = 'YES' THEN c.identity_increment::int
          ELSE NULL
        END as "identityIncrement",
        col_description(
          (SELECT oid FROM pg_class WHERE relname = c.table_name 
           AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = c.table_schema)),
          c.ordinal_position
        ) as comment,
        c.ordinal_position as "ordinalPosition"
      FROM information_schema.columns c
      WHERE c.table_schema = '${schema}'
        AND c.table_name = '${table}'
      ORDER BY c.ordinal_position
    `;
  }

  buildIndexInfoQuery(schema: string, table: string): string {
    return `
      SELECT 
        i.indexname as name,
        i.tablename as "tableName",
        i.schemaname as "schemaName",
        CASE 
          WHEN ix.indisprimary THEN 'PRIMARY'
          WHEN ix.indisunique THEN 'UNIQUE'
          ELSE 'INDEX'
        END as type,
        array_to_string(
          array_agg(a.attname ORDER BY a.attnum),
          ','
        ) as columns,
        ix.indisunique as "isUnique",
        ix.indisprimary as "isPrimary",
        ix.indisclustered as "isClustered",
        NULL as cardinality,
        pg_relation_size(i.indexname::regclass) as size,
        obj_description(i.indexname::regclass) as comment
      FROM pg_indexes i
      JOIN pg_class c ON c.relname = i.indexname
      JOIN pg_index ix ON ix.indexrelid = c.oid
      JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = ANY(ix.indkey)
      WHERE i.schemaname = '${schema}'
        AND i.tablename = '${table}'
      GROUP BY i.indexname, i.tablename, i.schemaname, ix.indisprimary, 
               ix.indisunique, ix.indisclustered
      ORDER BY i.indexname
    `;
  }

  buildTableStatsQuery(schema: string, table: string): string {
    return `
      SELECT 
        ps.relname as "tableName",
        ps.schemaname as "schemaName",
        ps.n_live_tup as "rowCount",
        pg_relation_size(c.oid) as "dataSize",
        pg_indexes_size(c.oid) as "indexSize",
        pg_total_relation_size(c.oid) as "totalSize",
        CASE 
          WHEN ps.n_live_tup > 0 THEN pg_relation_size(c.oid) / ps.n_live_tup
          ELSE 0
        END as "avgRowLength",
        ps.last_analyze as "lastAnalyzed",
        NULL as "autoIncrement"
      FROM pg_stat_user_tables ps
      JOIN pg_class c ON c.relname = ps.relname 
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = ps.schemaname)
      WHERE ps.schemaname = '${schema}'
        AND ps.relname = '${table}'
    `;
  }

  buildTableDDLQuery(schema: string, table: string): string {
    // PostgreSQL은 SHOW CREATE TABLE이 없으므로 정보를 조합해서 생성
    return `
      SELECT 
        'CREATE TABLE ' || n.nspname || '.' || c.relname || ' (' as ddl_start,
        string_agg(
          '  ' || a.attname || ' ' || 
          pg_catalog.format_type(a.atttypid, a.atttypmod) ||
          CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
          CASE WHEN d.adsrc IS NOT NULL THEN ' DEFAULT ' || d.adsrc ELSE '' END,
          E',\n'
          ORDER BY a.attnum
        ) as column_defs,
        ');' as ddl_end
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE n.nspname = '${schema}'
        AND c.relname = '${table}'
        AND a.attnum > 0
        AND NOT a.attisdropped
      GROUP BY n.nspname, c.relname
    `;
  }

  buildServerStatsQuery(): string {
    return `
      SELECT 
        'uptime' as name,
        EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))::text as value
      UNION ALL
      SELECT 
        'current_connections' as name,
        count(*)::text as value
      FROM pg_stat_activity
      WHERE state = 'active'
      UNION ALL
      SELECT 
        'max_connections' as name,
        setting as value
      FROM pg_settings
      WHERE name = 'max_connections'
      UNION ALL
      SELECT 
        'total_queries' as name,
        sum(xact_commit + xact_rollback)::text as value
      FROM pg_stat_database
      UNION ALL
      SELECT 
        'bytes_received' as name,
        '0' as value
      UNION ALL
      SELECT 
        'bytes_sent' as name,
        '0' as value
    `;
  }

  buildVersionQuery(): string {
    return 'SELECT version() as version';
  }

  formatDataType(column: any): string {
    let type = column.dataType.toUpperCase();
    
    // PostgreSQL 특수 타입 매핑
    const typeMap: Record<string, string> = {
      'CHARACTER VARYING': 'VARCHAR',
      'CHARACTER': 'CHAR',
      'INT4': 'INTEGER',
      'INT8': 'BIGINT',
      'INT2': 'SMALLINT',
      'BOOL': 'BOOLEAN',
      'TIMESTAMPTZ': 'TIMESTAMP WITH TIME ZONE',
      'TIMESTAMP': 'TIMESTAMP WITHOUT TIME ZONE'
    };
    
    type = typeMap[type] || type;
    
    // 길이가 있는 타입
    if (column.maxLength && ['VARCHAR', 'CHAR'].includes(type)) {
      type += `(${column.maxLength})`;
    }
    // 정밀도가 있는 타입
    else if (column.precision) {
      if (column.scale) {
        type += `(${column.precision},${column.scale})`;
      } else if (['NUMERIC', 'DECIMAL'].includes(type)) {
        type += `(${column.precision})`;
      }
    }
    
    return type;
  }

  formatDefaultValue(defaultValue: any, dataType: string): string {
    if (defaultValue === null || defaultValue === undefined) {
      return '';
    }
    
    // PostgreSQL 시퀀스 기본값
    if (defaultValue.includes('nextval')) {
      return `DEFAULT ${defaultValue}`;
    }
    
    // 함수 호출 기본값
    if (defaultValue.includes('()')) {
      return `DEFAULT ${defaultValue}`;
    }
    
    // NULL 기본값
    if (defaultValue === 'NULL') {
      return 'DEFAULT NULL';
    }
    
    // 타입 캐스팅 제거
    const cleanValue = defaultValue.replace(/::[\w\s]+$/, '');
    
    // 문자열 타입
    if (['VARCHAR', 'CHAR', 'TEXT'].some(type => dataType.toUpperCase().includes(type))) {
      return `DEFAULT '${cleanValue.replace(/'/g, "''")}'`;
    }
    
    return `DEFAULT ${cleanValue}`;
  }
}