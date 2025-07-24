# Backend 기존 프로젝트 분석 가이드

기존 Backend 프로젝트의 기술 스택과 구조를 분석하여 backend-config.md 파일을 생성합니다.

## 분석 대상 파일
1. `build.gradle` - Gradle 프로젝트 설정 (기본 빌드 도구)
2. `application.yml/properties` - Spring Boot 설정
3. `src/main/java/` - Java 소스 구조
4. Java 클래스 파일 분석

**주의**: 프로젝트는 기본 설정은 Gradle입니다.

## 빌드 도구 감지
### Gradle 프로젝트 분석 (build.gradle 파일):
```gradle
// Spring Boot 버전
id 'org.springframework.boot' version '3.4.0'

// Java 버전
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

// Group ID
group = 'com.example'

// 데이터베이스 의존성
runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'  → MariaDB
runtimeOnly 'mysql:mysql-connector-java'            → MySQL
runtimeOnly 'org.postgresql:postgresql'             → PostgreSQL
runtimeOnly 'com.h2database:h2'                     → H2

// ORM 감지
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter' → MyBatis
implementation 'org.springframework.boot:spring-boot-starter-data-jpa' → JPA
```

## 패키지 구조 분석
### src/main/java/ 폴더에서 패키지 구조 확인:
```
src/main/java/
└── com/example/myproject/
    ├── Application.java        # Main 클래스
    ├── controller/            # REST API
    ├── service/              # 비즈니스 로직
    ├── mapper/           # 데이터 접근
    ├── entity/               # 엔티티
    ├── dto/                  # DTO
    └── config/               # 설정
```

## 데이터베이스 설정 분석
### application.yml/properties에서:
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/db_name
    driver-class-name: org.mariadb.jdbc.Driver
    
# 또는
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db_name
    driver-class-name: com.mysql.cj.jdbc.Driver
```

## 프레임워크 버전 감지
### Spring Boot 의존성 확인:
```gradle/xml
// Web
spring-boot-starter-web → Spring MVC

// Security  
spring-boot-starter-security → Spring Security

// Data
spring-boot-starter-data-jpa → JPA
mybatis-spring-boot-starter → MyBatis

// Validation
spring-boot-starter-validation → Bean Validation
```

## backend-config.md 생성
분석된 정보를 바탕으로 다음 형식으로 생성:

```markdown
# Backend Configuration

## 기술 스택(Technology Stack)
- **Language**: Java [감지된 버전]
- **Framework**: Spring Boot [감지된 버전]
- **Build Tool**: Gradle [버전]
- **Database**: [감지된 DB] [버전]
- **ORM**: [MyBatis/JPA] [버전]

## 프로젝트 구조(Project Structure)
\`\`\`
src/main/java/[실제 패키지 구조]/
├── controller/     # REST API 엔드포인트
├── service/        # 비즈니스 로직
├── mapper/     # 데이터 접근 계층
├── entity/         # 도메인 엔티티
├── dto/           # 데이터 전송 객체
├── config/        # 설정 클래스
└── Application.java # 애플리케이션 진입점
\`\`\`

## 네이밍 규칙(Naming Conventions)
- 클래스명: PascalCase
- 메서드명: camelCase
- 변수명: camelCase
- 상수명: UPPER_SNAKE_CASE

## 개발 명령어(Development Commands)
\`\`\`bash
./gradlew bootRun  # 애플리케이션 실행
./gradlew build    # 빌드
./gradlew test     # 테스트 실행
\`\`\`

## 주요 의존성(Main Dependencies)
[실제 의존성 목록]

## 데이터베이스 설정(Database Configuration)
[실제 데이터베이스 설정]
```

## 기본값 설정
분석되지 않는 항목은 다음 기본값 사용:
- Language: Java 21
- Framework: Spring Boot 3.4.0
- Build Tool: Gradle 8.5
- Database: MariaDB 11.2
- ORM: MyBatis 3.5.15