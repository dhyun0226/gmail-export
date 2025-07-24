/**
 * 쿼리 빌더 인터페이스
 * DBMS별 쿼리 생성 추상화
 */

export interface IQueryBuilder {
  // 식별자 이스케이프
  escapeIdentifier(identifier: string): string;
  
  // 스키마 쿼리
  buildSchemaListQuery(): string;
  buildTableListQuery(schema: string): string;
  buildTableListByPatternQuery(schema: string, pattern: string): string;
  
  // 메타데이터 쿼리
  buildColumnInfoQuery(schema: string, table: string): string;
  buildIndexInfoQuery(schema: string, table: string): string;
  buildTableStatsQuery(schema: string, table: string): string;
  
  // DDL 쿼리
  buildTableDDLQuery(schema: string, table: string): string;
  
  // 서버 통계 쿼리
  buildServerStatsQuery(): string;
  buildVersionQuery(): string;
  
  // 유틸리티
  formatDataType(column: any): string;
  formatDefaultValue(defaultValue: any, dataType: string): string;
}