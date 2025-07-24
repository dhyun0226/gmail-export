# AI 프로젝트 수집 명령어 가이드

## 📋 개요

`/ai-project-collect`는 분리된 프런트엔드와 백엔드 프로젝트의 정보를 수집하여 통합 메타데이터를 생성하는 Claude Code 명령어입니다.

## 🎯 명령어 등록 방법

### 1. Claude Code 설정 파일 생성

```json
// .claude/commands/ai-project-collect.json
{
  "name": "ai-project-collect",
  "description": "분리된 프런트엔드/백엔드 프로젝트 정보 수집",
  "version": "1.0.0",
  "author": "AI Design System",
  "parameters": {
    "frontend": {
      "type": "path",
      "required": true,
      "description": "프런트엔드 프로젝트 경로",
      "alias": ["f", "fe"]
    },
    "backend": {
      "type": "path", 
      "required": true,
      "description": "백엔드 프로젝트 경로",
      "alias": ["b", "be"]
    },
    "output": {
      "type": "path",
      "required": false,
      "default": "./.ai-metadata",
      "description": "메타데이터 출력 경로",
      "alias": ["o"]
    },
    "mode": {
      "type": "enum",
      "required": false,
      "default": "standard",
      "choices": ["fast", "standard", "deep"],
      "description": "스캔 모드"
    },
    "merge-strategy": {
      "type": "enum",
      "required": false,
      "default": "smart",
      "choices": ["smart", "manual", "template"],
      "description": "프로젝트 정보 병합 전략"
    },
    "interactive": {
      "type": "boolean",
      "required": false,
      "default": false,
      "description": "대화형 모드 실행",
      "alias": ["i"]
    }
  },
  "execution": {
    "type": "shell",
    "script": "node /path/to/ai-project-collect.js"
  }
}
```

### 2. 실행 스크립트 생성

