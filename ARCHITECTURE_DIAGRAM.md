# Developer Portal - Quick Architecture Reference

## 🏗️ System Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE SYSTEM DIAGRAM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          END USER / BROWSER                                │
│                                                                             │
│                    ┌──────────────────────────────┐                        │
│                    │   Workstation / Laptop       │                        │
│                    │                              │                        │
│                    │   http://localhost:3000      │                        │
│                    │   (or company domain)        │                        │
│                    └────────────┬─────────────────┘                        │
│                                 │                                          │
│                    HTTPS / REST API (JSON)                                 │
│                                 │                                          │
│        ┌────────────────────────┴──────────────────────────┐              │
│        │                                                   │              │
│        ▼                                                   ▼              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  React App       │  │  Static Assets   │  │  Font/CSS/Icons  │       │
│  │  (Frontend)      │  │  (Public files)  │  │                  │       │
│  │  Port: 3000      │  │                  │  │                  │       │
│  │                  │  │                  │  │                  │       │
│  │ • Dashboard      │  │ • index.html     │  │ • Lucide Icons   │       │
│  │ • Package UI     │  │ • Favicon        │  │ • Tailwind CSS   │       │
│  │ • IDE Editor     │  │ • Manifest       │  │                  │       │
│  │ • Settings       │  │                  │  │                  │       │
│  │                  │  │                  │  │                  │       │
│  └────────┬─────────┘  └──────────────────┘  └──────────────────┘       │
│           │                                                               │
│           │ XHR/Fetch + JWT Bearer Token                                │
│           │ Authorization: Bearer eyJhbGc...                             │
│           │                                                               │
│           ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │            EXPRESS.JS API BACKEND (Node.js)                │        │
│  │            Port: 5001                                       │        │
│  │                                                             │        │
│  │  ┌──────────────────────────────────────────────────────┐ │        │
│  │  │ Middleware Layer                                     │ │        │
│  │  │ • CORS Handler                                       │ │        │
│  │  │ • JWT Verification                                   │ │        │
│  │  │ • Request Validation                                 │ │        │
│  │  │ • Error Handling                                     │ │        │
│  │  └──────────────────────────────────────────────────────┘ │        │
│  │                                                             │        │
│  │  ┌──────────────────────────────────────────────────────┐ │        │
│  │  │ API Route Handlers                                   │ │        │
│  │  │                                                      │ │        │
│  │  │ POST   /api/auth/login        [Dual Auth]          │ │        │
│  │  │ POST   /api/auth/register     [Local Only]         │ │        │
│  │  │ GET    /api/auth/profile      [JWT Protected]      │ │        │
│  │  │                                                      │ │        │
│  │  │ POST   /api/packages/upload            [Enhanced]  │ │        │
│  │  │ GET    /api/packages/download/:v      [Enhanced]   │ │        │
│  │  │ GET    /api/packages/versions/:name   [New]        │ │        │
│  │  │ POST   /api/packages/check-compatibility [New]    │ │        │
│  │  │ GET    /api/packages/search?q=...                  │ │        │
│  │  │ GET    /api/packages/org/:org         [Paginated]  │ │        │
│  │  │ DELETE /api/packages/:name/:version   [Owner only] │ │        │
│  │  │                                                      │ │        │
│  │  │ POST   /api/editor/projects           [CRUD]       │ │        │
│  │  │ GET    /api/editor/projects/:id                    │ │        │
│  │  │ POST   /api/editor/save                            │ │        │
│  │  │ GET    /api/editor/versions/:id                    │ │        │
│  │  │                                                      │ │        │
│  │  │ POST   /api/workflows/execute                      │ │        │
│  │  │ GET    /api/workflows/logs                         │ │        │
│  │  │                                                      │ │        │
│  │  │ POST   /api/tests/execute                          │ │        │
│  │  │ GET    /api/tests/results                          │ │        │
│  │  │                                                      │ │        │
│  │  │ GET    /api/rbac/roles                [Admin]      │ │        │
│  │  │ POST   /api/rbac/assign-role                       │ │        │
│  │  │                                                      │ │        │
│  │  └──────────────────────────────────────────────────────┘ │        │
│  │                                                             │        │
│  │  ┌──────────────────────────────────────────────────────┐ │        │
│  │  │ External Integrations                               │ │        │
│  │  │ • LDAP/Active Directory (auth)                      │ │        │
│  │  │ • GitHub API (workflows)                            │ │        │
│  │  │ • File Upload (multer)                              │ │        │
│  │  └──────────────────────────────────────────────────────┘ │        │
│  └──────────┬──────────────────────────┬─────────────────────┘        │
│             │                          │                              │
│             │ (SQL/JDBC)               │ (File I/O)                   │
│             │                          │                              │
│        ┌────▼──────────────┐     ┌────▼─────────────────────┐        │
│        │  PostgreSQL DB    │     │ Docker Volume Storage    │        │
│        │  (Port 5432)      │     │ /uploads                │        │
│        │                   │     │                         │        │
│        │ ┌───────────────┐ │     │ ┌─────────────────────┐ │        │
│        │ │ users         │ │     │ │ Package Files:      │ │        │
│        │ │ packages ★    │ │     │ │ • numpy-1.24.0.whl  │ │        │
│        │ │ code_projects │ │     │ │ • pandas-2.0.0.tar  │ │        │
│        │ │ code_versions │ │     │ │ • requests-2.31.tgz │ │        │
│        │ │ workflows     │ │     │ │ • [uuid]-flask.jar  │ │        │
│        │ │ test_runs     │ │     │ │                     │ │        │
│        │ │               │ │     │ │ (100MB max each)    │ │        │
│        │ │ JSONB:        │ │     │ │                     │ │        │
│        │ │ dependencies  │ │     │ │ Total size limits:  │ │        │
│        │ │ ^1.24.0, etc  │ │     │ │ • Per container: 50GB│ │       │
│        │ │               │ │     │ │ • Per deployment: ∞  │ │       │
│        │ └───────────────┘ │     │ └─────────────────────┘ │        │
│        │                   │     │                         │        │
│        │ Indexes:          │     │ Backup Strategy:        │        │
│        │ • name            │     │ • Daily snapshots (TBD) │        │
│        │ • organization    │     │ • 30-day retention      │        │
│        │ • version         │     │ • S3/GCS (future)       │        │
│        │ • created_at      │     │                         │        │
│        └───────────────────┘     └─────────────────────────┘        │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Network Configuration & Port Mapping                          │ │
│  │                                                                │ │
│  │ Development (Docker):                                          │ │
│  │  • Frontend: localhost:3000 → container:3000 (React)          │ │
│  │  • Backend: localhost:5001 → container:5001 (Express)         │ │
│  │  • Database: localhost:5433 → container:5432 (PostgreSQL)     │ │
│  │                                                                │ │
│  │ Production Recommended:                                        │ │
│  │  • Load Balancer (port 80/443) → Backend instances            │ │
│  │  • Backend: Internal port 5001 (not exposed)                  │ │
│  │  • Database: Private network, no external access              │ │
│  │  • Frontend: CDN with SSL/TLS termination                     │ │
│  │  • API Gateway: Request rate limiting, throttling              │ │
│  │                                                                │ │
│  │ Networking Details:                                            │ │
│  │  • Docker Bridge Network: 172.20.0.0/16                       │ │
│  │  • Service Discovery: DNS (container names)                   │ │
│  │  • Frontend-Backend: HTTPS only (production)                  │ │
│  │  • Backend-Database: Private TCP (127.0.0.1:5432)             │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

