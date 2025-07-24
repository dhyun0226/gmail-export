# 📁 최종 폴더 구조 요약

## 정리된 구조

```
refactoring-simple/
├── AI-MAIN.md                     # 🚀 메인 AI 실행 가이드
├── README.md                      # 📖 프로젝트 소개
├── FILE-NAMING-CONVENTION.md      # 📝 네이밍 규칙
├── analyze-project-command.md     # 🔧 Claude Code 명령어
│
├── common/                        # 📚 공통 모듈
│   ├── refactoring-framework.md  # 핵심 방법론
│   └── project-analyzer.md       # 프로젝트 분석기
│
├── backend/                       # ☕ 백엔드 전용
│   ├── AI-BACKEND.md             # 백엔드 AI 실행 가이드
│   ├── project-config-template.md
│   ├── project-config-generator.md
│   └── stage-1/                  # 백엔드 단계별 가이드
│       ├── 01-self-refactoring.md
│       ├── 02-target-analysis.md
│       ├── 03-refactoring-plan.md
│       ├── 04-controller-refactoring.md
│       ├── 05-service-refactoring.md
│       ├── 06-mapper-refactoring.md
│       ├── 07-xml-refactoring.md
│       ├── 08-verification.md
│       └── 09-mapping-result.md
│
├── frontend/                      # 🎨 프론트엔드 전용
│   ├── AI-FRONTEND.md            # 프론트엔드 AI 실행 가이드
│   ├── project-config-template.md
│   ├── project-config-generator.md
│   └── stage-1/                  # 프론트엔드 단계별 가이드 (준비중)
│
├── templates/                     # 📋 JSON 템플릿
│   ├── dashboard-data-template.json
│   ├── dashboard-template.html
│   ├── data-mapping.json
│   ├── issues-template.json
│   ├── metrics-template.json
│   └── performance-template.json
│
└── trash/                         # 🗑️ 레거시 및 참고 문서
    ├── README-OLD.md
    ├── tech-stack-definition.md
    ├── project-config-*.md
    ├── frontend-refactoring-guide.md
    ├── project-type-detection.md
    ├── dashboard/
    └── report/
```

## 네이밍 규칙 적용 결과

### ✅ AI 실행 가이드 (대문자)
- `AI-MAIN.md`
- `AI-BACKEND.md`
- `AI-FRONTEND.md`

### ✅ 일반 문서 (소문자)
- `project-config-template.md`
- `project-config-generator.md`
- `refactoring-framework.md`
- `analyze-project-command.md`

### ✅ 단계별 가이드 (소문자)
- `01-self-refactoring.md`
- `02-target-analysis.md`
- `03-refactoring-plan.md`
- 등...

## 주요 변경사항

1. **파일명 정리**
   - AI 실행 가이드는 `AI-*.md` 패턴으로 통일
   - 일반 문서는 kebab-case로 통일
   - 불필요한 접두사 제거

2. **폴더 구조 개선**
   - backend/frontend 명확히 분리
   - common 폴더로 공통 모듈 분리
   - trash 폴더로 레거시 문서 이동

3. **중복 제거**
   - 최상위 중복 템플릿 제거
   - 통합된 가이드들을 trash로 이동

## 사용 가이드

1. **시작하기**
   ```bash
   /analyze-project  # 프로젝트 분석
   ```

2. **직접 실행**
   ```bash
   # 메인 가이드
   AI-MAIN.md
   
   # 타입별 가이드
   backend/AI-BACKEND.md
   frontend/AI-FRONTEND.md
   ```

3. **참조 문서**
   - `common/refactoring-framework.md` - 방법론
   - `FILE-NAMING-CONVENTION.md` - 네이밍 규칙
   - 각 폴더의 템플릿 및 생성기 문서