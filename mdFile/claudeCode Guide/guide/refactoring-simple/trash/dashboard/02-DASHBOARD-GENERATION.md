# 🎨 대시보드 생성 가이드

## 1. 개요

이 가이드는 수집된 리팩토링 데이터를 활용하여 인터랙티브한 HTML 대시보드를 자동으로 생성하는 방법을 설명합니다.

## 2. 대시보드 생성 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                  통합 JSON 데이터                         │
│         (dashboard-data.json 및 관련 파일들)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 템플릿 엔진 (Template Engine)             │
│  - Handlebars/Mustache 템플릿                           │
│  - 데이터 바인딩                                         │
│  - 조건부 렌더링                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               차트 생성기 (Chart Generator)               │
│  - Chart.js 설정                                        │
│  - 데이터 시각화                                         │
│  - 인터랙티브 요소                                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  최종 HTML 대시보드                       │
│  - index.html                                           │
│  - 프로젝트별 데이터                                      │
│  - 공통 assets 참조                                      │
└─────────────────────────────────────────────────────────┘
```

## 3. 대시보드 구성 요소

### 3.1 메인 대시보드 (Overview)
- **핵심 메트릭스 카드**: 주요 개선 지표 표시
- **진행 타임라인**: 리팩토링 단계별 진행 상황
- **문제 해결 현황**: Critical/Major/Minor 이슈 상태
- **성능 개선 차트**: Before/After 비교

### 3.2 상세 분석 뷰
- **코드 품질 분석**: 복잡도, 크기, 결합도 상세 차트
- **성능 분석**: API 응답시간, 쿼리 성능, 캐싱 효과
- **보안 분석**: 취약점 해결 현황, 보안 점수
- **아키텍처 분석**: 도메인 분리, 패턴 적용 현황

### 3.3 Before/After 비교
- **코드 구조 비교**: 시각적 다이어그램
- **메트릭스 비교**: 막대 그래프, 레이더 차트
- **코드 스니펫**: 실제 개선 예시

## 4. 대시보드 생성 스크립트

### 4.1 메인 생성기 (generate-dashboard.js)
```javascript
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const Chart = require('chart.js');

class DashboardGenerator {
    constructor(config) {
        this.config = config;
        this.data = this.loadData();
        this.templates = this.loadTemplates();
        this.registerHelpers();
    }
    
