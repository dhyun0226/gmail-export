# refactor-config 명령어 등록 가이드

## Claude Code commands 디렉토리 위치
- macOS/Linux: `~/.claude/commands/`
- Windows: `%APPDATA%\claude\commands\`

## 명령어 파일 생성

### 1. 파일명: `refactor-config.md`

### 2. 파일 내용:

```markdown
# refactor-config

프로젝트 구조를 자동으로 분석하여 리팩토링을 위한 project-config.md 설정 파일을 생성합니다.

## 사용법
```
/refactor-config [프로젝트경로]
```

## 설명
이 명령어는 프로젝트 타입을 자동으로 감지하여:
- 백엔드 프로젝트 (Java/Spring Boot, Python, Go 등)
- 프론트엔드 프로젝트 (React, Vue, Angular 등)
- 프로젝트 구조 분석
- 기술 스택 확인
- project-config.md 파일 생성

## 옵션
- 프로젝트경로: 분석할 프로젝트의 루트 경로 (선택사항, 기본값: 현재 디렉토리)

## 예시
```bash
# 현재 디렉토리 분석
/refactor-config

# 특정 경로 분석
/refactor-config /path/to/my-project
```

## 실행 가이드
이 명령어가 실행되면 다음 파일을 참조하여 실행하세요:

**common/project-analyzer.md** - 프로젝트 자동 분석 가이드
- 위치: /mnt/c/guide/refactoring-simple/common/project-analyzer.md
- 프로젝트 타입을 자동 감지하고 적절한 generator 실행

## 실행 흐름
1. 프로젝트 타입 자동 감지 (백엔드/프론트엔드)
2. 타입에 맞는 project-config-generator.md 실행
   - 백엔드: backend/project-config-generator.md
   - 프론트엔드: frontend/project-config-generator.md
3. project-config.md 생성

## 출력
- `project-config.md` 파일이 프로젝트 루트에 생성됩니다.
- 분석 결과 요약이 콘솔에 표시됩니다.

## 다음 단계
project-config.md 생성 후:
```bash
# AI-MAIN.md 실행하여 리팩토링 시작
"AI-MAIN.md로 리팩토링 시작해줘"
```
```

## 명령어 등록 방법

### macOS/Linux:
```bash
# 디렉토리 생성 (없는 경우)
mkdir -p ~/.claude/commands/

# 명령어 파일 생성
cat > ~/.claude/commands/refactor-config.md << 'EOF'
[위의 파일 내용 붙여넣기]
EOF
```

### Windows (PowerShell):
```powershell
# 디렉토리 생성 (없는 경우)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\claude\commands"

# 명령어 파일 생성
@"
[위의 파일 내용 붙여넣기]
"@ | Out-File -FilePath "$env:APPDATA\claude\commands\refactor-config.md" -Encoding UTF8
```

## 명령어 등록 확인
Claude Code를 재시작하거나 다음 명령어로 확인:
```
/help
```

refactor-config가 명령어 목록에 표시되면 성공!