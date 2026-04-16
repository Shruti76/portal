# Developer Portal - Complete Reference Guide

## 📋 Project Overview

The **Developer Portal** is an enterprise-grade package management and unit testing system designed for development teams. It enables developers to:

- 📦 **Upload & Version Packages** with semantic versioning (format: `myorg@package`)
- 🧪 **Execute Automated Unit Tests** for Java, Python, Node.js, .NET, and Go
- 🔐 **Control Access** with Role-Based Access Control (RBAC)
- 🔄 **Collaborate** with GitHub integration for automated code push
- 📊 **Track Metrics** with test history and download analytics

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                 │
│                  User-Friendly Web Interface                  │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTPS/TLS
┌──────────────▼───────────────────────────────────────────────┐
│               Node.js/Express Backend (Port 5001)             │
│        - Authentication & JWT Token Management               │
│        - Package Upload/Download/Versioning                  │
│        - Test Execution & Result Tracking                    │
│        - RBAC Permission Management                          │
└──────────────┬───────────────────────────────────────────────┘
               │ TCP/IP
┌──────────────▼───────────────────────────────────────────────┐
│               PostgreSQL Database (Port 5432)                 │
│        - Users & Roles (RBAC)                                │
│        - Packages & Versions                                 │
│        - Test Runs & Results                                 │
└──────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
developer-portal/
├── backend/                      # Node.js/Express backend
│   ├── src/
│   │   ├── server.js            # Main server entry point
│   │   ├── config/
│   │   │   └── database.js      # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication & RBAC
│   │   └── routes/
│   │       ├── auth.js          # Register, Login, User profile
│   │       ├── packages.js      # Upload, Download, Manage packages
│   │       ├── tests.js         # Execute tests, Get results
│   │       └── rbac.js          # Role management
│   ├── package.json
│   ├── .env.example             # Environment template
│   ├── Dockerfile
│   └── uploads/                 # Package storage
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── components/
│   │   │   ├── PackageUpload.jsx    # Upload packages
│   │   │   ├── PackageDownload.jsx  # Search & download
│   │   │   ├── TestExecution.jsx    # Run tests
│   │   │   └── RoleManagement.jsx   # Manage users & roles
│   │   └── pages/
│   │       ├── Login.jsx        # Login page
│   │       ├── Register.jsx     # Registration page
│   │       └── Dashboard.jsx    # Main dashboard
│   ├── package.json
│   ├── Dockerfile
│   └── public/
│       └── index.html
│
├── database/                     # Database setup
│   ├── schema.sql               # Table definitions
│   ├── migrate.js               # Migration runner
│   └── seed.sql                 # Sample data
│
├── docs/                         # Documentation
│   ├── API.md                   # REST API documentation
│   ├── DEPLOYMENT.md            # Deployment guides
│   └── GITHUB_INTEGRATION.md    # GitHub integration setup
│
├── docker-compose.yml           # Multi-container orchestration
├── README.md                    # Main documentation
├── CONTRIBUTING.md              # Contribution guidelines
├── setup.sh                     # Automated setup script
└── .gitignore
```

## 🚀 Quick Start

### 1️⃣ Automated Setup (Recommended)
```bash
cd /Users/shrutisohan/Desktop/shruti/portal
chmod +x setup.sh
./setup.sh
```

### 2️⃣ Manual Docker Setup
```bash
# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3️⃣ Access Portal
```
Frontend:  http://localhost:3000
Backend:   http://localhost:5001/api
Database:  localhost:5432
```

## 👥 User Roles & Permissions

### 👨‍💼 Admin
Full system access
- ✅ Manage users and roles
- ✅ Upload packages
- ✅ Download packages
- ✅ Execute tests
- ✅ Delete packages
- ✅ View all packages
- ✅ Manage organizations
- ✅ View test reports

### 🔧 Maintainer
Package management access
- ✅ Upload packages
- ✅ Download packages
- ✅ Execute tests
- ✅ Delete own packages
- ✅ View test reports

### 👨‍💻 Developer
Standard developer access
- ✅ Download packages
- ✅ Execute tests
- ✅ View test reports

### 👁️ Viewer
Read-only access
- ✅ Download packages
- ✅ View test reports

## 📦 Package Management

### Package Naming Convention
```
Format: organization@package-name
Example: myorg@backend-api
```

### Upload Workflow
1. User navigates to "Upload Package"
2. Selects package name (auto-prefixed with org)
3. Provides version (semantic versioning)
4. Selects package type
5. Uploads file (supports: tar.gz, zip, jar, whl, tgz)
6. System validates and stores

### Download Workflow
1. User searches for package
2. Filters by type if needed
3. Views package details
4. Downloads file
5. System increments download counter

## 🧪 Unit Test Execution

### Supported Package Types

#### Java
- Detection: `pom.xml` (Maven) or `build.gradle` (Gradle)
- Execution: `mvn test` or `./gradlew test`
- Output: Test reports with pass/fail status

#### Python
- Detection: `requirements.txt` or `setup.py`
- Execution: `pytest` or `unittest`
- Output: Test coverage and results

#### Node.js
- Detection: `package.json`
- Execution: `npm test`
- Output: Jest/Mocha test results

#### .NET
- Detection: `.csproj` or `.sln`
- Execution: `dotnet test`
- Output: NUnit/xUnit results

#### Go
- Detection: `go.mod`
- Execution: `go test ./...`
- Output: Go test results

### Test Execution Flow
1. User selects package
2. Clicks "Execute Tests"
3. System downloads package
4. Detects package type automatically
5. Runs appropriate test command
6. Captures output & errors
7. Updates status (running → passed/failed)
8. Stores results in database