## 🔐 Authentication Flow (Detailed)

```
AUTHENTICATION DECISION TREE:

START: POST /api/auth/login {email, password}
│
├─ Is LDAP_URL configured?
│  ├─ YES → Attempt AD authentication
│  │   ├─ Connect to LDAP server
│  │   ├─ Bind with service account
│  │   ├─ Search for user
│  │   ├─ Verify password
│  │   ├─ SUCCESS? → Extract AD groups → Create JWT → Return token
│  │   └─ FAILURE? → Fall through to local auth
│  │
│  └─ NO → Use local database auth
│
└─ Local Auth (database):
   ├─ Query: SELECT password_hash FROM users WHERE email = ?
   ├─ Hash provided password (bcryptjs)
   ├─ Compare hashes (constant-time comparison)
   ├─ SUCCESS? → Create JWT token → Return 200 OK
   └─ FAILURE? → Return 401 Unauthorized

JWT Token Structure:
┌─────────────────────────────────────────────────────┐
│ Header:                                             │
│ {                                                   │
│   "alg": "HS256",                                   │
│   "typ": "JWT"                                      │
│ }                                                   │
│                                                     │
│ Payload:                                            │
│ {                                                   │
│   "sub": 5,                    // user_id           │
│   "email": "john@company.com", // user email        │
│   "full_name": "John Doe",     // display name      │
│   "organization": "acme",      // org scope         │
│   "role": "developer",         // RBAC level        │
│   "iat": 1618000000,           // issued at         │
│   "exp": 1618086400            // exp (24 hours)    │
│ }                                                   │
│                                                     │
│ Signature:                                          │
│ HMACSHA256(                                         │
│   base64(header) + "." + base64(payload),           │
│   "your-secret-key"                                 │
│ )                                                   │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Package Management Flow

```
UPLOAD FLOW:
────────────
1. Client selects file + fills form
   ├─ Package Name: org@package (validated format)
   ├─ Version: 1.24.0 (semantic version)
   ├─ Description: Free text
   ├─ Type: python|nodejs|java|dotnet|go
   ├─ Dependencies: JSON array [{name, version}, ...]
   └─ File: tar.gz|zip|whl|jar|tgz (max 100MB)

