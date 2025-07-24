# Claude Code 커스텀 명령어 등록 가이드

## 📋 개요

Claude Code에 AI 프로젝트 정보 수집을 위한 커스텀 슬래시 커맨드를 등록하는 완전한 가이드입니다.

## 🎯 등록할 명령어 목록

### 1. 기존 명령어 (가이드에 포함됨)
- `/ai-design` - AI 화면 설계 및 코드 생성
- `/ai-metadata-generate` - 단일 프로젝트 메타데이터 생성
- `/ai-metadata-wizard` - 대화형 메타데이터 생성

### 2. 새로운 명령어
- `/ai-project-collect` - 분리된 프런트엔드/백엔드 프로젝트 정보 수집

## 🚀 Claude Code 명령어 등록 방법

### 방법 1: Claude Code 설정 파일 사용

#### 1. 프로젝트 루트에 설정 디렉토리 생성
```bash
mkdir -p .claude/commands
mkdir -p .claude/scripts
```

#### 2. 명령어 정의 파일 생성
```bash
# .claude/commands/ai-commands.json
```

```json
{
  "version": "1.0.0",
  "commands": [
    {
      "name": "ai-design",
      "description": "이미지를 분석하여 UI 와이어프레임과 프로그램 사양서 생성",
      "usage": "/ai-design [이미지파일] [생성옵션] [화면타입] [메타데이터옵션]",
      "parameters": {
        "image": {
          "type": "file",
          "required": true,
          "description": "분석할 UI 이미지 파일",
          "extensions": [".png", ".jpg", ".jpeg", ".webp"]
        },
        "output": {
          "type": "enum",
          "default": "both",
          "choices": ["wireframe", "spec", "both", "full"],
          "description": "생성할 문서 타입"
        },
        "screenType": {
          "type": "enum",
          "default": "auto",
          "choices": ["crud", "dashboard", "form", "popup", "auto"],
          "description": "화면 유형"
        },
        "metadata": {
          "type": "string",
          "default": "auto",
          "description": "메타데이터 옵션"
        }
      },
      "script": ".claude/scripts/ai-design.js"
    },
    {
      "name": "ai-metadata-generate",
      "description": "프로젝트를 스캔하여 메타데이터 자동 생성",
      "usage": "/ai-metadata-generate [프로젝트경로] [스캔모드]",
      "parameters": {
        "path": {
          "type": "path",
          "default": ".",
          "description": "스캔할 프로젝트 경로"
        },
        "mode": {
          "type": "enum",
          "default": "standard",
          "choices": ["fast", "standard", "deep"],
          "description": "스캔 모드"
        }
      },
      "script": ".claude/scripts/ai-metadata-generate.js"
    },
    {
      "name": "ai-project-collect",
      "description": "분리된 프런트엔드/백엔드 프로젝트 정보 수집",
      "usage": "/ai-project-collect --frontend=경로 --backend=경로 [옵션]",
      "parameters": {
        "frontend": {
          "type": "path",
          "required": true,
          "description": "프런트엔드 프로젝트 경로",
          "flag": true
        },
        "backend": {
          "type": "path",
          "required": true,
          "description": "백엔드 프로젝트 경로",
          "flag": true
        },
        "output": {
          "type": "path",
          "default": "./.ai-metadata",
          "description": "메타데이터 출력 경로",
          "flag": true
        },
        "mode": {
          "type": "enum",
          "default": "standard",
          "choices": ["fast", "standard", "deep"],
          "description": "스캔 모드",
          "flag": true
        },
        "merge-strategy": {
          "type": "enum",
          "default": "smart",
          "choices": ["smart", "manual", "template"],
          "description": "병합 전략",
          "flag": true
        },
        "interactive": {
          "type": "boolean",
          "default": false,
          "description": "대화형 모드",
          "flag": true,
          "alias": "i"
        }
      },
      "script": ".claude/scripts/ai-project-collect.js"
    },
    {
      "name": "ai-metadata-wizard",
      "description": "대화형 메타데이터 생성 마법사",
      "usage": "/ai-metadata-wizard",
      "parameters": {},
      "script": ".claude/scripts/ai-metadata-wizard.js"
    }
  ]
}
```

#### 3. 실행 스크립트 생성

각 명령어에 대한 실행 스크립트를 `.claude/scripts/` 디렉토리에 생성합니다.

**ai-project-collect.js** (이미 위에서 제공됨)

**ai-design.js 예시**:
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class AIDesignCommand {
  async execute(args) {
    const { image, output, screenType, metadata } = args;
    
    // 메타데이터 확인
    const metadataPath = metadata === 'auto' 
      ? './.ai-metadata/project-metadata.json'
      : metadata;
    
    if (!fs.existsSync(metadataPath)) {
      console.log('⚠️  메타데이터를 찾을 수 없습니다.');
      console.log('💡 먼저 /ai-metadata-generate 또는 /ai-project-collect 명령어를 실행하세요.');
      return;
    }
    
    // AI 분석 실행
    console.log('🖼️  이미지 분석 시작:', image);
    console.log('📋 메타데이터 로드:', metadataPath);
    
    // 실제 AI 분석 로직...
    
    console.log('✅ 분석 완료!');
  }
}

