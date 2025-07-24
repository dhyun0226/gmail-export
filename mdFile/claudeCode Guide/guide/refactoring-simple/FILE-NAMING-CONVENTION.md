# 📝 파일 네이밍 컨벤션

## 네이밍 규칙

### 1. AI 실행 가이드 (AI-*.md)
- **패턴**: `AI-{PURPOSE}.md`
- **케이스**: SCREAMING-SNAKE-CASE (모두 대문자)
- **용도**: AI가 직접 실행하는 메인 가이드
- **예시**:
  - `AI-MAIN.md` - 메인 진입점
  - `AI-BACKEND.md` - 백엔드 실행 가이드
  - `AI-FRONTEND.md` - 프론트엔드 실행 가이드

### 2. 일반 문서 (*.md)
- **패턴**: `{purpose}.md`
- **케이스**: kebab-case (모두 소문자, 하이픈 구분)
- **용도**: 설정, 템플릿, 참조 문서
- **예시**:
  - `project-config-template.md` - 설정 템플릿
  - `project-config-generator.md` - 설정 생성기
  - `refactoring-framework.md` - 프레임워크 문서
  - `analyze-project-command.md` - 명령어 문서

### 3. 단계별 가이드 (stage-1/*.md)
- **패턴**: `{number}-{purpose}.md`
- **케이스**: kebab-case (모두 소문자)
- **용도**: 순차적 실행 단계
- **예시**:
  - `01-target-analysis.md`
  - `02-controller-refactoring.md`
  - `03-service-refactoring.md`

### 4. 특수 파일
- `README.md` - GitHub 관례
- `LICENSE` - 확장자 없음, 대문자
- `.gitignore` - 숨김 파일

## 폴더 네이밍
- **케이스**: kebab-case (모두 소문자)
- **예시**:
  - `backend/`
  - `frontend/`
  - `common/`
  - `stage-1/`
  - `trash/`

## 네이밍 선택 이유

### AI-*.md 대문자 사용 이유
1. **시각적 구분**: 파일 목록에서 즉시 식별 가능
2. **중요도 표현**: AI가 실행하는 핵심 파일임을 강조
3. **필터링 용이**: `ls AI-*` 명령으로 쉽게 필터링
4. **의도 전달**: "이 파일을 AI에게 주면 실행된다"는 의미

### 일반 문서 소문자 사용 이유
1. **일관성**: 대부분의 개발 문서 관례
2. **가독성**: 긴 파일명에서 읽기 편함
3. **URL 친화적**: 웹에서 사용시 편리
4. **타이핑 용이**: shift 키 사용 최소화

## 예시 디렉토리 구조

```
refactoring-simple/
├── AI-MAIN.md                    # ✅ AI 실행 가이드
├── README.md                     # ✅ 특수 파일
├── analyze-project-command.md    # ✅ 일반 문서
├── backend/
│   ├── AI-BACKEND.md            # ✅ AI 실행 가이드
│   ├── project-config-template.md # ✅ 일반 문서
│   └── stage-1/
│       ├── 01-target-analysis.md # ✅ 단계별 가이드
│       └── 02-refactoring.md    # ✅ 단계별 가이드
└── frontend/
    ├── AI-FRONTEND.md           # ✅ AI 실행 가이드
    └── project-config-template.md # ✅ 일반 문서
```