2. Backend receives multipart/form-data
   ├─ Validate JWT token
   ├─ Check auth scope (user.org == package.org)
   ├─ Validate inputs (regex, size limits)
   ├─ Generate UUID for file: {uuid}-{original-name}
   ├─ Save file to /uploads/{uuid}-{name}
   ├─ Insert record into packages table with dependencies
   ├─ Index added to database for fast lookups
   └─ Return 201 Created with metadata

3. File stored persistently
   └─ Docker volume mount: ./uploads:/uploads


DOWNLOAD FLOW:
──────────────
1. Client searches & selects package version
   ├─ View dependencies (displayed in UI)
   ├─ Check compatibility (optional)
   └─ Click Download

2. Backend processes GET /api/packages/download/:name/:version
   ├─ Verify JWT token
   ├─ Lookup package in database (by name + version)
   ├─ Optional: Validate user's installed versions (?require.x=1.0)
   ├─ Check dependency constraints (^, ~, >=, exact)
   ├─ If conflict detected → Return 409 Conflict
   ├─ Increment download counter in DB
   ├─ Read file from /uploads/{uuid}-{name}
   ├─ Stream file to client with appropriate Content-Type
   └─ Return file (gzip if JSON/text)

3. Client receives file
   └─ Browser saves as: {org}@{name}-{version}.{ext}


VERSION CONSTRAINT ENGINE:
──────────────────────────
When checking compatibility (POST /api/packages/check-compatibility):

Input: {packageName, version, dependencies}
       dependencies = {numpy: "1.24.0", pandas: "2.0.0"}

For each dependency in package.dependencies:
  ├─ dep.name = "numpy", dep.version = "^1.20.0"
  ├─ user_version = "1.24.0"
  │
  └─ Apply constraint matching:
     ├─ If "^1.20.0": major must match (1 == 1), minor/patch can be >= (20 ≤ 24) ✓
     ├─ If "~2.0.0": major.minor must match (2.0 == 2.0), patch can be >= ✓
     ├─ If ">=2.5.1": must be >= 2.5.1 ✓
     └─ If "2.0.0": must equal exactly ✗ (2.0.0 ≠ 2.0.0)

