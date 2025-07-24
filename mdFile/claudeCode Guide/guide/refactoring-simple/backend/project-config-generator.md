# 🤖 백엔드 프로젝트 자동 설정 생성 가이드

## 📁 참조 파일 경로
```
BACKEND_TEMPLATE = "/mnt/c/guide/refactoring-simple/backend/project-config-template.md"
GUIDE_ROOT = "/mnt/c/guide/refactoring-simple"
```

## 개요
Java/Spring Boot 백엔드 프로젝트를 자동으로 분석하여 `project-config.md`를 생성합니다.

## 자동 감지 항목

### 1. 빌드 도구 감지
```bash
# Gradle
- build.gradle 또는 build.gradle.kts
- settings.gradle
- gradle.properties

# Maven
- pom.xml
- settings.xml
```

### 2. Spring Boot 버전 확인
```groovy
// build.gradle에서
plugins {
    id 'org.springframework.boot' version '3.2.0'
}

// 또는 dependencies에서
implementation 'org.springframework.boot:spring-boot-starter:3.2.0'
```

### 3. 패키지 구조 분석
```java
// @SpringBootApplication 찾기
@SpringBootApplication
public class MyApplication {
    // 이 클래스의 패키지가 basePackage
}
```

### 4. 데이터베이스 설정 감지
```yaml
# application.yml 분석
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 5. ORM 감지
```groovy
// MyBatis
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter'

// JPA
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
```

## 분석 프로세스

### Phase 1: 프로젝트 루트 확인
```bash
# 프로젝트 루트 찾기
1. build.gradle 또는 pom.xml 위치
2. src/main/java 디렉토리 확인
3. .git 디렉토리 위치 (옵션)
```

### Phase 2: 소스 구조 분석
```bash
# 패키지 스캔
src/main/java/
└── com/example/project/
    ├── controller/     # *Controller.java 파일들
    ├── service/        # *Service.java 파일들  
    ├── domain/         # 또는 service 대신
    ├── mapper/         # *Mapper.java 파일들
    ├── repository/     # *Repository.java 파일들
    └── dto/           # DTO 클래스들
```

### Phase 3: 네이밍 패턴 감지
```java
// Controller 패턴
@RestController
public class UserController { }  // suffix: Controller

// Service 패턴
@Service
public class UserService { }      // suffix: Service
public class UserServiceImpl { }  // suffix: ServiceImpl

// Mapper 패턴
@Mapper
public interface UserMapper { }   // suffix: Mapper
```

### Phase 4: MyBatis XML 위치
```bash
# 일반적인 위치들
src/main/resources/
├── mapper/
│   └── UserMapper.xml
├── mybatis/
│   └── mapper/
│       └── user-mapper.xml
└── sqlmap/
    └── user.xml

# application.yml에서 확인
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
```

## 생성 예시

### 입력: 프로젝트 구조
```
my-backend/
├── build.gradle
├── src/main/java/
│   └── com/mycompany/api/
│       ├── MyApiApplication.java
│       ├── controller/
│       │   ├── UserController.java
│       │   └── ProductController.java
│       ├── service/
│       │   ├── UserService.java
│       │   └── ProductService.java
│       └── mapper/
│           ├── UserMapper.java
│           └── ProductMapper.java
└── src/main/resources/
    ├── application.yml
    └── mapper/
        ├── UserMapper.xml
        └── ProductMapper.xml
```

### 출력: project-config.md
```yaml
# 자동 생성된 백엔드 프로젝트 설정
# 생성 시간: 2024-03-15 10:30:00

project:
  name: "my-backend"
  type: "backend"
  framework: "spring-boot"
  language: "java"
  version: "17"

tech_stack:
  build_tool: "gradle"
  spring_boot_version: "3.2.0"
  database: "mysql"
  orm: "mybatis"

paths:
  baseProjectPath: "/path/to/my-backend"
  javaMain: "src/main/java"
  resourceMain: "src/main/resources"
  projectPackagePath: "com/mycompany/api"

packages:
  basePackage: "com.mycompany.api"
  controllerPackage: "com.mycompany.api.controller"
  servicePackage: "com.mycompany.api.service"
  mapperPackage: "com.mycompany.api.mapper"

sourceLocations:
  controller: "/path/to/my-backend/src/main/java/com/mycompany/api/controller"
  service: "/path/to/my-backend/src/main/java/com/mycompany/api/service"
  mapper: "/path/to/my-backend/src/main/java/com/mycompany/api/mapper"
  xml: "/path/to/my-backend/src/main/resources/mapper"

mybatis:
  xmlLocation: "mapper"
  xmlNaming: "${className}Mapper.xml"
  detected: true

naming:
  controllerSuffix: "Controller"
  serviceSuffix: "Service"
  mapperSuffix: "Mapper"

# 감지된 도메인들
detected_domains:
  - user
  - product

# 감지된 특이사항
notes:
  - "Service 인터페이스와 Impl 패턴 미사용"
  - "DTO 패키지 없음 - Map 또는 Entity 직접 사용 추정"
```

## 특수 케이스 처리

### 1. 멀티 모듈 프로젝트
```
project-root/
├── api-module/      # API 모듈
├── core-module/     # 코어 비즈니스 로직
├── common-module/   # 공통 유틸리티
└── build.gradle     # 루트 빌드 파일
```
→ 모듈 선택 옵션 제공

### 2. 레거시 구조
```
src/
├── controller/      # 패키지 없이 바로 시작
├── service/
└── dao/            # mapper 대신 dao 사용
```
→ 레거시 패턴으로 감지 및 설정

### 3. 비표준 패키지
```
com.company.business/    # 비즈니스 로직
com.company.web/        # 웹 레이어
com.company.data/       # 데이터 레이어
```
→ 사용자 확인 요청

## 검증 및 확인

### 자동 검증
1. 각 패키지 경로 존재 확인
2. 최소 1개 이상의 클래스 존재 확인
3. XML 파일과 Mapper 인터페이스 매칭

### 사용자 확인
```
✅ 프로젝트 분석 완료!

감지된 설정:
- Base Package: com.mycompany.api
- Controller: 2개 파일
- Service: 2개 파일
- Mapper: 2개 파일
- MyBatis XML: 2개 파일

project-config.md 파일을 생성했습니다.
수정이 필요한 부분이 있다면 직접 편집해주세요.
```