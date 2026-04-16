# 🔗 GitHub Integration Guide

## Where is GitHub Integrated?

GitHub is integrated in **3 main components**:

### 1. **Backend Configuration** (`backend/src/config/github.js`)
- GitHub API client setup
- Workflow triggering
- Log retrieval
- Run management

### 2. **Workflow Routes** (`backend/src/routes/workflows.js`)
- `/api/workflows/workflows` - List available workflows
- `/api/workflows/execute` - Trigger a workflow
- `/api/workflows/logs/:executionId` - Get execution logs
- `/api/workflows/cancel/:executionId` - Cancel a run

### 3. **Frontend Component** (`frontend/src/components/WorkflowLogs.jsx`)
- Workflow selector dropdown
- Real-time log viewer
- Execution history
- Auto-refresh toggle

---

## How GitHub Integration Works

```
┌─ Developer Portal ────────────────────────────┐
│                                               │
│  1. User clicks "Workflow Logs"              │
│  2. Selects GitHub workflow                  │
│  3. Clicks "Trigger Workflow"                │
│                                               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─ Backend API (port 5001) ─────────────────────┐
│                                               │
│  POST /api/workflows/execute                  │
│  ├─ Verify project exists                    │
│  ├─ Call GitHub API                          │
│  └─ Store in database                        │
│                                               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─ GitHub API ──────────────────────────────────┐
│                                               │
│  /repos/{owner}/{repo}/actions/workflows/     │
│    {workflow}/dispatches                      │
│                                               │
│  Triggers the workflow run                    │
│                                               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─ GitHub Actions ──────────────────────────────┐
│                                               │
│  Executes workflow (.github/workflows/*.yml)  │
│  Runs tests                                   │
│  Generates logs                               │
│                                               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─ Backend Polls Logs ──────────────────────────┐
│                                               │
│  GET /api/workflows/logs/{executionId}        │
│  Fetches logs from GitHub                     │
│  Stores in database                           │
│                                               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─ Frontend Shows Logs ─────────────────────────┐
│                                               │
│  Real-time log display                        │
│  Auto-refresh every 5 seconds                 │
│  Status indicators                            │
│                                               │
└───────────────────────────────────────────────┘
```

---

## Setup Instructions

### Step 1: Generate GitHub Personal Access Token

1. Go to **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** (Classic)
2. Click **Generate new token**
3. Fill in:
   - **Note:** "Developer Portal Workflow Trigger"
   - **Expiration:** 90 days
4. Select scopes:
   - ✅ `workflow` - Update GitHub Action workflows
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:repo_hook` - Read webhook hooks
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)

Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Update .env File

```bash
# Edit backend/.env
nano backend/.env
```

Add/update these lines:

```env
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO_OWNER=your-github-username-or-org
GITHUB_REPO_NAME=your-repository-name
GITHUB_REPO_BRANCH=main
```

### Step 3: Create GitHub Workflows

In your GitHub repository, create workflows:

```bash
mkdir -p .github/workflows
```

Create `test.yml`:

```yaml
name: Run Tests

on:
  workflow_dispatch:
    inputs:
      projectId:
        description: 'Project ID'
        required: true
      executedBy:
        description: 'Executed by'
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Test Results
        if: always()
        run: echo "Tests completed for project ${{ inputs.projectId }}"
```

### Step 4: Restart Services

```bash
cd /Users/shrutisohan/Desktop/shruti/portal
docker-compose restart developer_portal_backend
```

### Step 5: Test Integration

1. Go to **Code Editor**
2. Create/select a project
3. Go to **Workflow Logs**
4. Select a workflow
5. Click **[Trigger Workflow]**
6. View logs auto-update

---

## API Endpoints

### Get Available Workflows

```bash
GET /api/workflows/workflows

Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 12345,
    "name": "Run Tests",
    "path": "test.yml",
    "state": "active"
  }
]
```

### Trigger Workflow

```bash
POST /api/workflows/execute

Authorization: Bearer {token}
Content-Type: application/json

