# 인프라 및 배포 설정 완전 가이드
> 프로덕션 수준의 인프라 구성과 CI/CD 파이프라인 자동 생성 가이드

## 🎯 목표
AI가 화면 이미지로부터 **즉시 배포 가능한** 인프라 설정과 배포 파이프라인을 자동 생성

## 🏗️ 완전한 인프라 구성

### 1. Docker 설정

#### Dockerfile (Frontend)
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build-stage

WORKDIR /app

# 의존성 설치를 위한 파일들 복사
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Nginx를 사용한 프로덕션 단계
FROM nginx:alpine as production-stage

# Nginx 설정 파일
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile (Backend)
```dockerfile
# backend/Dockerfile
FROM maven:3.9-openjdk-17-slim as build-stage

WORKDIR /app

# 의존성 캐시를 위한 pom.xml 먼저 복사
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 소스 코드 복사 및 빌드
COPY src ./src
RUN mvn clean package -DskipTests

# 프로덕션 런타임 이미지
FROM openjdk:17-jre-slim as production-stage

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 애플리케이션 사용자 생성
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# JAR 파일 복사
COPY --from=build-stage /app/target/*.jar app.jar

# 설정 파일 복사
COPY docker/application-docker.yml ./config/

# 권한 설정
RUN chown -R appuser:appgroup /app

USER appuser

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=docker", \
    "-Xmx512m", \
    "-jar", \
    "app.jar"]
```

#### docker-compose.yml (전체 스택)
```yaml
version: '3.8'

services:
  # 데이터베이스
  postgres:
    image: postgres:15-alpine
    container_name: ows-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-ows_demo}
      POSTGRES_USER: ${DB_USER:-ows_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-ows_pass}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --locale=C"
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-ows_user} -d ${DB_NAME:-ows_demo}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ows-network

  # 캐시
  redis:
    image: redis:7-alpine
    container_name: ows-redis
    command: redis-server --requirepass ${REDIS_PASSWORD:-}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
      - ./docker/redis.conf:/usr/local/etc/redis/redis.conf:ro
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    restart: unless-stopped
    networks:
      - ows-network

  # 백엔드 애플리케이션
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production-stage
    container_name: ows-backend
    environment:
      SPRING_PROFILES_ACTIVE: docker
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-ows_demo}
      DB_USER: ${DB_USER:-ows_user}
      DB_PASSWORD: ${DB_PASSWORD:-ows_pass}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-}
      JWT_SECRET: ${JWT_SECRET:-mySecretKey123456789012345678901234567890}
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - ows-network
    volumes:
      - backend_logs:/app/logs

  # 프론트엔드 애플리케이션
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production-stage
    container_name: ows-frontend
    ports:
      - "${FRONTEND_PORT:-80}:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - ows-network

  # 리버스 프록시
  nginx:
    image: nginx:alpine
    container_name: ows-nginx
    ports:
      - "${HTTP_PORT:-80}:80"
      - "${HTTPS_PORT:-443}:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - ows-network

  # 모니터링: Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: ows-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - ows-network

  # 모니터링: Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: ows-grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./docker/grafana/provisioning:/etc/grafana/provisioning:ro
    restart: unless-stopped
    networks:
      - ows-network

volumes:
  postgres_data:
  redis_data:
  backend_logs:
  nginx_logs:
  prometheus_data:
  grafana_data:

networks:
  ows-network:
    driver: bridge
```

### 2. Kubernetes 배포 설정

#### namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ows-demo
  labels:
    name: ows-demo
    environment: production
```

#### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ows-config
  namespace: ows-demo
data:
  application.yml: |
    spring:
      profiles:
        active: k8s
      datasource:
        url: jdbc:postgresql://postgres-service:5432/ows_demo
        username: ${DB_USER}
        password: ${DB_PASSWORD}
      data:
        redis:
          host: redis-service
          port: 6379
          password: ${REDIS_PASSWORD}
    server:
      port: 8080
    management:
      endpoints:
        web:
          exposure:
            include: health,info,metrics,prometheus
    logging:
      level:
        com.ows.demo: INFO
      pattern:
        console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: ows-demo
data:
  nginx.conf: |
    user nginx;
    worker_processes auto;
    error_log /var/log/nginx/error.log warn;
    pid /var/run/nginx.pid;

    events {
        worker_connections 1024;
    }

    http {
        include /etc/nginx/mime.types;
        default_type application/octet-stream;
        
        log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                       '$status $body_bytes_sent "$http_referer" '
                       '"$http_user_agent" "$http_x_forwarded_for"';
        
        access_log /var/log/nginx/access.log main;
        
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        
        # Gzip 압축
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
        
        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        
        upstream backend {
            server backend-service:8080;
        }
        
        server {
            listen 80;
            server_name _;
            
            # Security headers
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-XSS-Protection "1; mode=block" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header Referrer-Policy "no-referrer-when-downgrade" always;
            add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
            
            # Frontend static files
            location / {
                root /usr/share/nginx/html;
                index index.html index.htm;
                try_files $uri $uri/ /index.html;
                
                # Cache static assets
                location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                    expires 1y;
                    add_header Cache-Control "public, immutable";
                }
            }
            
            # API 프록시
            location /api/ {
                limit_req zone=api burst=20 nodelay;
                
                proxy_pass http://backend;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                
                # CORS 설정
                add_header Access-Control-Allow-Origin * always;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
                add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
                add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
                
                if ($request_method = 'OPTIONS') {
                    add_header Access-Control-Max-Age 1728000;
                    add_header Content-Type 'text/plain charset=UTF-8';
                    add_header Content-Length 0;
                    return 204;
                }
            }
            
            # 헬스체크
            location /health {
                access_log off;
                return 200 "healthy\n";
                add_header Content-Type text/plain;
            }
        }
    }
```

