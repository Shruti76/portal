# Active Directory Authentication & Code Editor Framework Guide

## Overview

Your Developer Portal now includes:
1. **Active Directory (LDAP) Authentication** - Secure authentication against your company's AD
2. **Code Editor Framework** - Full-featured code editor with version control
3. **GitHub Actions Integration** - Trigger workflows and view logs directly from the portal

## Part 1: Active Directory Authentication

### Configuration

Update your `backend/.env` file with your AD server details:

```env
# Active Directory / LDAP Configuration
LDAP_URL=ldap://your-ad-server:389
LDAP_BIND_DN=CN=service-account,CN=Users,DC=yourcompany,DC=com
LDAP_BIND_PASSWORD=your-service-account-password
LDAP_BASE_DN=DC=yourcompany,DC=com
LDAP_USER_SEARCH_FILTER=(sAMAccountName={{username}})
LDAP_GROUP_SEARCH_FILTER=(member={{dn}})
```

### How AD Authentication Works

1. **User Login**: User enters their AD username and password
2. **AD Verification**: System authenticates against your Active Directory server
3. **Group Extraction**: User's AD group membership is retrieved
4. **Role Mapping**: Groups are mapped to portal roles:
   - Groups containing "Admin" → Admin role
   - Groups containing "Maintainer" → Maintainer role
   - Default → Developer role
5. **Database Sync**: User is created/updated in the local database with AD info
6. **JWT Token**: User receives a JWT token for subsequent API calls

### Key Files

- `backend/src/config/ldap.js` - LDAP client and authentication logic
- `backend/src/routes/auth.js` - Updated authentication routes
- `frontend/src/pages/Login.jsx` - Updated login UI for AD

### API Endpoint

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",    # AD username (sAMAccountName)
  "password": "password123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "john.doe@company.com",
    "fullName": "John Doe",
    "role": "developer",
    "organization": "Development"
  },
  "token": "eyJhbGc..."
}
```

---

## Part 2: Code Editor Framework

### Features

- **Create Projects**: Create code projects in multiple languages
- **Edit Code**: Write and edit code with a simple textarea editor
- **Version Control**: Save versions/snapshots of your code with commit messages
- **Version History**: View and restore previous versions
- **Language Support**: JavaScript, TypeScript, Python, Java, Go, Rust, C#, SQL

### Usage

#### Create a Project

```javascript
POST /api/editor/projects
{
  "name": "My API Service",
  "language": "nodejs",
  "description": "REST API with Express"
}
```

#### Save Project Code

```javascript
PUT /api/editor/projects/{projectId}
{
  "code": "const express = require('express');\n...",
  "name": "My API Service"
}
```

#### Create Version Snapshot

```javascript
POST /api/editor/projects/{projectId}/versions
{
  "message": "Fixed authentication bug"
}
```

#### Restore Previous Version

```javascript
POST /api/editor/projects/{projectId}/versions/{versionId}/restore
```

### Component Usage

```jsx
import CodeEditor from './components/CodeEditor';

function App() {
  return <CodeEditor />;
}
```

### Database Tables

**code_projects**
```sql
- id (UUID)
- name (String)
- language (enum: javascript, typescript, python, java, go, rust, csharp, sql)
- description (Text)
- code (Text)
- created_by (User ID)
- organization (String)
- created_at, updated_at (Timestamp)
```

**code_versions**
```sql
- id (UUID)
- project_id (UUID) - Foreign key to code_projects
- code (Text)
- message (String)
- created_by (User ID)
- created_at (Timestamp)
```

---

## Part 3: GitHub Actions Integration

### Configuration

Update your `backend/.env` with GitHub credentials:

```env
# GitHub Configuration for Actions
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-repo
GITHUB_REPO_BRANCH=main
```

### How It Works

1. **Trigger Workflow**: User selects a workflow and triggers it from the portal
2. **GitHub Actions**: Workflow starts running on GitHub
3. **Log Monitoring**: Portal fetches and displays logs in real-time
4. **View Status**: See job status, completion state, and full output logs

### API Endpoints

#### Get Available Workflows

```bash
GET /api/workflows/workflows

