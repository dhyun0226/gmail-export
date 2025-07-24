# 프로젝트 메타데이터 수집 및 분석 시스템

## 📋 개요

이 시스템은 프로젝트 파일을 자동으로 스캔하여 기술스택, 아키텍처, 도메인 규칙을 감지하고 AI 화면 설계 도구에서 사용할 수 있는 메타데이터를 생성합니다.

## 🏗️ 시스템 구조

```
project-metadata/
├── engine/                           # 메타데이터 수집 엔진
│   ├── metadata-collection-config.json  # 수집 설정
│   ├── scan-rules.js                     # JavaScript 스캔 엔진
│   ├── tech-stack-detector.py           # Python 기술스택 감지기
│   └── metadata-cli.js                   # CLI 도구
├── templates/                        # 프로젝트 템플릿
│   ├── vue3-springboot-template.json
│   └── react-nodejs-template.json
└── README.md                        # 이 파일
```

## 🚀 설치 및 설정

### 1. 필수 요구사항

**Node.js 환경** (JavaScript 엔진용):
```bash
# Node.js 18+ 설치 확인
node --version
npm --version

# 필요한 패키지 설치
npm install -g glob inquirer chalk ora figlet
```

**Python 환경** (기술스택 감지기용):
```bash
# Python 3.8+ 설치 확인
python --version

# 필요한 패키지 설치
pip install pyyaml
```

### 2. CLI 도구 설치

```bash
# 1. 이 저장소를 클론하거나 파일들을 다운로드
git clone <repository-url>
cd ai-design/production-code/project-metadata

# 2. CLI 도구를 전역으로 설치
npm link engine/metadata-cli.js

# 또는 직접 실행
chmod +x engine/metadata-cli.js
alias ai-metadata='node /path/to/engine/metadata-cli.js'
```

### 3. 설정 확인

```bash
# CLI 도구 동작 확인
ai-metadata --help

# 사용 가능한 템플릿 확인
ai-metadata templates
```

## 💻 사용법

### 기본 명령어

#### 1. 자동 스캔으로 메타데이터 생성
```bash
# 현재 디렉토리 표준 스캔
ai-metadata generate

# 특정 경로 심층 스캔
ai-metadata generate ./my-project deep

# 고속 스캔
ai-metadata generate . fast
```

**실행 결과 예시**:
```
🔍 프로젝트 스캔 시작: ./my-project (standard 모드)
📁 발견된 파일: 127개
🎨 프론트엔드 분석 중...
⚙️ 백엔드 분석 중...
🗄️ 데이터베이스 분석 중...
🏗️ 아키텍처 분석 중...
🚀 인프라 분석 중...
✅ 스캔 완료: 2,340ms

🎉 메타데이터 생성 성공!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 위치: ./.ai-metadata/project-metadata.json

🎨 감지된 기술스택:
  Frontend: Vue 3 3.4.32
  Backend: Spring Boot 3.2.x

📊 전체 신뢰도: 94%

✅ 이제 AI 화면 분석을 시작할 수 있습니다:
  /ai-design your-image.png full
```

#### 2. 대화형 마법사 사용
```bash
ai-metadata wizard
```

**실행 화면**:
```
🧙‍♂️ 메타데이터 생성 마법사

? 프로젝트 유형을 선택하세요:
❯ 💻 Vue 3 + Spring Boot (엔터프라이즈)
  ⚛️  React + Node.js (모던 웹앱)
  🅰️  Angular + .NET Core (기업용)
  🐍 Vue 3 + Django (풀스택)
  🔍 자동 스캔 (기존 프로젝트)
```

#### 3. 템플릿 적용
```bash
# 특정 템플릿 적용
ai-metadata apply vue3-springboot

# 사용 가능한 템플릿 목록 확인
ai-metadata templates
```

#### 4. 메타데이터 검증
```bash
ai-metadata validate
```

