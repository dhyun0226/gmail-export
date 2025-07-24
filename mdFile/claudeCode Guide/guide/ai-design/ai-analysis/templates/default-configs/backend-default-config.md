# 백엔드 기본 설정 템플릿

## 프로젝트 메타데이터

### 프로젝트 식별 정보
- **Project ID**: [프로젝트 고유 ID] (예: PROJ-2025-001)
- **Project Name**: [프로젝트명]
- **Version**: 1.0.0
- **Description**: [프로젝트 설명]
- **Author**: Development Team
- **Copyright**: © 2025 OSSTEM IMPLANT. All rights reserved.
- **License**: [라이선스] (예: MIT, Apache 2.0, Proprietary)
- **Created Date**: 2025-01-01
- **Last Modified**: 2025-07-04

### 팀 정보
- **Lead Developer**: [리드 개발자명]
- **Contributors**: [기여자 목록]
- **Contact Email**: [연락처 이메일]
- **Team/Department**: [팀/부서명]

### 프로젝트 관리
- **Repository URL**: [Git 저장소 URL]
- **Documentation**: [문서화 사이트 URL]
- **Issue Tracker**: [이슈 트래커 URL]
- **CI/CD Pipeline**: [CI/CD 도구 및 URL]

### 비즈니스 정보
- **Client/Customer**: [고객사명]
- **Business Domain**: [비즈니스 도메인]
- **Project Scope**: [프로젝트 범위]
- **Target Users**: [대상 사용자]

## 프로젝트 기본 정보

### 기술 스택
- **언어**: Java 21 (LTS)
- **프레임워크**: Spring Boot 3.4.0
- **빌드 도구**: Gradle 8.5
- **데이터베이스**: MariaDB 11.2
- **ORM**: MyBatis 3.5.15
- **API 문서화**: Swagger (SpringDoc OpenAPI) 2.3.0
- **기타 라이브러리**: Lombok 1.18.30

### 아키텍처
- **패턴**: 레이어드 아키텍처 (Layered Architecture)
- **계층**: Controller → Service → Mapper(DAO) → Database
- **패키지 구조**: 도메인 기반 패키지 구조

## 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── project/
│   │   │               ├── common/
│   │   │               │   ├── config/
│   │   │               │   │   ├── DatabaseConfig.java
│   │   │               │   │   ├── MyBatisConfig.java
│   │   │               │   │   ├── SwaggerConfig.java
│   │   │               │   │   └── WebConfig.java
│   │   │               │   ├── exception/
│   │   │               │   │   ├── BusinessException.java
│   │   │               │   │   ├── EntityNotFoundException.java
│   │   │               │   │   └── GlobalExceptionHandler.java
│   │   │               │   ├── interceptor/
│   │   │               │   │   └── AuditInterceptor.java
│   │   │               │   ├── response/
│   │   │               │   │   └── ApiResponse.java
│   │   │               │   └── util/
│   │   │               │       ├── DateUtils.java
│   │   │               │       └── StringUtils.java
│   │   │               ├── domain/
│   │   │               │   └── sample/
│   │   │               │       ├── controller/
│   │   │               │       │   └── SampleController.java
│   │   │               │       ├── service/
│   │   │               │       │   └── SampleService.java
│   │   │               │       ├── mapper/
│   │   │               │       │   └── SampleMapper.java
│   │   │               │       └── model/
│   │   │               │           ├── dto/
│   │   │               │           │   ├── SampleDto.java
│   │   │               │           │   ├── SampleCreateRequestDto.java
│   │   │               │           │   ├── SampleUpdateRequestDto.java
│   │   │               │           │   └── SampleSearchDto.java
│   │   │               │           └── code/
│   │   │               │               └── SampleStatusCode.java
│   │   │               └── Application.java
│   │   └── resources/
│   │       ├── mapper/
│   │       │   └── sample/
│   │       │       └── SampleMapper.xml
│   │       ├── messages/
│   │       │   ├── common-message.properties
│   │       │   ├── common-message_en.properties
│   │       │   ├── project-message.properties
│   │       │   ├── project-message_en.properties
│   │       │   ├── project-validation.properties
│   │       │   └── project-validation_en.properties
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── logback-spring.xml
│   │       └── mybatis-config.xml
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           └── project/
│       │               └── domain/
│       │                   └── sample/
│       │                       ├── controller/
│       │                       │   └── SampleControllerTest.java
│       │                       └── service/
│       │                           └── SampleServiceTest.java
│       └── resources/
│           └── application-test.yml
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── .gitignore
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
└── README.md
```

## 설정 파일 내용

### build.gradle
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.example'
version = '1.0.0-SNAPSHOT'
description = '[프로젝트 설명]'

java {
    sourceCompatibility = '21'
}

// 프로젝트 메타데이터
project.ext {
    projectId = '[프로젝트 ID]'
    author = 'Development Team'
    copyright = '© 2025 OSSTEM IMPLANT'
    license = '[라이선스]'
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-aop'
    
    // Database
    implementation 'org.springframework.boot:spring-boot-starter-jdbc'
    implementation 'org.mariadb.jdbc:mariadb-java-client'
    
    // MyBatis
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
    
    // Swagger
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
    
    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // DevTools
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter-test:3.0.3'
}

tasks.named('test') {
    useJUnitPlatform()
}

// Java 21 특성 활성화
tasks.withType(JavaCompile) {
    options.compilerArgs += ['--enable-preview']
}

tasks.withType(Test) {
    jvmArgs += ['--enable-preview']
}

tasks.withType(JavaExec) {
    jvmArgs += ['--enable-preview']
}
```

