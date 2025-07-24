# 📊 대시보드 데이터 수집 가이드

## 1. 개요

이 가이드는 리팩토링 과정에서 생성된 모든 데이터를 수집하고 통합하여 대시보드에서 활용할 수 있는 형태로 변환하는 방법을 설명합니다.

## 2. 데이터 수집 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    마크다운 문서들                         │
│  (02-TARGET-ANALYSIS.md ~ 22-ADV-FINAL-REPORT.md)      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  데이터 추출기 (Parser)                   │
│  - 마크다운 테이블 파싱                                  │
│  - 코드 블록 추출                                        │
│  - 메트릭스 수집                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   데이터 변환기 (Transformer)             │
│  - 정규화 및 검증                                        │
│  - 집계 및 계산                                          │
│  - 관계 매핑                                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    통합 JSON 데이터                       │
│  - dashboard-data.json                                  │
│  - metrics-timeline.json                                │
│  - issues-resolved.json                                 │
└─────────────────────────────────────────────────────────┘
```

## 3. 수집 대상 데이터

### 3.1 Phase 1: 기본 리팩토링 (01-09)

#### 02-TARGET-ANALYSIS.md
```json
{
  "source": "02-TARGET-ANALYSIS.md",
  "data": {
    "initialMetrics": {
      "complexity": {...},
      "size": {...},
      "coupling": {...},
      "issues": [...]
    },
    "dependencies": {
      "controller": [...],
      "service": [...],
      "mapper": [...],
      "xml": [...]
    },
    "domains": [...]
  }
}
```

#### 03-REFACTORING-PLAN.md
```json
{
  "source": "03-REFACTORING-PLAN.md",
  "data": {
    "expectedImprovements": {...},
    "patterns": [...],
    "domainStructure": {...},
    "timeline": {...}
  }
}
```

#### 08-VERIFICATION.md
```json
{
  "source": "08-VERIFICATION.md",
  "data": {
    "finalMetrics": {...},
    "performance": {...},
    "testCoverage": {...},
    "completeness": {...}
  }
}
```

### 3.2 Phase 2: 고급 리팩토링 (10-22)

#### 11-ADV-SECURITY-ANALYSIS.md
```json
{
  "source": "11-ADV-SECURITY-ANALYSIS.md",
  "data": {
    "vulnerabilities": {
      "before": [...],
      "after": [...],
      "resolved": [...]
    },
    "securityScore": {
      "before": 45,
      "after": 92
    }
  }
}
```

#### 14-ADV-PERFORMANCE-ANALYSIS.md
```json
{
  "source": "14-ADV-PERFORMANCE-ANALYSIS.md",
  "data": {
    "queryOptimizations": [...],
    "caching": {...},
    "responseTimeImprovements": [...]
  }
}
```

## 4. 데이터 추출 스크립트

### 4.1 마크다운 파서 (parse-markdown.py)
```python
import re
import json
import os
from pathlib import Path

