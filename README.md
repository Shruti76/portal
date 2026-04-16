# Developer Portal - Comprehensive Setup Guide

## Overview

The Developer Portal is a complete package management and unit testing system designed for development teams. It provides:

- **RBAC (Role-Based Access Control)**: Manage user permissions with 4 different roles
- **Package Versioning**: Version packages in the format `myorg@package`
- **Multi-Language Testing**: Automatic unit test execution for Java, Python, Node.js, .NET, and Go
- **GitHub Integration**: Push tested code directly to GitHub repositories
- **Open Source Stack**: PostgreSQL, Node.js, React with no licensing costs

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)       │
├─────────────────────────────────────────┤
│    Node.js/Express Backend (Port 5001)  │
├─────────────────────────────────────────┤
│    PostgreSQL Database (Port 5432)      │
└─────────────────────────────────────────┘
```

## Features

### 1. RBAC (Role-Based Access Control)

Four user roles with specific permissions:

#### Admin
- Manage users and roles
- Upload packages
- Download packages
- Execute tests
- Delete packages
- View all packages
- Manage organizations
- View test reports

#### Maintainer
- Upload packages
- Download packages
- Execute tests
- Delete own packages
- View test reports

#### Developer
- Download packages
- Execute tests
- View test reports

#### Viewer
- Download packages
- View test reports

### 2. Package Management

**Package Naming Convention**: `organization@package-name`

Example: `myorg@backend-api`

**Supported Formats**:
- `.tar.gz` - Tar archives
- `.zip` - ZIP archives
- `.jar` - Java archives
- `.whl` - Python wheels
- `.tgz` - Compressed tar

**Version Control**:
- Packages support semantic versioning (e.g., 1.0.0, 2.1.3)
- Prevents duplicate version uploads
- Tracks download counts
- Maintains upload history

### 3. Unit Test Execution

**Supported Package Types**:

#### Java
- Detects: `pom.xml` (Maven) or `build.gradle` (Gradle)
- Commands: `mvn test` or `./gradlew test`

#### Python
- Detects: `requirements.txt` or `setup.py`
- Commands: `pytest` or `unittest`

#### Node.js
- Detects: `package.json`
- Commands: `npm test`

#### .NET
- Detects: `.csproj` or `.sln` files
- Commands: `dotnet test`

#### Go
- Detects: `go.mod`
- Commands: `go test ./...`

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OR Node.js 18+ and PostgreSQL 15+

### Option 1: Docker (Recommended)

```bash
cd /Users/shrutisohan/Desktop/shruti/portal

docker-compose up -d
```

The portal will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Database: `localhost:5432`

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run database migration
npm run migrate

# Start server
npm run dev  # Development with nodemon
npm start    # Production
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

#### Database Setup
```bash
# PostgreSQL must be running on localhost:5432
psql -U postgres -d developer_portal -f database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Packages
- `POST /api/packages/upload` - Upload package (multipart/form-data)
- `GET /api/packages/download/:packageName/:version` - Download package
- `GET /api/packages/:packageName/:version` - Get package details
- `GET /api/packages/org/:organization` - List org packages
- `GET /api/packages/search?q=query&type=type` - Search packages
- `DELETE /api/packages/:packageName/:version` - Delete package version

### Tests
- `POST /api/tests/execute` - Execute unit tests (async)
- `GET /api/tests/results/:testRunId` - Get test results
- `GET /api/tests/package/:packageId/history` - Get test history

### RBAC
- `GET /rbac/user/:userId` - Get user role and permissions
- `PUT /rbac/user/:userId/role` - Update user role
- `GET /rbac/organization/:organization` - Get org users
- `POST /rbac/check-permission` - Check user permission
- `GET /rbac/roles` - Get all available roles

## Database Schema