**검증 결과 예시**:
```
🔍 메타데이터 검증 중...
✅ 메타데이터 검증 완료!

✅ 검증 통과:
  ✓ projectInfo 존재
  ✓ techStack 존재
  ✓ architecture 존재
  ✓ 프론트엔드 프레임워크 감지
  ✓ 백엔드 프레임워크 감지

⚠️  경고:
  ! DevExtreme 라이선스 확인 필요

📊 전체 품질 점수: 94/100
```

#### 5. 메타데이터 정보 확인
```bash
ai-metadata info
```

#### 6. 백업 및 복원
```bash
# 백업 생성
ai-metadata backup my-backup

# 백업 복원
ai-metadata restore my-backup
```

### 고급 사용법

#### Python 기술스택 감지기 직접 사용
```bash
# Python 스크립트 직접 실행
python engine/tech-stack-detector.py ./my-project 3

# 출력 결과를 파일로 저장
python engine/tech-stack-detector.py ./my-project > tech-stack-result.json
```

#### 설정 파일 커스터마이징
```bash
# 기본 설정 파일 위치
engine/metadata-collection-config.json

# 스캔 규칙 수정
# - scan_modes: 스캔 모드별 설정
# - file_patterns: 스캔 대상 파일 패턴
# - analysis_rules: 기술스택 감지 규칙
```

## 📊 생성되는 파일

### 1. project-metadata.json (메인 메타데이터)
```json
{
  "metadata_version": "1.0.0",
  "schema_version": "2024.1",
  "generated_at": "2025-07-01T00:00:00Z",
  "projectInfo": {
    "name": "my-project",
    "version": "1.0.0",
    "description": "프로젝트 설명"
  },
  "techStack": {
    "frontend": {
      "framework": "Vue 3",
      "version": "3.4.32",
      "ui_library": "Bootstrap Vue Next"
    },
    "backend": {
      "framework": "Spring Boot",
      "version": "3.2.x",
      "language": "Java 17"
    }
  },
  "architecture": {
    "pattern": "Layered Architecture",
    "style": "Monolithic"
  }
}
```

### 2. component-mappings.json (컴포넌트 매핑)
```json
{
  "generated_from": "project_scan",
  "timestamp": "2025-07-01T00:00:00Z",
  "mappings": {
    "form_controls": {
      "text_input": "OwInput",
      "select": "OwFormSelect",
      "date_picker": "OwBizDatePicker"
    },
    "data_display": {
      "table": "DxDataGrid",
      "pagination": "OwPagination"
    }
  }
}
```

### 3. api-patterns.json (API 패턴)
```json
{
  "generated_from": "project_scan",
  "timestamp": "2025-07-01T00:00:00Z",
  "patterns": {
    "rest_endpoints": {
      "list": "GET /api/{resource}?page={page}&size={size}",
      "detail": "GET /api/{resource}/{id}",
      "create": "POST /api/{resource}"
    },
    "response_format": {
      "success": "{ success: true, data: {}, message: '' }",
      "error": "{ success: false, error: { code: '', message: '' } }"
    }
  }
}
```

## 🔧 기술스택 감지 규칙

### 프론트엔드 감지
- **Vue.js**: package.json의 vue 의존성, .vue 파일, createApp 패턴
- **React**: package.json의 react 의존성, .jsx/.tsx 파일, React.createElement 패턴
- **Angular**: @angular/core 의존성, angular.json 파일, @Component 데코레이터

### 백엔드 감지
- **Spring Boot**: pom.xml의 spring-boot 의존성, @SpringBootApplication 어노테이션
- **Express.js**: package.json의 express 의존성, app.listen 패턴
- **Django**: requirements.txt의 Django, settings.py 파일

### 데이터베이스 감지
- **PostgreSQL**: 설정 파일의 postgresql 연결 문자열
- **MySQL**: 설정 파일의 mysql 연결 문자열
- **MongoDB**: 설정 파일의 mongodb 연결 문자열

