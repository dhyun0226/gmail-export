# 다중 데이터베이스 연결 설정 가이드

## 개요

mcp-dbms-server는 이제 다중 데이터베이스 연결과 이기종 DBMS를 지원합니다. MySQL, PostgreSQL, MSSQL, Oracle을 동시에 연결하여 사용할 수 있습니다.

## 지원 DBMS

- MySQL / MariaDB
- PostgreSQL
- Microsoft SQL Server (MSSQL)
- Oracle Database

## 환경 변수 설정

### 1. 단일 연결 설정 (하위 호환성)

기존 방식과 동일하게 단일 데이터베이스 연결을 설정할 수 있습니다:

```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=mydb
```

### 2. 다중 연결 설정 (JSON 배열)

`DB_CONNECTIONS` 환경 변수에 JSON 배열 형식으로 여러 연결을 설정합니다:

```bash
DB_CONNECTIONS='[
  {
    "id": "mysql-prod",
    "type": "mysql",
    "host": "mysql.example.com",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "production"
  },
  {
    "id": "postgres-dev",
    "type": "postgresql",
    "host": "postgres.example.com",
    "port": 5432,
    "user": "postgres",
    "password": "password",
    "database": "development"
  },
  {
    "id": "mssql-test",
    "type": "mssql",
    "host": "sqlserver.example.com",
    "port": 1433,
    "user": "sa",
    "password": "password",
    "database": "testdb"
  },
  {
    "id": "oracle-legacy",
    "type": "oracle",
    "host": "oracle.example.com",
    "port": 1521,
    "user": "system",
    "password": "password",
    "database": "ORCL"
  }
]'
```

### 3. 다중 연결 설정 (JSON 객체)

키를 연결 ID로 사용하는 객체 형식도 지원합니다:

```bash
DB_CONNECTIONS='{
  "mysql-prod": {
    "type": "mysql",
    "host": "mysql.example.com",
    "port": 3306,
    "user": "root",
    "password": "password"
  },
  "postgres-dev": {
    "type": "postgresql",
    "host": "postgres.example.com",
    "user": "postgres",
    "password": "password",
    "database": "devdb"
  }
}'
```

### 4. 기본 연결 ID 설정

여러 연결이 있을 때 기본으로 사용할 연결을 지정합니다:

```bash
DEFAULT_CONNECTION_ID=mysql-prod
```

## 연결 설정 옵션

각 연결은 다음 옵션을 지원합니다:

```json
{
  "id": "connection-id",           // 필수: 연결 식별자
  "type": "mysql",                 // 필수: mysql, postgresql, mssql, oracle
  "host": "localhost",             // 필수: 호스트 주소
  "port": 3306,                    // 선택: 포트 (기본값은 DBMS별로 다름)
  "user": "username",              // 필수: 사용자명
  "password": "password",          // 필수: 비밀번호
  "database": "dbname",            // 선택: 데이터베이스명
  "ssl": true,                     // 선택: SSL 연결 사용
  "connectionTimeout": 30000,      // 선택: 연결 타임아웃 (ms)
  "requestTimeout": 30000,         // 선택: 요청 타임아웃 (ms)
  "pool": {                        // 선택: 연결 풀 설정
    "min": 1,
    "max": 10,
    "idleTimeoutMillis": 30000
  },
  "options": {                     // 선택: DBMS별 추가 옵션
    "encrypt": true,               // MSSQL용 예시
    "trustServerCertificate": true
  }
}
```

## MCP 클라이언트 설정

### Claude Desktop 설정 예시

```json
{
  "mcpServers": {
    "mcp-dbms-server": {
      "command": "node",
      "args": ["/path/to/mcp-dbms-server/dist/index.js"],
      "env": {
        "DB_CONNECTIONS": "[{\"id\":\"mysql-main\",\"type\":\"mysql\",\"host\":\"localhost\",\"user\":\"root\",\"password\":\"password\"},{\"id\":\"postgres-analytics\",\"type\":\"postgresql\",\"host\":\"localhost\",\"user\":\"postgres\",\"password\":\"password\"}]",
        "DEFAULT_CONNECTION_ID": "mysql-main"
      }
    }
  }
}
```

## 사용 방법

### 1. 기본 연결 사용

connectionId를 지정하지 않으면 기본 연결이 사용됩니다:

```javascript
// 기본 연결 사용
await getSchemaList();
await getTableList({ schemaName: "public" });
```

### 2. 특정 연결 지정

connectionId를 지정하여 특정 데이터베이스에 접근합니다:

```javascript
// MySQL 연결 사용
await getSchemaList({ connectionId: "mysql-prod" });

// PostgreSQL 연결 사용
await getTableList({ 
  connectionId: "postgres-dev",
  schemaName: "public" 
});

// Oracle 연결 사용
await executeQuery({
  connectionId: "oracle-legacy",
  query: "SELECT * FROM all_tables WHERE ROWNUM <= 10"
});
```

### 3. 다중 데이터베이스 작업

여러 데이터베이스에서 동시에 작업할 수 있습니다:

```javascript
// MySQL에서 테이블 목록 조회
const mysqlTables = await getTableList({
  connectionId: "mysql-prod",
  schemaName: "mydb"
});

// PostgreSQL에서 동일한 작업
const postgresTables = await getTableList({
  connectionId: "postgres-dev",
  schemaName: "public"
});

// 결과 비교 또는 병합 처리
```

## 연결 상태 확인

서버 로그에서 활성 연결을 확인할 수 있습니다:

```
[INFO] 2개의 데이터베이스 연결 설정 발견
[INFO] 데이터베이스 연결 등록 완료: mysql-prod (mysql)
[INFO] 데이터베이스 연결 등록 완료: postgres-dev (postgresql)
[INFO] 활성 데이터베이스 연결: mysql-prod, postgres-dev
```

## 주의사항

1. **연결 ID 중복**: 각 연결 ID는 고유해야 합니다.
2. **메모리 사용**: 많은 연결을 동시에 유지하면 메모리 사용량이 증가합니다.
3. **연결 풀**: 각 DBMS별로 적절한 연결 풀 크기를 설정하세요.
4. **보안**: 환경 변수에 비밀번호를 저장할 때는 보안에 주의하세요.

## 문제 해결

### 연결 실패

- 호스트, 포트, 인증 정보가 올바른지 확인
- 방화벽 설정 확인
- DBMS별 드라이버 설치 상태 확인

### Oracle 연결 문제

Oracle 연결 시 Oracle Instant Client가 필요할 수 있습니다:

```bash
# Ubuntu/Debian
sudo apt-get install libaio1

# macOS
brew tap InstantClientTap/instantclient
brew install instantclient-basic
```

### MSSQL 인증 문제

Windows 인증을 사용하는 경우:

```json
{
  "id": "mssql-windows",
  "type": "mssql",
  "host": "localhost",
  "options": {
    "trustedConnection": true
  }
}
```