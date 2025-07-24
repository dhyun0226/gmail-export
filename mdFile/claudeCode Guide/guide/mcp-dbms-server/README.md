# mcp-dbms-server

다중 데이터베이스 및 이기종 DBMS를 지원하는 MCP(Model Context Protocol) 서버

## 개요

mcp-dbms-server는 AI 모델이 다양한 데이터베이스 시스템(MySQL, PostgreSQL, MSSQL, Oracle)의 스키마, 테이블, 컬럼 정보를 조회하고 DDL을 생성할 수 있도록 하는 도구입니다. MCP 프로토콜을 통해 Claude 등의 AI 어시스턴트와 연동하여 데이터베이스 작업을 지원합니다.

## 지원 DBMS

- 🐬 **MySQL / MariaDB**
- 🐘 **PostgreSQL**
- 🪟 **Microsoft SQL Server (MSSQL)**
- 🔶 **Oracle Database**

## 주요 기능

- 📊 **스키마 관리**: 데이터베이스 스키마 목록 조회 및 테이블 탐색
- 🔍 **테이블 정보**: 컬럼, 인덱스, 통계 정보 상세 조회
- 🛠️ **DDL 생성**: CREATE TABLE 구문 자동 생성
- 📈 **성능 모니터링**: 데이터베이스 성능 통계 조회
- 🔐 **안전한 쿼리 실행**: SELECT 쿼리 및 CREATE TABLE 실행 지원
- 🔄 **다중 연결 지원**: 여러 데이터베이스 동시 연결 및 관리
- 🌐 **이기종 DBMS 지원**: 다양한 DBMS를 통합 인터페이스로 관리

## 빠른 시작

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd mcp-dbms-server

# 의존성 설치
npm install

# 환경 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 정보 입력

# 빌드
npm run build
```

### 실행

```bash
npm start
```

### Claude Desktop 연동

#### 단일 연결 설정

`claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "mcp-dbms-server": {
      "command": "node",
      "args": ["/path/to/mcp-dbms-server/dist/index.js"],
      "env": {
        "DB_TYPE": "mysql",
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "your_user",
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

#### 다중 연결 설정

```json
{
  "mcpServers": {
    "mcp-dbms-server": {
      "command": "node",
      "args": ["/path/to/mcp-dbms-server/dist/index.js"],
      "env": {
        "DB_CONNECTIONS": "[{\"id\":\"mysql-main\",\"type\":\"mysql\",\"host\":\"localhost\",\"user\":\"root\",\"password\":\"pass\"},{\"id\":\"pg-dev\",\"type\":\"postgresql\",\"host\":\"localhost\",\"user\":\"postgres\",\"password\":\"pass\"}]",
        "DEFAULT_CONNECTION_ID": "mysql-main"
      }
    }
  }
}
```

자세한 다중 연결 설정 방법은 [MULTI_DB_SETUP.md](./MULTI_DB_SETUP.md)를 참조하세요.

## 사용 가능한 도구

### 스키마 조회
- `getSchemaList`: 모든 스키마 목록 조회
- `getTableList`: 특정 스키마의 테이블 목록 조회

### 테이블 정보
- `getColumnInfo`: 테이블 컬럼 정보 조회
- `getIndexInfo`: 테이블 인덱스 정보 조회
- `getTableStats`: 테이블 통계 정보 조회

### DDL 생성
- `generateTableDdl`: 단일 테이블 DDL 생성
- `generateAllTablesDdl`: 스키마 내 모든 테이블 DDL 생성
- `generateTablesDdlByPattern`: 패턴 매칭 테이블 DDL 생성

### 쿼리 실행
- `executeQuery`: SELECT 쿼리 실행 (읽기 전용)
- `executeCreateTable`: CREATE TABLE DDL 실행

### 모니터링
- `getPerformanceStats`: 데이터베이스 성능 통계 조회

## 프로젝트 구조

```
mcp-dbms-server/
├── src/
│   ├── index.ts           # 진입점
│   ├── config/            # 설정 관리
│   ├── db/                # 데이터베이스 연결
│   ├── tools/             # MCP 도구 구현
│   │   ├── schema/        # 스키마 도구
│   │   ├── table/         # 테이블 도구
│   │   ├── ddl/           # DDL 도구
│   │   ├── query/         # 쿼리 도구
│   │   └── stats/         # 통계 도구
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 함수
├── dist/                  # 빌드 결과물
├── logs/                  # 로그 파일
└── package.json
```

## 개발

### 개발 모드 실행
```bash
npm run dev
```

### 코드 품질
```bash
# 린트 검사
npm run lint

# 코드 포맷팅
npm run format
```

## 라이선스

MIT License

## 기여

이슈 및 Pull Request를 환영합니다. 기여하기 전에 프로젝트의 코드 스타일과 가이드라인을 확인해 주세요.