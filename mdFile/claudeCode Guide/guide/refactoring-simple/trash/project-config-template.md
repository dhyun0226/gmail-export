# 프로젝트 설정 템플릿

이 파일은 리팩토링을 실행할 프로젝트별로 생성해야 하는 설정 파일입니다.
`project-config.md` 파일명으로 프로젝트 루트에 저장하세요.

## 프로젝트 정보

```yaml
project:
  name: "프로젝트명"
  description: "프로젝트 설명"
```

## 경로 설정

```yaml
paths:
  baseProjectPath: "/path/to/your/project"
  javaMain: "src/main/java"
  resourceMain: "src/main/resources"
  projectPackagePath: "com/example/project"  # 패키지 경로 (슬래시 구분)
```

## 패키지 구조

```yaml
packages:
  basePackage: "com.example.project"
  controllerPackage: "${basePackage}.controller"
  servicePackage: "${basePackage}.service"  # 또는 domain
  mapperPackage: "${basePackage}.mapper"
  dtoPackage: "${basePackage}.dto"
  modelPackage: "${basePackage}.model"
```

## 소스 파일 위치

```yaml
sourceLocations:
  controller: "${baseProjectPath}/${javaMain}/${projectPackagePath}/controller"
  service: "${baseProjectPath}/${javaMain}/${projectPackagePath}/service"
  mapper: "${baseProjectPath}/${javaMain}/${projectPackagePath}/mapper"
  xml: "${baseProjectPath}/${resourceMain}/mapper"
```

## 리팩토링 결과 경로

```yaml
refactoring:
  outputBase: "${baseProjectPath}/refactoring"
  outputPath: "${outputBase}/${className}-${todayYYYYMMDD}"
```

## MyBatis 설정

```yaml
mybatis:
  xmlLocation: "mapper"  # resources 하위 경로
  xmlNaming: "${className}_SqlMapper.xml"  # XML 파일 명명 규칙
```

## 프로젝트별 규칙 (선택사항)

```yaml
rules:
  useServiceLayer: true  # Service 레이어 사용 여부
  serviceName: "service"  # service 또는 domain
  controllerSuffix: "Controller"
  serviceSuffix: "Service"
  mapperSuffix: "Mapper"
```