### Test Result Tracking
- Status: running, passed, failed
- Output logs
- Error messages
- Execution time
- Historical data

## 🔐 Security Features

### Authentication
- JWT (JSON Web Tokens) based authentication
- Token expiration (default: 24 hours)
- Secure password hashing with bcryptjs
- Login/Register validation

### Authorization
- Role-Based Access Control (RBAC)
- Permission checking per endpoint
- Organization-level access control
- Package ownership validation

### Data Protection
- HTTPS/TLS encryption (production)
- Password hashing (bcrypt, 10 rounds)
- Environment variable protection
- SQL injection prevention (parameterized queries)

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  full_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Packages Table
```sql
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,  -- myorg@package format
  version VARCHAR(50) NOT NULL,  -- semantic versioning
  description TEXT,
  package_type VARCHAR(50) NOT NULL,  -- java, python, nodejs, dotnet, go
  file_path VARCHAR(512) NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  organization VARCHAR(255) NOT NULL,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);
```

### Test Runs Table
```sql
CREATE TABLE test_runs (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES packages(id),
  executed_by INTEGER REFERENCES users(id),
  status VARCHAR(50),  -- running, passed, failed
  output TEXT,
  error_output TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints Summary

### Auth Routes
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user profile

### Package Routes
- `POST /api/packages/upload` - Upload new package
- `GET /api/packages/download/:name/:version` - Download package
- `GET /api/packages/:name/:version` - Package details
- `GET /api/packages/org/:organization` - List org packages
- `GET /api/packages/search?q=query` - Search packages
- `DELETE /api/packages/:name/:version` - Delete package

### Test Routes
- `POST /api/tests/execute` - Start test execution
- `GET /api/tests/results/:testRunId` - Get test results
- `GET /api/tests/package/:packageId/history` - Test history

### RBAC Routes
- `GET /rbac/user/:userId` - Get user role
- `PUT /rbac/user/:userId/role` - Update user role
- `GET /rbac/organization/:org` - Org users
- `GET /rbac/roles` - Available roles
- `POST /rbac/check-permission` - Check permission

## 📊 Usage Statistics

### Tracking
- Downloads per package version
- Test execution count
- Success/failure rates
- Historical trends

### Reporting
- Download analytics
- Test success rates
- Popular packages
- User activity logs

## 🐳 Docker Deployment

### Single Command Start
```bash
docker-compose up -d
```

### Services
- `postgres`: Database (port 5432)
- `backend`: API server (port 5001)
- `frontend`: React app (port 3000)

### Commands
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose build

# Status
docker-compose ps
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main overview & quick start |
| `docs/API.md` | Complete API documentation |
| `docs/DEPLOYMENT.md` | Production deployment guides |
| `docs/GITHUB_INTEGRATION.md` | GitHub webhook setup |
| `CONTRIBUTING.md` | Development guidelines |
| `backend/.env.example` | Backend configuration template |

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=developer_portal
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=<secure_key>
JWT_EXPIRY=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 🚨 Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5001
lsof -i :5432

# Kill existing processes if needed
kill -9 <PID>

# Restart with clean state
docker-compose down -v
docker-compose up -d
```

### Database Issues
```bash
# Check database status
docker-compose logs postgres

# Connect to database
docker exec developer_portal_db psql -U postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Test Execution Fails
```bash
# Check available tools
docker exec developer_portal_backend node --version
docker exec developer_portal_backend python --version
docker exec developer_portal_backend java -version

# Install missing tools
docker-compose exec backend npm install
```

## 🎯 Common Use Cases

### Developer Scenario
1. Register account with organization
2. Search for packages
3. Download required package
4. Review and execute tests
5. View test results
6. Download tested package

### Maintainer Scenario
1. Package code and compress
2. Upload to portal with version
3. System stores with versioning
4. Monitor package downloads
5. Track test execution
6. Manage multiple versions

### Admin Scenario
1. Register users
2. Assign roles and permissions
3. Monitor system usage
4. Manage organizations
5. Review test results
6. Maintain security policies

## 🎓 Learning Resources

- View example code in `frontend/src/components/`
- Check API documentation in `docs/API.md`
- Review database schema in `database/schema.sql`
- See deployment guide in `docs/DEPLOYMENT.md`

## 📞 Support

- Issues: Check `README.md` troubleshooting section
- API Help: Refer to `docs/API.md` with examples
- Deployment: See `docs/DEPLOYMENT.md`
- Development: Check `CONTRIBUTING.md`

## ✅ Feature Checklist

### Core Features
- ✅ User authentication with JWT
- ✅ RBAC with 4 roles
- ✅ Package upload with versioning
- ✅ Package download tracking
- ✅ Automatic unit test detection
- ✅ Test execution for 5 languages
- ✅ Test result tracking
- ✅ Organization management
- ✅ User role management
- ✅ Package search & filtering

### Infrastructure
- ✅ Docker Compose setup
- ✅ PostgreSQL database
- ✅ Node.js/Express backend
- ✅ React frontend
- ✅ Environment configuration
- ✅ API documentation
- ✅ Deployment guides

### Future Enhancements
- ⏳ GitHub Actions CI/CD integration
- ⏳ Slack notifications
- ⏳ Email notifications
- ⏳ Code quality metrics
- ⏳ Performance benchmarking
- ⏳ Container registry support
- ⏳ Kubernetes templates
- ⏳ Advanced analytics dashboard

## 📄 License

This project uses open-source components with no licensing costs:
- PostgreSQL (PostgreSQL License)
- Node.js (MIT License)
- React (MIT License)
- Express.js (MIT License)

---

**Ready to start?** Run `./setup.sh` and visit `http://localhost:3000`!
