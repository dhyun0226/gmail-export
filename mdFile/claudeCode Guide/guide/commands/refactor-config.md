# analyze-project - 리팩토링을 위한 프로젝트 분석

프로젝트 구조를 자동으로 분석하여 리팩토링을 위한 project-config.md 설정 파일을 생성합니다.

## 사용법
```
/analyze-project [프로젝트경로]
```

## 설명
이 명령어는 백엔드와 프런트엔드 프로젝트의 구조를 자동으로 분석하여:
- 프로젝트 기본 정보 감지
- 패키지 구조 분석
- 기술 스택 확인
- 네이밍 컨벤션 파악
- project-config.md 파일 생성

## 옵션
- 프로젝트경로: 분석할 프로젝트의 루트 경로 (선택사항, 기본값: 현재 디렉토리)

## 예시
```bash
# 현재 디렉토리 분석
/analyze-project

# 특정 경로 분석
/analyze-project /path/to/my-project
```

## 실행 가이드
이 명령어가 실행되면 다음 파일들을 순서대로 참조하여 실행하세요:

1. **project-analyzer.md** - 프로젝트 자동 분석 가이드
   - 위치: /mnt/c/guide/refactoring-simple/project-analyzer.md
   - 백엔드 혹은 프런트엔드 프로젝트인지 파악하여 [backend | frontend] 프로젝트 설정 파일을 생성

2. **project-config-generator.md** - 설정 생성 상세 가이드
   - 위치: /mnt/c/guide/refactoring-simple/[backend | frontend]/project-config-generator.md
   - 감지된 정보를 바탕으로 project-config.md 생성

3. **project-config-template.md** - 설정 템플릿
   - 위치: /mnt/c/guide/refactoring-simple/[backend | frontend]/project-config-template.md
   - 생성될 설정 파일의 구조 참조

## 출력
- `project-config.md` 파일이 프로젝트 루트에 생성됩니다.
- 분석 결과 요약이 콘솔에 표시됩니다.

## 다음 단계
project-config.md 생성 후:
```bash
/refactor {ClassName}  # 특정 클래스 리팩토링
/smart-refactor {ClassName}  # 자동 분석 + 리팩토링
```
