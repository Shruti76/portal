# Deployment Guide

## Production Deployment

This guide covers deploying the Developer Portal to production.

## Pre-Deployment Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Update database credentials
- [ ] Configure CORS for your domain
- [ ] Setup SSL/TLS certificates
- [ ] Configure email for notifications (optional)
- [ ] Setup backup strategy
- [ ] Configure monitoring and logging
- [ ] Plan scalability strategy

## Environment Configuration

### Security Variables
```env
# Generate secure secret
openssl rand -base64 32

# Update in backend/.env
JWT_SECRET=<generated_32_char_secret>
JWT_EXPIRY=24h

# Update database password
DB_PASSWORD=<secure_postgres_password>
```

## Deployment Options

### Option 1: Docker Compose (Single Server)

```bash
# Clone/download project
cd /path/to/portal

# Create environment file
cp backend/.env.example backend/.env

# Update sensitive values
nano backend/.env

# Build and start
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f
```

### Option 2: Kubernetes (Multi-Server Scalable)

Create `k8s/postgres.yaml`:
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/postgres
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  ports:
    - port: 5432
  selector:
    app: postgres
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
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
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: POSTGRES_DB
          value: developer_portal
```

Create `k8s/backend.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
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
        image: developer-portal-backend:latest
        ports:
        - containerPort: 5001
        env:
        - name: DB_HOST
          value: postgres
        - name: NODE_ENV
          value: production
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: LoadBalancer
  ports:
    - port: 5001
      targetPort: 5001
  selector:
    app: backend
```

Deploy:
```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
```

### Option 3: Cloud Platforms

#### AWS Deployment
```bash
# Using Elastic Beanstalk
eb init -p docker developer-portal
eb create production
eb deploy
```

#### Google Cloud
```bash
# Using Cloud Run
gcloud run deploy developer-portal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure
```bash
# Using App Service
az group create --name portal-rg --location eastus
az appservice plan create --name portal-plan --resource-group portal-rg --sku B2
az webapp create --resource-group portal-rg --plan portal-plan --name my-portal
```

## Database Backup Strategy

### Automated PostgreSQL Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
DB_NAME="developer_portal"
DB_USER="postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

# Full backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to crontab:
```
0 2 * * * /usr/local/bin/backup.sh
```

Docker backup:
```bash
docker exec developer_portal_db pg_dump -U postgres developer_portal | gzip > backup_$(date +%Y%m%d).sql.gz
```

## Monitoring & Logging

### Docker Logs
```bash
# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres

# View specific time range
docker-compose logs --since 1h backend
```

### Application Monitoring

Add PM2 for process management:
```bash
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "portal-backend"
pm2 save
pm2 startup
```

### Database Monitoring

```bash
# Connect to database
psql -h localhost -U postgres -d developer_portal

# Check connections
SELECT * FROM pg_stat_activity;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Connection Pooling**
```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

3. **Caching**
```bash
npm install redis
```

### Database Optimization

1. **Index Creation**
```sql
CREATE INDEX idx_packages_search ON packages(name, organization, created_at DESC);
CREATE INDEX idx_test_runs_status ON test_runs(status, created_at DESC);
```

2. **Vacuum & Analyze**
```sql
VACUUM ANALYZE;
```

3. **Connection Pooling (PgBouncer)**
```bash
docker run -d -p 6432:6432 pgbouncer
```

## SSL/TLS Configuration

### Self-Signed Certificate
```bash
# Generate certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/portal-key.pem \
  -out /etc/ssl/certs/portal-cert.pem
```

### Let's Encrypt with Nginx
```bash
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly \
  --standalone \
  --email your-email@example.com \
  -d your-domain.com
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/portal-cert.pem;
    ssl_certificate_key /etc/ssl/private/portal-key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker images
        run: docker-compose build
      
      - name: Push to registry
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker push your-registry/portal-backend:latest
          docker push your-registry/portal-frontend:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /home/portal
            docker-compose pull
            docker-compose up -d
```

## Health Checks

```bash
# Backend health check
curl http://localhost:5001/health

# Frontend health check
curl http://localhost:3000

# Database health check
docker exec developer_portal_db pg_isready -U postgres
```

## Rollback Strategy

```bash
# Keep previous version
docker-compose build --no-cache
docker-compose up -d

# If issues, rollback
git checkout previous-version
docker-compose build
docker-compose up -d
```

## Support & Monitoring

### Uptime Monitoring
- Use services like Uptime Robot, StatusPage
- Monitor HTTP endpoints
- Alert on failures

### Log Aggregation
```bash
# Using ELK Stack
docker-compose up elasticsearch kibana logstash
```

### Error Tracking
```bash
npm install sentry
// In backend
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and delete old logs
- [ ] Monitor disk usage
- [ ] Test backup restoration
- [ ] Review security patches
- [ ] Optimize database (VACUUM)
- [ ] Update SSL certificates (30 days before expiry)

## Troubleshooting

### High Memory Usage
```bash
# Check process memory
docker stats developer_portal_backend

# Restart service
docker-compose restart backend
```

### Database Connectivity Issues
```bash
# Test connection
docker exec developer_portal_db psql -U postgres -d developer_portal -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

### Slow Queries
```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```