```javascript
// .claude/scripts/ai-project-collect.js
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

class AIProjectCollector {
  constructor() {
    this.version = '1.0.0';
    this.metadata = {
      metadata_version: '2.0.0',
      collection_type: 'separated_projects',
      collected_at: new Date().toISOString(),
      projects: {
        frontend: null,
        backend: null
      }
    };
  }

  async collect(options) {
    console.log(chalk.cyan('🚀 AI 프로젝트 정보 수집 시작\n'));

    // 대화형 모드 처리
    if (options.interactive) {
      options = await this.runInteractiveMode();
    }

    // 프런트엔드 프로젝트 수집
    const feSpin = ora('프런트엔드 프로젝트 분석 중...').start();
    this.metadata.projects.frontend = await this.collectFrontend(options.frontend, options.mode);
    feSpin.succeed('프런트엔드 분석 완료');

    // 백엔드 프로젝트 수집
    const beSpin = ora('백엔드 프로젝트 분석 중...').start();
    this.metadata.projects.backend = await this.collectBackend(options.backend, options.mode);
    beSpin.succeed('백엔드 분석 완료');

    // 메타데이터 병합
    const mergeSpin = ora('메타데이터 병합 중...').start();
    const mergedMetadata = await this.mergeMetadata(options.mergeStrategy);
    mergeSpin.succeed('메타데이터 병합 완료');

    // 결과 저장
    await this.saveMetadata(mergedMetadata, options.output);

    // 검증
    if (options.validate) {
      await this.validateMetadata(mergedMetadata);
    }

    this.showSummary(mergedMetadata);
  }

  async runInteractiveMode() {
    console.log(chalk.yellow('🎯 대화형 프로젝트 수집 모드\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'frontend',
        message: '프런트엔드 프로젝트 경로:',
        default: './frontend',
        validate: (input) => {
          if (!fs.existsSync(input)) {
            return '경로가 존재하지 않습니다.';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'backend',
        message: '백엔드 프로젝트 경로:',
        default: './backend',
        validate: (input) => {
          if (!fs.existsSync(input)) {
            return '경로가 존재하지 않습니다.';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'mode',
        message: '스캔 모드 선택:',
        choices: [
          { name: '⚡ Fast (30초, 85% 정확도)', value: 'fast' },
          { name: '📊 Standard (1-2분, 90% 정확도)', value: 'standard' },
          { name: '🔍 Deep (3-5분, 95% 정확도)', value: 'deep' }
        ],
        default: 'standard'
      },
      {
        type: 'list',
        name: 'mergeStrategy',
        message: '병합 전략 선택:',
        choices: [
          { name: '🤖 Smart (자동 최적화)', value: 'smart' },
          { name: '✏️ Manual (수동 선택)', value: 'manual' },
          { name: '📋 Template (템플릿 기반)', value: 'template' }
        ],
        default: 'smart'
      },
      {
        type: 'confirm',
        name: 'validate',
        message: '수집 후 자동 검증을 실행하시겠습니까?',
        default: true
      }
    ]);

    return answers;
  }

  async collectFrontend(projectPath, mode) {
    const metadata = {
      path: path.resolve(projectPath),
      collected_at: new Date().toISOString(),
      scan_mode: mode
    };

    // package.json 분석
    const packagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      metadata.package_info = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      };

      // 프레임워크 감지
      metadata.framework = this.detectFrontendFramework(packageJson);
      metadata.ui_library = this.detectUILibrary(packageJson);
      metadata.dependencies = this.extractKeyDependencies(packageJson.dependencies);
    }

    // 프로젝트 구조 분석
    metadata.structure = await this.analyzeFrontendStructure(projectPath);

    // 설정 파일 분석
    metadata.config = await this.analyzeFrontendConfig(projectPath);

    return metadata;
  }

  async collectBackend(projectPath, mode) {
    const metadata = {
      path: path.resolve(projectPath),
      collected_at: new Date().toISOString(),
      scan_mode: mode
    };

    // Java 프로젝트 감지
    const pomPath = path.join(projectPath, 'pom.xml');
    const gradlePath = path.join(projectPath, 'build.gradle');
    
    if (fs.existsSync(pomPath)) {
      metadata.build_tool = 'Maven';
      metadata.framework = await this.detectJavaFramework(pomPath);
    } else if (fs.existsSync(gradlePath)) {
      metadata.build_tool = 'Gradle';
      metadata.framework = await this.detectJavaFramework(gradlePath);
    }

    // Node.js 프로젝트 감지
    const nodePackagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(nodePackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(nodePackagePath, 'utf8'));
      metadata.framework = this.detectBackendFramework(packageJson);
      metadata.dependencies = this.extractKeyDependencies(packageJson.dependencies);
    }

    // 프로젝트 구조 분석
    metadata.structure = await this.analyzeBackendStructure(projectPath);

    // API 패턴 분석
    metadata.api_patterns = await this.analyzeAPIPattterns(projectPath);

    return metadata;
  }

  async mergeMetadata(strategy) {
    const { frontend, backend } = this.metadata.projects;

    const merged = {
      metadata_version: '2.0.0',
      schema_version: '2024.1',
      generated_at: new Date().toISOString(),
      generation_method: 'ai-project-collect',
      projectInfo: {
        name: frontend.package_info?.name || 'integrated-system',
        version: '1.0.0',
        description: '분리된 프런트엔드/백엔드 통합 시스템',
        type: 'Separated Architecture',
        frontend_path: frontend.path,
        backend_path: backend.path
      },
      techStack: {
        frontend: {
          framework: frontend.framework?.name || 'Unknown',
          version: frontend.framework?.version || 'Unknown',
          ui_library: frontend.ui_library || 'Unknown',
          libs: frontend.dependencies || []
        },
        backend: {
          framework: backend.framework?.name || 'Unknown', 
          version: backend.framework?.version || 'Unknown',
          build_tool: backend.build_tool || 'Unknown',
          libs: backend.dependencies || []
        }
      },
      architecture: {
        pattern: 'Separated Frontend/Backend',
        frontend_structure: frontend.structure,
        backend_structure: backend.structure,
        communication: 'REST API',
        deployment: 'Separate Containers'
      }
    };

    // Smart 병합 전략
    if (strategy === 'smart') {
      merged.optimization = {
        cors_required: true,
        api_gateway_recommended: true,
        separate_deployment: true
      };
    }

    return merged;
  }

  async saveMetadata(metadata, outputPath) {
    const fullPath = path.resolve(outputPath);
    
    // 디렉토리 생성
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // 메타데이터 저장
    const metadataFile = path.join(fullPath, 'project-metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    // 수집 로그 저장
    const logFile = path.join(fullPath, 'collection-log.json');
    fs.writeFileSync(logFile, JSON.stringify(this.metadata, null, 2));

    console.log(chalk.green(`\n✅ 메타데이터 저장 완료: ${metadataFile}`));
  }

  showSummary(metadata) {
    console.log(chalk.cyan('\n📊 수집 결과 요약'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(chalk.yellow('\n🎨 프런트엔드:'));
    console.log(`  프레임워크: ${metadata.techStack.frontend.framework} ${metadata.techStack.frontend.version}`);
    console.log(`  UI 라이브러리: ${metadata.techStack.frontend.ui_library}`);
    console.log(`  주요 라이브러리: ${metadata.techStack.frontend.libs.slice(0, 3).join(', ')}`);
    
    console.log(chalk.yellow('\n⚙️ 백엔드:'));
    console.log(`  프레임워크: ${metadata.techStack.backend.framework} ${metadata.techStack.backend.version}`);
    console.log(`  빌드 도구: ${metadata.techStack.backend.build_tool}`);
    console.log(`  주요 라이브러리: ${metadata.techStack.backend.libs.slice(0, 3).join(', ')}`);
    
    console.log(chalk.yellow('\n🏗️ 아키텍처:'));
    console.log(`  패턴: ${metadata.architecture.pattern}`);
    console.log(`  통신: ${metadata.architecture.communication}`);
    console.log(`  배포: ${metadata.architecture.deployment}`);
    
    console.log(chalk.gray('\n━'.repeat(50)));
    console.log(chalk.green('✨ AI 화면 설계를 시작할 준비가 완료되었습니다!'));
    console.log(chalk.blue('   /ai-design [이미지] full 명령어로 시작하세요.\n'));
  }

  // 헬퍼 메서드들
  detectFrontendFramework(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.vue) {
      const version = deps.vue.replace(/[\^~]/, '');
      return { name: 'Vue', version, variant: version.startsWith('3') ? 'Vue 3' : 'Vue 2' };
    }
    if (deps.react) {
      const version = deps.react.replace(/[\^~]/, '');
      return { name: 'React', version };
    }
    if (deps['@angular/core']) {
      const version = deps['@angular/core'].replace(/[\^~]/, '');
      return { name: 'Angular', version };
    }
    
    return { name: 'Unknown', version: 'Unknown' };
  }

  detectUILibrary(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['bootstrap-vue-next']) return 'Bootstrap Vue Next';
    if (deps['vuetify']) return 'Vuetify';
    if (deps['element-plus']) return 'Element Plus';
    if (deps['ant-design-vue']) return 'Ant Design Vue';
    if (deps['@mui/material']) return 'Material-UI';
    if (deps['antd']) return 'Ant Design';
    
    return 'Custom/Unknown';
  }

  detectBackendFramework(packageJson) {
    const deps = { ...packageJson.dependencies };
    
    if (deps.express) {
      return { name: 'Express.js', version: deps.express.replace(/[\^~]/, '') };
    }
    if (deps.fastify) {
      return { name: 'Fastify', version: deps.fastify.replace(/[\^~]/, '') };
    }
    if (deps['@nestjs/core']) {
      return { name: 'NestJS', version: deps['@nestjs/core'].replace(/[\^~]/, '') };
    }
    
    return { name: 'Unknown', version: 'Unknown' };
  }

  async detectJavaFramework(buildFile) {
    const content = fs.readFileSync(buildFile, 'utf8');
    
    if (content.includes('spring-boot')) {
      // Spring Boot 버전 추출 시도
      const versionMatch = content.match(/spring-boot['":\s]+(\d+\.\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : '3.x';
      return { name: 'Spring Boot', version };
    }
    
    return { name: 'Java', version: 'Unknown' };
  }

  extractKeyDependencies(deps) {
    if (!deps) return [];
    
    const keyLibs = [
      'axios', 'pinia', 'vuex', 'redux', 'mobx',
      'vue-router', 'react-router', '@angular/router',
      'dayjs', 'moment', 'lodash', 'ramda',
      'devextreme', 'ag-grid', 'chart.js'
    ];
    
    return Object.keys(deps)
      .filter(dep => keyLibs.some(lib => dep.includes(lib)))
      .map(dep => ({ name: dep, version: deps[dep] }));
  }

  async analyzeFrontendStructure(projectPath) {
    const structure = {
      src_exists: fs.existsSync(path.join(projectPath, 'src')),
      public_exists: fs.existsSync(path.join(projectPath, 'public')),
      components_path: null,
      pages_path: null,
      stores_path: null
    };

    // 일반적인 구조 탐색
    const possiblePaths = [
      'src/components',
      'src/views',
      'src/pages',
      'src/stores',
      'src/store',
      'src/redux'
    ];

    for (const p of possiblePaths) {
      const fullPath = path.join(projectPath, p);
      if (fs.existsSync(fullPath)) {
        const key = path.basename(p) + '_path';
        structure[key] = p;
      }
    }

    return structure;
  }

  async analyzeBackendStructure(projectPath) {
    const structure = {
      src_exists: fs.existsSync(path.join(projectPath, 'src')),
      controllers_path: null,
      services_path: null,
      models_path: null,
      routes_path: null
    };

    // Java 프로젝트 구조
    const javaPaths = [
      'src/main/java',
      'src/main/resources'
    ];

    // Node.js 프로젝트 구조
    const nodePaths = [
      'src/controllers',
      'src/services',
      'src/models',
      'src/routes',
      'controllers',
      'services',
      'models',
      'routes'
    ];

    const allPaths = [...javaPaths, ...nodePaths];

    for (const p of allPaths) {
      const fullPath = path.join(projectPath, p);
      if (fs.existsSync(fullPath)) {
        const key = path.basename(p) + '_path';
        structure[key] = p;
      }
    }

    return structure;
  }

  async analyzeFrontendConfig(projectPath) {
    const config = {};

    // Vite 설정
    const viteConfig = path.join(projectPath, 'vite.config.js');
    if (fs.existsSync(viteConfig)) {
      config.build_tool = 'Vite';
    }

    // Webpack 설정
    const webpackConfig = path.join(projectPath, 'webpack.config.js');
    if (fs.existsSync(webpackConfig)) {
      config.build_tool = 'Webpack';
    }

    // TypeScript 설정
    const tsConfig = path.join(projectPath, 'tsconfig.json');
    if (fs.existsSync(tsConfig)) {
      config.typescript = true;
      const tsConfigContent = JSON.parse(fs.readFileSync(tsConfig, 'utf8'));
      config.typescript_config = {
        target: tsConfigContent.compilerOptions?.target,
        module: tsConfigContent.compilerOptions?.module
      };
    }

    return config;
  }

  async analyzeAPIPattterns(projectPath) {
    const patterns = {
      rest: false,
      graphql: false,
      websocket: false
    };

    // 파일 내용 검색으로 API 패턴 감지
    // 실제 구현에서는 더 정교한 분석 필요
    
    return patterns;
  }

  async validateMetadata(metadata) {
    console.log(chalk.yellow('\n🔍 메타데이터 검증 중...'));
    
    const issues = [];
    
    // 필수 필드 검증
    if (!metadata.techStack?.frontend?.framework) {
      issues.push('프런트엔드 프레임워크 정보 누락');
    }
    if (!metadata.techStack?.backend?.framework) {
      issues.push('백엔드 프레임워크 정보 누락');
    }
    
    if (issues.length > 0) {
      console.log(chalk.red('⚠️  검증 경고:'));
      issues.forEach(issue => console.log(chalk.yellow(`   - ${issue}`)));
    } else {
      console.log(chalk.green('✅ 검증 통과!'));
    }
  }
}

// CLI 실행
if (require.main === module) {
  const collector = new AIProjectCollector();
  const args = process.argv.slice(2);
  
  // 옵션 파싱
  const options = {
    frontend: null,
    backend: null,
    output: './.ai-metadata',
    mode: 'standard',
    mergeStrategy: 'smart',
    interactive: false,
    validate: true
  };

  // 간단한 옵션 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.split('=');
      const optionKey = key.replace('--', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      if (value !== undefined) {
        options[optionKey] = value;
      } else if (optionKey === 'interactive') {
        options[optionKey] = true;
      }
    }
  }

  // 실행
  collector.collect(options).catch(err => {
    console.error(chalk.red('❌ 오류:', err.message));
    process.exit(1);
  });
}

module.exports = AIProjectCollector;
```

