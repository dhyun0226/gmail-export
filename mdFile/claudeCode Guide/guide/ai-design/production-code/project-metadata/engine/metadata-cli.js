#!/usr/bin/env node

/**
 * AI 메타데이터 생성 CLI 도구
 * 실제 프로젝트에서 사용할 수 있는 명령줄 인터페이스
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const figlet = require('figlet');

class MetadataCLI {
  constructor() {
    this.config = this.loadConfig();
    this.outputDir = '.ai-metadata';
  }

  loadConfig() {
    const configPath = path.join(__dirname, 'metadata-collection-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return null;
  }

  async run() {
    console.log(chalk.cyan(figlet.textSync('AI Metadata')));
    console.log(chalk.gray('프로젝트 메타데이터 자동 생성 도구 v2.0\n'));

    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'generate':
          await this.generateMetadata(args[1], args[2]);
          break;
        case 'wizard':
          await this.runWizard();
          break;
        case 'validate':
          await this.validateMetadata();
          break;
        case 'info':
          await this.showInfo();
          break;
        case 'templates':
          await this.listTemplates();
          break;
        case 'apply':
          await this.applyTemplate(args[1]);
          break;
        case 'backup':
          await this.backupMetadata(args[1]);
          break;
        case 'restore':
          await this.restoreMetadata(args[1]);
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error(chalk.red('❌ 오류 발생:'), error.message);
      process.exit(1);
    }
  }

  async generateMetadata(projectPath = '.', mode = 'standard') {
    const spinner = ora('프로젝트 스캔 중...').start();

    try {
      // 1단계: 프로젝트 스캔
      const ProjectMetadataScanner = require('./scan-rules');
      const scanner = new ProjectMetadataScanner(this.config.metadata_engine);
      
      const results = await scanner.scanProject(projectPath, mode);
      
      spinner.text = '메타데이터 생성 중...';
      
      // 2단계: 출력 디렉토리 생성
      const outputPath = path.join(projectPath, this.outputDir);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // 3단계: 메타데이터 파일 저장
      const metadataPath = path.join(outputPath, 'project-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(results, null, 2));

      // 4단계: 컴포넌트 매핑 생성
      const mappingPath = path.join(outputPath, 'component-mappings.json');
      const componentMappings = this.generateComponentMappings(results);
      fs.writeFileSync(mappingPath, JSON.stringify(componentMappings, null, 2));

      // 5단계: API 패턴 생성
      const apiPatternsPath = path.join(outputPath, 'api-patterns.json');
      const apiPatterns = this.generateApiPatterns(results);
      fs.writeFileSync(apiPatternsPath, JSON.stringify(apiPatterns, null, 2));

      spinner.succeed('메타데이터 생성 완료!');

      // 결과 출력
      this.displayResults(results, metadataPath);

    } catch (error) {
      spinner.fail('메타데이터 생성 실패');
      throw error;
    }
  }

  async runWizard() {
    console.log(chalk.yellow('🧙‍♂️ 메타데이터 생성 마법사\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: '프로젝트 유형을 선택하세요:',
        choices: [
          { name: '💻 Vue 3 + Spring Boot (엔터프라이즈)', value: 'vue3-springboot' },
          { name: '⚛️  React + Node.js (모던 웹앱)', value: 'react-nodejs' },
          { name: '🅰️  Angular + .NET Core (기업용)', value: 'angular-dotnet' },
          { name: '🐍 Vue 3 + Django (풀스택)', value: 'vue3-django' },
          { name: '🔍 자동 스캔 (기존 프로젝트)', value: 'auto-scan' }
        ]
      }
    ]);

    if (answers.projectType === 'auto-scan') {
      const scanAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectPath',
          message: '프로젝트 경로:',
          default: '.'
        },
        {
          type: 'list',
          name: 'scanMode',
          message: '스캔 모드:',
          choices: [
            { name: '표준 스캔 (빠름, 90% 정확도)', value: 'standard' },
            { name: '심층 스캔 (느림, 95% 정확도)', value: 'deep' },
            { name: '고속 스캔 (매우 빠름, 85% 정확도)', value: 'fast' }
          ]
        }
      ]);

      await this.generateMetadata(scanAnswers.projectPath, scanAnswers.scanMode);
    } else {
      await this.applyTemplate(answers.projectType);
    }
  }

  async applyTemplate(templateName) {
    if (!templateName) {
      console.error(chalk.red('❌ 템플릿 이름을 지정해주세요.'));
      return;
    }

    const spinner = ora(`${templateName} 템플릿 적용 중...`).start();

    try {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}-template.json`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`템플릿을 찾을 수 없습니다: ${templateName}`);
      }

      const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      
      // 프로젝트 정보 커스터마이징
      const projectInfo = await this.customizeProjectInfo(template);
      template.projectInfo = { ...template.projectInfo, ...projectInfo };
      template.projectInfo.createdAt = new Date().toISOString();
      template.projectInfo.updatedAt = new Date().toISOString();

      // 출력 디렉토리 생성
      const outputPath = path.join('.', this.outputDir);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // 메타데이터 파일 저장
      const metadataPath = path.join(outputPath, 'project-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(template, null, 2));

      spinner.succeed(`${templateName} 템플릿 적용 완료!`);
      
      console.log(chalk.green(`\n📁 메타데이터 위치: ${metadataPath}`));
      console.log(chalk.blue('\n이제 AI 화면 분석을 시작할 수 있습니다:'));
      console.log(chalk.gray('  /ai-design your-image.png full\n'));

    } catch (error) {
      spinner.fail('템플릿 적용 실패');
      throw error;
    }
  }

  async customizeProjectInfo(template) {
    console.log(chalk.yellow('\n📝 프로젝트 정보를 입력하세요:\n'));

    return await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '프로젝트명:',
        default: template.projectInfo.name
      },
      {
        type: 'input',
        name: 'version',
        message: '버전:',
        default: template.projectInfo.version
      },
      {
        type: 'input',
        name: 'description',
        message: '설명:',
        default: template.projectInfo.description
      },
      {
        type: 'input',
        name: 'team',
        message: '팀명:',
        default: template.projectInfo.team || 'Development Team'
      },
      {
        type: 'input',
        name: 'contact',
        message: '연락처:',
        default: template.projectInfo.contact || 'dev@company.com'
      }
    ]);
  }

  async validateMetadata() {
    const spinner = ora('메타데이터 검증 중...').start();

    try {
      const metadataPath = path.join('.', this.outputDir, 'project-metadata.json');
      
      if (!fs.existsSync(metadataPath)) {
        throw new Error('메타데이터를 찾을 수 없습니다. 먼저 생성해주세요.');
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const validation = this.validateMetadataStructure(metadata);

      spinner.succeed('메타데이터 검증 완료!');

      // 검증 결과 출력
      console.log(chalk.green('\n✅ 검증 통과:'));
      validation.passed.forEach(item => {
        console.log(chalk.green(`  ✓ ${item}`));
      });

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  경고:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`  ! ${warning}`));
        });
      }

      if (validation.errors.length > 0) {
        console.log(chalk.red('\n❌ 오류:'));
        validation.errors.forEach(error => {
          console.log(chalk.red(`  ✗ ${error}`));
        });
      }

      console.log(chalk.blue(`\n📊 전체 품질 점수: ${validation.score}/100`));

    } catch (error) {
      spinner.fail('메타데이터 검증 실패');
      throw error;
    }
  }

  validateMetadataStructure(metadata) {
    const validation = {
      passed: [],
      warnings: [],
      errors: [],
      score: 0
    };

    let score = 0;

    // 필수 필드 검증
    const requiredFields = ['projectInfo', 'techStack', 'architecture'];
    requiredFields.forEach(field => {
      if (metadata[field]) {
        validation.passed.push(`${field} 존재`);
        score += 20;
      } else {
        validation.errors.push(`${field} 필드가 누락됨`);
      }
    });

    // 기술스택 검증
    if (metadata.techStack) {
      if (metadata.techStack.frontend && metadata.techStack.frontend.framework !== 'Unknown') {
        validation.passed.push('프론트엔드 프레임워크 감지');
        score += 15;
      } else {
        validation.warnings.push('프론트엔드 프레임워크 확인 필요');
      }

      if (metadata.techStack.backend && metadata.techStack.backend.framework !== 'Unknown') {
        validation.passed.push('백엔드 프레임워크 감지');
        score += 15;
      } else {
        validation.warnings.push('백엔드 프레임워크 확인 필요');
      }
    }

    // 버전 정보 검증
    if (metadata.metadata_version) {
      validation.passed.push('메타데이터 버전 정보');
      score += 10;
    }

    validation.score = Math.min(100, score);
    return validation;
  }

  async showInfo() {
    const metadataPath = path.join('.', this.outputDir, 'project-metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.yellow('📁 프로젝트 메타데이터 정보'));
      console.log(chalk.gray('━'.repeat(30)));
      console.log(chalk.red('위치: 찾을 수 없음'));
      console.log(chalk.red('상태: 설정 필요'));
      console.log(chalk.blue('\n💡 메타데이터를 생성하려면:'));
      console.log(chalk.gray('  ai-metadata generate'));
      console.log(chalk.gray('  ai-metadata wizard'));
      return;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const stat = fs.statSync(metadataPath);

    console.log(chalk.cyan('📊 프로젝트 메타데이터 정보'));
    console.log(chalk.gray('━'.repeat(30)));
    console.log(chalk.blue(`📁 위치: ${metadataPath}`));
    console.log(chalk.blue(`📅 생성: ${new Date(stat.birthtime).toLocaleString()}`));
    console.log(chalk.blue(`🔄 수정: ${new Date(stat.mtime).toLocaleString()}`));
    console.log(chalk.blue(`📊 버전: ${metadata.metadata_version || 'Unknown'}`));

    if (metadata.techStack) {
      console.log(chalk.green('\n🎨 기술스택:'));
      if (metadata.techStack.frontend) {
        console.log(chalk.gray(`  Frontend: ${metadata.techStack.frontend.framework} ${metadata.techStack.frontend.version || ''}`));
      }
      if (metadata.techStack.backend) {
        console.log(chalk.gray(`  Backend: ${metadata.techStack.backend.framework} ${metadata.techStack.backend.version || ''}`));
      }
      if (metadata.techStack.database) {
        console.log(chalk.gray(`  Database: ${metadata.techStack.database.primary || 'Unknown'}`));
      }
    }

    if (metadata.architecture) {
      console.log(chalk.green(`\n🏗️  Architecture: ${metadata.architecture.pattern || 'Unknown'}`));
    }

    console.log(chalk.green('\n✅ 상태: 정상 (AI 분석 준비 완료)'));
  }

  async listTemplates() {
    console.log(chalk.cyan('📋 사용 가능한 템플릿'));
    console.log(chalk.gray('━'.repeat(30)));

    const templatesDir = path.join(__dirname, '..', 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      console.log(chalk.red('템플릿 디렉토리를 찾을 수 없습니다.'));
      return;
    }

    const templates = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('-template.json'))
      .map(file => file.replace('-template.json', ''));

    console.log(chalk.yellow('🎯 공식 템플릿:'));
    templates.forEach((template, index) => {
      console.log(chalk.gray(`  ${index + 1}) ${template}`));
    });

    console.log(chalk.blue('\n💡 템플릿 사용법:'));
    console.log(chalk.gray('  ai-metadata apply vue3-springboot'));
    console.log(chalk.gray('  ai-metadata wizard'));
  }

  async backupMetadata(backupName) {
    const metadataPath = path.join('.', this.outputDir);
    
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.red('❌ 백업할 메타데이터가 없습니다.'));
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalBackupName = backupName || `backup-${timestamp}`;
    const backupPath = path.join(metadataPath, 'backups', finalBackupName);

    const spinner = ora('메타데이터 백업 중...').start();

    try {
      // 백업 디렉토리 생성
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });

      // 메타데이터 파일들 복사
      const files = fs.readdirSync(metadataPath);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'backups') {
          const sourcePath = path.join(metadataPath, file);
          const destPath = path.join(backupPath, file);
          fs.copyFileSync(sourcePath, destPath);
        }
      }

      spinner.succeed(`백업 완료: ${finalBackupName}`);
      console.log(chalk.blue(`📁 백업 위치: ${backupPath}`));

    } catch (error) {
      spinner.fail('백업 실패');
      throw error;
    }
  }

  generateComponentMappings(metadata) {
    const mappings = {
      generated_from: "project_scan",
      timestamp: new Date().toISOString(),
      mappings: {}
    };

    // 기술스택 기반 컴포넌트 매핑 생성
    if (metadata.techStack && metadata.techStack.frontend) {
      const framework = metadata.techStack.frontend.framework;
      
      if (framework === 'Vue 3') {
        mappings.mappings = {
          form_controls: {
            text_input: "OwInput",
            select: "OwFormSelect",
            checkbox: "OwFormCheckbox",
            date_picker: "OwBizDatePicker"
          },
          data_display: {
            table: "DxDataGrid",
            pagination: "OwPagination"
          },
          layout: {
            container: "BContainer",
            row: "BRow",
            column: "BCol"
          }
        };
      } else if (framework === 'React') {
        mappings.mappings = {
          form_controls: {
            text_input: "TextField",
            select: "Select",
            checkbox: "Checkbox"
          },
          data_display: {
            table: "DataGrid",
            pagination: "Pagination"
          }
        };
      }
    }

    return mappings;
  }

  generateApiPatterns(metadata) {
    const patterns = {
      generated_from: "project_scan",
      timestamp: new Date().toISOString(),
      patterns: {}
    };

    // 백엔드 프레임워크 기반 API 패턴 생성
    if (metadata.techStack && metadata.techStack.backend) {
      const framework = metadata.techStack.backend.framework;
      
      if (framework === 'Spring Boot') {
        patterns.patterns = {
          rest_endpoints: {
            list: "GET /api/{resource}?page={page}&size={size}",
            detail: "GET /api/{resource}/{id}",
            create: "POST /api/{resource}",
            update: "PUT /api/{resource}/{id}",
            delete: "DELETE /api/{resource}/{id}"
          },
          response_format: {
            success: "{ success: true, data: {}, message: '' }",
            error: "{ success: false, error: { code: '', message: '' } }"
          }
        };
      } else if (framework === 'Express.js') {
        patterns.patterns = {
          rest_endpoints: {
            list: "GET /api/{resource}",
            detail: "GET /api/{resource}/:id",
            create: "POST /api/{resource}",
            update: "PUT /api/{resource}/:id",
            delete: "DELETE /api/{resource}/:id"
          }
        };
      }
    }

    return patterns;
  }

  displayResults(results, metadataPath) {
    console.log(chalk.green('\n🎉 메타데이터 생성 성공!'));
    console.log(chalk.gray('━'.repeat(40)));
    
    console.log(chalk.blue(`📁 위치: ${metadataPath}`));
    
    if (results.techStack) {
      console.log(chalk.yellow('\n🎨 감지된 기술스택:'));
      if (results.techStack.frontend) {
        console.log(chalk.gray(`  Frontend: ${results.techStack.frontend.framework} ${results.techStack.frontend.version || ''}`));
      }
      if (results.techStack.backend) {
        console.log(chalk.gray(`  Backend: ${results.techStack.backend.framework} ${results.techStack.backend.version || ''}`));
      }
    }

    if (results.scan_info && results.scan_info.confidence) {
      console.log(chalk.cyan(`\n📊 전체 신뢰도: ${results.scan_info.confidence}%`));
    }

    if (results.scan_info && results.scan_info.recommendations && results.scan_info.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 권장사항:'));
      results.scan_info.recommendations.forEach(rec => {
        console.log(chalk.gray(`  • ${rec}`));
      });
    }

    console.log(chalk.green('\n✅ 이제 AI 화면 분석을 시작할 수 있습니다:'));
    console.log(chalk.gray('  /ai-design your-image.png full\n'));
  }

  showHelp() {
    console.log(chalk.cyan('\n📖 사용법:'));
    console.log(chalk.gray('━'.repeat(30)));
    console.log('  ai-metadata generate [경로] [모드]  메타데이터 자동 생성');
    console.log('  ai-metadata wizard                 대화형 생성 마법사');
    console.log('  ai-metadata apply <템플릿>         템플릿 적용');
    console.log('  ai-metadata validate               메타데이터 검증');
    console.log('  ai-metadata info                   메타데이터 정보 표시');
    console.log('  ai-metadata templates              사용 가능한 템플릿 목록');
    console.log('  ai-metadata backup [이름]          메타데이터 백업');
    console.log('  ai-metadata restore <이름>         메타데이터 복원');
    
    console.log(chalk.cyan('\n📝 예시:'));
    console.log(chalk.gray('━'.repeat(30)));
    console.log('  ai-metadata generate . standard');
    console.log('  ai-metadata wizard');
    console.log('  ai-metadata apply vue3-springboot');
    console.log('  ai-metadata validate');
  }
}

// CLI 실행
if (require.main === module) {
  const cli = new MetadataCLI();
  cli.run().catch(error => {
    console.error(chalk.red('❌ 실행 중 오류 발생:'), error);
    process.exit(1);
  });
}

module.exports = MetadataCLI;