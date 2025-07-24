# 🤖 AI 프로젝트 자동 진단 및 설정 생성 가이드

## 개요
AI가 프로젝트 코드베이스를 자동으로 진단하여 `project-config.md`를 생성하는 가이드입니다.

## 실행 명령
```
"이 프로젝트를 진단해서 project-config.md 파일을 생성해주세요"
```

## AI 자동 진단 프로세스

### 1단계: 프로젝트 구조 탐색
```bash
# 프로젝트 루트 확인
- build.gradle 또는 pom.xml 위치 찾기
- src/main/java 디렉토리 확인
- src/main/resources 디렉토리 확인
```

### 2단계: 기술 스택 감지
```bash
# 빌드 도구
- build.gradle → Gradle
- pom.xml → Maven

# 프레임워크
- @SpringBootApplication → Spring Boot
- spring-boot-starter 의존성 확인

# ORM
- mybatis-spring-boot-starter → MyBatis
- spring-boot-starter-data-jpa → JPA

# 데이터베이스
- application.yml/properties에서 datasource 확인
```

### 3단계: 패키지 구조 분석
```bash
# Base Package 찾기
1. @SpringBootApplication 어노테이션이 있는 클래스의 패키지
2. 가장 많은 클래스가 있는 공통 패키지 경로

# 레이어별 패키지 감지
- **/controller/** → Controller 레이어
- **/service/** 또는 **/domain/** → Service 레이어
- **/mapper/** 또는 **/repository/** → 데이터 접근 레이어
- **/dto/** 또는 **/model/** → 데이터 모델
```

### 4단계: 네이밍 컨벤션 분석
```bash
# Controller 패턴
- 파일명에서 suffix 확인 (*Controller.java)

# Service 패턴
- 파일명에서 suffix 확인 (*Service.java, *ServiceImpl.java)

# Mapper/Repository 패턴
- 파일명에서 suffix 확인 (*Mapper.java, *Repository.java)
```

### 5단계: MyBatis 설정 확인 (해당시)
```bash
# XML 위치
- src/main/resources/mapper/**/*.xml
- src/main/resources/mybatis/**/*.xml
- application.yml의 mybatis.mapper-locations

# XML 네이밍
- {Entity}Mapper.xml
- {Entity}_SqlMapper.xml
- {Entity}Query.xml
```

## AI 진단 체크리스트

### 필수 확인 항목
- [ ] 프로젝트 루트 디렉토리 위치
- [ ] Java 소스 루트 (src/main/java)
- [ ] 리소스 루트 (src/main/resources)
- [ ] Base Package 구조
- [ ] Controller 패키지 위치
- [ ] Service/Domain 패키지 위치
- [ ] Mapper/Repository 패키지 위치
- [ ] MyBatis XML 위치 (사용시)

### 선택 확인 항목
- [ ] DTO/Model 패키지 위치
- [ ] 예외 처리 패키지
- [ ] 유틸리티 패키지
- [ ] 설정 클래스 패키지

## 자동 생성 예시

### 입력 (프로젝트 구조)
```
my-project/
├── build.gradle
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── myapp/
│   │   │               ├── MyAppApplication.java
│   │   │               ├── controller/
│   │   │               ├── service/
│   │   │               ├── mapper/
│   │   │               └── dto/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── mapper/
│   │           └── user/
│   │               └── UserMapper.xml
```

### 출력 (project-config.md)
```yaml
project:
  name: "my-project"
  description: "Auto-detected Spring Boot project"

paths:
  baseProjectPath: "/path/to/my-project"
  javaMain: "src/main/java"
  resourceMain: "src/main/resources"
  projectPackagePath: "com/example/myapp"

packages:
  basePackage: "com.example.myapp"
  controllerPackage: "${basePackage}.controller"
  servicePackage: "${basePackage}.service"
  mapperPackage: "${basePackage}.mapper"
  dtoPackage: "${basePackage}.dto"

sourceLocations:
  controller: "${baseProjectPath}/${javaMain}/${projectPackagePath}/controller"
  service: "${baseProjectPath}/${javaMain}/${projectPackagePath}/service"
  mapper: "${baseProjectPath}/${javaMain}/${projectPackagePath}/mapper"
  xml: "${baseProjectPath}/${resourceMain}/mapper"

refactoring:
  outputBase: "${baseProjectPath}/refactoring"
  outputPath: "${outputBase}/${className}-${todayYYYYMMDD}"

mybatis:
  xmlLocation: "mapper"
  xmlNaming: "${className}Mapper.xml"
  detected: true

rules:
  useServiceLayer: true
  serviceName: "service"
  controllerSuffix: "Controller"
  serviceSuffix: "Service"
  mapperSuffix: "Mapper"
```

## 진단 실패시 대응

### 1. 비표준 구조
- 사용자에게 직접 확인 요청
- 예: "Controller 패키지를 찾을 수 없습니다. 위치를 알려주세요."

### 2. 다중 모듈 프로젝트
- 모듈 목록 표시 후 선택 요청
- 또는 각 모듈별 config 생성

### 3. 레거시 구조
- 가능한 범위에서 자동 감지
- 수동 수정 필요 부분 명시

## 검증 프로세스

### 생성된 config 검증
1. 각 경로가 실제로 존재하는지 확인
2. 패키지에 실제 클래스가 있는지 확인
3. MyBatis XML 파일 존재 여부 확인

### 사용자 확인
```
"다음과 같이 프로젝트 구조를 감지했습니다:
- Base Package: com.example.myapp
- Controller: .../controller
- Service: .../service
- Mapper: .../mapper

이 설정이 맞나요? (Y/n)"
```

## 최종 워크플로우

1. **AI 진단 실행**
   ```
   사용자: "프로젝트 진단해서 설정 파일 만들어줘"
   AI: 자동 진단 시작...
   ```

2. **project-config.md 생성**
   ```
   AI: project-config.md 생성 완료
   ```

3. **리팩토링 실행**
   ```
   사용자: "UserController 리팩토링해줘"
   AI: project-config.md 기반으로 리팩토링 시작...
   ```

이 방식으로 사용자는 복잡한 설정 없이 바로 리팩토링을 시작할 수 있습니다!