Response:
[
  {
    "id": 1,
    "name": "Test Suite",
    "path": ".github/workflows/test.yml",
    "state": "active"
  }
]
```

#### Trigger Workflow

```bash
POST /api/workflows/execute
{
  "workflowFile": ".github/workflows/test.yml",
  "projectId": "project-uuid",
  "inputs": {
    "custom_param": "value"
  }
}

Response:
{
  "execution": {
    "id": "execution-uuid",
    "project_id": "project-uuid",
    "workflow_file": ".github/workflows/test.yml",
    "status": "triggered",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Execution Logs

```bash
GET /api/workflows/executions/{executionId}/logs

Response:
{
  "executionId": "execution-uuid",
  "logs": [
    {
      "jobId": 12345,
      "jobName": "test",
      "status": "completed",
      "conclusion": "success",
      "logs": "Run tests\n...\nAll tests passed"
    }
  ]
}
```

#### Cancel Execution

```bash
POST /api/workflows/executions/{executionId}/cancel
```

### Component Usage

```jsx
import WorkflowLogs from './components/WorkflowLogs';

function App() {
  const projectId = 'project-uuid';
  return <WorkflowLogs projectId={projectId} />;
}
```

### Database Tables

**workflow_executions**
```sql
- id (UUID)
- project_id (UUID) - Foreign key to code_projects
- workflow_file (String)
- github_run_id (BigInt)
- status (enum: triggered, running, completed, failed, cancelled)
- triggered_by (User ID)
- created_at, updated_at (Timestamp)
```

---

## Complete Workflow Example

### Scenario: Developer Writes and Tests Code

1. **Login**: Developer logs in with AD credentials
2. **Create Project**: Developer creates a new project ("Unit Tests")
3. **Write Code**: Developer writes test code in the editor
4. **Save Version**: Developer saves a version with message "Initial test setup"
5. **Trigger Tests**: Developer clicks "Trigger Workflow" and selects `.github/workflows/test.yml`
6. **View Logs**: Portal displays real-time logs from GitHub Actions
7. **Check Results**: Developer sees test results and job output
8. **Update Code**: If tests fail, developer edits code and repeats

### Example GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Run Unit Tests

on:
  workflow_dispatch:
    inputs:
      projectId:
        description: 'Project ID'
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Generate coverage
        run: npm run coverage
```

---

## Security Notes

### Active Directory
- Service account should have minimal required permissions
- LDAP connections should be encrypted (LDAPS on port 636)
- Store credentials securely in environment variables only

### GitHub Integration
- Use GitHub Personal Access Token (not password)
- Token should have minimal scopes: `workflow`, `repo:status`
- Rotate token regularly
- Never commit tokens to git

### Code Editor
- Code is stored in the database - ensure proper backup
- Access control through user roles
- Only project owner and admins can delete/modify projects

---

## Troubleshooting

### AD Login Fails
- Verify LDAP URL and credentials
- Check AD server is reachable from backend container
- Review backend logs: `docker logs developer_portal_backend`

### Workflows Not Showing
- Verify GitHub token has `workflow` scope
- Check repository owner and name are correct
- Confirm workflows exist in `.github/workflows/`

### Logs Not Displaying
- Ensure workflow is actually running on GitHub
- Check GitHub API rate limits (60/hour for unauthenticated)
- Verify token permissions

---

## Environment Setup Checklist

- [ ] AD server configured with service account
- [ ] LDAP credentials added to `.env`
- [ ] GitHub Personal Access Token generated
- [ ] GitHub repo owner and name configured
- [ ] ldapjs package installed (`npm install ldapjs`)
- [ ] Database migrations applied
- [ ] Backend restarted with new environment variables
- [ ] Frontend credentials updated for login page
- [ ] Tested AD login with real credentials
- [ ] Tested workflow trigger and log viewing

---

## Next Steps

1. **Customize Code Editor**: Add syntax highlighting with Monaco Editor or CodeMirror
2. **Enhance Log Viewer**: Add filtering, search, and download capabilities
3. **Add Notifications**: Email alerts when workflow completes
4. **Implement Webhooks**: GitHub webhooks to update portal automatically
5. **Add Analytics**: Track code changes and test results over time
