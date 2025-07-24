# 🎨 대시보드 템플릿 생성 가이드

## 1. 개요

이 가이드는 정적 HTML 대시보드에 리팩토링 결과 데이터를 자동으로 주입하여 실제 프로젝트별 대시보드를 생성하는 방법을 설명합니다.

## 2. 문제 정의

### 현재 상황
- **정적 데이터**: 대시보드의 모든 수치가 하드코딩됨
- **재사용 불가**: 다른 프로젝트에 적용 불가능
- **수동 업데이트**: 데이터 변경 시 수동으로 HTML/JS 수정 필요

### 목표
- **동적 데이터 주입**: 리팩토링 결과를 자동으로 반영
- **템플릿 기반**: 재사용 가능한 템플릿 시스템
- **완전 자동화**: 데이터 수집부터 대시보드 생성까지 자동화

## 3. 데이터 매핑 전략

### 3.1 하드코딩된 값 식별
현재 대시보드에서 하드코딩된 주요 값들:

| 위치 | 하드코딩된 값 | 데이터 소스 |
|------|--------------|------------|
| Hero Title | "VisitAction 모듈 혁신" | metadata.project.name |
| God Class 라인 수 | "1,847줄" | metrics.size.class.totalLines.before |
| 복잡도 감소 | "92.3%" | metrics.complexity.improvement |
| 성능 향상 | "48.8%" | metrics.performance.improvement |
| 진행 기간 | "14일" | summary.duration |
| 순환 복잡도 | "156 → 12" | metrics.complexity.cyclomatic |
| API 응답 시간 | "450ms → 230ms" | metrics.performance.apiResponseTime |

### 3.2 데이터 구조 매핑
```json
{
  "dataMapping": {
    "hero": {
      "title": {
        "template": "${project.name} 모듈 혁신",
        "source": "metadata.project.name"
      },
      "description": {
        "template": "${totalLines}줄의 God Class를 깔끔하고 유지보수 가능한 CQRS 아키텍처로 성공적으로 변환했습니다. Java 21 기능을 활용하여 ${complexityReduction} 복잡도 감소와 ${performanceImprovement} 성능 향상을 달성했습니다.",
        "variables": {
          "totalLines": "metrics.size.class.totalLines.before",
          "complexityReduction": "metrics.complexity.improvement",
          "performanceImprovement": "metrics.performance.apiResponseTime.improvement"
        }
      },
      "stats": [
        {
          "value": "summary.duration",
          "label": "진행 기간"
        },
        {
          "value": "metrics.complexity.improvement",
          "label": "복잡도 감소"
        },
        {
          "value": "metrics.performance.apiResponseTime.improvement",
          "label": "성능 향상"
        },
        {
          "value": "metrics.testing.testsPassed",
          "label": "테스트 통과"
        }
      ]
    },
    "metricsCards": [
      {
        "type": "danger",
        "icon": "alert-triangle",
        "label": "순환 복잡도",
        "trend": {
          "type": "negative",
          "icon": "trending-down",
          "value": "metrics.complexity.cyclomatic.improvement"
        },
        "value": {
          "template": "${before} → ${after}",
          "before": "metrics.complexity.cyclomatic.before.max",
          "after": "metrics.complexity.cyclomatic.after.max"
        },
        "description": "CQRS 패턴 구현을 통해 God Class 복잡도를 극적으로 감소했습니다"
      }
    ]
  }
}
```

## 4. 템플릿 변환 프로세스

### 4.1 HTML 템플릿 준비
원본 HTML을 템플릿으로 변환:

```html
<!-- 원본 -->
<h5 class="hero-title">VisitAction 모듈 혁신</h5>

<!-- 템플릿 -->
<h5 class="hero-title">{{projectTitle}}</h5>
```

### 4.2 JavaScript 뷰 템플릿화
각 view 파일을 템플릿으로 변환:

