/**
 * 프로젝트 메타데이터 수집을 위한 스캔 규칙 엔진
 * AI 화면 설계 도구에서 사용하는 메타데이터 자동 생성 로직
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ProjectMetadataScanner {
  constructor(config) {
    this.config = config;
    this.results = {
      frontend: {},
      backend: {},
      database: {},
      architecture: {},
      infrastructure: {},
      confidence: {}
    };
  }

  /**
   * 프로젝트 스캔 실행
   * @param {string} projectPath - 스캔할 프로젝트 경로
   * @param {string} mode - 스캔 모드 (standard, deep, fast)
   * @returns {Object} 스캔 결과 메타데이터
   */
  async scanProject(projectPath, mode = 'standard') {
    console.log(`🔍 프로젝트 스캔 시작: ${projectPath} (${mode} 모드)`);
    
    const scanConfig = this.config.scan_config.scan_modes[mode];
    const startTime = Date.now();

    try {
      // 1단계: 파일 목록 수집
      const files = await this.collectFiles(projectPath, scanConfig);
      console.log(`📁 발견된 파일: ${files.length}개`);

      // 2단계: 프론트엔드 분석
      await this.analyzeFrontend(files);
      
      // 3단계: 백엔드 분석
      await this.analyzeBackend(files);
      
      // 4단계: 데이터베이스 분석
      await this.analyzeDatabase(files);
      
      // 5단계: 아키텍처 분석
      await this.analyzeArchitecture(files);
      
      // 6단계: 인프라 분석
      await this.analyzeInfrastructure(files);

      // 7단계: 결과 검증 및 신뢰도 계산
      this.calculateConfidence();

      const elapsed = Date.now() - startTime;
      console.log(`✅ 스캔 완료: ${elapsed}ms`);

      return this.generateMetadata();

    } catch (error) {
      console.error(`❌ 스캔 실패:`, error);
      throw error;
    }
  }

  /**
   * 스캔 대상 파일 수집
   */
  async collectFiles(projectPath, scanConfig) {
    const allPatterns = [
      ...this.config.scan_config.file_patterns.frontend.package_files,
      ...this.config.scan_config.file_patterns.frontend.config_files,
      ...this.config.scan_config.file_patterns.frontend.source_files,
      ...this.config.scan_config.file_patterns.backend.java.build_files,
      ...this.config.scan_config.file_patterns.backend.java.config_files,
      ...this.config.scan_config.file_patterns.backend.nodejs.package_files,
      ...this.config.scan_config.file_patterns.infrastructure.docker_files
    ];

    const files = [];
    
    for (const pattern of allPatterns) {
      try {
        const matches = glob.sync(pattern, {
          cwd: projectPath,
          ignore: this.config.scan_config.ignore_patterns,
          nodir: true
        });
        
        for (const match of matches.slice(0, scanConfig.file_limit)) {
          const fullPath = path.join(projectPath, match);
          const stat = fs.statSync(fullPath);
          
          files.push({
            path: match,
            fullPath: fullPath,
            size: stat.size,
            ext: path.extname(match),
            dir: path.dirname(match)
          });
        }
      } catch (error) {
        console.warn(`⚠️ 패턴 스캔 실패: ${pattern}`, error.message);
      }
    }

    return files.slice(0, scanConfig.file_limit);
  }

  /**
   * 프론트엔드 기술스택 분석
   */
  async analyzeFrontend(files) {
    console.log('🎨 프론트엔드 분석 중...');
    
    const packageFiles = files.filter(f => f.path.includes('package.json'));
    
    for (const file of packageFiles) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const packageJson = JSON.parse(content);
        
        // Vue.js 감지
        if (this.detectVueJS(packageJson, files)) {
          this.results.frontend.framework = 'Vue 3';
          this.results.frontend.version = this.extractVueVersion(packageJson);
          this.results.confidence.frontend = 95;
        }
        
        // React 감지
        else if (this.detectReact(packageJson, files)) {
          this.results.frontend.framework = 'React';
          this.results.frontend.version = this.extractReactVersion(packageJson);
          this.results.confidence.frontend = 95;
        }
        
        // Angular 감지
        else if (this.detectAngular(packageJson, files)) {
          this.results.frontend.framework = 'Angular';
          this.results.frontend.version = this.extractAngularVersion(packageJson);
          this.results.confidence.frontend = 95;
        }

        // UI 라이브러리 감지
        this.detectUILibraries(packageJson);
        
        // 빌드 도구 감지
        this.detectBuildTools(packageJson, files);
        
        // 상태 관리 감지
        this.detectStateManagement(packageJson);

      } catch (error) {
        console.warn(`⚠️ package.json 분석 실패: ${file.path}`);
      }
    }
  }

  /**
   * Vue.js 프레임워크 감지
   */
  detectVueJS(packageJson, files) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Vue 3 의존성 확인
    if (deps.vue && (deps.vue.includes('^3') || deps.vue.includes('3.'))) {
      return true;
    }
    
    // Vue 파일 존재 확인
    const vueFiles = files.filter(f => f.ext === '.vue');
    if (vueFiles.length > 0) {
      return true;
    }
    
    // Vue CLI 설정 확인
    if (deps['@vue/cli'] || files.some(f => f.path.includes('vue.config'))) {
      return true;
    }
    
    return false;
  }

  /**
   * React 프레임워크 감지
   */
  detectReact(packageJson, files) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // React 의존성 확인
    if (deps.react) {
      return true;
    }
    
    // JSX/TSX 파일 존재 확인
    const reactFiles = files.filter(f => ['.jsx', '.tsx'].includes(f.ext));
    if (reactFiles.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Angular 프레임워크 감지
   */
  detectAngular(packageJson, files) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Angular 의존성 확인
    if (deps['@angular/core']) {
      return true;
    }
    
    // Angular 설정 파일 확인
    if (files.some(f => f.path.includes('angular.json'))) {
      return true;
    }
    
    return false;
  }

  /**
   * UI 라이브러리 감지
   */
  detectUILibraries(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Bootstrap 관련
    if (deps.bootstrap || deps['bootstrap-vue-next']) {
      this.results.frontend.ui_library = 'Bootstrap Vue Next';
      this.results.frontend.ui_version = deps['bootstrap-vue-next'] || deps.bootstrap;
    }
    
    // Material-UI
    else if (deps['@mui/material'] || deps['@material-ui/core']) {
      this.results.frontend.ui_library = 'Material-UI';
      this.results.frontend.ui_version = deps['@mui/material'] || deps['@material-ui/core'];
    }
    
    // Ant Design
    else if (deps.antd) {
      this.results.frontend.ui_library = 'Ant Design';
      this.results.frontend.ui_version = deps.antd;
    }
    
    // DevExtreme
    if (deps.devextreme) {
      this.results.frontend.grid_component = 'DevExtreme';
      this.results.frontend.grid_version = deps.devextreme;
    }
  }

  /**
   * 백엔드 기술스택 분석
   */
  async analyzeBackend(files) {
    console.log('⚙️ 백엔드 분석 중...');
    
    // Spring Boot 감지
    const pomFiles = files.filter(f => f.path.includes('pom.xml'));
    const gradleFiles = files.filter(f => f.path.includes('build.gradle'));
    
    if (pomFiles.length > 0 || gradleFiles.length > 0) {
      await this.analyzeSpringBoot(pomFiles, gradleFiles);
    }
    
    // Node.js 백엔드 감지
    const nodePackageFiles = files.filter(f => 
      f.path.includes('package.json') && 
      !f.path.includes('node_modules') &&
      (f.dir.includes('backend') || f.dir.includes('server') || f.dir.includes('api'))
    );
    
    if (nodePackageFiles.length > 0) {
      await this.analyzeNodeJS(nodePackageFiles);
    }
  }

  /**
   * Spring Boot 분석
   */
  async analyzeSpringBoot(pomFiles, gradleFiles) {
    try {
      // pom.xml 분석
      for (const file of pomFiles) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        if (content.includes('spring-boot-starter')) {
          this.results.backend.framework = 'Spring Boot';
          this.results.backend.language = 'Java';
          this.results.confidence.backend = 95;
          
          // Spring Boot 버전 추출
          const versionMatch = content.match(/<spring-boot\.version>(.*?)<\/spring-boot\.version>/);
          if (versionMatch) {
            this.results.backend.version = versionMatch[1];
          }
          
          // 추가 의존성 분석
          if (content.includes('spring-boot-starter-data-jpa')) {
            this.results.backend.orm = 'JPA/Hibernate';
          }
          
          if (content.includes('spring-boot-starter-security')) {
            this.results.backend.security = 'Spring Security';
          }
        }
      }
      
      // build.gradle 분석
      for (const file of gradleFiles) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        if (content.includes('spring-boot')) {
          this.results.backend.framework = 'Spring Boot';
          this.results.backend.language = 'Java';
          this.results.backend.build_tool = 'Gradle';
          this.results.confidence.backend = 95;
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Spring Boot 분석 실패:', error.message);
    }
  }

  /**
   * Node.js 백엔드 분석
   */
  async analyzeNodeJS(packageFiles) {
    try {
      for (const file of packageFiles) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const packageJson = JSON.parse(content);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Express.js 감지
        if (deps.express) {
          this.results.backend.framework = 'Express.js';
          this.results.backend.language = 'Node.js';
          this.results.backend.version = deps.express;
          this.results.confidence.backend = 90;
        }
        
        // ORM 감지
        if (deps.mongoose) {
          this.results.backend.orm = 'Mongoose';
          this.results.database.primary = 'MongoDB';
        } else if (deps.sequelize) {
          this.results.backend.orm = 'Sequelize';
        }
        
        // 인증 라이브러리 감지
        if (deps.passport) {
          this.results.backend.auth = 'Passport.js';
        }
      }
    } catch (error) {
      console.warn('⚠️ Node.js 분석 실패:', error.message);
    }
  }

  /**
   * 데이터베이스 분석
   */
  async analyzeDatabase(files) {
    console.log('🗄️ 데이터베이스 분석 중...');
    
    // 설정 파일에서 데이터베이스 연결 정보 분석
    const configFiles = files.filter(f => 
      f.path.includes('application.yml') || 
      f.path.includes('application.properties') ||
      f.path.includes('.env')
    );
    
    for (const file of configFiles) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        // PostgreSQL 감지
        if (content.includes('postgresql') || content.includes('postgres')) {
          this.results.database.primary = 'PostgreSQL';
          this.results.confidence.database = 90;
        }
        
        // MySQL 감지
        else if (content.includes('mysql')) {
          this.results.database.primary = 'MySQL';
          this.results.confidence.database = 90;
        }
        
        // MongoDB 감지
        else if (content.includes('mongodb') || content.includes('mongo')) {
          this.results.database.primary = 'MongoDB';
          this.results.confidence.database = 90;
        }
        
        // Redis 감지
        if (content.includes('redis')) {
          this.results.database.cache = 'Redis';
        }
        
      } catch (error) {
        console.warn(`⚠️ 설정 파일 분석 실패: ${file.path}`);
      }
    }
  }

  /**
   * 아키텍처 패턴 분석
   */
  async analyzeArchitecture(files) {
    console.log('🏗️ 아키텍처 분석 중...');
    
    // 디렉토리 구조로 아키텍처 패턴 추론
    const directories = [...new Set(files.map(f => f.dir))];
    
    // Layered Architecture 감지
    const hasController = directories.some(dir => dir.includes('controller'));
    const hasService = directories.some(dir => dir.includes('service'));
    const hasRepository = directories.some(dir => dir.includes('repository'));
    const hasEntity = directories.some(dir => dir.includes('entity') || dir.includes('model'));
    
    if (hasController && hasService && hasRepository) {
      this.results.architecture.pattern = 'Layered Architecture';
      this.results.confidence.architecture = 85;
    }
    
    // 마이크로서비스 구조 감지
    const serviceDirectories = directories.filter(dir => 
      dir.includes('-service') || dir.includes('_service')
    );
    
    if (serviceDirectories.length > 1) {
      this.results.architecture.pattern = 'Microservices';
      this.results.confidence.architecture = 80;
    }
    
    // 모노리스 구조 (기본값)
    if (!this.results.architecture.pattern) {
      this.results.architecture.pattern = 'Monolithic';
      this.results.confidence.architecture = 70;
    }
  }

  /**
   * 인프라 분석
   */
  async analyzeInfrastructure(files) {
    console.log('🚀 인프라 분석 중...');
    
    // Docker 감지
    const dockerFiles = files.filter(f => f.path.includes('Dockerfile'));
    const dockerComposeFiles = files.filter(f => f.path.includes('docker-compose'));
    
    if (dockerFiles.length > 0 || dockerComposeFiles.length > 0) {
      this.results.infrastructure.container = 'Docker';
      this.results.confidence.infrastructure = 90;
    }
    
    // CI/CD 감지
    const ciFiles = files.filter(f => 
      f.path.includes('.github/workflows') ||
      f.path.includes('.gitlab-ci') ||
      f.path.includes('Jenkinsfile')
    );
    
    if (ciFiles.length > 0) {
      this.results.infrastructure.cicd = 'GitHub Actions';
      this.results.confidence.infrastructure = 85;
    }
  }

  /**
   * 신뢰도 계산
   */
  calculateConfidence() {
    const confidences = Object.values(this.results.confidence);
    this.results.overall_confidence = confidences.length > 0 
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;
  }

  /**
   * 최종 메타데이터 생성
   */
  generateMetadata() {
    const timestamp = new Date().toISOString();
    
    return {
      metadata_version: "1.0.0",
      schema_version: "2024.1",
      generated_at: timestamp,
      generator: "AI Project Scanner v2.0",
      confidence: this.results.confidence,
      
      projectInfo: {
        name: "scanned-project",
        version: "1.0.0",
        description: "AI 스캔으로 생성된 프로젝트 메타데이터",
        scanned_at: timestamp
      },
      
      techStack: {
        frontend: {
          framework: this.results.frontend.framework || "Unknown",
          version: this.results.frontend.version || "Unknown",
          ui_library: this.results.frontend.ui_library || "Unknown",
          build_tool: this.detectBuildTool(),
          libs: this.extractFrontendLibs()
        },
        backend: {
          framework: this.results.backend.framework || "Unknown",
          version: this.results.backend.version || "Unknown",
          language: this.results.backend.language || "Unknown",
          orm: this.results.backend.orm || "Unknown",
          libs: this.extractBackendLibs()
        },
        database: {
          primary: this.results.database.primary || "Unknown",
          cache: this.results.database.cache || null
        },
        infrastructure: {
          container: this.results.infrastructure.container || null,
          cicd: this.results.infrastructure.cicd || null
        }
      },
      
      architecture: {
        pattern: this.results.architecture.pattern || "Unknown",
        style: "Monolithic", // 기본값
        frontend_structure: this.generateFrontendStructure(),
        backend_structure: this.generateBackendStructure()
      },
      
      scan_info: {
        mode: "auto-generated",
        confidence: this.results.overall_confidence,
        recommendations: this.generateRecommendations()
      }
    };
  }

  /**
   * 빌드 도구 감지
   */
  detectBuildTool() {
    if (this.results.frontend.framework === 'Vue 3') {
      return 'Vite';
    } else if (this.results.frontend.framework === 'React') {
      return 'Create React App';
    } else if (this.results.frontend.framework === 'Angular') {
      return 'Angular CLI';
    }
    return 'Unknown';
  }

  /**
   * 프론트엔드 라이브러리 목록 추출
   */
  extractFrontendLibs() {
    const libs = [];
    
    if (this.results.frontend.ui_library) {
      libs.push({
        name: this.results.frontend.ui_library,
        version: this.results.frontend.ui_version || "Unknown",
        purpose: "UI Components"
      });
    }
    
    if (this.results.frontend.grid_component) {
      libs.push({
        name: this.results.frontend.grid_component,
        version: this.results.frontend.grid_version || "Unknown",
        purpose: "Data Grid"
      });
    }
    
    return libs;
  }

  /**
   * 백엔드 라이브러리 목록 추출
   */
  extractBackendLibs() {
    const libs = [];
    
    if (this.results.backend.orm) {
      libs.push({
        name: this.results.backend.orm,
        purpose: "ORM"
      });
    }
    
    if (this.results.backend.security) {
      libs.push({
        name: this.results.backend.security,
        purpose: "Security"
      });
    }
    
    return libs;
  }

  /**
   * 프론트엔드 구조 생성
   */
  generateFrontendStructure() {
    if (this.results.frontend.framework === 'Vue 3') {
      return {
        layers: [
          {
            name: "Presentation Layer",
            components: ["Vue Components", "Pages", "Layouts"],
            path: "/src/components, /src/pages, /src/layouts"
          },
          {
            name: "State Management Layer",
            components: ["Pinia Stores", "Composables"],
            path: "/src/stores, /src/composables"
          }
        ],
        routing: "Vue Router",
        state_management: "Pinia"
      };
    }
    
    return {
      layers: [],
      routing: "Unknown",
      state_management: "Unknown"
    };
  }

  /**
   * 백엔드 구조 생성
   */
  generateBackendStructure() {
    if (this.results.backend.framework === 'Spring Boot') {
      return {
        layers: [
          {
            name: "Presentation Layer",
            components: ["REST Controllers", "DTOs"],
            path: "/controller, /dto"
          },
          {
            name: "Business Layer",
            components: ["Services", "Business Logic"],
            path: "/service"
          },
          {
            name: "Persistence Layer",
            components: ["Repositories", "Entities"],
            path: "/repository, /entity"
          }
        ],
        api_pattern: "RESTful API"
      };
    }
    
    return {
      layers: [],
      api_pattern: "Unknown"
    };
  }

  /**
   * 권장사항 생성
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.confidence.frontend < 80) {
      recommendations.push("프론트엔드 설정을 수동으로 검토하세요");
    }
    
    if (this.results.confidence.backend < 80) {
      recommendations.push("백엔드 설정을 수동으로 검토하세요");
    }
    
    if (!this.results.database.primary || this.results.database.primary === 'Unknown') {
      recommendations.push("데이터베이스 설정을 확인하세요");
    }
    
    if (this.results.overall_confidence < 80) {
      recommendations.push("스캔 결과를 수동으로 검증하고 수정하세요");
    }
    
    return recommendations;
  }
}

module.exports = ProjectMetadataScanner;