Output: {
  compatible: true/false,
  conflicts: [{name, required, provided, compatible: false}],
  satisfiedDependencies: [{name, required, provided, compatible: true}]
}
```

---

## 🛠️ Technology Layer Breakdown

### Frontend Stack
```
┌─────────────────────────────┐
│ React 18 + Hooks            │ Component framework
├─────────────────────────────┤
│ React Router v6             │ Client-side routing
├─────────────────────────────┤
│ Axios + Interceptors        │ HTTP client with auto JWT
├─────────────────────────────┤
│ Context API                 │ Global state (auth, user)
├─────────────────────────────┤
│ Lucide React Icons          │ 200+ SVG icons
├─────────────────────────────┤
│ CSS Modules + Tailwind      │ Styling utilities
├─────────────────────────────┤
│ localStorage API            │ Persistent token storage
├─────────────────────────────┤
│ Webpack (via CRA)           │ Module bundler
├─────────────────────────────┤
│ Babel 7                     │ JavaScript transpiler
└─────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────┐
│ Node.js 20+                 │ Runtime environment
├─────────────────────────────┤
│ Express.js 4.x              │ HTTP framework & routing
├─────────────────────────────┤
│ JWT (jsonwebtoken)          │ Token generation/verification
├─────────────────────────────┤
│ bcryptjs                    │ Password hashing
├─────────────────────────────┤
│ PostgreSQL (pg client)      │ Database driver
├─────────────────────────────┤
│ ldapjs                      │ LDAP/AD client
├─────────────────────────────┤
│ Axios                       │ GitHub API calls
├─────────────────────────────┤
│ Multer                      │ File upload handling
├─────────────────────────────┤
│ express-validator           │ Input validation
├─────────────────────────────┤
│ uuid                        │ Unique ID generation
├─────────────────────────────┤
│ dotenv                      │ Environment variables
└─────────────────────────────┘
```

### Database Stack
```
┌─────────────────────────────┐
│ PostgreSQL 15+              │ DBMS
├─────────────────────────────┤
│ Data Types:                 │
│ • SERIAL (auto-increment)   │
│ • UUID (globally unique)    │
│ • VARCHAR (bounded string)  │
│ • TEXT (unlimited)          │
│ • JSONB (JSON documents)    │ ★ For dependencies
│ • TIMESTAMP (date/time)     │
│ • FOREIGN KEY (referential) │
├─────────────────────────────┤
│ Connection Pooling          │ Reuse connections
├─────────────────────────────┤
│ Indexes (for performance)   │
│ • name, organization        │
│ • version, created_at       │
├─────────────────────────────┤
│ Docker Volume Persistence   │ Data survives container restart
├─────────────────────────────┤
│ Automated Migrations        │ migrate.js script
└─────────────────────────────┘
```

---

## 🚀 Deployment Topology

### Development (Current)
```
Your Laptop:
├─ localhost:3000 (React frontend)
├─ localhost:5001 (Express backend)
└─ localhost:5433 (PostgreSQL)

Running via: docker-compose up -d
Container Network: bridge (172.20.0.0/16)
```

### Production (Recommended)
```
┌──────────────────────────────────────────────────────────┐
│ Internet / Users                                         │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
        ┌───────────────────┐
        │ CDN (CloudFront)  │ (Static files + SSL/TLS)
        │ 80, 443           │
        └──────────┬────────┘
                   │
                   ▼
        ┌───────────────────────────────┐
        │ Load Balancer (ALB/NLB)       │
        │ Port 80 → 443 (redirect)      │
        │ Port 443 (SSL/TLS terminate)  │
        └──────────┬────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌─────────────────────────────────┐
    │ Kubernetes Cluster (EKS/GKE)    │
    │                                 │
    │ ┌───────────────┐               │
    │ │ Frontend Pod  │ (x3, replicas)│
    │ │ :3000         │               │
    │ └───────────────┘               │
    │                                 │
    │ ┌───────────────┐               │
    │ │ Backend Pod   │ (x5, replicas)│
    │ │ :5001         │               │
    │ │ HPA enabled   │               │
    │ └───────────────┘               │
    │                                 │
    └─────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌──────────────┐    ┌──────────────┐
    │ RDS Instance │    │ S3 Bucket    │
    │ (Postgres    │    │ (file store) │
    │  read-replica)    │              │
    └──────────────┘    └──────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Backup (S3 + Glacier)│
        │ (daily, 30-day ret.) │
        └──────────────────────┘