### application.yml
```yaml
# 프로젝트 메타데이터
project:
  id: '[프로젝트 ID]'
  version: '1.0.0'
  author: 'Development Team'
  copyright: '© 2025 OSSTEM IMPLANT'
  
spring:
  application:
    name: project-backend
    
  profiles:
    active: dev
    
  messages:
    basename: messages/common-message,messages/project-message,messages/project-validation
    encoding: UTF-8
    
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
      
  jackson:
    time-zone: Asia/Seoul
    serialization:
      write-dates-as-timestamps: false
      
mybatis:
  type-aliases-package: com.example.project.**.model
  mapper-locations: classpath:mapper/**/*.xml
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 1000
    default-statement-timeout: 30
    
logging:
  level:
    root: INFO
    com.example.project: DEBUG
    org.springframework.web: DEBUG
    
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: alpha
    tags-sorter: alpha
  packages-to-scan: com.example.project
  paths-to-match: /api/**
```

### application-dev.yml
```yaml
spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/project_db?characterEncoding=UTF-8&serverTimezone=Asia/Seoul
    username: dev_user
    password: dev_password
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      
  devtools:
    restart:
      enabled: true
      
logging:
  level:
    org.springframework.jdbc: DEBUG
    com.example.project.**.mapper: TRACE
```

### application-prod.yml
```yaml
spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://prod-db-server:3306/project_db?characterEncoding=UTF-8&serverTimezone=Asia/Seoul
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
      connection-timeout: 30000
      
logging:
  level:
    root: WARN
    com.example.project: INFO
```

### mybatis-config.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <settings>
        <setting name="cacheEnabled" value="true"/>
        <setting name="lazyLoadingEnabled" value="true"/>
        <setting name="aggressiveLazyLoading" value="false"/>
        <setting name="multipleResultSetsEnabled" value="true"/>
        <setting name="useColumnLabel" value="true"/>
        <setting name="useGeneratedKeys" value="false"/>
        <setting name="autoMappingBehavior" value="PARTIAL"/>
        <setting name="defaultExecutorType" value="SIMPLE"/>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <setting name="localCacheScope" value="SESSION"/>
        <setting name="jdbcTypeForNull" value="NULL"/>
    </settings>
</configuration>
```

## 초기 코드 예시

### BaseDto.java
```java
package com.example.project.common.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 공통 DTO 기본 클래스
 * 모든 DTO가 상속받는 기본 클래스로 Audit 필드를 포함합니다.
 * 
 * @author Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * @copyright © 2025 OSSTEM IMPLANT. All rights reserved.
 * @license [라이선스]
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "공통 Audit 필드를 포함하는 기본 DTO")
public abstract class BaseDto {
    
    @Schema(description = "처리 프로그램 ID", example = "UI-USR-001", hidden = true)
    private String procPrgmId;
    
    @Schema(description = "등록 처리자 ID", example = "admin", accessMode = Schema.AccessMode.READ_ONLY)
    private String rgstProcrId;
    