{
  "workflowFile": "test.yml",
  "projectId": "uuid-here",
  "inputs": {
    "customParam": "value"
  }
}
```

**Response:**
```json
{
  "execution": {
    "id": "uuid",
    "project_id": "uuid",
    "workflow_file": "test.yml",
    "status": "triggered",
    "triggered_by": 1,
    "created_at": "2026-04-14T10:30:00.000Z"
  },
  "workflowStatus": {
    "status": "triggered",
    "statusCode": 204,
    "message": "Workflow triggered successfully"
  }
}
```

### Get Execution Logs

```bash
GET /api/workflows/logs/{executionId}

Authorization: Bearer {token}
```

**Response:**
```json
{
  "execution_id": "uuid",
  "workflow_file": "test.yml",
  "status": "completed",
  "logs": "[2026-04-14 10:30:00] Setup Node...",
  "created_at": "2026-04-14T10:30:00.000Z",
  "updated_at": "2026-04-14T10:35:00.000Z"
}
```

### Cancel Workflow Run

```bash
DELETE /api/workflows/{executionId}

Authorization: Bearer {token}
```

---

## Workflow Examples

### Example 1: Test Workflow

```yaml
name: Test Suite

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
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=.
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Example 2: Build & Deploy

```yaml
name: Build and Deploy

on:
  workflow_dispatch:
    inputs:
      projectId:
        description: 'Project ID'
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t myapp .
      
      - name: Push to registry
        run: |
          docker tag myapp ${{ secrets.REGISTRY }}/myapp
          docker push ${{ secrets.REGISTRY }}/myapp
      
      - name: Deploy
        run: echo "Deployment complete"
```

### Example 3: Code Quality

```yaml
name: Code Quality Check

on:
  workflow_dispatch:
    inputs:
      projectId:
        description: 'Project ID'
        required: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run SonarQube
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## Features

### ✅ Implemented Features
- List available workflows
- Trigger workflow execution
- Track execution status
- Fetch real-time logs
- Store execution history
- Cancel running workflows
- Auto-refresh log viewer
- Status indicators (running/completed/failed)

### 🔄 How Real-time Works

1. Frontend polls backend every 5 seconds
2. Backend fetches latest logs from GitHub
3. Logs displayed in real-time viewer
4. Auto-stops when workflow completes

### 💾 Database Tracking

Each workflow execution stored in `workflow_executions` table:
- `id` - Unique execution ID
- `project_id` - Linked code project
- `workflow_file` - Which workflow ran
- `status` - triggered, running, completed, failed
- `triggered_by` - User who triggered it
- `created_at` - When triggered
- `updated_at` - Last updated

---

## Troubleshooting

### Workflows Not Showing

```bash
# Check GitHub token
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user

# Should return your GitHub user info
```

### Workflow Won't Trigger

```bash
# Verify token has workflow scope
# Check .env has correct values
# Verify repository is accessible
# Check workflow file exists in .github/workflows/
```

### Logs Not Updating

```bash
# Check backend logs
docker logs developer_portal_backend | grep -i workflow

# Verify GitHub token is valid
# Check workflow is actually running in GitHub
```

### Connection Refused

```bash
# Ensure backend is running
docker ps | grep developer_portal_backend

# Check API is responding
curl http://localhost:5001/api/workflows/workflows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Notes

⚠️ **Important:**
- Never commit GitHub token to git
- Use `.env` file (not in version control)
- GitHub token can access your repositories
- Rotate token periodically (90 days recommended)
- Use fine-grained tokens when available
- Restrict scopes to minimum needed

---

## Files Modified for GitHub Integration

| File | Purpose |
|------|---------|
| `backend/src/config/github.js` | GitHub API client and functions |
| `backend/src/routes/workflows.js` | Workflow REST API endpoints |
| `frontend/src/components/WorkflowLogs.jsx` | Log viewer UI component |
| `database/schema.sql` | `workflow_executions` table |
| `backend/.env` | GitHub configuration variables |

---

## Next Steps

1. ✅ Generate GitHub Personal Access Token
2. ✅ Update `.env` with token and repo details
3. ✅ Create `.github/workflows/` directory
4. ✅ Add workflow YAML files
5. ✅ Restart backend: `docker-compose restart`
6. ✅ Test: Create project → Trigger workflow → View logs

**You're ready to integrate with GitHub!** 🚀
