# 프로젝트 메타데이터 관리 시나리오 가이드

## 📋 개요

실제 개발 현장에서 발생하는 다양한 상황별 메타데이터 관리 방법을 제시합니다. 각 시나리오는 **구체적인 명령어와 예상 결과**를 포함하여 즉시 적용 가능합니다.

## 🎯 시나리오 분류

### 📚 목차
1. [초기 설정 시나리오](#1-초기-설정-시나리오)
2. [팀 협업 시나리오](#2-팀-협업-시나리오)
3. [기술스택 변경 시나리오](#3-기술스택-변경-시나리오)
4. [프로젝트 확장 시나리오](#4-프로젝트-확장-시나리오)
5. [문제 해결 시나리오](#5-문제-해결-시나리오)
6. [유지보수 시나리오](#6-유지보수-시나리오)

---

## 1. 초기 설정 시나리오

### 🆕 시나리오 1.1: 새 프로젝트 시작

**상황**: 새로운 Vue 3 + Spring Boot 프로젝트를 시작하는 경우

**단계별 가이드**:
```bash
# 1단계: 프로젝트 디렉토리 생성
mkdir my-enterprise-app
cd my-enterprise-app

# 2단계: 기본 프로젝트 구조 생성
npm create vue@latest frontend
mkdir backend

# 3단계: 메타데이터 자동 생성
/ai-metadata-generate . deep

# 예상 출력:
🔍 프로젝트 스캔 중...
📦 Frontend: Vue 3.4.32 + TypeScript 감지
🏗️ Backend: Spring Boot 프로젝트 구조 감지
🎨 UI 라이브러리: Bootstrap Vue Next 권장
💾 메타데이터 생성: .ai-metadata/project-metadata.json
✅ 초기 설정 완료!

# 4단계: 메타데이터 검증
/ai-metadata-validate
# ✅ 모든 검증 통과

# 5단계: 첫 번째 AI 화면 분석
/ai-design ./wireframe.png full
```

**결과**: 표준화된 메타데이터 기반으로 일관된 코드 생성 환경 구축

### 🔄 시나리오 1.2: 기존 프로젝트에 AI 도구 도입

**상황**: 이미 개발 중인 프로젝트에 AI 화면 설계 도구를 도입하는 경우

**단계별 가이드**:
```bash
# 1단계: 현재 프로젝트 상태 확인
ls -la
# frontend/, backend/, package.json, pom.xml 등 확인

# 2단계: 기존 설정 기반 메타데이터 생성
/ai-metadata-generate . standard --existing-project

# 예상 출력:
🔍 기존 프로젝트 분석 중...
📦 의존성 분석: package.json, pom.xml
🏗️ 아키텍처 분석: src/ 구조 기반
🎨 UI 패턴 분석: 기존 컴포넌트 스캔
⚠️  경고: DevExtreme 라이선스 확인 필요
💾 메타데이터 생성 완료

# 3단계: 기존 코드와 호환성 확인
/ai-metadata-compatibility-check

# 4단계: 필요시 메타데이터 커스터마이징
/ai-metadata-edit
```

**결과**: 기존 프로젝트 패턴을 유지하면서 AI 도구 활용 가능

### 🎨 시나리오 1.3: 템플릿 기반 빠른 시작

**상황**: 검증된 템플릿을 사용하여 빠르게 프로젝트를 시작하는 경우

**단계별 가이드**:
```bash
# 1단계: 사용 가능한 템플릿 확인
/ai-metadata-templates

# 예상 출력:
📋 사용 가능한 템플릿
━━━━━━━━━━━━━━━━━━━━━━━━
🎯 공식 템플릿:
  1) vue3-springboot    - Vue 3 + Spring Boot + PostgreSQL
  2) react-nodejs       - React 18 + Express + MongoDB  
  3) angular-dotnet     - Angular 15 + ASP.NET Core + SQL Server

🏢 도메인 특화 템플릿:
  4) ecommerce-vue      - 전자상거래 특화 (Vue + Spring)
  5) finance-react      - 금융 특화 (React + Spring)

# 2단계: 템플릿 적용
/ai-metadata-apply vue3-springboot

# 3단계: 프로젝트 정보 커스터마이징
/ai-metadata-customize
> 프로젝트명: inventory-management
> 도메인: warehouse
> 팀 정보: logistics-team@company.com

# 4단계: 적용 결과 확인
/ai-metadata-info
```

**결과**: 모범 사례가 적용된 메타데이터로 고품질 코드 생성 기반 마련

---

## 2. 팀 협업 시나리오

### 👥 시나리오 2.1: 팀 표준 메타데이터 구축

**상황**: 개발팀에서 공통 표준을 정의하고 모든 프로젝트에 적용하는 경우

**팀 리더 작업**:
```bash
# 1단계: 마스터 메타데이터 생성
/ai-metadata-generate . deep --team-standard

# 2단계: 팀 표준 규칙 추가
/ai-metadata-edit --section=standards
# 네이밍 컨벤션, 코딩 스타일, 보안 정책 등 추가

# 3단계: 검증 규칙 설정
/ai-metadata-set-validation-rules
# 필수 컴포넌트, 금지 패턴, 성능 임계값 등 설정

# 4단계: 팀 템플릿으로 저장
/ai-metadata-save-as-template company-standard-vue3

# 5단계: Git 저장소에 커밋
git add .ai-metadata/
git commit -m "feat: Add team standard metadata template"
git push
```

**팀원 작업**:
```bash
# 1단계: 최신 메타데이터 동기화
git pull

# 2단계: 팀 표준 적용
/ai-metadata-apply company-standard-vue3

# 3단계: AI 화면 분석 시작
/ai-design ./my-feature.png full
# 자동으로 팀 표준이 적용된 코드 생성
```

**결과**: 팀 전체가 동일한 패턴과 표준으로 개발, 코드 리뷰 시간 단축

### 🔄 시나리오 2.2: 다중 프로젝트 메타데이터 관리

**상황**: 여러 프로젝트를 동시에 진행하는 팀에서 메타데이터를 효율적으로 관리하는 경우

**프로젝트별 설정**:
```bash
# 프로젝트 A (웹 애플리케이션)
cd project-web
/ai-metadata-apply vue3-springboot
/ai-metadata-set-domain ecommerce

# 프로젝트 B (모바일 API)
cd ../project-mobile-api  
/ai-metadata-apply react-nodejs
/ai-metadata-set-domain mobile

# 프로젝트 C (관리자 포털)
cd ../project-admin
/ai-metadata-apply vue3-springboot
/ai-metadata-set-domain enterprise
```

**공통 설정 관리**:
```bash
# 공통 메타데이터 저장소 생성
mkdir shared-metadata

# 공통 컴포넌트 매핑 생성
/ai-metadata-create-shared-mappings ./shared-metadata/

# 각 프로젝트에서 공통 설정 참조
/ai-metadata-link ../shared-metadata/common-mappings.json
```

**결과**: 프로젝트별 특성을 유지하면서 공통 표준 적용

### 📊 시나리오 2.3: 메타데이터 품질 관리

**상황**: 팀에서 메타데이터 품질을 지속적으로 관리하고 개선하는 경우

**품질 검증 자동화**:
```bash
# CI/CD 파이프라인에 추가할 스크립트
# .github/workflows/metadata-check.yml

name: Metadata Quality Check
on: [push, pull_request]
jobs:
  metadata-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Metadata
        run: |
          /ai-metadata-validate --strict
          /ai-metadata-security-check
          /ai-metadata-performance-check
      - name: Quality Report
        run: /ai-metadata-quality-report --output=report.json
```

**품질 지표 모니터링**:
```bash
# 주간 품질 리포트 생성
/ai-metadata-quality-report --period=week

# 예상 출력:
📊 메타데이터 품질 리포트 (2025-07-01 ~ 2025-07-07)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 전체 품질 점수: 92/100 (↗️ +3)
🎯 컴포넌트 매핑 정확도: 96.2% (↗️ +1.2%)
⚡ 코드 생성 성공률: 98.7% (→ 0%)
🔒 보안 규칙 준수율: 100% (→ 0%)

📋 개선 권장사항:
  1. DevExtreme 라이선스 정보 업데이트 필요
  2. 새로운 Bootstrap 5.4 버전 적용 검토
  3. TypeScript 5.1 마이그레이션 계획 수립
```

**결과**: 지속적인 품질 개선과 팀 전체 개발 생산성 향상

---

## 3. 기술스택 변경 시나리오

### 🔄 시나리오 3.1: Vue 2 → Vue 3 마이그레이션

**상황**: 기존 Vue 2 프로젝트를 Vue 3으로 업그레이드하는 경우

**마이그레이션 전 준비**:
```bash
# 1단계: 현재 메타데이터 백업
/ai-metadata-backup vue2-backup-$(date +%Y%m%d)

# 2단계: 마이그레이션 호환성 검사
/ai-metadata-migration-check vue2-to-vue3

# 예상 출력:
🔍 Vue 2 → Vue 3 마이그레이션 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 호환 가능: Pinia (Vuex 대체)
✅ 호환 가능: Vue Router 4
⚠️  변경 필요: Vue 3 Composition API
⚠️  변경 필요: Bootstrap Vue Next
❌ 호환 불가: Vue 2 전용 플러그인 3개

📋 마이그레이션 계획:
  1. Vue 3.4.32 업그레이드
  2. Composition API 전환
  3. Bootstrap Vue Next 설치
  4. 비호환 플러그인 대체
```

**단계별 마이그레이션**:
```bash
# 3단계: 자동 마이그레이션 실행
/ai-metadata-migrate vue2-to-vue3 --auto

# 4단계: 수동 검토 및 수정
/ai-metadata-edit --section=frontend
# Composition API 패턴, 새로운 라이프사이클 훅 등 설정

# 5단계: 마이그레이션 검증
/ai-metadata-validate --migration-check

# 6단계: 테스트 화면으로 검증
/ai-design ./test-screen.png full
# Vue 3 기반 코드 생성 확인
```

**결과**: 기존 프로젝트 구조를 유지하면서 최신 기술스택으로 업그레이드

### 📱 시나리오 3.2: 새로운 UI 라이브러리 도입

**상황**: Bootstrap에서 Material-UI로 변경하는 경우

**라이브러리 변경 과정**:
```bash
# 1단계: 현재 컴포넌트 매핑 분석
/ai-metadata-analyze-components

# 예상 출력:
📊 현재 컴포넌트 사용 분석
━━━━━━━━━━━━━━━━━━━━━━
🎨 Bootstrap 컴포넌트: 15개
📋 DevExtreme 컴포넌트: 8개
🔧 커스텀 컴포넌트: 12개

# 2단계: Material-UI 매핑 테이블 생성
/ai-metadata-create-mapping bootstrap-to-material-ui

# 3단계: 메타데이터 업데이트
/ai-metadata-update --ui-library=material-ui

# 4단계: 컴포넌트 매핑 검증
/ai-metadata-validate --mapping-check

# 5단계: 실제 화면으로 테스트
/ai-design ./test-ui.png --preview
# Material-UI 컴포넌트 기반 미리보기 생성
```

**호환성 매핑 테이블**:
```yaml
component_migration:
  bootstrap_to_material_ui:
    BButton: "Button (Material-UI)"
    BForm: "FormControl + FormGroup"
    BTable: "DataGrid (@mui/x-data-grid)"
    BModal: "Dialog (Material-UI)"
    BAlert: "Alert (Material-UI)"
    BCard: "Card (Material-UI)"
    BNavbar: "AppBar (Material-UI)"
```

**결과**: 기존 화면 설계를 유지하면서 새로운 UI 라이브러리 적용

### 🗄️ 시나리오 3.3: 데이터베이스 변경

**상황**: MySQL에서 PostgreSQL로 변경하는 경우

**데이터베이스 마이그레이션**:
```bash
# 1단계: 현재 데이터 모델 분석
/ai-metadata-analyze-database

# 2단계: PostgreSQL 호환성 검사
/ai-metadata-db-compatibility mysql-to-postgresql

# 예상 출력:
🗄️ MySQL → PostgreSQL 호환성 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 기본 데이터 타입: 호환 가능
⚠️  AUTO_INCREMENT → SERIAL 변환 필요
⚠️  MySQL 특화 함수 → PostgreSQL 함수 매핑
❌ MySQL 전용 저장 엔진 설정 제거 필요

# 3단계: 자동 스키마 변환
/ai-metadata-convert-schema mysql-to-postgresql

# 4단계: ORM 설정 업데이트
/ai-metadata-update --database=postgresql
# JPA 방언, 연결 설정 등 자동 업데이트

# 5단계: 생성된 코드 검증
/ai-design ./entity-diagram.png spec
# PostgreSQL 기반 엔티티 및 리포지토리 코드 검증
```

**결과**: 데이터베이스 변경에 따른 모든 관련 설정 자동 업데이트

---

## 4. 프로젝트 확장 시나리오

### 🚀 시나리오 4.1: 마이크로서비스 아키텍처 전환

**상황**: 모놀리식 애플리케이션을 마이크로서비스로 분할하는 경우

**아키텍처 변경 과정**:
```bash
# 1단계: 현재 모놀리식 아키텍처 분석
/ai-metadata-analyze-architecture

# 2단계: 마이크로서비스 분할 계획 생성
/ai-metadata-microservice-planning

# 예상 출력:
🏗️ 마이크로서비스 분할 계획
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 제안된 서비스 분할:
  1. user-service: 사용자 관리 (3개 엔티티)
  2. order-service: 주문 처리 (5개 엔티티)  
  3. inventory-service: 재고 관리 (4개 엔티티)
  4. notification-service: 알림 (2개 엔티티)

🔗 서비스 간 통신:
  - API Gateway: Spring Cloud Gateway
  - Service Discovery: Eureka
  - Message Broker: RabbitMQ

# 3단계: 서비스별 메타데이터 생성
/ai-metadata-split-services --plan=microservice-plan.json

# 4단계: 각 서비스별 설정
cd user-service
/ai-metadata-apply microservice-user-template

cd ../order-service  
/ai-metadata-apply microservice-order-template
```

**API Gateway 설정**:
```yaml
# API Gateway 메타데이터
gateway_config:
  framework: "Spring Cloud Gateway"
  routes:
    - id: user-service
      uri: "lb://user-service"
      predicates: ["Path=/api/users/**"]
    - id: order-service
      uri: "lb://order-service" 
      predicates: ["Path=/api/orders/**"]
```

**결과**: 마이크로서비스 아키텍처에 맞는 개별 서비스 메타데이터 구성

### 🌐 시나리오 4.2: 다국가 서비스 확장

**상황**: 국내 서비스를 해외로 확장하면서 다국어 및 현지화 요구사항이 추가되는 경우

**국제화 설정 추가**:
```bash
# 1단계: 현재 메타데이터에 i18n 설정 추가
/ai-metadata-add-i18n --languages=ko,en,ja,zh-CN

# 2단계: 현지화 규칙 설정
/ai-metadata-set-localization
> 기본 언어: Korean (ko)
> 대상 언어: English, Japanese, Chinese Simplified
> 날짜 형식: 지역별 자동 적용
> 통화 형식: KRW, USD, JPY, CNY
> 시간대: Asia/Seoul, UTC, Asia/Tokyo, Asia/Shanghai

# 3단계: 현지화 규칙 검증
/ai-metadata-validate --i18n-check

# 4단계: 다국어 적용 화면 생성 테스트
/ai-design ./login-screen.png full --locale=en
# 영어 기반 코드 생성 확인
```

**다국어 컴포넌트 매핑**:
```yaml
i18n_mappings:
  date_components:
    ko: "OwBizDatePicker (한국어 로케일)"
    en: "OwBizDatePicker (English locale)"
    ja: "OwBizDatePicker (日本語 locale)"
  
  validation_messages:
    required:
      ko: "필수 입력 항목입니다"
      en: "This field is required"
      ja: "この項目は必須です"
```

**결과**: 다국어 지원이 자동 적용된 글로벌 서비스 코드 생성

### 📊 시나리오 4.3: 실시간 데이터 처리 기능 추가

**상황**: 기존 CRUD 시스템에 실시간 대시보드 및 알림 기능을 추가하는 경우

**실시간 기능 메타데이터 확장**:
```bash
# 1단계: 실시간 기술스택 추가
/ai-metadata-add-realtime-stack
> WebSocket: Socket.io
> Message Broker: Redis Pub/Sub
> Real-time DB: Redis Streams
> Push Notification: FCM

# 2단계: 실시간 컴포넌트 매핑 추가
/ai-metadata-add-realtime-components

# 3단계: 실시간 아키텍처 패턴 설정
/ai-metadata-set-architecture-pattern event-driven

# 4단계: 실시간 화면 테스트
/ai-design ./realtime-dashboard.png full
# WebSocket 연결, 실시간 차트, 알림 컴포넌트 포함된 코드 생성
```

**실시간 컴포넌트 확장**:
```yaml
realtime_components:
  charts:
    real_time_line_chart: "RealtimeLineChart (Socket.io 연동)"
    live_data_grid: "LiveDataGrid (자동 갱신)"
    notification_panel: "NotificationPanel (실시간 알림)"
  
  websocket_handlers:
    connection_manager: "WebSocketConnectionManager"
    event_dispatcher: "RealtimeEventDispatcher"
    data_synchronizer: "DataSynchronizer"
```

**결과**: 실시간 기능이 통합된 현대적 웹 애플리케이션 아키텍처

---

## 5. 문제 해결 시나리오

### 🚨 시나리오 5.1: 메타데이터 손상 복구

**상황**: 메타데이터 파일이 손상되거나 유실된 경우

**손상 감지 및 복구**:
```bash
# 1단계: 손상 정도 진단
/ai-metadata-diagnose

# 예상 출력:
🔍 메타데이터 진단 결과
━━━━━━━━━━━━━━━━━━━━━━━━
❌ 치명적 오류: project-metadata.json 구문 오류
⚠️  경고: component-mappings.json 누락
✅ 정상: api-patterns.json
✅ 정상: domain-rules.json

🏥 복구 옵션:
  1. 백업에서 복원
  2. 프로젝트 스캔으로 재생성
  3. 템플릿 기반 재구성

# 2단계: 백업 확인
/ai-metadata-list-backups

# 3단계: 최신 백업에서 복원
/ai-metadata-restore latest

# 또는 프로젝트 스캔으로 재생성
/ai-metadata-regenerate --from-project

# 4단계: 복구 검증
/ai-metadata-validate --full-check
```

**자동 백업 설정**:
```bash
# 자동 백업 활성화
/ai-metadata-setup-auto-backup --interval=daily --keep=30

# 수동 백업 생성
/ai-metadata-backup "before-major-update-$(date +%Y%m%d)"
```

**결과**: 빠른 메타데이터 복구로 개발 중단 시간 최소화

### 🔧 시나리오 5.2: 버전 호환성 문제 해결

**상황**: 메타데이터 스키마 버전과 AI 도구 버전이 맞지 않는 경우

**버전 호환성 해결**:
```bash
# 1단계: 버전 호환성 확인
/ai-metadata-version-check

# 예상 출력:
📊 버전 호환성 분석
━━━━━━━━━━━━━━━━━━━━━━
🔧 AI 도구 버전: v2.1.0
📋 메타데이터 스키마: v2024.1
❌ 호환성: 불일치 (v2024.2 필요)

🔄 업그레이드 옵션:
  1. 메타데이터 스키마 업그레이드 (권장)
  2. AI 도구 다운그레이드
  3. 호환 모드 사용

# 2단계: 자동 스키마 업그레이드
/ai-metadata-upgrade-schema --target=v2024.2

# 3단계: 업그레이드 검증
/ai-metadata-validate --schema-check

# 4단계: 기능 테스트
/ai-design ./test-image.png --dry-run
# 실제 생성 없이 호환성 테스트
```

**롤백 계획**:
```bash
# 업그레이드 실패 시 롤백
/ai-metadata-rollback --to-schema=v2024.1

# 안전 모드로 실행
/ai-design ./image.png --compatibility-mode=v2024.1
```

**결과**: 버전 호환성 문제 없이 안정적인 AI 도구 사용

### 🐛 시나리오 5.3: 컴포넌트 매핑 오류 해결

**상황**: AI가 잘못된 컴포넌트를 매핑하거나 알 수 없는 컴포넌트를 감지하는 경우

**매핑 오류 해결**:
```bash
# 1단계: 매핑 오류 분석
/ai-design ./problematic-screen.png --debug

# 예상 출력:
🔍 컴포넌트 매핑 분석
━━━━━━━━━━━━━━━━━━━━━━━━
✅ 인식 성공: 테이블 (DxDataGrid, 97% 신뢰도)
⚠️  낮은 신뢰도: 드롭다운 (OwFormSelect, 65% 신뢰도)
❌ 인식 실패: 커스텀 위젯 (매핑 없음)

# 2단계: 커스텀 매핑 추가
/ai-metadata-add-custom-mapping
> 컴포넌트 타입: 커스텀 위젯
> OWS 컴포넌트: OwCustomWidget
> 신뢰도 임계값: 80%

# 3단계: 매핑 테이블 업데이트
/ai-metadata-update-mappings --retrain

# 4단계: 수정된 매핑으로 재분석
/ai-design ./problematic-screen.png --force-refresh
```

**매핑 정확도 개선**:
```bash
# 사용자 피드백 기반 매핑 개선
/ai-metadata-improve-mapping --feedback-mode
> 이 컴포넌트 매핑이 정확합니까? (y/n)
> 올바른 컴포넌트: OwBizDatePicker
> 매핑 규칙 업데이트됨

# 팀 매핑 데이터 공유
/ai-metadata-sync-team-mappings
```

**결과**: 지속적으로 개선되는 컴포넌트 매핑 정확도

---

## 6. 유지보수 시나리오

### 🔄 시나리오 6.1: 정기 메타데이터 최적화

**상황**: 프로젝트가 성숙해지면서 메타데이터를 최적화하고 불필요한 요소를 제거하는 경우

**정기 최적화 프로세스**:
```bash
# 월간 최적화 작업 (매월 첫 주)
/ai-metadata-monthly-optimization

# 예상 출력:
🔧 메타데이터 최적화 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 현재 상태:
  - 총 크기: 2.3MB
  - 컴포넌트 매핑: 127개
  - 사용되지 않는 매핑: 23개
  - 중복 규칙: 5개

🗑️  정리 대상:
  1. 미사용 컴포넌트 매핑 제거
  2. 중복 비즈니스 규칙 통합
  3. 구버전 호환성 코드 제거
  4. 임시 실험 설정 제거

# 자동 정리 실행
/ai-metadata-cleanup --auto

# 수동 검토 후 정리
/ai-metadata-cleanup --interactive
```

**성능 모니터링**:
```bash
# 메타데이터 성능 분석
/ai-metadata-performance-report

# 예상 출력:
📈 메타데이터 성능 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ 로딩 시간: 0.8초 (목표: < 1초) ✅
💾 메모리 사용량: 45MB (목표: < 50MB) ✅
🔍 컴포넌트 매칭 속도: 2.1초 (목표: < 3초) ✅
📊 캐시 히트율: 87% (목표: > 80%) ✅

💡 최적화 제안:
  1. 자주 사용되는 매핑을 상위로 이동
  2. 복잡한 정규식 패턴 단순화
  3. 사용 빈도 낮은 도메인 규칙 지연 로딩
```

**결과**: 최적화된 메타데이터로 향상된 성능과 유지보수성

### 📊 시나리오 6.2: 메타데이터 사용 통계 분석

**상황**: 메타데이터 활용도를 분석하여 개선점을 찾고 ROI를 측정하는 경우

**사용 통계 수집**:
```bash
# 분기별 사용 통계 리포트
/ai-metadata-usage-report --period=quarter

# 예상 출력:
📊 메타데이터 사용 통계 (Q3 2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 전체 지표:
  - AI 분석 횟수: 1,247회 (전분기 대비 +32%)
  - 코드 생성 성공률: 96.4% (전분기 대비 +2.1%)
  - 평균 분석 시간: 2.3초 (전분기 대비 -0.7초)
  - 개발자 만족도: 4.6/5.0 (전분기 대비 +0.3)

🎯 컴포넌트별 사용 빈도:
  1. DxDataGrid: 342회 (27.4%)
  2. OwBizDatePicker: 198회 (15.9%)
  3. OwFormSelect: 156회 (12.5%)
  4. BButton: 134회 (10.7%)
  5. OwInput: 89회 (7.1%)

💰 ROI 분석:
  - 메타데이터 구축 시간: 40시간
  - 절약된 개발 시간: 624시간
  - ROI: 1,460% (15.6배 투자 대비 수익)
```

**팀별 활용도 분석**:
```bash
# 팀별 사용 패턴 분석
/ai-metadata-team-analytics

# 개선 권장사항 생성
/ai-metadata-improvement-suggestions
```

**결과**: 데이터 기반 메타데이터 개선 방향 수립

### 🚀 시나리오 6.3: 메타데이터 진화 및 확장

**상황**: 새로운 기술 트렌드나 팀 요구사항에 따라 메타데이터를 확장하는 경우

**진화 계획 수립**:
```bash
# 기술 트렌드 분석
/ai-metadata-trend-analysis

# 예상 출력:
🔮 기술 트렌드 분석 및 메타데이터 확장 제안
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 신기술 트렌드:
  1. AI/ML 통합: 머신러닝 모델 API 연동
  2. 서버리스: AWS Lambda, Vercel Functions
  3. 엣지 컴퓨팅: CloudFlare Workers
  4. 웹어셈블리: WASM 모듈 지원

🎯 확장 우선순위:
  1. 우선 (Q4 2025): AI/ML 컴포넌트 매핑 추가
  2. 보통 (Q1 2026): 서버리스 아키텍처 템플릿
  3. 후순위 (Q2 2026): 엣지 컴퓨팅 설정

# 단계별 확장 실행
/ai-metadata-add-ml-support --preview
/ai-metadata-add-serverless-templates --experimental
```

**커뮤니티 기여**:
```bash
# 오픈소스 메타데이터 기여
/ai-metadata-contribute --target=community

# 사용자 정의 확장 공유
/ai-metadata-share-extensions --public
```

**결과**: 지속적으로 진화하는 최신 기술 환경 대응

---

## 🎯 시나리오별 체크리스트

### ✅ 초기 설정 체크리스트
- [ ] 프로젝트 기술스택 확정
- [ ] 메타데이터 생성 방법 선택 (자동/템플릿/수동)
- [ ] 메타데이터 검증 및 커스터마이징
- [ ] Git 저장소에 메타데이터 커밋
- [ ] 팀원들과 메타데이터 공유
- [ ] 첫 번째 AI 분석 테스트 수행

### ✅ 팀 협업 체크리스트
- [ ] 팀 표준 메타데이터 정의
- [ ] CI/CD에 메타데이터 검증 추가
- [ ] 정기 품질 리포트 설정
- [ ] 팀원 교육 및 가이드 공유
- [ ] 프로젝트별 메타데이터 관리 체계 구축

### ✅ 기술스택 변경 체크리스트
- [ ] 현재 메타데이터 백업
- [ ] 호환성 검사 수행
- [ ] 단계별 마이그레이션 계획 수립
- [ ] 자동 변환 도구 활용
- [ ] 변경 후 검증 테스트
- [ ] 팀원들에게 변경사항 공유

### ✅ 문제 해결 체크리스트
- [ ] 문제 상황 정확한 진단
- [ ] 백업 데이터 확인
- [ ] 단계별 복구 계획 수립
- [ ] 복구 후 전체 검증
- [ ] 재발 방지책 마련

### ✅ 유지보수 체크리스트
- [ ] 정기 최적화 스케줄 설정
- [ ] 사용 통계 모니터링
- [ ] 성능 지표 추적
- [ ] 기술 트렌드 반영 계획
- [ ] 커뮤니티 기여 활동

---

## 📚 관련 문서

- [프로젝트 메타데이터 생성 가이드](./Project-Metadata-Generation-Guide.md)
- [AI 디자인 명령어 가이드](../AI-DESIGN-COMMAND-GUIDE.md)
- [워크플로우 가이드](../AI-WORKFLOW-GUIDE.md)
- [메타데이터 템플릿 모음](./templates/)

이제 모든 상황에 대비한 **완벽한 메타데이터 관리**가 가능합니다! 🚀