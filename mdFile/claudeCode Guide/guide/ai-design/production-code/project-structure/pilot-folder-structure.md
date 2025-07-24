# 📁 Pilot 폴더 구조 가이드

> AI-Design 명령어로 생성되는 **pilot 폴더**의 구조와 생성 규칙을 정의합니다.

## 📌 개요

AI-Design은 기존 프로젝트에 영향을 주지 않고 독립적으로 테스트할 수 있도록 **`pilot` 폴더**를 생성합니다. 이는 생성된 코드를 검증한 후 실제 프로젝트에 통합하기 위한 안전한 샌드박스 역할을 합니다.

## 🎯 Pilot 폴더의 목적

1. **격리된 환경**: 기존 프로젝트 코드와 충돌하지 않는 독립적인 공간
2. **빠른 검증**: 생성된 코드를 즉시 실행하고 테스트
3. **선택적 통합**: 검증 후 필요한 부분만 실제 프로젝트로 이동
4. **완전한 구조**: 실행 가능한 전체 애플리케이션 구조 제공

## 🗂️ Pilot 폴더 전체 구조

```
[현재 프로젝트 루트]/
└── pilot/                    # AI-Design으로 생성된 파일럿 프로젝트
    ├── README.md            # 프로젝트 설명 및 실행 방법
    ├── docs/                # 📚 설계 문서
    │   ├── analysis/       # 이미지 분석 결과
    │   ├── wireframe/      # UI 와이어프레임
    │   └── specification/  # 프로그램 사양서
    ├── frontend/           # 🎨 프론트엔드 애플리케이션
    │   ├── src/
    │   │   ├── views/     # 페이지 컴포넌트
    │   │   ├── components/# 재사용 컴포넌트
    │   │   ├── stores/    # 상태 관리 (Pinia)
    │   │   ├── api/       # API 통신 모듈
    │   │   ├── types/     # TypeScript 타입 정의
    │   │   └── utils/     # 유틸리티 함수
    │   ├── package.json   # 의존성 정의
    │   └── tsconfig.json  # TypeScript 설정
    ├── backend/            # ⚙️ 백엔드 애플리케이션
    │   ├── src/
    │   │   └── main/
    │   │       ├── java/
    │   │       │   └── com/example/[도메인]/
    │   │       │       ├── controller/
    │   │       │       ├── service/
    │   │       │       ├── repository/
    │   │       │       ├── dto/
    │   │       │       ├── entity/
    │   │       │       ├── validator/
    │   │       │       ├── exception/
    │   │       │       └── config/
    │   │       └── resources/
    │   │           └── application.yml
    │   └── pom.xml       # Maven 설정
    └── tests/            # 🧪 테스트 코드
        ├── frontend/
        └── backend/
```

## 📝 상세 폴더 구조 및 파일 설명

### 1. **문서 (docs/)**
```
pilot/docs/
├── analysis/
│   └── [화면명]-analysis.md          # AI 이미지 분석 결과
├── wireframe/
│   └── [화면명]-wireframe.md         # UI 구조 및 컴포넌트 매핑
└── specification/
    └── [화면명]-spec.md              # API 명세 및 데이터 모델
```

### 2. **Frontend 구조**
```
pilot/frontend/src/
├── views/[모듈]/[기능]/
│   └── [화면명]List.vue              # 메인 화면 컴포넌트
├── stores/
│   └── [기능]Store.ts                # Pinia 상태 관리
├── api/
│   └── [기능].ts                     # API 호출 모듈
├── types/
│   └── [기능].ts                     # TypeScript 인터페이스
└── utils/
    ├── constants.ts                  # 상수 정의
    └── validators.ts                 # 검증 함수
```

### 3. **Backend 구조**
```
pilot/backend/src/main/java/com/example/[도메인]/
├── controller/
│   └── [엔티티]Controller.java       # REST API 엔드포인트
├── service/
│   ├── [엔티티]Service.java         # 서비스 인터페이스
│   └── [엔티티]ServiceImpl.java     # 서비스 구현체
├── repository/
│   ├── [엔티티]Repository.java      # JPA Repository
│   └── [엔티티]Specification.java  # 동적 쿼리
├── entity/
│   └── [엔티티].java                # JPA 엔티티
├── dto/
│   ├── [엔티티]Dto.java            # 기본 DTO
│   ├── [엔티티]CreateDto.java      # 생성 요청 DTO
│   ├── [엔티티]UpdateDto.java      # 수정 요청 DTO
│   └── BatchDeleteRequest.java      # 일괄 삭제 요청
├── validator/
│   └── [엔티티]Validator.java       # 비즈니스 검증 로직
├── exception/
│   ├── BusinessException.java       # 비즈니스 예외
│   ├── NotFoundException.java       # 404 예외
│   └── ValidationException.java     # 검증 예외
└── mapper/
    └── [엔티티]Mapper.java          # DTO-Entity 매핑
```

