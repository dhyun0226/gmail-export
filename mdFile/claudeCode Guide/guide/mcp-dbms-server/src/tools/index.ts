import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

// 모든 도구 정의
import { schemaTools } from './schema/tools.js';
import { tableTools } from './table/tools.js';
import { ddlTools } from './ddl/tools.js';
import { queryTools } from './query/tools.js';
import { statsTools } from './stats/tools.js';

// 도구 핸들러
import { handleSchemaTools } from './schema/handlers.js';
import { handleTableTools } from './table/handlers.js';
import { handleDdlTools } from './ddl/handlers.js';
import { handleQueryTools } from './query/handlers.js';
import { handleStatsTools } from './stats/handlers.js';

// 모든 도구를 합친 배열
const allTools: Tool[] = [
  ...schemaTools,
  ...tableTools,
  ...ddlTools,
  ...queryTools,
  ...statsTools,
];

// 모든 도구를 서버에 등록
export function registerTools(server: Server) {
  // 도구 목록 제공 핸들러
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  // 도구 실행 핸들러
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // 스키마 도구
    if (name === 'getSchemaList' || name === 'getTableList') {
      return await handleSchemaTools(name, args || {});
    }
    
    // 테이블 도구
    if (name === 'getColumnInfo' || name === 'getIndexInfo' || name === 'getTableStats') {
      return await handleTableTools(name, args || {});
    }
    
    // DDL 도구
    if (name === 'generateTableDdl' || name === 'generateAllTablesDdl' || name === 'generateTablesDdlByPattern') {
      return await handleDdlTools(name, args || {});
    }
    
    // 쿼리 도구
    if (name === 'executeQuery' || name === 'executeCreateTable') {
      return await handleQueryTools(name, args || {});
    }
    
    // 통계 도구
    if (name === 'getPerformanceStats') {
      return await handleStatsTools(name, args || {});
    }

    throw new Error(`알 수 없는 도구: ${name}`);
  });
}