    loadData() {
        const dataPath = path.join(this.config.dataDir, 'dashboard-data.json');
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    loadTemplates() {
        const templates = {};
        const templateDir = path.join(__dirname, '../templates');
        
        ['index', 'overview', 'analysis', 'patterns'].forEach(name => {
            const templatePath = path.join(templateDir, `${name}.hbs`);
            templates[name] = fs.readFileSync(templatePath, 'utf8');
        });
        
        return templates;
    }
    
    registerHelpers() {
        // 백분율 포맷
        Handlebars.registerHelper('percentage', (value) => {
            return `${value}%`;
        });
        
        // 숫자 포맷
        Handlebars.registerHelper('number', (value) => {
            return value.toLocaleString();
        });
        
        // 등급 색상
        Handlebars.registerHelper('gradeColor', (grade) => {
            const colors = {
                'A': 'success',
                'B': 'info',
                'C': 'warning',
                'D': 'danger'
            };
            return colors[grade] || 'secondary';
        });
        
        // 개선율 화살표
        Handlebars.registerHelper('improvementArrow', (value) => {
            const num = parseFloat(value);
            if (num > 0) return '↑';
            if (num < 0) return '↓';
            return '→';
        });
    }
    
    generate() {
        console.log('🎨 대시보드 생성 시작...');
        
        // 1. 프로젝트 디렉토리 생성
        const projectDir = path.join(
            this.config.outputDir, 
            this.data.metadata.project.replace(/\s+/g, '-').toLowerCase()
        );
        fs.mkdirSync(projectDir, { recursive: true });
        
        // 2. 데이터 준비
        const dashboardData = this.prepareDashboardData();
        
        // 3. HTML 생성
        this.generateHTML(projectDir, dashboardData);
        
        // 4. 데이터 파일 복사
        this.copyDataFiles(projectDir);
        
        // 5. 차트 설정 생성
        this.generateChartConfigs(projectDir, dashboardData);
        
        console.log('✅ 대시보드 생성 완료!');
        console.log(`📁 위치: ${projectDir}`);
    }
    
    prepareDashboardData() {
        return {
            ...this.data,
            charts: {
                complexity: this.prepareComplexityChart(),
                performance: this.preparePerformanceChart(),
                issues: this.prepareIssuesChart(),
                timeline: this.prepareTimelineChart()
            },
            views: {
                overview: this.prepareOverviewData(),
                problems: this.prepareProblemsData(),
                patterns: this.preparePatternsData()
            }
        };
    }
    
    generateHTML(outputDir, data) {
        // index.html 생성
        const indexTemplate = Handlebars.compile(this.templates.index);
        const indexHtml = indexTemplate(data);
        fs.writeFileSync(
            path.join(outputDir, 'index.html'), 
            indexHtml
        );
        
        // 뷰별 HTML 조각 생성
        Object.keys(this.templates).forEach(viewName => {
            if (viewName !== 'index') {
                const viewTemplate = Handlebars.compile(this.templates[viewName]);
                const viewHtml = viewTemplate(data.views[viewName]);
                
                fs.writeFileSync(
                    path.join(outputDir, `${viewName}.html`),
                    viewHtml
                );
            }
        });
    }
    
    prepareComplexityChart() {
        const before = this.data.metrics.complexity.before;
        const after = this.data.metrics.complexity.after;
        
        return {
            type: 'bar',
            data: {
                labels: ['최대 복잡도', '평균 복잡도', '메소드 길이'],
                datasets: [{
                    label: 'Before',
                    data: [before.max, before.average, 185],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                }, {
                    label: 'After',
                    data: [after.max, after.average, 25],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '복잡도 개선 현황'
                    }
                }
            }
        };
    }
    
    preparePerformanceChart() {
        return {
            type: 'line',
            data: {
                labels: ['주문 생성', '주문 조회', '고객 조회', '결제 처리'],
                datasets: [{
                    label: 'Before (ms)',
                    data: [450, 380, 350, 420],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }, {
                    label: 'After (ms)',
                    data: [230, 180, 170, 210],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        };
    }
}

// 실행
const generator = new DashboardGenerator({
    dataDir: './data/integrated',
    outputDir: './dashboard/projects',
    templateDir: './templates'
});

generator.generate();
```

### 4.2 템플릿 파일 (index.hbs)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{metadata.project}} - 리팩토링 대시보드</title>
    
    <!-- 공통 리소스 -->
    <link rel="stylesheet" href="../../../common/dashboard-assets/css/dashboard-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    
    <!-- 차트 라이브러리 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-title">🔄 {{metadata.project}}</div>
            </div>
            
            <nav class="nav">
                <div class="nav-section">
                    <div class="nav-title">개요</div>
                    <a href="#" class="nav-item active" data-view="dashboard">
                        <i data-lucide="home" class="nav-item-icon"></i>
                        대시보드
                    </a>
                    <a href="#" class="nav-item" data-view="problems">
                        <i data-lucide="alert-triangle" class="nav-item-icon"></i>
                        코드 이슈
                        <span class="nav-badge">{{issues.critical.resolved}}</span>
                    </a>
                    <a href="#" class="nav-item" data-view="performance">
                        <i data-lucide="trending-up" class="nav-item-icon"></i>
                        성능
                    </a>
                </div>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="main">
            <header class="header">
                <div class="header-left">
                    <nav class="breadcrumb">
                        <span>{{metadata.project}}</span>
                        <i data-lucide="chevron-right" width="12" height="12"></i>
                        <span class="breadcrumb-item">리팩토링 결과</span>
                    </nav>
                </div>
                
                <div class="header-actions">
                    <span class="badge badge-success">
                        완료: {{metadata.generatedAt}}
                    </span>
                </div>
            </header>
            
            <div class="content" id="main-content">
                <!-- Hero Section -->
                <section class="hero">
                    <div class="hero-content">
                        <div class="hero-header">
                            <h5 class="hero-title">{{metadata.project}} 리팩토링 완료</h5>
                            <div class="hero-badge">
                                <i data-lucide="check-circle" width="14" height="14"></i>
                                {{summary.duration}} 소요
                            </div>
                        </div>
                        <p class="hero-description">
                            {{summary.linesOfCode.before}}줄의 레거시 코드를 
                            {{summary.filesChanged.after}}개의 도메인별 파일로 성공적으로 분리했습니다.
                            복잡도 {{metrics.complexity.improvement}} 감소, 
                            성능 {{metrics.performance.apiResponseTime.improvement}} 향상을 달성했습니다.
                        </p>
                        <div class="hero-stats">
                            <div class="hero-stat">
                                <div class="hero-stat-value">{{summary.duration}}</div>
                                <div class="hero-stat-label">진행 기간</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">{{metrics.complexity.improvement}}</div>
                                <div class="hero-stat-label">복잡도 감소</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">{{metrics.performance.apiResponseTime.improvement}}</div>
                                <div class="hero-stat-label">성능 향상</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">{{metrics.quality.grade}}</div>
                                <div class="hero-stat-label">품질 등급</div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Metrics Grid -->
                <section class="metrics-grid">
                    {{#each views.overview.metrics}}
                    <div class="metric-card {{cardType}}">
                        <div class="metric-header">
                            <div class="metric-info">
                                <div class="metric-icon">
                                    <i data-lucide="{{icon}}" width="18" height="18"></i>
                                </div>
                                <div class="metric-label">{{label}}</div>
                            </div>
                            <div class="metric-trend {{trendType}}">
                                <i data-lucide="{{trendIcon}}" width="12" height="12"></i>
                                {{improvement}}
                            </div>
                        </div>
                        <div class="metric-value">{{before}} → {{after}}</div>
                        <div class="metric-description">{{description}}</div>
                    </div>
                    {{/each}}
                </section>
                
                <!-- Charts Section -->
                <section class="charts-section">
                    <div class="chart-container">
                        <canvas id="complexityChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </section>
            </div>
        </main>
    </div>
    
    <!-- 프로젝트별 데이터 -->
    <script>
        window.dashboardData = {{{json .}}};
    </script>
    
    <!-- 공통 스크립트 -->
    <script src="../../../common/dashboard-assets/js/dashboard-script.js"></script>
    <script src="./charts.js"></script>
</body>
</html>
```

### 4.3 차트 설정 생성 (charts.js)
```javascript
// 대시보드 데이터에서 차트 생성
document.addEventListener('DOMContentLoaded', function() {
    const data = window.dashboardData;
    
    // 복잡도 차트
    if (document.getElementById('complexityChart')) {
        new Chart(document.getElementById('complexityChart'), 
            data.charts.complexity
        );
    }
    
    // 성능 차트
    if (document.getElementById('performanceChart')) {
        new Chart(document.getElementById('performanceChart'), 
            data.charts.performance
        );
    }
    
    // 이슈 차트
    if (document.getElementById('issuesChart')) {
        new Chart(document.getElementById('issuesChart'), {
            type: 'doughnut',
            data: {
                labels: ['해결됨', '진행중', '대기'],
                datasets: [{
                    data: [
                        data.issues.critical.resolved,
                        data.issues.major.resolved,
                        data.issues.minor.identified - data.issues.minor.resolved
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ]
                }]
            }
        });
    }
});
```

## 5. 템플릿 시스템

### 5.1 Handlebars 헬퍼
```javascript
// 조건부 클래스
Handlebars.registerHelper('statusClass', function(status) {
    const classes = {
        'completed': 'badge-success',
        'in-progress': 'badge-warning',
        'pending': 'badge-secondary'
    };
    return classes[status] || 'badge-default';
});

// 날짜 포맷
Handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('ko-KR');
});

// JSON 직렬화
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
```

### 5.2 부분 템플릿 (Partials)
```handlebars
{{!-- metric-card.hbs --}}
<div class="metric-card {{type}}">
    <div class="metric-header">
        <div class="metric-info">
            <div class="metric-icon">
                <i data-lucide="{{icon}}" width="18" height="18"></i>
            </div>
            <div class="metric-label">{{label}}</div>
        </div>
        {{#if trend}}
        <div class="metric-trend {{trend.type}}">
            <i data-lucide="{{trend.icon}}" width="12" height="12"></i>
            {{trend.value}}
        </div>
        {{/if}}
    </div>
    <div class="metric-value">{{value}}</div>
    {{#if description}}
    <div class="metric-description">{{description}}</div>
    {{/if}}
</div>
```

## 6. 디렉토리 구조

```
dashboard/
├── projects/                      # 프로젝트별 대시보드
│   └── visitaction-module/       # 특정 프로젝트
│       ├── index.html           # 메인 대시보드
│       ├── data.json           # 프로젝트 데이터
│       └── charts.js           # 차트 설정
├── common/                       # 공통 리소스
│   └── dashboard-assets/        # CSS, JS, 이미지
│       ├── css/
│       │   └── dashboard-styles.css
│       ├── js/
│       │   ├── dashboard-script.js
│       │   └── utils/
│       └── img/
└── templates/                    # 템플릿 파일
    ├── index.hbs
    ├── overview.hbs
    └── partials/
```

## 7. 실행 및 배포

### 7.1 로컬 실행
```bash
# 대시보드 생성
npm run generate-dashboard

# 로컬 서버 시작
npm run serve

# 브라우저에서 확인
open http://localhost:8080/dashboard/projects/visitaction-module/
```

### 7.2 빌드 스크립트
```json
{
  "scripts": {
    "generate-dashboard": "node scripts/generate-dashboard.js",
    "serve": "http-server dashboard -p 8080",
    "build": "npm run collect-data && npm run generate-dashboard",
    "watch": "nodemon --watch data --exec npm run generate-dashboard"
  }
}
```

### 7.3 CI/CD 통합
```yaml
# .github/workflows/dashboard.yml
name: Generate Dashboard

on:
  push:
    paths:
      - 'reports/**'
      - 'data/**'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Collect data
        run: npm run collect-data
      
      - name: Generate dashboard
        run: npm run generate-dashboard
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dashboard
```

## 8. 커스터마이징

### 8.1 테마 설정
```javascript
// theme-config.js
module.exports = {
    colors: {
        primary: '#007bff',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107'
    },
    fonts: {
        main: 'Inter',
        code: 'JetBrains Mono'
    }
};
```

### 8.2 추가 뷰 생성
```javascript
// 새로운 뷰 추가
generator.addView('security', {
    template: 'security.hbs',
    data: securityAnalysisData,
    route: '/security'
});
```

## 9. 최종 체크리스트

### 9.1 생성 확인
- [ ] 모든 데이터가 정확히 표시되는가?
- [ ] 차트가 올바르게 렌더링되는가?
- [ ] 반응형 디자인이 작동하는가?
- [ ] 다크/라이트 테마 전환이 작동하는가?
- [ ] 모든 링크가 정상 작동하는가?

### 9.2 성능 확인
- [ ] 초기 로딩 시간 < 3초
- [ ] 차트 렌더링 < 1초
- [ ] 뷰 전환 < 500ms

### 9.3 접근성 확인
- [ ] 키보드 네비게이션 가능
- [ ] 스크린 리더 호환
- [ ] 색상 대비 적절

## 10. 완료

대시보드 생성이 완료되면:
1. 생성된 대시보드 URL 공유
2. 프로젝트 이해관계자에게 결과 보고
3. 피드백 수집 및 개선사항 반영

🎉 축하합니다! 리팩토링 프로젝트의 모든 과정과 결과가 시각적으로 표현된 대시보드가 완성되었습니다.