### 아키텍처 패턴 감지
- **Layered Architecture**: controller, service, repository 디렉토리 구조
- **Microservices**: 여러 -service 디렉토리, service discovery 의존성

## 🎯 신뢰도 점수

각 감지된 기술스택에는 신뢰도 점수가 부여됩니다:

- **95-100%**: 확실한 감지 (package.json 의존성 + 설정파일 + 소스코드 패턴)
- **85-94%**: 높은 신뢰도 (package.json 의존성 + 설정파일 또는 소스코드)
- **70-84%**: 보통 신뢰도 (단일 지표로 감지)
- **60-69%**: 낮은 신뢰도 (추론 기반)

## 🚨 문제 해결

### 일반적인 문제

1. **"command not found: ai-metadata"**
   ```bash
   # Node.js와 npm이 설치되어 있는지 확인
   node --version
   npm --version
   
   # CLI 도구 재설치
   npm link engine/metadata-cli.js
   ```

2. **"메타데이터를 찾을 수 없습니다"**
   ```bash
   # 현재 디렉토리에 .ai-metadata 폴더가 있는지 확인
   ls -la .ai-metadata
   
   # 없으면 새로 생성
   ai-metadata generate
   ```

3. **"스캔 결과 신뢰도가 낮습니다"**
   ```bash
   # 심층 스캔 실행
   ai-metadata generate . deep
   
   # 수동으로 검토 및 수정 필요
   ai-metadata validate
   ```

4. **Python 스크립트 실행 오류**
   ```bash
   # Python 3.8+ 설치 확인
   python --version
   
   # 필요한 패키지 설치
   pip install pyyaml
   ```

### 디버그 모드

```bash
# 상세한 로그와 함께 실행
DEBUG=* ai-metadata generate

# JavaScript 스캔 엔진 직접 테스트
node engine/scan-rules.js /path/to/project

# Python 감지기 직접 테스트
python engine/tech-stack-detector.py /path/to/project 3
```

## 📈 성능 최적화

### 스캔 성능 개선
- **fast 모드**: 개발 중 빠른 테스트용 (30초)
- **standard 모드**: 일반적인 용도 (1-2분)
- **deep 모드**: 정확한 분석이 필요한 경우 (3-5분)

### 파일 제외 설정
```json
// engine/metadata-collection-config.json
{
  "scan_config": {
    "ignore_patterns": [
      "**/node_modules/**",
      "**/target/**",
      "**/build/**",
      "**/dist/**",
      "**/.git/**"
    ]
  }
}
```

## 🔄 업데이트 및 유지보수

### 정기 업데이트
```bash
# 메타데이터 재검증 (월 1회 권장)
ai-metadata validate

# 프로젝트 변경사항 반영
ai-metadata generate . standard

# 백업 후 업데이트
ai-metadata backup before-update
ai-metadata generate . deep
```

### 새로운 기술스택 추가
1. `engine/metadata-collection-config.json`에 감지 규칙 추가
2. `engine/scan-rules.js`에 분석 로직 추가
3. 템플릿 파일 생성 (`templates/새기술스택-template.json`)

## 📚 관련 문서

- [프로젝트 메타데이터 생성 가이드](./Project-Metadata-Generation-Guide.md)
- [메타데이터 관리 시나리오](./Metadata-Management-Scenarios.md)
- [AI 디자인 명령어 가이드](../AI-DESIGN-COMMAND-GUIDE.md)

---

## 🎉 완료!

이제 프로젝트 메타데이터 수집 시스템이 완전히 설정되었습니다. 

**다음 단계**:
1. `ai-metadata generate` 실행하여 메타데이터 생성
2. `ai-metadata validate` 실행하여 검증
3. `/ai-design your-image.png full` 실행하여 AI 화면 분석 시작

🚀 **한 번 설정으로 무제한 사용하세요!**