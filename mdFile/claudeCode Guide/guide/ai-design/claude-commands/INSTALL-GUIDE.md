# Claude Code 명령어 설치 가이드

## 📋 개요

이 가이드는 `/ai-design-config` 명령어를 Claude Code에 등록하는 방법을 안내합니다.

## 🚀 설치 방법

### 1. 명령어 파일 복사

홈 디렉토리의 `.claude/commands` 폴더에 명령어 파일을 복사합니다:

#### Windows (PowerShell)
```powershell
# .claude/commands 디렉토리 생성
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\commands"

# 명령어 파일 복사
Copy-Item "claude-commands\ai-design-config.json" "$env:USERPROFILE\.claude\commands\"
```

#### macOS/Linux
```bash
# .claude/commands 디렉토리 생성
mkdir -p ~/.claude/commands

# 명령어 파일 복사
cp claude-commands/ai-design-config.json ~/.claude/commands/
```

### 2. CLAUDE.md 파일 생성/업데이트

프로젝트 루트에 `CLAUDE.md` 파일을 생성하거나 업데이트합니다:

```markdown
# CLAUDE.md - AI Design System Commands

## 프로젝트 개요
이 프로젝트는 AI 기반 화면 설계 및 코드 생성 시스템입니다.

## 커스텀 명령어 정의

### /ai-design-config
프로젝트 구성을 감지하여 설정 정보를 수집하거나, 프로젝트가 없을 경우 기본 설정을 제공합니다.

**실행 방법:**
1. 현재 디렉토리에서 프런트엔드와 백엔드 프로젝트 디렉토리를 찾습니다
2. 프로젝트가 없으면 기본 설정 템플릿 사용 여부를 물어봅니다
3. 분석 결과를 바탕으로 다음 파일을 생성합니다:
   - frontend-config.md: 프런트엔드 프로젝트 설정 정보
   - backend-config.md: 백엔드 프로젝트 설정 정보

**기본 설정:**
- 프런트엔드: Vue 3, Bootstrap 5, Pinia, TypeScript
- 백엔드: Java 21, Spring Boot 3.4, MariaDB, MyBatis

### /ai-project-init [옵션]
설정 파일을 기반으로 실제 프로젝트 구조를 생성하고 의존성을 설정합니다.

**옵션:**
- `--frontend-only`: 프런트엔드만 초기화
- `--backend-only`: 백엔드만 초기화
- `--skip-install`: 의존성 설치 건너뛰기
- `--force`: 기존 파일 덮어쓰기

### /ai-design [이미지파일] [옵션]
이미지를 분석하여 UI 와이어프레임, 프로그램 사양서, 프로덕션 코드를 생성합니다.

**생성 옵션:**
- `wireframe`: UI 와이어프레임만 생성
- `spec`: 프로그램 사양서만 생성
- `both`: 와이어프레임과 사양서 생성 (기본값)
- `full`: 와이어프레임, 사양서, 실제 코드까지 생성
```

### 3. Claude Code 재시작

명령어가 적용되도록 Claude Code를 재시작합니다.

## 🔍 설치 확인

다음 명령어로 설치를 확인합니다:

```bash
# 프로젝트 디렉토리에서
/ai-design-config

# 출력 예시:
🔍 프로젝트 구조를 분석 중입니다...
```

## 📁 파일 구조

설치 후 파일 구조:

```
$HOME/
├── .claude/
│   └── commands/
│       └── ai-design-config.json
└── your-project/
    ├── CLAUDE.md
    ├── frontend-config.md (생성됨)
    └── backend-config.md (생성됨)
```

## 🎯 사용 시나리오

### 신규 프로젝트
```bash
mkdir my-new-project
cd my-new-project
/ai-design-config
# → 기본 설정으로 config 파일 생성
```

### 기존 프로젝트
```bash
cd existing-project
/ai-design-config
# → 프로젝트 분석 후 config 파일 생성
```

## 🔧 문제 해결

### 명령어가 인식되지 않는 경우

1. **파일 위치 확인**
   ```bash
   # Windows
   dir %USERPROFILE%\.claude\commands\ai-design-config.json
   
   # macOS/Linux
   ls ~/.claude/commands/ai-design-config.json
   ```

2. **CLAUDE.md 파일 확인**
   - 프로젝트 루트에 CLAUDE.md 파일이 있는지 확인
   - 명령어 정의가 올바르게 되어 있는지 확인

3. **Claude Code 재시작**
   - Claude Code를 완전히 종료 후 재시작

### 권한 문제

```bash
# macOS/Linux에서 권한 설정
chmod 644 ~/.claude/commands/ai-design-config.json
```

## 📚 관련 문서

- [AI-DESIGN-CONFIG-GUIDE.md](../AI-DESIGN-CONFIG-GUIDE.md) - 명령어 사용 가이드
- [AI-PROJECT-INIT-GUIDE.md](../AI-PROJECT-INIT-GUIDE.md) - 프로젝트 초기화 가이드
- [CLAUDE-CODE-COMMANDS-GUIDE.md](../CLAUDE-CODE-COMMANDS-GUIDE.md) - 명령어 등록 가이드

## 🆘 지원

문제가 지속되면 다음을 확인하세요:
1. Claude Code 버전이 최신인지 확인
2. 파일 인코딩이 UTF-8인지 확인
3. JSON 파일 형식이 올바른지 확인 (JSON 검증 도구 사용)