// CLI 실행
if (require.main === module) {
  const command = new AIDesignCommand();
  // 파라미터 파싱 로직...
  command.execute(parsedArgs);
}
```

### 방법 2: CLAUDE.md 파일 사용

프로젝트 루트에 `CLAUDE.md` 파일을 생성하여 명령어를 문서화합니다.

```markdown
# CLAUDE.md - AI Design System Commands

## 프로젝트 개요
이 프로젝트는 AI 기반 화면 설계 및 코드 생성 시스템입니다.

## 사용 가능한 명령어

### /ai-project-collect
분리된 프런트엔드와 백엔드 프로젝트의 정보를 수집합니다.

**사용법:**
```bash
/ai-project-collect --frontend=./vue-app --backend=./spring-api
```

**옵션:**
- `--frontend`: 프런트엔드 프로젝트 경로 (필수)
- `--backend`: 백엔드 프로젝트 경로 (필수)
- `--output`: 메타데이터 저장 경로 (기본: ./.ai-metadata)
- `--mode`: 스캔 모드 (fast|standard|deep)
- `--interactive` 또는 `-i`: 대화형 모드

### /ai-design
이미지를 분석하여 코드를 생성합니다.

**사용법:**
```bash
/ai-design ./design.png full
```

### /ai-metadata-generate
단일 프로젝트의 메타데이터를 생성합니다.

**사용법:**
```bash
/ai-metadata-generate . deep
```
```

### 방법 3: 글로벌 설치 (npm 패키지)

#### 1. package.json 생성
```json
{
  "name": "@ai-design/claude-commands",
  "version": "1.0.0",
  "description": "AI Design System Commands for Claude Code",
  "bin": {
    "ai-project-collect": "./bin/ai-project-collect.js",
    "ai-design": "./bin/ai-design.js",
    "ai-metadata-generate": "./bin/ai-metadata-generate.js"
  },
  "scripts": {
    "postinstall": "node ./scripts/register-commands.js"
  },
  "dependencies": {
    "inquirer": "^8.2.5",
    "chalk": "^4.1.2",
    "ora": "^5.4.1",
    "commander": "^9.4.1"
  }
}
```

#### 2. 설치 스크립트
```javascript
// scripts/register-commands.js
const fs = require('fs');
const path = require('path');
const os = require('os');

// Claude Code 설정 디렉토리 찾기
const claudeConfigDir = path.join(os.homedir(), '.claude', 'commands');

// 명령어 등록
const commands = require('../commands.json');

fs.mkdirSync(claudeConfigDir, { recursive: true });
fs.writeFileSync(
  path.join(claudeConfigDir, 'ai-design-commands.json'),
  JSON.stringify(commands, null, 2)
);

console.log('✅ AI Design 명령어가 Claude Code에 등록되었습니다!');
```

#### 3. 글로벌 설치
```bash
npm install -g @ai-design/claude-commands
```

## 🔧 명령어 테스트 및 디버깅

### 1. 로컬 테스트
```bash
# 직접 실행
node .claude/scripts/ai-project-collect.js --frontend=./fe --backend=./be

# 디버그 모드
DEBUG=* node .claude/scripts/ai-project-collect.js --frontend=./fe --backend=./be
```

### 2. Claude Code에서 테스트
```bash
# Claude Code 열기
claude

# 명령어 실행
/ai-project-collect --interactive
```

### 3. 로그 확인
```bash
# Claude Code 로그 위치
tail -f ~/.claude/logs/commands.log
```

## 📊 명령어 사용 워크플로우

```mermaid
graph LR
    A[새 프로젝트 시작] --> B{프로젝트 구조?}
    B -->|통합| C[/ai-metadata-generate]
    B -->|분리| D[/ai-project-collect]
    
    C --> E[메타데이터 생성]
    D --> E
    
    E --> F[/ai-design 이미지 full]
    F --> G[코드 생성 완료]
    
    G --> H[Pilot 폴더에서 테스트]
    H --> I[기존 프로젝트에 통합]
```

## 🚨 문제 해결

### 명령어가 인식되지 않는 경우
```bash
# Claude Code 명령어 캐시 재구성
claude --rebuild-cache

# 명령어 목록 확인
claude --list-commands | grep ai-
```

### 권한 문제
```bash
# 실행 권한 부여
chmod +x .claude/scripts/*.js
```

### 의존성 문제
```bash
# 프로젝트 루트에서
npm install inquirer chalk ora commander
```

## 📚 추가 리소스

### 명령어 개발 가이드
- [Claude Code SDK 문서](https://docs.anthropic.com/claude-code/sdk)
- [커스텀 명령어 API](https://docs.anthropic.com/claude-code/commands)

### 예제 프로젝트
- [AI Design Commands 저장소](https://github.com/ai-design/claude-commands)
- [샘플 프로젝트](https://github.com/ai-design/examples)

## 🎉 완료!

이제 Claude Code에서 다음 명령어들을 사용할 수 있습니다:

```bash
# 분리된 프로젝트 정보 수집
/ai-project-collect --frontend=./vue-app --backend=./spring-api

# 대화형 모드로 수집
/ai-project-collect -i

# 수집된 메타데이터로 AI 화면 설계
/ai-design ./mockup.png full
```

**팁**: 자주 사용하는 명령어는 별칭(alias)으로 등록하면 더욱 편리합니다!

```bash
# .claude/config.json
{
  "aliases": {
    "apc": "ai-project-collect",
    "ad": "ai-design",
    "amg": "ai-metadata-generate"
  }
}
```