## 🔄 파일 생성 순서

AI-Design은 다음 순서로 파일을 생성합니다:

1. **폴더 구조 생성**
   ```bash
   mkdir -p pilot/{docs/{analysis,wireframe,specification},frontend/src/{views,stores,api,types,utils},backend/src/main/java/com/example,tests/{frontend,backend}}
   ```

2. **README.md 생성**
   - 프로젝트 개요
   - 생성된 파일 목록
   - 실행 방법

3. **설계 문서 생성**
   - 분석 결과 문서
   - UI 와이어프레임
   - 프로그램 사양서

4. **Frontend 코드 생성**
   - Vue 컴포넌트
   - Pinia 스토어
   - API 모듈
   - TypeScript 타입

5. **Backend 코드 생성**
   - Controller
   - Service
   - Repository
   - Entity/DTO
   - 설정 파일

## 💡 네이밍 규칙

### **파일명 패턴**
```yaml
Frontend:
  Vue컴포넌트: "[기능명][화면유형].vue"     # ProhibitedWordList.vue
  Store: "[기능명]Store.ts"                # prohibitedWordStore.ts
  API: "[기능명].ts"                       # prohibitedWord.ts
  Type: "[기능명].ts"                      # prohibitedWord.ts

Backend:
  Controller: "[기능명]Controller.java"     # ProhibitedWordController.java
  Service: "[기능명]Service.java"          # ProhibitedWordService.java
  Repository: "[기능명]Repository.java"     # ProhibitedWordRepository.java
  Entity: "[기능명].java"                   # ProhibitedWord.java
  DTO: "[기능명][용도]Dto.java"            # ProhibitedWordCreateDto.java
```

### **경로 패턴**
```yaml
화면별_경로:
  시스템관리: "system/"
  상품관리: "product/"
  주문관리: "order/"
  고객관리: "customer/"

기능별_경로:
  금칙어: "prohibitedword/"
  사용자: "user/"
  권한: "permission/"
```

## 🚀 Pilot 폴더 활용 방법

### 1. **즉시 실행**
```bash
# Frontend 실행
cd pilot/frontend
npm install
npm run dev

# Backend 실행
cd pilot/backend
mvn spring-boot:run
```

### 2. **코드 검증**
- 생성된 코드 리뷰
- 기능 테스트
- 성능 확인

### 3. **실제 프로젝트 통합**
```bash
# 검증된 파일만 선택적으로 복사
cp pilot/frontend/src/views/system/prohibitedword/* ../apps/web/src/views/system/
cp pilot/backend/src/main/java/com/example/prohibitedword/* ../backend/src/main/java/com/company/
```

## 📋 생성 체크리스트

- [ ] `pilot` 폴더가 현재 디렉토리에 생성됨
- [ ] 모든 하위 디렉토리 구조 생성 완료
- [ ] README.md에 실행 방법 명시
- [ ] 설계 문서 3종 생성 (analysis, wireframe, specification)
- [ ] Frontend 소스 파일 생성
- [ ] Backend 소스 파일 생성
- [ ] 패키지 설정 파일 생성 (package.json, pom.xml)
- [ ] 환경 설정 파일 생성 (.env, application.yml)

## 🔍 실제 생성 예시

### **명령어 실행**
```bash
# 현재 위치: /mnt/c/bj-project/ows-master
/ai-design design.png full

# 생성 결과
pilot/
├── README.md (생성 시간, AI 모델, 명령어 기록)
├── docs/
│   ├── analysis/prohibited-word-analysis.md
│   ├── wireframe/prohibited-word-wireframe.md
│   └── specification/prohibited-word-spec.md
├── frontend/ (완전한 Vue 3 애플리케이션)
└── backend/ (완전한 Spring Boot 애플리케이션)
```

## ⚡ 장점

1. **안전성**: 기존 코드에 영향 없음
2. **독립성**: 완전히 실행 가능한 애플리케이션
3. **검증성**: 실행하여 즉시 테스트 가능
4. **선택성**: 필요한 부분만 통합 가능
5. **추적성**: 생성 시간과 AI 모델 정보 포함

---

**참고**: Pilot 폴더는 AI-Design의 핵심 기능으로, 안전하고 체계적인 코드 생성을 보장합니다.