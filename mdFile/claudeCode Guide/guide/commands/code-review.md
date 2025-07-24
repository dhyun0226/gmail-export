# code-review - 지정된 파일이나 디렉토리의 코드 리뷰 수행

특정 파일이나 디렉토리의 코드를 분석하여 개선사항, 보안 이슈, 코드 품질을 체계적으로 리뷰합니다.

## 사용법
```
/code-review {파일/디렉토리경로} [리뷰유형] [결과경로]
```

## 설명
이 명령어는 지정된 코드를 다각도로 분석하여 리뷰합니다:
- 단일 파일 리뷰: 해당 파일의 상세 분석
- 디렉토리 리뷰: 디렉토리 내 모든 소스 파일 분석
- 리뷰 유형별 집중 분석 지원

## 옵션
- 파일/디렉토리경로: 리뷰할 대상 경로 (필수)
- 리뷰유형: basic|security|performance|architecture (선택사항, 기본값: basic)
- 결과경로: 리뷰 결과를 저장할 경로 (선택사항, 기본값: 현재 디렉토리의 code-review-results/)

## 리뷰 유형
- **basic**: 일반적인 코드 품질, 가독성, 유지보수성
- **security**: 보안 취약점, 인증/인가, 데이터 보호
- **performance**: 성능 병목, 최적화 기회, 리소스 사용
- **architecture**: 설계 패턴, 의존성, 구조적 개선점

## 예시
```bash
# 단일 파일 기본 리뷰
/code-review src/service/UserService.java

# 디렉토리 보안 리뷰
/code-review src/controller security

# 전체 프로젝트 아키텍처 리뷰
/code-review . architecture /tmp/review-results
```

## 전제조건
- 소스 코드가 존재하는 프로젝트 디렉토리
- 코드 파일의 읽기 권한

## 실행 가이드
이 명령어가 실행되면 다음 가이드를 순서대로 참조하여 실행하세요:

1. **사전 준비**
   - 대상 파일/디렉토리 존재 확인
   - /mnt/c/guide/ai-analysis/common/analysis-framework.md 참조

2. **메인 가이드**
   - /mnt/c/guide/ai-analysis/backend/AI-CODE-REVIEW.md

3. **단계별 실행 가이드** (순차 실행)
   - Stage 1: /mnt/c/guide/ai-analysis/backend/stage-1/01-target-discovery.md
   - Stage 2: /mnt/c/guide/ai-analysis/backend/stage-1/02-code-parsing.md
   - Stage 3: /mnt/c/guide/ai-analysis/backend/stage-1/03-quality-analysis.md
   - Stage 4: /mnt/c/guide/ai-analysis/backend/stage-1/04-security-analysis.md
   - Stage 5: /mnt/c/guide/ai-analysis/backend/stage-1/05-performance-analysis.md
   - Stage 6: /mnt/c/guide/ai-analysis/backend/stage-1/06-architecture-analysis.md
   - Stage 7: /mnt/c/guide/ai-analysis/backend/stage-1/07-report-generation.md

## 출력
- code-review-summary.md: 리뷰 요약 보고서
- code-review-detail.md: 상세 분석 결과
- issues-found.md: 발견된 이슈 목록
- improvement-suggestions.md: 개선 제안사항

## 리뷰 기준
- **코드 품질**: 가독성, 일관성, 재사용성
- **보안**: OWASP Top 10, 인증/인가, 데이터 보호
- **성능**: 시간/공간 복잡도, 리소스 사용, 병목현상
- **아키텍처**: SOLID 원칙, 디자인 패턴, 의존성 관리

## 심각도 레벨
- **Critical**: 즉시 수정 필요한 중대 이슈
- **High**: 중요한 개선사항
- **Medium**: 권장되는 개선사항
- **Low**: 선택적 개선사항
- **Info**: 참고사항

## 다음 단계
리뷰 완료 후:
```bash
# 리뷰 요약 확인
cat code-review-summary.md

# 발견된 이슈 확인
cat issues-found.md

# 개선 제안사항 확인
cat improvement-suggestions.md
```