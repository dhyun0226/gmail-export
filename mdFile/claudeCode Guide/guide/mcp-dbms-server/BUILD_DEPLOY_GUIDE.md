# mcp-dbms-server 빌드 및 배포 가이드

## 목차
1. [사전 요구사항](#사전-요구사항)
2. [프로젝트 설정](#프로젝트-설정)
3. [빌드 방법](#빌드-방법)
4. [배포 방법](#배포-방법)
5. [MCP 클라이언트 설정](#mcp-클라이언트-설정)
6. [문제 해결](#문제-해결)

## 사전 요구사항

### 시스템 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- MySQL 5.7+ 또는 MariaDB 10.2+

### 데이터베이스 권한
MCP 서버가 정상적으로 작동하려면 다음 권한이 필요합니다:
```sql
-- 최소 권한
GRANT SELECT ON *.* TO 'mcp_user'@'localhost';
GRANT SHOW DATABASES ON *.* TO 'mcp_user'@'localhost';
GRANT CREATE ON *.* TO 'mcp_user'@'localhost';  -- executeCreateTable 사용 시

-- information_schema에 대한 접근 권한 (자동으로 부여됨)
```

## 프로젝트 설정

### 1. 저장소 클론 또는 다운로드
```bash
git clone <repository-url>
cd mcp-dbms-server
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:
```bash
cp .env.example .env
```

`.env` 파일을 편집하여 데이터베이스 연결 정보를 설정합니다:
```env
# 데이터베이스 연결 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_CONNECTION_LIMIT=10

# 로깅 설정
LOG_LEVEL=info

# MCP 서버 설정
MCP_SERVER_NAME=mcp-dbms-server
```

## 빌드 방법

### TypeScript 컴파일
```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 개발 모드 실행
개발 중에는 TypeScript 파일을 직접 실행할 수 있습니다:
```bash
npm run dev
```

## 배포 방법

### 1. 프로덕션 빌드
```bash
npm run build
```

### 2. 로그 디렉토리 생성
```bash
mkdir -p logs
```

### 3. 실행 권한 설정 (Unix/Linux)
```bash
chmod +x dist/index.js
```

### 4. 직접 실행
```bash
npm start
# 또는
node dist/index.js
```

### 5. 시스템 서비스로 등록 (선택사항)

#### systemd 서비스 파일 생성 (Linux)
`/etc/systemd/system/mcp-dbms-server.service`:
```ini
[Unit]
Description=MCP DBMS Server
After=network.target mysql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/mcp-dbms-server
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /path/to/mcp-dbms-server/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 활성화 및 시작:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-dbms-server
sudo systemctl start mcp-dbms-server
```

## MCP 클라이언트 설정

### Claude Desktop 설정
Claude Desktop의 설정 파일에 다음을 추가합니다:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-dbms-server": {
      "command": "node",
      "args": ["/path/to/mcp-dbms-server/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "your_db_user",
        "DB_PASSWORD": "your_db_password"
      }
    }
  }
}
```

### 다른 MCP 클라이언트
각 클라이언트의 문서를 참조하여 서버를 등록합니다. 일반적으로:
- 실행 명령: `node /path/to/mcp-dbms-server/dist/index.js`
- 환경 변수: 위의 `.env` 설정 참조

## 사용 가능한 도구

배포된 서버는 다음 도구들을 제공합니다:

| 도구 이름 | 설명 |
|-----------|------|
| `getSchemaList` | 데이터베이스 스키마 목록 조회 |
| `getTableList` | 지정된 스키마의 테이블 목록 조회 |
| `getColumnInfo` | 테이블 컬럼 정보 조회 |
| `getIndexInfo` | 테이블 인덱스 정보 조회 |
| `getTableStats` | 테이블 통계 정보 조회 |
| `getPerformanceStats` | 데이터베이스 성능 통계 조회 |
| `executeQuery` | SELECT 쿼리 실행 |
| `generateTableDdl` | 테이블 DDL 생성 |
| `generateAllTablesDdl` | 스키마 내 모든 테이블의 DDL 생성 |
| `generateTablesDdlByPattern` | 패턴과 일치하는 테이블의 DDL 생성 |
| `executeCreateTable` | 테이블 생성 구문 실행 |

## 문제 해결

### 연결 오류
```
Error: Connection refused
```
**해결 방법**:
- MySQL/MariaDB 서비스가 실행 중인지 확인
- 호스트와 포트가 올바른지 확인
- 방화벽 설정 확인

### 권한 오류
```
Error: Access denied for user
```
**해결 방법**:
- 사용자 이름과 비밀번호 확인
- 필요한 권한이 부여되었는지 확인
- 호스트 제한 확인 (localhost vs %)

### 로그 확인
문제 발생 시 로그 파일을 확인합니다:
```bash
tail -f logs/error.log
tail -f logs/combined.log
```

### 디버그 모드
더 자세한 로그를 보려면 LOG_LEVEL을 'debug'로 설정합니다:
```env
LOG_LEVEL=debug
```

## 보안 권장사항

1. **최소 권한 원칙**: 필요한 최소한의 데이터베이스 권한만 부여
2. **네트워크 보안**: 필요한 경우 SSL/TLS 연결 사용
3. **환경 변수**: 민감한 정보는 환경 변수로 관리
4. **로그 관리**: 로그 파일에 민감한 정보가 포함되지 않도록 주의

## 성능 최적화

1. **연결 풀 크기**: `DB_CONNECTION_LIMIT`를 서버 부하에 맞게 조정
2. **로그 레벨**: 프로덕션에서는 'info' 또는 'warn' 레벨 사용
3. **쿼리 최적화**: 대량 데이터 조회 시 페이지네이션 고려