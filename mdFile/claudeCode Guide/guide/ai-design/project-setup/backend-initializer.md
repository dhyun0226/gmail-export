# Backend 신규 프로젝트 초기화 가이드

신규 Backend 프로젝트를 기본 설정으로 초기화하고 backend-config.md 파일을 생성합니다.

## 필수 파라미터
- **groupId**: Java 패키지 구조 (예: com.osstem.ows)
- **artifactId**: 프로젝트명 (예: sal)

## 기본 기술 스택
- **Language**: Java 21
- **Framework**: Spring Boot 3.4.0
- **Build Tool**: Gradle 8.5
- **Database**: MariaDB 11.2
- **ORM**: MyBatis 3.5.15

## 초기화 절차

### 1. 기본 폴더 구조 생성

**Spring Boot 3.4 + Gradle 표준 구조:**

```bash
# Backend 프로젝트 루트 폴더로 이동
cd [지정된 backend-path]

# groupId를 경로로 변환 (com.example → com/example)
PACKAGE_PATH=$(echo "${groupId}" | tr '.' '/')

# 기본 Gradle 프로젝트 구조 생성
mkdir -p src/main/java/${PACKAGE_PATH}
mkdir -p src/main/resources
mkdir -p src/test/java/${PACKAGE_PATH}
mkdir -p gradle/wrapper

# Spring Boot 패키지 구조 생성
mkdir -p src/main/java/${PACKAGE_PATH}/{controller,service,repository,entity,dto,config}
mkdir -p src/main/java/${PACKAGE_PATH}/controller/{api,web}
mkdir -p src/main/java/${PACKAGE_PATH}/service/{impl}
mkdir -p src/main/java/${PACKAGE_PATH}/repository/{mapper}
mkdir -p src/main/java/${PACKAGE_PATH}/entity/{base}
mkdir -p src/main/java/${PACKAGE_PATH}/dto/{request,response}
mkdir -p src/main/java/${PACKAGE_PATH}/config/{database,security,web}

# 리소스 폴더 구조 생성
mkdir -p src/main/resources/{mapper,static,templates,config}
mkdir -p src/main/resources/static/{css,js,images}
mkdir -p src/main/resources/config/{profiles}

# 테스트 폴더 구조 생성
mkdir -p src/test/java/${PACKAGE_PATH}/{controller,service,repository}
mkdir -p src/test/resources
```

**생성되는 최종 폴더 구조:**

```
backend-project/
├── gradle/                          # Gradle Wrapper
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/[groupId 패키지]/
│   │   │   ├── controller/          # REST API 컨트롤러
│   │   │   │   ├── api/            # REST API 컨트롤러
│   │   │   │   └── web/            # 웹 페이지 컨트롤러
│   │   │   ├── service/            # 비즈니스 로직
│   │   │   ├── mapper/             # MyBatis 매퍼 인터페이스
│   │   │   ├── entity/             # 도메인 엔티티
│   │   │   │   └── base/           # 기본 엔티티 클래스
│   │   │   ├── dto/               # 데이터 전송 객체
│   │   │   │   ├── request/        # 요청 DTO
│   │   │   │   └── response/       # 응답 DTO
│   │   │   ├── config/            # 설정 클래스
│   │   │   │   ├── database/       # 데이터베이스 설정
│   │   │   │   ├── security/       # 보안 설정
│   │   │   │   └── web/           # 웹 설정
│   │   │   └── Application.java    # 메인 애플리케이션
│   │   └── resources/
│   │       ├── mapper/             # MyBatis XML 매퍼
│   │       ├── config/            # 설정 파일
│   │       │   └── profiles/       # 프로파일별 설정
│   │       └── application.yml     # 애플리케이션 설정
│   └── test/
│       ├── java/[groupId 패키지]/
│       │   ├── controller/         # 컨트롤러 테스트
│       │   ├── service/           # 서비스 테스트
│       │   └── repository/        # 리포지토리 테스트
│       └── resources/             # 테스트 리소스
├── build.gradle                   # Gradle 빌드 설정
├── gradlew                       # Gradle Wrapper (Unix)
├── gradlew.bat                   # Gradle Wrapper (Windows)
├── settings.gradle               # Gradle 설정
└── README.md                     # 프로젝트 설명
```

### 2. build.gradle 생성
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.0'
    id 'io.spring.dependency-management' version '1.1.6'
}

group = '${groupId}'
version = '0.0.1-SNAPSHOT'
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()  // Gradle 중앙 저장소
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### 3. application.yml 생성
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/${artifactId}_db
    username: root
    password: password
    driver-class-name: org.mariadb.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080

mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: ${groupId}.entity
```

### 4. Application.java 생성
```java
package ${groupId};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 5. HelloController.java 생성 (예제)
```java
package ${groupId}.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/api/hello")
    public String hello() {
        return "Hello, ${artifactId} with Spring Boot 3.4.0 + Java 21!";
    }
}
```

### 6. Gradle Wrapper 생성
```bash
gradle wrapper --gradle-version 8.5
```

## 의존성 설치 및 빌드
```bash
cd [백엔드 경로]
./gradlew build
```

## backend-config.md 생성
초기화 완료 후 다음 내용으로 backend-config.md 생성:

```markdown
# Backend Configuration

## 기술 스택(Technology Stack)
- **Language**: Java 21
- **Framework**: Spring Boot 3.4.0
- **Build Tool**: Gradle 8.5
- **Database**: MariaDB 11.2
- **ORM**: MyBatis 3.5.15

## 프로젝트 구조(Project Structure)
\`\`\`
src/main/java/${groupId의 패키지 경로}/
├── controller/     # REST API 엔드포인트
├── service/        # 비즈니스 로직
├── mapper/         # 데이터 접근 계층
├── entity/         # 도메인 엔티티
├── dto/            # 데이터 전송 객체
├── config/         # 설정 클래스
└── Application.java # 애플리케이션 진입점

src/main/resources/
├── application.yml # 애플리케이션 설정
├── mapper/        # MyBatis XML 매퍼
└── static/        # 정적 리소스
\`\`\`

## 네이밍 규칙(Naming Conventions)
- **클래스명**: PascalCase
- **메서드명**: camelCase
- **변수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE
- **테이블명**: snake_case
- **컬럼명**: snake_case

## API 설계 규칙(API Design Rules)
- **RESTful URL 패턴**:
  - GET /api/{resource} - 목록 조회
  - GET /api/{resource}/{id} - 단건 조회
  - POST /api/{resource} - 생성
  - PUT /api/{resource}/{id} - 수정
  - DELETE /api/{resource}/{id} - 삭제

## 개발 명령어(Development Commands)
\`\`\`bash
./gradlew bootRun  # 애플리케이션 실행
./gradlew build    # 빌드
./gradlew test     # 테스트 실행
\`\`\`

## 환경 설정(Environment Configuration)
- **Java 버전**: Java 21
- **빌드 도구**: Gradle
- **서버 포트**: 8080 (기본값)
- **데이터베이스 포트**: 3306 (MariaDB)

## 데이터베이스 설정(Database Configuration)
\`\`\`yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/${artifactId}_db
    username: root
    password: password
    driver-class-name: org.mariadb.jdbc.Driver
\`\`\`
```

## 초기화 완료 메시지
```
✅ Backend 프로젝트 초기화 완료!
📦 ./gradlew build 실행 완료
📝 backend-config.md 생성 완료

🚀 애플리케이션 실행: ./gradlew bootRun
🌐 API 테스트: http://localhost:8080/api/hello
```