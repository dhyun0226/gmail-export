#!/usr/bin/env python3
"""
기술스택 감지 엔진
프로젝트 파일을 분석하여 사용된 기술스택을 자동으로 감지합니다.
"""

import os
import json
import re
import glob
from pathlib import Path
from typing import Dict, List, Any, Tuple
import yaml

class TechStackDetector:
    """기술스택 자동 감지 클래스"""
    
    def __init__(self, config_path: str = None):
        """
        초기화
        Args:
            config_path: 설정 파일 경로
        """
        self.config = self._load_config(config_path)
        self.detection_results = {
            'frontend': {},
            'backend': {},
            'database': {},
            'tools': {},
            'confidence_scores': {}
        }
    
    def _load_config(self, config_path: str) -> Dict:
        """설정 파일 로드"""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # 기본 설정
        return {
            "detection_patterns": {
                "vue3": {
                    "package_patterns": [r"vue@\^?3", r"vue@3\.", r"@vue/cli"],
                    "file_patterns": [r"\.vue$", r"main\.(js|ts)"],
                    "content_patterns": [r"createApp\(", r"Vue\.createApp"],
                    "weight": 90
                },
                "react": {
                    "package_patterns": [r"react@\^?(17|18)", r"react-dom"],
                    "file_patterns": [r"\.(jsx|tsx)$", r"App\.(jsx|tsx)"],
                    "content_patterns": [r"React\.createElement", r"import.*React"],
                    "weight": 90
                },
                "spring_boot": {
                    "package_patterns": [r"spring-boot-starter", r"org\.springframework\.boot"],
                    "file_patterns": [r"pom\.xml$", r"application\.(yml|properties)"],
                    "content_patterns": [r"@SpringBootApplication", r"@RestController"],
                    "weight": 95
                },
                "express": {
                    "package_patterns": [r"express"],
                    "file_patterns": [r"server\.(js|ts)$", r"app\.(js|ts)$"],
                    "content_patterns": [r"express\(\)", r"app\.listen"],
                    "weight": 85
                }
            }
        }
    
    def detect_tech_stack(self, project_path: str, scan_depth: int = 3) -> Dict[str, Any]:
        """
        프로젝트 기술스택 감지 메인 함수
        
        Args:
            project_path: 분석할 프로젝트 경로
            scan_depth: 스캔 깊이
            
        Returns:
            감지된 기술스택 정보
        """
        print(f"🔍 기술스택 감지 시작: {project_path}")
        
        # 1. 파일 목록 수집
        files = self._collect_files(project_path, scan_depth)
        print(f"📁 분석 대상 파일: {len(files)}개")
        
        # 2. Package 파일 분석
        self._analyze_package_files(files)
        
        # 3. 설정 파일 분석
        self._analyze_config_files(files)
        
        # 4. 소스 코드 분석
        self._analyze_source_files(files)
        
        # 5. 디렉토리 구조 분석
        self._analyze_directory_structure(files)
        
        # 6. 결과 종합 및 신뢰도 계산
        final_results = self._calculate_final_results()
        
        print(f"✅ 기술스택 감지 완료")
        return final_results
    
    def _collect_files(self, project_path: str, scan_depth: int) -> List[Dict]:
        """분석 대상 파일 수집"""
        files = []
        project_path = Path(project_path)
        
        # 중요한 파일 패턴들
        important_patterns = [
            '**/package.json',
            '**/pom.xml',
            '**/build.gradle',
            '**/requirements.txt',
            '**/Pipfile',
            '**/composer.json',
            '**/application.yml',
            '**/application.properties',
            '**/*.vue',
            '**/*.jsx',
            '**/*.tsx',
            '**/Dockerfile',
            '**/docker-compose*.yml'
        ]
        
        # 제외할 디렉토리
        exclude_dirs = {
            'node_modules', 'target', 'build', 'dist', '.git', 
            '__pycache__', '.venv', 'venv', 'coverage'
        }
        
        for pattern in important_patterns:
            for file_path in project_path.glob(pattern):
                # 제외 디렉토리 체크
                if any(exclude_dir in file_path.parts for exclude_dir in exclude_dirs):
                    continue
                
                # 깊이 제한 체크
                relative_path = file_path.relative_to(project_path)
                if len(relative_path.parts) > scan_depth:
                    continue
                
                files.append({
                    'path': str(file_path),
                    'relative_path': str(relative_path),
                    'name': file_path.name,
                    'suffix': file_path.suffix,
                    'parent': str(file_path.parent),
                    'size': file_path.stat().st_size if file_path.exists() else 0
                })
        
        return files
    
    def _analyze_package_files(self, files: List[Dict]) -> None:
        """패키지 매니저 파일 분석"""
        print("📦 패키지 파일 분석 중...")
        
        package_files = [f for f in files if f['name'] in ['package.json', 'pom.xml', 'build.gradle', 'requirements.txt']]
        
        for file_info in package_files:
            try:
                content = self._read_file_content(file_info['path'])
                
                if file_info['name'] == 'package.json':
                    self._analyze_package_json(content, file_info)
                elif file_info['name'] == 'pom.xml':
                    self._analyze_pom_xml(content, file_info)
                elif file_info['name'] == 'build.gradle':
                    self._analyze_build_gradle(content, file_info)
                elif file_info['name'] == 'requirements.txt':
                    self._analyze_requirements_txt(content, file_info)
                    
            except Exception as e:
                print(f"⚠️ 파일 분석 실패: {file_info['path']} - {str(e)}")
    
    def _analyze_package_json(self, content: str, file_info: Dict) -> None:
        """package.json 분석"""
        try:
            package_data = json.loads(content)
            dependencies = {**package_data.get('dependencies', {}), **package_data.get('devDependencies', {})}
            
            # Vue.js 감지
            if self._detect_vue_js(dependencies):
                self.detection_results['frontend']['framework'] = 'Vue 3'
                self.detection_results['frontend']['package_manager'] = 'npm/pnpm'
                self.detection_results['confidence_scores']['vue'] = 95
                
                # Vue 관련 라이브러리 감지
                self._detect_vue_ecosystem(dependencies)
            
            # React 감지
            elif self._detect_react(dependencies):
                self.detection_results['frontend']['framework'] = 'React'
                self.detection_results['frontend']['package_manager'] = 'npm'
                self.detection_results['confidence_scores']['react'] = 95
                
                # React 관련 라이브러리 감지
                self._detect_react_ecosystem(dependencies)
            
            # Angular 감지
            elif self._detect_angular(dependencies):
                self.detection_results['frontend']['framework'] = 'Angular'
                self.detection_results['frontend']['package_manager'] = 'npm'
                self.detection_results['confidence_scores']['angular'] = 95
            
            # Node.js 백엔드 감지
            if self._detect_nodejs_backend(dependencies):
                self.detection_results['backend']['framework'] = 'Express.js'
                self.detection_results['backend']['runtime'] = 'Node.js'
                self.detection_results['confidence_scores']['nodejs'] = 85
            
            # 빌드 도구 감지
            self._detect_build_tools(dependencies)
            
            # UI 라이브러리 감지
            self._detect_ui_libraries(dependencies)
            
        except json.JSONDecodeError:
            print(f"⚠️ JSON 파싱 실패: {file_info['path']}")
    
    def _detect_vue_js(self, dependencies: Dict[str, str]) -> bool:
        """Vue.js 감지"""
        vue_indicators = [
            'vue',
            '@vue/cli',
            '@vue/cli-service',
            'vue-router',
            'vuex',
            'pinia'
        ]
        
        for dep_name, version in dependencies.items():
            if dep_name == 'vue' and ('3.' in version or '^3' in version):
                return True
            elif dep_name in vue_indicators:
                return True
        
        return False
    
    def _detect_vue_ecosystem(self, dependencies: Dict[str, str]) -> None:
        """Vue 생태계 라이브러리 감지"""
        vue_libs = []
        
        # 라우터
        if 'vue-router' in dependencies:
            vue_libs.append({
                'name': 'Vue Router',
                'version': dependencies['vue-router'],
                'purpose': 'Routing'
            })
        
        # 상태 관리
        if 'pinia' in dependencies:
            vue_libs.append({
                'name': 'Pinia',
                'version': dependencies['pinia'],
                'purpose': 'State Management'
            })
        elif 'vuex' in dependencies:
            vue_libs.append({
                'name': 'Vuex',
                'version': dependencies['vuex'],
                'purpose': 'State Management'
            })
        
        # 빌드 도구
        if 'vite' in dependencies:
            vue_libs.append({
                'name': 'Vite',
                'version': dependencies['vite'],
                'purpose': 'Build Tool'
            })
        
        self.detection_results['frontend']['libs'] = vue_libs
    
    def _detect_react(self, dependencies: Dict[str, str]) -> bool:
        """React 감지"""
        return 'react' in dependencies and 'react-dom' in dependencies
    
    def _detect_react_ecosystem(self, dependencies: Dict[str, str]) -> None:
        """React 생태계 라이브러리 감지"""
        react_libs = []
        
        # 라우터
        if 'react-router-dom' in dependencies:
            react_libs.append({
                'name': 'React Router',
                'version': dependencies['react-router-dom'],
                'purpose': 'Routing'
            })
        
        # 상태 관리
        if 'redux' in dependencies or '@reduxjs/toolkit' in dependencies:
            react_libs.append({
                'name': 'Redux Toolkit',
                'version': dependencies.get('@reduxjs/toolkit', dependencies.get('redux')),
                'purpose': 'State Management'
            })
        
        self.detection_results['frontend']['libs'] = react_libs
    
    def _detect_angular(self, dependencies: Dict[str, str]) -> bool:
        """Angular 감지"""
        angular_indicators = ['@angular/core', '@angular/cli', '@angular/common']
        return any(indicator in dependencies for indicator in angular_indicators)
    
    def _detect_nodejs_backend(self, dependencies: Dict[str, str]) -> bool:
        """Node.js 백엔드 감지"""
        backend_indicators = ['express', 'koa', 'fastify', 'hapi']
        return any(indicator in dependencies for indicator in backend_indicators)
    
    def _detect_build_tools(self, dependencies: Dict[str, str]) -> None:
        """빌드 도구 감지"""
        if 'vite' in dependencies:
            self.detection_results['tools']['build'] = 'Vite'
        elif 'webpack' in dependencies:
            self.detection_results['tools']['build'] = 'Webpack'
        elif '@vue/cli-service' in dependencies:
            self.detection_results['tools']['build'] = 'Vue CLI'
        elif 'react-scripts' in dependencies:
            self.detection_results['tools']['build'] = 'Create React App'
    
    def _detect_ui_libraries(self, dependencies: Dict[str, str]) -> None:
        """UI 라이브러리 감지"""
        ui_mappings = {
            'bootstrap': 'Bootstrap',
            'bootstrap-vue-next': 'Bootstrap Vue Next',
            '@mui/material': 'Material-UI',
            'antd': 'Ant Design',
            'element-plus': 'Element Plus',
            'vuetify': 'Vuetify',
            'devextreme': 'DevExtreme',
            'ag-grid-vue': 'AG Grid'
        }
        
        detected_ui = []
        for dep_name, ui_name in ui_mappings.items():
            if dep_name in dependencies:
                detected_ui.append({
                    'name': ui_name,
                    'version': dependencies[dep_name],
                    'package': dep_name
                })
        
        if detected_ui:
            self.detection_results['frontend']['ui_libraries'] = detected_ui
    
    def _analyze_pom_xml(self, content: str, file_info: Dict) -> None:
        """pom.xml 분석"""
        if 'spring-boot' in content.lower():
            self.detection_results['backend']['framework'] = 'Spring Boot'
            self.detection_results['backend']['language'] = 'Java'
            self.detection_results['backend']['build_tool'] = 'Maven'
            self.detection_results['confidence_scores']['spring_boot'] = 95
            
            # Spring Boot 버전 추출
            version_match = re.search(r'<spring-boot\.version>(.*?)</spring-boot\.version>', content)
            if version_match:
                self.detection_results['backend']['version'] = version_match.group(1)
            
            # 추가 Spring 라이브러리 감지
            spring_libs = []
            
            if 'spring-boot-starter-data-jpa' in content:
                spring_libs.append({'name': 'Spring Data JPA', 'purpose': 'Data Access'})
            
            if 'spring-boot-starter-security' in content:
                spring_libs.append({'name': 'Spring Security', 'purpose': 'Security'})
            
            if 'spring-boot-starter-web' in content:
                spring_libs.append({'name': 'Spring Web', 'purpose': 'Web Framework'})
            
            if spring_libs:
                self.detection_results['backend']['libs'] = spring_libs
    
    def _analyze_build_gradle(self, content: str, file_info: Dict) -> None:
        """build.gradle 분석"""
        if 'spring-boot' in content.lower():
            self.detection_results['backend']['framework'] = 'Spring Boot'
            self.detection_results['backend']['language'] = 'Java'
            self.detection_results['backend']['build_tool'] = 'Gradle'
            self.detection_results['confidence_scores']['spring_boot'] = 95
    
    def _analyze_requirements_txt(self, content: str, file_info: Dict) -> None:
        """requirements.txt 분석"""
        lines = content.strip().split('\n')
        
        for line in lines:
            line = line.strip().lower()
            
            if line.startswith('django'):
                self.detection_results['backend']['framework'] = 'Django'
                self.detection_results['backend']['language'] = 'Python'
                self.detection_results['confidence_scores']['django'] = 90
            
            elif line.startswith('flask'):
                self.detection_results['backend']['framework'] = 'Flask'
                self.detection_results['backend']['language'] = 'Python'
                self.detection_results['confidence_scores']['flask'] = 90
            
            elif line.startswith('fastapi'):
                self.detection_results['backend']['framework'] = 'FastAPI'
                self.detection_results['backend']['language'] = 'Python'
                self.detection_results['confidence_scores']['fastapi'] = 90
    
    def _analyze_config_files(self, files: List[Dict]) -> None:
        """설정 파일 분석"""
        print("⚙️ 설정 파일 분석 중...")
        
        config_files = [f for f in files if f['name'] in ['application.yml', 'application.properties', '.env']]
        
        for file_info in config_files:
            try:
                content = self._read_file_content(file_info['path'])
                self._analyze_database_config(content)
                
            except Exception as e:
                print(f"⚠️ 설정 파일 분석 실패: {file_info['path']} - {str(e)}")
    
    def _analyze_database_config(self, content: str) -> None:
        """데이터베이스 설정 분석"""
        content_lower = content.lower()
        
        # PostgreSQL 감지
        if any(keyword in content_lower for keyword in ['postgresql', 'postgres']):
            self.detection_results['database']['primary'] = 'PostgreSQL'
            self.detection_results['confidence_scores']['postgresql'] = 90
        
        # MySQL 감지
        elif 'mysql' in content_lower:
            self.detection_results['database']['primary'] = 'MySQL'
            self.detection_results['confidence_scores']['mysql'] = 90
        
        # MongoDB 감지
        elif any(keyword in content_lower for keyword in ['mongodb', 'mongo']):
            self.detection_results['database']['primary'] = 'MongoDB'
            self.detection_results['confidence_scores']['mongodb'] = 90
        
        # Redis 감지
        if 'redis' in content_lower:
            self.detection_results['database']['cache'] = 'Redis'
            self.detection_results['confidence_scores']['redis'] = 85
    
    def _analyze_source_files(self, files: List[Dict]) -> None:
        """소스 파일 분석"""
        print("📝 소스 파일 분석 중...")
        
        # Vue 파일 확인
        vue_files = [f for f in files if f['suffix'] == '.vue']
        if vue_files and 'vue' not in self.detection_results.get('confidence_scores', {}):
            self.detection_results['frontend']['framework'] = 'Vue'
            self.detection_results['confidence_scores']['vue'] = 80
        
        # React 파일 확인
        react_files = [f for f in files if f['suffix'] in ['.jsx', '.tsx']]
        if react_files and 'react' not in self.detection_results.get('confidence_scores', {}):
            self.detection_results['frontend']['framework'] = 'React'
            self.detection_results['confidence_scores']['react'] = 80
    
    def _analyze_directory_structure(self, files: List[Dict]) -> None:
        """디렉토리 구조 분석"""
        print("📁 디렉토리 구조 분석 중...")
        
        directories = set()
        for file_info in files:
            parts = Path(file_info['relative_path']).parts
            for i in range(len(parts)):
                directories.add('/'.join(parts[:i+1]))
        
        # Spring Boot 패턴 감지
        spring_patterns = ['src/main/java', 'src/main/resources']
        if any(pattern in directories for pattern in spring_patterns):
            if 'spring_boot' not in self.detection_results.get('confidence_scores', {}):
                self.detection_results['backend']['framework'] = 'Spring Boot'
                self.detection_results['confidence_scores']['spring_boot'] = 70
        
        # 레이어드 아키텍처 감지
        layered_patterns = ['controller', 'service', 'repository', 'entity']
        layered_score = sum(1 for pattern in layered_patterns if any(pattern in dir_name.lower() for dir_name in directories))
        
        if layered_score >= 3:
            self.detection_results['backend']['architecture'] = 'Layered Architecture'
            self.detection_results['confidence_scores']['layered'] = min(90, layered_score * 25)
    
    def _calculate_final_results(self) -> Dict[str, Any]:
        """최종 결과 계산"""
        # 전체 신뢰도 계산
        confidence_scores = list(self.detection_results['confidence_scores'].values())
        overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # 메타데이터 형식으로 변환
        result = {
            'detection_timestamp': self._get_timestamp(),
            'overall_confidence': round(overall_confidence, 1),
            'tech_stack': {
                'frontend': self.detection_results.get('frontend', {}),
                'backend': self.detection_results.get('backend', {}),
                'database': self.detection_results.get('database', {}),
                'tools': self.detection_results.get('tools', {})
            },
            'confidence_breakdown': self.detection_results['confidence_scores'],
            'recommendations': self._generate_recommendations()
        }
        
        return result
    
    def _generate_recommendations(self) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        # 신뢰도 기반 권장사항
        for tech, score in self.detection_results['confidence_scores'].items():
            if score < 80:
                recommendations.append(f"{tech} 설정을 수동으로 검토하세요 (신뢰도: {score}%)")
        
        # 누락된 기술스택 권장사항
        if not self.detection_results.get('database'):
            recommendations.append("데이터베이스 설정이 감지되지 않았습니다. 수동으로 추가하세요.")
        
        if not self.detection_results.get('frontend') and not self.detection_results.get('backend'):
            recommendations.append("주요 프레임워크가 감지되지 않았습니다. 프로젝트 구조를 확인하세요.")
        
        return recommendations
    
    def _read_file_content(self, file_path: str) -> str:
        """파일 내용 읽기"""
        encodings = ['utf-8', 'utf-8-sig', 'latin-1']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        
        # 바이너리로 읽어서 텍스트 부분만 추출
        with open(file_path, 'rb') as f:
            content = f.read()
            return content.decode('utf-8', errors='ignore')
    
    def _get_timestamp(self) -> str:
        """현재 타임스탬프 반환"""
        from datetime import datetime
        return datetime.now().isoformat()

def main():
    """메인 실행 함수"""
    import sys
    
    if len(sys.argv) < 2:
        print("사용법: python tech-stack-detector.py <프로젝트_경로> [스캔_깊이]")
        sys.exit(1)
    
    project_path = sys.argv[1]
    scan_depth = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    detector = TechStackDetector()
    results = detector.detect_tech_stack(project_path, scan_depth)
    
    # 결과 출력
    print("\n" + "="*50)
    print("🎯 기술스택 감지 결과")
    print("="*50)
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()