```

---

## 📋 Key Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APP_NAME=Developer Portal
REACT_APP_VERSION=1.0.0
```

### Backend (.env)
```
# Database
DB_HOST=developer_portal_db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=developer_portal

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# LDAP/AD Configuration (optional)
LDAP_URL=ldap://your-ad-server:389
LDAP_BIND_DN=CN=service_account,OU=Service Accounts,DC=company,DC=com
LDAP_BIND_PASSWORD=service_account_password
LDAP_BASE_DN=DC=company,DC=com

# GitHub Integration (optional)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-repo

# Server
PORT=5001
NODE_ENV=production
LOG_LEVEL=info
```

---

## ⚡ Performance Characteristics

```
Latency Targets (p95):
  GET /api/packages/search     < 100ms
  POST /api/packages/upload    < 500ms (+ file transfer)
  GET /api/packages/download   < 200ms (+ file transfer)
  POST /api/auth/login         < 300ms (AD) / 50ms (local)
  GET /api/editor/projects     < 100ms

Throughput:
  Max concurrent connections:   100+ (single instance)
  Max requests/sec (single):    1000+
  File upload bandwidth:        Limited by network

Database:
  Query latency (p95):          < 50ms
  Connection pool size:         20
  Idle timeout:                 30 seconds

Frontend:
  Initial load time:            < 3 seconds
  Interactive time:             < 4 seconds (target)
  Bundle size:                  ~250KB (gzipped)
```

---

## 🔄 Request/Response Examples

### 1. Login Request
```
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "secure_password"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "email": "john@company.com",
    "full_name": "John Doe",
    "organization": "acme",
    "role": "developer"
  }
}
```

### 2. Upload Package Request
```
POST /api/packages/upload HTTP/1.1
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Form Data:
  packageName: acme@numpy
  version: 1.24.0
  packageType: python
  description: NumPy scientific computing library
  file: [binary file]
  dependencies: [{"name": "python-dateutil", "version": "^2.8.0"}]

Response (201 Created):
{
  "message": "Package uploaded successfully",
  "package": {
    "id": 42,
    "name": "acme@numpy",
    "version": "1.24.0",
    "package_type": "python",
    "dependencies": [{...}],
    "downloads": 0,
    "created_at": "2026-04-14T10:30:00Z"
  }
}
```

### 3. Download Package Request
```
GET /api/packages/download/acme@numpy/1.24.0 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200 OK):
[Binary file content]
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="acme@numpy-1.24.0.tar.gz"
Content-Length: 45678900
```

### 4. Check Compatibility Request
```
POST /api/packages/check-compatibility HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "packageName": "acme@pandas",
  "version": "2.0.0",
  "dependencies": {
    "numpy": "1.24.0",
    "python-dateutil": "2.8.2"
  }
}

Response (200 OK):
{
  "compatible": true,
  "conflicts": [],
  "satisfiedDependencies": [
    {
      "name": "numpy",
      "required": "^1.20.0",
      "provided": "1.24.0",
      "compatible": true
    }
  ]
}
```

---

## 📊 Metrics & Monitoring

### Key Metrics to Track
```
Availability:
  • Uptime percentage
  • Error rate (errors / total requests)
  • API health checks

Performance:
  • API response times (p50, p95, p99)
  • Package upload/download speed
  • Database query times
  • Frontend load time

Usage:
  • Daily active users
  • Package upload/download volume
  • Most used features
  • Storage utilization

Security:
  • Failed login attempts
  • Unauthorized access attempts
  • Authentication success rate
  • Token refresh rate
```

---

**Document Version:** 1.0  
**Created:** April 14, 2026  
**For:** VP & Leadership Review
