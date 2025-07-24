# 독립적 리팩토링 가이드 사용법

## 개요
이 가이드는 Java Spring Boot 프로젝트를 비즈니스 도메인 단위로 리팩토링하는 독립적인 프레임워크입니다.

## 구성 요소

### 1. 핵심 가이드 문서
- **AI-SELF-REFACTORING.md**: AI가 실행하는 메인 가이드
- **refactoring-framework.md**: 프로젝트 독립적인 리팩토링 방법론
- **stage-1/*.md**: 단계별 상세 실행 가이드

### 2. 프로젝트별 설정
- **project-config-template.md**: 프로젝트 설정 템플릿
- **project-config.md**: 실제 프로젝트 설정 (프로젝트별 생성)

## 사용 방법

### 1단계: 프로젝트 설정 파일 생성
1. `project-config-template.md`를 참고하여 프로젝트 루트에 `project-config.md` 생성
2. 프로젝트별 경로, 패키지 구조 등 설정

### 2단계: AI 실행
1. AI에게 다음 순서로 파일 제공:
   - `refactoring-framework.md` (범용 가이드)
   - `project-config.md` (프로젝트별 설정)
   - `AI-SELF-REFACTORING.md` (실행 가이드)

2. 타겟 클래스명 제공:
   ```
   "VisitActionController를 리팩토링해주세요"
   ```

### 3단계: 결과 확인
- 리팩토링 결과는 설정한 경로에 도메인별로 분리되어 저장됨
- `refactoring-status.md`에서 진행 상황 확인
- `result/` 폴더에서 최종 보고서 확인

## 프로젝트 독립성 보장

### 분리된 구조
1. **프레임워크 레이어** (프로젝트 독립적)
   - 리팩토링 방법론
   - AI 실행 지침
   - 체크포인트 시스템
   - 품질 기준

2. **설정 레이어** (프로젝트별)
   - 프로젝트 경로
   - 패키지 구조
   - 명명 규칙
   - 출력 경로

### 장점
- 어떤 Java Spring Boot 프로젝트에도 적용 가능
- 프로젝트별 설정만 변경하여 재사용
- 리팩토링 방법론의 일관성 유지
- AI 실행의 표준화

## 커스터마이징

### 지원되는 변형
- Service vs Domain 레이어 명칭
- MyBatis vs JPA
- 다양한 명명 규칙
- 폴더 구조 커스터마이징

### 확장 가능한 영역
- 새로운 체크포인트 추가
- 추가 검증 단계
- 커스텀 리포트 템플릿
- 도메인별 특수 규칙

## 주의사항
1. Java 17 이상 프로젝트에서 사용 권장
2. Spring Boot 2.x / 3.x 호환
3. 프로젝트 설정 파일의 정확성이 중요
4. 원본 소스코드 백업 필수

## 문제 해결
- 경로를 찾을 수 없는 경우: project-config.md 경로 설정 확인
- 패키지 구조 불일치: basePackage 설정 확인
- MyBatis XML 미발견: xmlLocation 설정 확인