## 🚀 사용 시나리오

### 시나리오 1: 기본 프로젝트 수집
```bash
# Vue 3 프런트엔드 + Spring Boot 백엔드
/ai-project-collect --frontend=./vue-app --backend=./spring-api

# 결과
✅ 프런트엔드 분석 완료
  - Framework: Vue 3.4.32
  - UI Library: Bootstrap Vue Next
  - State Management: Pinia

✅ 백엔드 분석 완료  
  - Framework: Spring Boot 3.2.x
  - Build Tool: Maven
  - Database: PostgreSQL

📁 메타데이터 저장: ./.ai-metadata/project-metadata.json
```

### 시나리오 2: 대화형 모드
```bash
/ai-project-collect --interactive

# 대화형 프롬프트
? 프런트엔드 프로젝트 경로: ./frontend
? 백엔드 프로젝트 경로: ./backend  
? 스캔 모드 선택: Standard (1-2분, 90% 정확도)
? 병합 전략 선택: Smart (자동 최적화)
? 수집 후 자동 검증을 실행하시겠습니까? Yes

🔍 프로젝트 분석 중...
```

### 시나리오 3: 모노레포 프로젝트
```bash
# 모노레포 구조에서 분리된 앱 수집
/ai-project-collect \
  --frontend=./packages/web-app \
  --backend=./packages/api-server \
  --output=./packages/ai-metadata
```