class MarkdownParser:
    def __init__(self, reports_dir):
        self.reports_dir = Path(reports_dir)
        self.data = {}
    
    def parse_table(self, content, start_marker):
        """마크다운 테이블을 JSON으로 변환"""
        # 테이블 추출 로직
        pass
    
    def parse_code_block(self, content, language):
        """코드 블록에서 JSON 데이터 추출"""
        pattern = f"```{language}(.*?)```"
        matches = re.findall(pattern, content, re.DOTALL)
        return [json.loads(match.strip()) for match in matches]
    
    def extract_metrics(self, content):
        """메트릭스 데이터 추출"""
        metrics = {}
        
        # 순환 복잡도 추출
        complexity_pattern = r"순환 복잡도.*?(\d+).*?→.*?(\d+)"
        match = re.search(complexity_pattern, content)
        if match:
            metrics['complexity'] = {
                'before': int(match.group(1)),
                'after': int(match.group(2))
            }
        
        return metrics
    
    def parse_all_reports(self):
        """모든 리포트 파싱"""
        for report_file in self.reports_dir.glob("*.md"):
            with open(report_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            file_data = {
                'source': report_file.name,
                'data': self.extract_data(content, report_file.name)
            }
            
            self.data[report_file.stem] = file_data
        
        return self.data
    
    def extract_data(self, content, filename):
        """파일별 데이터 추출 로직"""
        data = {}
        
        if filename == "02-TARGET-ANALYSIS.md":
            data['metrics'] = self.extract_metrics(content)
            data['issues'] = self.parse_issues(content)
        elif filename == "08-VERIFICATION.md":
            data['finalMetrics'] = self.extract_metrics(content)
            data['performance'] = self.parse_performance(content)
        # ... 각 파일별 추출 로직
        
        return data
```

### 4.2 데이터 통합기 (integrate-data.js)
```javascript
const fs = require('fs');
const path = require('path');

class DataIntegrator {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.integratedData = {
            project: {},
            timeline: [],
            metrics: {
                before: {},
                after: {},
                improvements: {}
            },
            issues: {
                identified: [],
                resolved: [],
                remaining: []
            },
            patterns: [],
            performance: {}
        };
    }
    
    integrate() {
        // 각 JSON 파일 읽기
        const files = fs.readdirSync(this.dataDir)
            .filter(f => f.endsWith('.json'));
        
        files.forEach(file => {
            const data = JSON.parse(
                fs.readFileSync(path.join(this.dataDir, file), 'utf8')
            );
            this.mergeData(data);
        });
        
        // 계산 및 집계
        this.calculateImprovements();
        this.generateTimeline();
        
        return this.integratedData;
    }
    
    mergeData(data) {
        // 데이터 병합 로직
        if (data.source === '02-TARGET-ANALYSIS.md') {
            this.integratedData.metrics.before = data.data.initialMetrics;
            this.integratedData.issues.identified = data.data.issues;
        }
        // ... 추가 병합 로직
    }
    
    calculateImprovements() {
        const before = this.integratedData.metrics.before;
        const after = this.integratedData.metrics.after;
        
        // 개선율 계산
        this.integratedData.metrics.improvements = {
            complexity: this.calculatePercentage(
                before.complexity.max, 
                after.complexity.max
            ),
            responseTime: this.calculatePercentage(
                before.performance.avgResponseTime,
                after.performance.avgResponseTime
            )
            // ... 추가 계산
        };
    }
    
    calculatePercentage(before, after) {
        return ((before - after) / before * 100).toFixed(1) + '%';
    }
}
```

## 5. 데이터 검증

### 5.1 데이터 완전성 검증
```javascript
class DataValidator {
    validate(data) {
        const required = [
            'metrics.before.complexity',
            'metrics.after.complexity',
            'issues.identified',
            'issues.resolved',
            'performance.before',
            'performance.after'
        ];
        
        const missing = [];
        required.forEach(path => {
            if (!this.getNestedValue(data, path)) {
                missing.push(path);
            }
        });
        
        if (missing.length > 0) {
            throw new Error(`Missing required data: ${missing.join(', ')}`);
        }
        
        return true;
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}
```

## 6. 출력 데이터 구조

### 6.1 dashboard-data.json
```json
{
  "metadata": {
    "generatedAt": "2024-01-20T10:00:00Z",
    "version": "1.0",
    "project": "VisitAction Module Refactoring"
  },
  "summary": {
    "duration": "14 days",
    "filesChanged": {
      "before": 2,
      "after": 28
    },
    "linesOfCode": {
      "before": 1847,
      "after": 2100,
      "distribution": "better"
    }
  },
  "metrics": {
    "complexity": {
      "before": {
        "max": 156,
        "average": 23.5
      },
      "after": {
        "max": 12,
        "average": 4.5
      },
      "improvement": "92.3%"
    },
    "performance": {
      "apiResponseTime": {
        "before": 450,
        "after": 230,
        "improvement": "48.8%"
      },
      "queryOptimizations": 12,
      "cacheHitRate": 85
    },
    "quality": {
      "before": 30,
      "after": 90,
      "grade": "A"
    }
  },
  "issues": {
    "critical": {
      "identified": 3,
      "resolved": 3,
      "details": [
        {
          "type": "God Class",
          "severity": "Critical",
          "location": "VisitActionService",
          "resolution": "Split into 15 domain-specific classes"
        }
      ]
    },
    "major": {
      "identified": 8,
      "resolved": 8
    },
    "minor": {
      "identified": 15,
      "resolved": 12
    }
  },
  "patterns": [
    {
      "name": "CQRS",
      "applied": true,
      "impact": "High",
      "locations": ["OrderService", "PaymentService"]
    },
    {
      "name": "Repository",
      "applied": true,
      "impact": "Medium",
      "locations": ["Data Access Layer"]
    }
  ],
  "timeline": [
    {
      "phase": "Analysis",
      "start": "2024-01-01",
      "end": "2024-01-03",
      "tasks": ["Dependency Analysis", "Metrics Collection"]
    },
    {
      "phase": "Planning",
      "start": "2024-01-04",
      "end": "2024-01-05",
      "tasks": ["Domain Separation", "Pattern Selection"]
    },
    {
      "phase": "Implementation",
      "start": "2024-01-06",
      "end": "2024-01-12",
      "tasks": ["Controller Refactoring", "Service Refactoring", "Mapper Refactoring"]
    },
    {
      "phase": "Verification",
      "start": "2024-01-13",
      "end": "2024-01-14",
      "tasks": ["Testing", "Performance Validation"]
    }
  ]
}
```

## 7. 실행 방법

### 7.1 단계별 실행
```bash
# 1. 마크다운 파싱
python scripts/parse-markdown.py --input reports/ --output data/raw/

# 2. 데이터 통합
node scripts/integrate-data.js --input data/raw/ --output data/integrated/

# 3. 검증
node scripts/validate-data.js --input data/integrated/dashboard-data.json

# 4. 대시보드 생성
node scripts/generate-dashboard.js --data data/integrated/ --output dashboard/
```

### 7.2 자동화 스크립트
```bash
#!/bin/bash
# collect-dashboard-data.sh

echo "🚀 대시보드 데이터 수집 시작..."

# 환경 변수 설정
REPORTS_DIR="./reports"
DATA_DIR="./data"
DASHBOARD_DIR="./dashboard"

# 디렉토리 생성
mkdir -p $DATA_DIR/{raw,integrated}
mkdir -p $DASHBOARD_DIR

# 1. 마크다운 파싱
echo "📄 마크다운 문서 파싱 중..."
python scripts/parse-markdown.py \
    --input $REPORTS_DIR \
    --output $DATA_DIR/raw

# 2. 데이터 통합
echo "🔄 데이터 통합 중..."
node scripts/integrate-data.js \
    --input $DATA_DIR/raw \
    --output $DATA_DIR/integrated

# 3. 데이터 검증
echo "✅ 데이터 검증 중..."
node scripts/validate-data.js \
    --input $DATA_DIR/integrated/dashboard-data.json

# 4. 결과 확인
echo "📊 수집된 데이터:"
ls -la $DATA_DIR/integrated/

echo "✨ 데이터 수집 완료!"
```

## 8. 트러블슈팅

### 8.1 일반적인 문제
1. **파싱 오류**: 마크다운 형식이 일관되지 않은 경우
   - 해결: 템플릿 준수 확인
   
2. **데이터 누락**: 필수 데이터가 없는 경우
   - 해결: 각 단계에서 데이터 생성 확인

3. **인코딩 문제**: UTF-8이 아닌 경우
   - 해결: 모든 파일을 UTF-8로 저장

### 8.2 디버깅 옵션
```bash
# 상세 로그 출력
python scripts/parse-markdown.py --verbose

# 특정 파일만 파싱
python scripts/parse-markdown.py --file 02-TARGET-ANALYSIS.md

# 드라이런 (실제 파일 생성하지 않음)
node scripts/integrate-data.js --dry-run
```

## 9. 다음 단계
- 24-DASHBOARD-GENERATION.md 참조하여 수집된 데이터로 대시보드 생성
- 생성된 대시보드 검증 및 배포