    @Schema(description = "등록 처리 일시", example = "2024-01-01 09:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime rgstProcDtm;
    
    @Schema(description = "수정 처리자 ID", example = "admin", accessMode = Schema.AccessMode.READ_ONLY)
    private String updtProcrId;
    
    @Schema(description = "수정 처리 일시", example = "2024-01-01 10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updtProcDtm;
}
```

### ApiResponse.java
```java
package com.example.project.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * API 공통 응답 클래스
 * 모든 API 응답을 감싸는 표준 응답 형식입니다.
 * 
 * @author Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * @copyright © 2025 OSSTEM IMPLANT. All rights reserved.
 * @license [라이선스]
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "API 표준 응답 객체")
public class ApiResponse<T> {
    
    @Schema(description = "응답 성공 여부", example = "true", required = true)
    private boolean success;
    
    @Schema(description = "응답 데이터")
    private T data;
    
    @Schema(description = "응답 메시지", example = "처리가 완료되었습니다.")
    private String message;
    
    @Schema(description = "메시지 코드", example = "SUCCESS")
    private String messageCode;
    
    @Schema(description = "에러 코드", example = "ERR001")
    private String errorCode;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String messageCode) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .messageCode(messageCode)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .build();
    }
}
```

### GlobalExceptionHandler.java
```java
package com.example.project.common.exception;

import com.example.project.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Locale;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    
    private final MessageSource messageSource;
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e, Locale locale) {
        String message = messageSource.getMessage(e.getMessageCode(), e.getArgs(), locale);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessageCode(), message));
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(EntityNotFoundException e, Locale locale) {
        String message = messageSource.getMessage(e.getMessageCode(), e.getArgs(), locale);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessageCode(), message));
    }
    
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Void>> handleBindException(BindException e, Locale locale) {
        String field = e.getBindingResult().getFieldError().getField();
        String errorCode = e.getBindingResult().getFieldError().getCode();
        String messageCode = field + "." + errorCode;
        String message = messageSource.getMessage(messageCode, null, locale);
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(messageCode, message));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected error occurred", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("system.error", "시스템 오류가 발생했습니다."));
    }
}
```

## 데이터베이스 설정

### 테이블 생성 스크립트 예시
```sql
-- 샘플 테이블
CREATE TABLE TB_SAMPLE (
    SAMPLE_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT '샘플ID',
    SAMPLE_NM VARCHAR(100) NOT NULL COMMENT '샘플명',
    SAMPLE_DESC VARCHAR(500) COMMENT '샘플설명',
    SAMPLE_STATUS_CD VARCHAR(10) NOT NULL COMMENT '샘플상태코드',
    USE_YN CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용여부',
    PROC_PRGM_ID VARCHAR(50) NOT NULL COMMENT '처리프로그램ID',
    RGST_PROCR_ID VARCHAR(50) NOT NULL COMMENT '등록처리자ID',
    RGST_PROC_DTM DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '등록처리일시',
    UPDT_PROCR_ID VARCHAR(50) COMMENT '수정처리자ID',
    UPDT_PROC_DTM DATETIME(6) COMMENT '수정처리일시',
    PRIMARY KEY (SAMPLE_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='샘플';

-- 인덱스
CREATE INDEX IDX_SAMPLE_01 ON TB_SAMPLE(SAMPLE_STATUS_CD);
CREATE INDEX IDX_SAMPLE_02 ON TB_SAMPLE(USE_YN, RGST_PROC_DTM);
```

## 사용 가이드

### 1. 프로젝트 초기화
```bash
./gradlew clean build
```

### 2. 개발 서버 실행
```bash
./gradlew bootRun
```

### 3. 테스트 실행
```bash
./gradlew test
```

### 4. JAR 파일 생성
```bash
./gradlew bootJar
```

## 주요 특징

1. **Java 21 최신 기능**: Record, Pattern Matching, Switch Expression 활용
2. **레이어드 아키텍처**: 명확한 계층 분리로 유지보수성 향상
3. **MyBatis**: 복잡한 쿼리 처리에 유리
4. **Swagger UI**: API 문서 자동 생성
5. **메시지 국제화**: 다국어 지원
6. **예외 처리**: 글로벌 예외 핸들러로 일관된 응답
7. **Audit 자동화**: Interceptor를 통한 Audit 컬럼 자동 처리
8. **프로파일 분리**: 환경별 설정 관리