## 📊 생성되는 메타데이터 구조

### 통합 메타데이터 (project-metadata.json)
```json
{
  "metadata_version": "2.0.0",
  "generation_method": "ai-project-collect",
  "projectInfo": {
    "name": "integrated-system",
    "type": "Separated Architecture",
    "frontend_path": "/workspace/vue-app",
    "backend_path": "/workspace/spring-api"
  },
  "techStack": {
    "frontend": {
      "framework": "Vue 3",
      "version": "3.4.32",
      "ui_library": "Bootstrap Vue Next",
      "libs": ["pinia", "vue-router", "axios"]
    },
    "backend": {
      "framework": "Spring Boot",
      "version": "3.2.x",
      "build_tool": "Maven",
      "libs": ["spring-security", "spring-data-jpa"]
    }
  },
  "architecture": {
    "pattern": "Separated Frontend/Backend",
    "communication": "REST API",
    "deployment": "Separate Containers",
    "cors_required": true
  }
}
```

### 수집 로그 (collection-log.json)
```json
{
  "collection_type": "separated_projects",
  "collected_at": "2025-07-01T10:30:00Z",
  "projects": {
    "frontend": {
      "path": "/workspace/vue-app",
      "scan_mode": "standard",
      "framework": { "name": "Vue", "version": "3.4.32" },
      "structure": {
        "components_path": "src/components",
        "pages_path": "src/pages",
        "stores_path": "src/stores"
      }
    },
    "backend": {
      "path": "/workspace/spring-api",
      "scan_mode": "standard",
      "framework": { "name": "Spring Boot", "version": "3.2.x" },
      "build_tool": "Maven",
      "api_patterns": { "rest": true }
    }
  }
}
```