#### deployments.yaml
```yaml
# PostgreSQL 배포
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
  namespace: ows-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "ows_demo"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: db-user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: db-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
# Redis 배포
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-deployment
  namespace: ows-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: redis-password
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc

---
# Backend 배포
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: ows-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ows/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: db-user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: db-password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: redis-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ows-secrets
              key: jwt-secret
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: config-volume
        configMap:
          name: ows-config

---
# Frontend 배포
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: ows-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ows/frontend:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config-volume
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
      volumes:
      - name: nginx-config-volume
        configMap:
          name: nginx-config
```

### 3. CI/CD 파이프라인

#### GitHub Actions (.github/workflows/ci-cd.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 테스트 및 빌드
  test-and-build:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ows_demo_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    # Frontend 테스트 및 빌드
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install frontend dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Run frontend linting
      working-directory: ./frontend
      run: npm run lint
    
    - name: Run frontend type check
      working-directory: ./frontend
      run: npm run type-check
    
    - name: Run frontend tests
      working-directory: ./frontend
      run: npm run test:unit
    
    - name: Build frontend
      working-directory: ./frontend
      run: npm run build
    
    # Backend 테스트 및 빌드
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2
    
    - name: Run backend tests
      working-directory: ./backend
      run: ./mvnw clean test
      env:
        SPRING_PROFILES_ACTIVE: test
        DB_URL: jdbc:postgresql://localhost:5432/ows_demo_test
        DB_USERNAME: postgres
        DB_PASSWORD: postgres
        REDIS_HOST: localhost
        REDIS_PORT: 6379
    
    - name: Build backend
      working-directory: ./backend
      run: ./mvnw clean package -DskipTests
    
    # 코드 품질 검사
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    
    # 빌드 아티팩트 업로드
    - name: Upload backend artifact
      uses: actions/upload-artifact@v3
      with:
        name: backend-jar
        path: backend/target/*.jar
    
    - name: Upload frontend artifact
      uses: actions/upload-artifact@v3
      with:
        name: frontend-dist
        path: frontend/dist/

  # Docker 이미지 빌드 및 푸시
  build-and-push:
    needs: test-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        component: [frontend, backend]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: ${{ matrix.component }}-${{ matrix.component == 'backend' && 'jar' || 'dist' }}
        path: ${{ matrix.component }}/
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.component }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./${{ matrix.component }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # 배포 (스테이징)
  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
    
    - name: Deploy to staging
      run: |
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/secrets.yaml
        kubectl apply -f k8s/configmap.yaml
        kubectl apply -f k8s/storage.yaml
        kubectl apply -f k8s/deployments.yaml
        kubectl apply -f k8s/services.yaml
        kubectl apply -f k8s/ingress.yaml
        
        # 이미지 업데이트
        kubectl set image deployment/backend-deployment backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }} -n ows-demo
        kubectl set image deployment/frontend-deployment frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }} -n ows-demo
        
        # 롤아웃 대기
        kubectl rollout status deployment/backend-deployment -n ows-demo --timeout=300s
        kubectl rollout status deployment/frontend-deployment -n ows-demo --timeout=300s
    
    # E2E 테스트
    - name: Run E2E tests
      working-directory: ./frontend
      run: |
        npm run test:e2e
      env:
        BASE_URL: https://staging.ows-demo.com

  # 프로덕션 배포
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl (Production)
      run: |
        echo "${{ secrets.PROD_KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
    
    - name: Deploy to production
      run: |
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/secrets.yaml
        kubectl apply -f k8s/configmap.yaml
        kubectl apply -f k8s/storage.yaml
        kubectl apply -f k8s/deployments.yaml
        kubectl apply -f k8s/services.yaml
        kubectl apply -f k8s/ingress.yaml
        
        # Blue-Green 배포
        kubectl patch deployment backend-deployment -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","image":"${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}"}]}}}}' -n ows-demo
        kubectl patch deployment frontend-deployment -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","image":"${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}"}]}}}}' -n ows-demo
        
        # 롤아웃 상태 확인
        kubectl rollout status deployment/backend-deployment -n ows-demo --timeout=300s
        kubectl rollout status deployment/frontend-deployment -n ows-demo --timeout=300s
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### 4. 모니터링 설정

#### Prometheus 설정 (docker/prometheus/prometheus.yml)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # Spring Boot 애플리케이션
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']
    scrape_interval: 5s

  # Nginx 메트릭
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  # PostgreSQL 메트릭
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis 메트릭
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Node Exporter (시스템 메트릭)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Grafana 대시보드 프로비저닝
```yaml
# docker/grafana/provisioning/dashboards/dashboard.yml
apiVersion: 1

providers:
- name: 'default'
  orgId: 1
  folder: ''
  type: file
  disableDeletion: false
  updateIntervalSeconds: 10
  allowUiUpdates: true
  options:
    path: /etc/grafana/provisioning/dashboards
```

### 5. 배포 스크립트

#### deploy.sh
```bash
#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "🚀 $ENVIRONMENT 환경에 배포 시작 (버전: $VERSION)"

# 환경별 설정
case $ENVIRONMENT in
  "staging")
    NAMESPACE="ows-demo-staging"
    DOMAIN="staging.ows-demo.com"
    REPLICAS_BACKEND=2
    REPLICAS_FRONTEND=1
    ;;
  "production")
    NAMESPACE="ows-demo"
    DOMAIN="ows-demo.com"
    REPLICAS_BACKEND=3
    REPLICAS_FRONTEND=2
    ;;
  *)
    echo "❌ 지원하지 않는 환경: $ENVIRONMENT"
    exit 1
    ;;
esac

# 네임스페이스 생성
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Secrets 적용
echo "🔐 Secrets 적용..."
envsubst < k8s/secrets.yaml | kubectl apply -f - -n $NAMESPACE

# ConfigMap 적용
echo "⚙️ ConfigMap 적용..."
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE

# Storage 적용
echo "💾 Storage 적용..."
kubectl apply -f k8s/storage.yaml -n $NAMESPACE

# Services 적용
echo "🌐 Services 적용..."
kubectl apply -f k8s/services.yaml -n $NAMESPACE

# Deployments 적용
echo "🚢 Deployments 적용..."
envsubst < k8s/deployments.yaml | kubectl apply -f - -n $NAMESPACE

# 이미지 업데이트
echo "🔄 이미지 업데이트..."
kubectl set image deployment/backend-deployment backend=ghcr.io/ows/backend:$VERSION -n $NAMESPACE
kubectl set image deployment/frontend-deployment frontend=ghcr.io/ows/frontend:$VERSION -n $NAMESPACE

# 롤아웃 상태 확인
echo "⏳ 배포 상태 확인..."
kubectl rollout status deployment/backend-deployment -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/frontend-deployment -n $NAMESPACE --timeout=300s

# Ingress 적용
echo "🌍 Ingress 적용..."
envsubst < k8s/ingress.yaml | kubectl apply -f - -n $NAMESPACE

# 헬스체크
echo "🔍 헬스체크..."
sleep 30

BACKEND_URL="https://$DOMAIN/api/actuator/health"
FRONTEND_URL="https://$DOMAIN/health"

if curl -f -s $BACKEND_URL > /dev/null; then
    echo "✅ 백엔드 헬스체크 성공"
else
    echo "❌ 백엔드 헬스체크 실패"
    exit 1
fi

if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "✅ 프론트엔드 헬스체크 성공"
else
    echo "❌ 프론트엔드 헬스체크 실패"
    exit 1
fi

echo "🎉 $ENVIRONMENT 환경 배포 완료!"
echo "📊 대시보드: https://$DOMAIN"
echo "📚 API 문서: https://$DOMAIN/api/swagger-ui.html"
echo "📈 모니터링: https://grafana.$DOMAIN"
```

## 🎯 결론

### ✅ **완전한 인프라 자동화**
1. **Docker 컨테이너화** - 멀티스테이지 빌드, 헬스체크, 보안
2. **Kubernetes 오케스트레이션** - 고가용성, 자동 스케일링, 롤링 업데이트
3. **CI/CD 파이프라인** - 자동 테스트, 빌드, 배포
4. **모니터링 & 로깅** - Prometheus, Grafana, 알림
5. **보안 & 최적화** - SSL, Rate limiting, 캐싱

### 🚀 **AI가 이제 생성 가능한 것**
- **즉시 배포 가능한 인프라 설정**
- **프로덕션 준비 완료된 CI/CD**
- **완전 자동화된 배포 파이프라인**
- **모니터링 및 알림 시스템**

이제 AI가 **화면 이미지 → 완전한 프로덕션 시스템**을 생성할 수 있습니다! 🎉