```javascript
// 원본 (dashboard.js)
function loadDashboard() {
    content.innerHTML = `
        <div class="hero-stat-value">92.3%</div>
        <div class="hero-stat-label">복잡도 감소</div>
    `;
}

// 템플릿 (dashboard.js.hbs)
function loadDashboard() {
    const data = window.REFACTORING_DATA || {};
    
    content.innerHTML = `
        <div class="hero-stat-value">${data.metrics.complexity.improvement || 'N/A'}</div>
        <div class="hero-stat-label">복잡도 감소</div>
    `;
}
```

## 5. 구현 단계

### Step 1: 데이터 매핑 파일 생성
`templates/data-mapping.json` 파일에 모든 매핑 정의

### Step 2: 템플릿 변환 스크립트
`scripts/templatize-views.js` 스크립트로 view 파일들을 템플릿화

### Step 3: 최종 대시보드 생성
`scripts/generate-final-dashboard.js` 스크립트로 데이터 주입

## 6. 스크립트 상세 설명

### 6.1 View 템플릿화 스크립트
```javascript
// templatize-views.js
const fs = require('fs');
const path = require('path');

class ViewTemplatizer {
    constructor(config) {
        this.viewsDir = config.viewsDir;
        this.outputDir = config.outputDir;
        this.mappingFile = config.mappingFile;
        this.mapping = JSON.parse(fs.readFileSync(this.mappingFile, 'utf8'));
    }
    
    templatize() {
        // 1. 각 view 파일 읽기
        // 2. 하드코딩된 값 찾기
        // 3. 템플릿 변수로 치환
        // 4. 새 파일로 저장
    }
    
    findHardcodedValues(content) {
        const patterns = [
            /\d+,?\d*줄/g,  // 라인 수
            /\d+\.?\d*%/g,  // 퍼센트
            /\d+ms/g,       // 시간
            /\d+일/g        // 기간
        ];
        
        // 패턴 매칭으로 하드코딩된 값 찾기
    }
    
    replaceWithTemplate(content, value, dataPath) {
        // ${data.path.to.value} 형식으로 치환
    }
}
```

### 6.2 최종 대시보드 생성 스크립트
```javascript
// generate-final-dashboard.js
class FinalDashboardGenerator {
    generate(templatePath, dataPath, outputPath) {
        // 1. 템플릿 HTML 로드
        const template = fs.readFileSync(templatePath, 'utf8');
        
        // 2. 데이터 로드
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // 3. 데이터 스크립트 생성
        const dataScript = `
            <script>
                window.REFACTORING_DATA = ${JSON.stringify(data, null, 2)};
            </script>
        `;
        
        // 4. HTML에 데이터 주입
        const finalHtml = template.replace(
            '</body>',
            `${dataScript}\n</body>`
        );
        
        // 5. View 파일들 복사 및 수정
        this.processViewFiles(data, outputPath);
        
        // 6. 최종 HTML 저장
        fs.writeFileSync(
            path.join(outputPath, 'index.html'),
            finalHtml
        );
    }
    
    processViewFiles(data, outputPath) {
        // 템플릿화된 view 파일들을 데이터와 함께 처리
    }
}
```

## 7. 사용 방법

### 7.1 전체 프로세스
```bash
# 1. 리팩토링 실행 및 데이터 수집
./run-refactoring.sh

# 2. 마크다운 파싱
python scripts/parse-markdown.py --input reports/ --output data/

# 3. 데이터 통합
node scripts/integrate-data.js --input data/ --output data/integrated/

# 4. View 템플릿화 (최초 1회)
node scripts/templatize-views.js \
  --views dashboard-assets/js/views/ \
  --output templates/view-templates/

# 5. 최종 대시보드 생성
node scripts/generate-final-dashboard.js \
  --template templates/dashboard-template.html \
  --data data/integrated/dashboard-data.json \
  --views templates/view-templates/ \
  --output projects/my-project/
```