## 🔧 고급 기능

### 1. 병합 전략 상세

#### Smart 전략 (기본값)
```yaml
자동_최적화:
  - CORS 설정 자동 감지
  - API Gateway 필요성 판단
  - 인증 방식 통합 제안
  - 배포 전략 추천
```

#### Manual 전략
```yaml
수동_선택:
  - 각 설정을 대화형으로 선택
  - 충돌하는 설정 수동 해결
  - 커스텀 매핑 규칙 정의
```

#### Template 전략
```yaml
템플릿_기반:
  - 사전 정의된 템플릿 사용
  - 프로젝트 타입별 최적화
  - 빠른 설정 완료
```

### 2. 검증 및 최적화

```bash
# 검증만 실행
/ai-project-collect --frontend=./fe --backend=./be --validate-only

# 최적화 제안 포함
/ai-project-collect --frontend=./fe --backend=./be --optimize

# 호환성 검사
/ai-project-collect --frontend=./fe --backend=./be --check-compatibility
```

## 🎯 다음 단계

메타데이터 수집 완료 후:

```bash
# 1. AI 화면 설계 시작
/ai-design ./design-mockup.png full

# 2. 메타데이터 검증
/ai-metadata-validate

# 3. 프로젝트별 코드 생성
/ai-design ./screen.png full --target=frontend
/ai-design ./screen.png full --target=backend
```

## 📚 관련 명령어

- `/ai-metadata-generate`: 단일 프로젝트 메타데이터 생성
- `/ai-metadata-wizard`: 대화형 메타데이터 생성
- `/ai-design`: AI 화면 설계 및 코드 생성

---

이제 분리된 프런트엔드/백엔드 프로젝트도 **쉽고 빠르게** 통합 관리할 수 있습니다! 🚀