### Users Table
```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR UNIQUE
- password: VARCHAR (hashed)
- full_name: VARCHAR
- organization: VARCHAR
- role: VARCHAR (admin, maintainer, developer, viewer)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Packages Table
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR (myorg@package format)
- version: VARCHAR (semantic versioning)
- description: TEXT
- package_type: VARCHAR (java, python, nodejs, dotnet, go)
- file_path: VARCHAR
- uploaded_by: INTEGER (FK to users)
- organization: VARCHAR
- downloads: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Test Runs Table
```sql
- id: SERIAL PRIMARY KEY
- package_id: INTEGER (FK to packages)
- executed_by: INTEGER (FK to users)
- status: VARCHAR (running, passed, failed)
- output: TEXT
- error_output: TEXT
- started_at: TIMESTAMP
- finished_at: TIMESTAMP
- created_at: TIMESTAMP
```

## Usage Workflows

### Developer Workflow

1. **Register/Login**
   - Go to http://localhost:3000
   - Register with your organization name (e.g., "myorg")
   - Login with credentials

2. **Download Package**
   - Go to "Download Packages"
   - Search for packages (e.g., "myorg@api")
   - Click "Download"

3. **Execute Tests**
   - Package is automatically extracted
   - Go to "Execute Tests"
   - Click "Execute Tests" button
   - Monitor test execution
   - View results and history

### Maintainer Workflow

1. **Upload Package**
   - Go to "Upload Package"
   - Package name automatically prefixed with org (myorg@name)
   - Select version and package type
   - Upload compressed file
   - System validates and stores

2. **Manage Versions**
   - Multiple versions of same package supported
   - Each version independently managed
   - Download counts tracked per version

3. **Monitor Tests**
   - View test execution history
   - Track success/failure rates
   - Export test reports

### Admin Workflow

1. **Manage Users**
   - Go to "Role Management"
   - Search organization
   - Change user roles
   - Remove unnecessary permissions

2. **Organize Teams**
   - Group users by organization
   - Assign roles based on responsibility
   - Monitor access logs

## Environment Variables

### Backend (.env)
```
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=developer_portal
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=24h

# GitHub (Optional)
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### Frontend
Set `REACT_APP_API_URL` environment variable:
```
REACT_APP_API_URL=http://localhost:5001/api
```

## Testing

### Manual Testing
1. Create test users with different roles
2. Upload test packages for each supported type
3. Execute tests and verify results
4. Verify RBAC restrictions

### Automated Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Checklist
- [ ] Change JWT_SECRET to strong value
- [ ] Update database password
- [ ] Configure GitHub tokens if needed
- [ ] Setup SSL/TLS certificates
- [ ] Configure proper CORS settings
- [ ] Setup backup strategy for PostgreSQL
- [ ] Configure log aggregation
- [ ] Setup monitoring and alerts

### Docker Deployment
```bash
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## GitHub Integration (Future Enhancement)

The system supports GitHub webhook integration:

1. **Automatic Pushes**
   - After successful test execution
   - Push to specified GitHub repository
   - Create pull requests with test results

2. **Webhook Configuration**
   - Setup GitHub webhook pointing to `/api/webhooks/github`
   - Automatic branch detection
   - Test result comments on PRs

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -d developer_portal

# Check backend logs
docker-compose logs backend

# Verify environment variables
cat backend/.env
```

### Upload/Download Issues
```bash
# Verify uploads directory exists
ls -la ./uploads

# Check file permissions
chmod 755 ./uploads

# Verify disk space
df -h
```

### Test Execution Issues
```bash
# Check test runner logs
docker-compose logs backend | grep "test"

# Verify required tools installed
docker exec developer_portal_backend npm list

# For Python tests
docker exec developer_portal_backend python --version

# For Java tests
docker exec developer_portal_backend java -version
```

## Performance Tips

1. **Database Optimization**
   - Indexes on frequently searched columns (package name, organization)
   - Regular VACUUM and ANALYZE
   - Connection pooling enabled

2. **File Storage**
   - Use high-speed storage for uploads
   - Implement cleanup for old test logs
   - Monitor disk usage

3. **Scalability**
   - Use load balancer for multiple backend instances
   - Implement caching for package lists
   - Use message queue for async test execution (RabbitMQ/Redis)

## Support & Documentation

- Backend API docs: `http://localhost:5001/api/health`
- Database schema: `/database/schema.sql`
- Environment setup: `/backend/.env.example`
- Frontend components: `/frontend/src/components/`

## License

This project uses open-source components:
- PostgreSQL - PostgreSQL License
- Node.js - MIT License
- React - MIT License
- Express - MIT License

No commercial licenses required.

## Future Enhancements

- [ ] GitHub Actions integration
- [ ] Slack notifications for test results
- [ ] Package dependency analysis
- [ ] Code quality metrics
- [ ] Performance benchmarking
- [ ] Multi-language CI/CD pipelines
- [ ] Package registry API (NPM-like)
- [ ] Container image support (Docker)
- [ ] Kubernetes deployment templates
- [ ] Advanced analytics dashboard
# portal
# portal
