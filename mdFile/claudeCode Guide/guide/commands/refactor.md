# refactor - 지정된 클래스의 모든 의존성을 리팩토링

특정 클래스를 비즈니스 도메인별로 리팩토링합니다. Controller, Service, Mapper, MyBatis XML을 도메인별로 분리하여 코드 구조를 개선합니다.

## 사용법
```
/refactor {ClassName} [결과경로]
```

## 설명
이 명령어는 지정된 클래스와 관련된 코드를 도메인별로 리팩토링합니다:
- Controller 클래스 지정: Controller → Service → Mapper → XML 순차 리팩토링
- Service 클래스 지정: Service → Mapper → XML 순차 리팩토링
- Mapper 클래스 지정: Mapper → XML 순차 리팩토링

## 옵션
- ClassName: 리팩토링할 클래스명 (필수)
- 결과경로: 리팩토링 결과를 저장할 경로 (선택사항, 기본값: 현재 프로젝트의 refactored/)

## 예시
```bash
# Controller 전체 리팩토링
/refactor CustomerController

# Service부터 리팩토링
/refactor CustomerService

# 결과를 특정 경로에 저장
/refactor CustomerController /path/to/result
```

## 전제조건
- project-config.md 파일이 프로젝트 루트에 존재해야 함
- /analyze-project 명령어를 먼저 실행하여 프로젝트 구조 분석 완료

## 실행 가이드
이 명령어가 실행되면 다음 가이드를 순서대로 참조하여 실행하세요:

1. **사전 준비**
   - project-config.md 파일 확인
   - /mnt/c/guide/refactoring-simple/common/refactoring-framework.md 참조

2. **메인 가이드**
   - /mnt/c/guide/refactoring-simple/backend/AI-BACKEND.md

3. **단계별 실행 가이드** (순차 실행)
   - Stage 1: /mnt/c/guide/refactoring-simple/backend/stage-1/01-target-analysis.md
   - Stage 2: /mnt/c/guide/refactoring-simple/backend/stage-1/02-refactoring-plan.md
   - Stage 3: /mnt/c/guide/refactoring-simple/backend/stage-1/03-controller-refactoring.md
   - Stage 4: /mnt/c/guide/refactoring-simple/backend/stage-1/04-service-refactoring.md
   - Stage 5: /mnt/c/guide/refactoring-simple/backend/stage-1/05-mapper-refactoring.md
   - Stage 6: /mnt/c/guide/refactoring-simple/backend/stage-1/06-xml-refactoring.md
   - Stage 7: /mnt/c/guide/refactoring-simple/backend/stage-1/07-verification.md
   - Stage 8: /mnt/c/guide/refactoring-simple/backend/stage-1/08-mapping-result.md

## 출력
- refactoring-status.md: 리팩토링 진행 상태
- refactored/ 디렉토리: 리팩토링된 소스 코드
- mapping-result.md: 메소드 이동 매핑 문서

## 주요 원칙
- **기능 100% 유지**: URL 매핑, 메소드 시그니처, 비즈니스 로직 불변
- **도메인별 분리**: 비즈니스 도메인별로 명확한 패키지 구조
- **점진적 리팩토링**: 단계별 검증을 통한 안전한 진행
- **원본 보존**: 원본 파일은 수정하지 않고 새 파일 생성

## 다음 단계
리팩토링 완료 후:
```bash
# 리팩토링 결과 확인
cat refactoring-status.md

# 매핑 결과 확인
cat mapping-result.md
```