### 7.2 결과물
```
projects/my-project/
├── index.html                    # 데이터가 주입된 메인 HTML
├── dashboard-assets/            # 복사된 assets
│   ├── css/
│   ├── js/
│   │   ├── views/              # 데이터가 바인딩된 view 파일들
│   │   │   ├── overview/
│   │   │   │   └── dashboard.js
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── data.json                    # 프로젝트 데이터
```

## 8. 데이터 바인딩 예시

### 8.1 Hero Section
```javascript
// 템플릿화된 dashboard.js
function loadDashboard() {
    const data = window.REFACTORING_DATA || {};
    const hero = data.hero || {};
    
    content.innerHTML = `
        <section class="hero">
            <div class="hero-header">
                <h5 class="hero-title">${hero.title || '리팩토링 프로젝트'}</h5>
            </div>
            <p class="hero-description">
                ${data.metrics?.size?.class?.totalLines?.before || 'N/A'}줄의 God Class를 
                깔끔하고 유지보수 가능한 CQRS 아키텍처로 성공적으로 변환했습니다.
                Java 21 기능을 활용하여 
                ${data.metrics?.complexity?.improvement || 'N/A'} 복잡도 감소와 
                ${data.metrics?.performance?.apiResponseTime?.improvement || 'N/A'} 성능 향상을 달성했습니다.
            </p>
            <div class="hero-stats">
                ${hero.stats?.map(stat => `
                    <div class="hero-stat">
                        <div class="hero-stat-value">${getNestedValue(data, stat.valuePath) || 'N/A'}</div>
                        <div class="hero-stat-label">${stat.label}</div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// 헬퍼 함수
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
```

### 8.2 Metrics Cards
```javascript
// 메트릭 카드 생성
function createMetricCard(cardData, data) {
    const before = getNestedValue(data, cardData.value.before);
    const after = getNestedValue(data, cardData.value.after);
    const improvement = getNestedValue(data, cardData.trend.value);
    
    return `
        <div class="metric-card ${cardData.type}">
            <div class="metric-header">
                <div class="metric-info">
                    <div class="metric-icon">
                        <i data-lucide="${cardData.icon}" width="18" height="18"></i>
                    </div>
                    <div class="metric-label">${cardData.label}</div>
                </div>
                <div class="metric-trend ${cardData.trend.type}">
                    <i data-lucide="${cardData.trend.icon}" width="12" height="12"></i>
                    ${improvement || 'N/A'}
                </div>
            </div>
            <div class="metric-value">${before || 'N/A'} → ${after || 'N/A'}</div>
            <div class="metric-description">${cardData.description}</div>
        </div>
    `;
}
```

## 9. 문제 해결

### 9.1 데이터 누락 처리
- 모든 데이터 접근 시 기본값 제공
- Optional chaining (`?.`) 사용
- 'N/A' 또는 적절한 기본값 표시

### 9.2 템플릿 버전 관리
- 템플릿 파일에 버전 정보 포함
- 데이터 구조 변경 시 호환성 체크

### 9.3 디버깅
```javascript
// 디버그 모드 추가
if (window.DEBUG_MODE) {
    console.log('Refactoring Data:', window.REFACTORING_DATA);
    console.log('Mapped Value:', getNestedValue(data, path));
}
```

## 10. 확장 가능성

### 10.1 다국어 지원
```javascript
const i18n = {
    ko: {
        complexityReduction: '복잡도 감소',
        performanceImprovement: '성능 향상'
    },
    en: {
        complexityReduction: 'Complexity Reduction',
        performanceImprovement: 'Performance Improvement'
    }
};
```

### 10.2 테마 커스터마이징
- CSS 변수를 통한 색상 커스터마이징
- 레이아웃 템플릿 분리

이 가이드를 통해 정적 대시보드를 동적으로 변환하여 실제 리팩토링 데이터를 자동으로 반영할 수 있습니다.