# 🚀 Quick Start Guide

## In 5 Minutes - Get Your Portal Running

### Step 1: Configure Active Directory (Optional - for AD login)
```bash
# Edit the .env file
nano backend/.env

# Update these lines with your AD details:
LDAP_URL=ldap://your-ad-server:389
LDAP_BIND_DN=CN=service_account,CN=Users,DC=yourcompany,DC=com
LDAP_BIND_PASSWORD=your-password
LDAP_BASE_DN=DC=yourcompany,DC=com
```

### Step 2: Configure GitHub (Optional - for workflow testing)
```bash
# In the same .env file, update:
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-repo
GITHUB_REPO_BRANCH=main
```

### Step 3: Start the Portal
```bash
cd /Users/shrutisohan/Desktop/shruti/portal
docker-compose up -d
```

### Step 4: Verify Everything is Running
```bash
docker ps
# You should see 3 containers running:
# - developer_portal_backend
# - developer_portal_frontend  
# - developer_portal_db
```

### Step 5: Access the Portal
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **Database:** localhost:5432

---

## 🎯 Using the Portal

### Login
- Use AD credentials if configured
- Falls back to local users if AD not available
- Test user: `dev@example.com` / `password123` (if using local)

### Code Editor
1. Click "Code Editor" on dashboard
2. "New Project" → enter name and language
3. Write code in the editor
4. Click "Save Project"
5. Create versions with "Save Version" button

### Run Tests (GitHub Actions)
1. Click "Workflow Logs" on dashboard
2. Select a workflow from the dropdown
3. Click "Trigger Workflow"
4. View real-time logs in the logs panel

### View Project History
1. In Code Editor, select a project
2. Click "Version History" 
3. Click on any version to restore it

---

## 🔧 Configuration Cheat Sheet

### Active Directory (LDAP)
```env
LDAP_URL=ldap://YOUR_AD_SERVER:389
LDAP_BIND_DN=CN=SERVICE_ACCOUNT,CN=Users,DC=DOMAIN,DC=COM
LDAP_BIND_PASSWORD=PASSWORD
LDAP_BASE_DN=DC=DOMAIN,DC=COM
```

### GitHub
```env
GITHUB_TOKEN=ghp_XXXXXXXXX (Personal Access Token)
GITHUB_REPO_OWNER=your-organization
GITHUB_REPO_NAME=your-repository
GITHUB_REPO_BRANCH=main
```

### Database
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=developer_portal
DB_USER=postgres
DB_PASSWORD=postgres
```

### Security
```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
```

---

## 🧪 Test Commands

### Test Backend Health
```bash
curl http://localhost:5001/health
```

### Test Code Editor
```bash
# Create a project
curl -X POST http://localhost:5001/api/editor/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","language":"javascript"}'
```

### Test Workflows
```bash
# List workflows
curl -X GET http://localhost:5001/api/workflows/workflows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker --version

# Check ports aren't in use
lsof -i :3000
lsof -i :5001
lsof -i :5432
```

### Login Not Working
```bash
# Check LDAP configuration
docker logs developer_portal_backend | grep -i ldap

# Verify AD server is reachable
telnet your-ad-server 389
```

### Workflows Not Showing
```bash
# Check GitHub token
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user

# Check backend logs
docker logs developer_portal_backend
```

### Database Issues
```bash
# Connect to database
docker exec -it developer_portal_db psql -U postgres

# List tables
\dt
```

---

## 📚 Full Documentation

For complete documentation, see:
- **Setup Guide:** `AD_AND_EDITOR_GUIDE.md`
- **Architecture:** `IMPLEMENTATION_COMPLETE.md`
- **Deployment:** `docs/DEPLOYMENT.md`
- **API Docs:** `docs/API.md`

---

## 💡 Pro Tips

1. **Create a Test Workflow**
   ```bash
   mkdir -p .github/workflows
   # Create test.yml with your workflow
   ```

2. **Generate GitHub Token**
   - GitHub → Settings → Developer Settings → Personal Access Tokens
   - Select: `workflow`, `repo:status` scopes

3. **Create AD Service Account**
   - Should have read access to users and groups
   - Don't use admin account

4. **Backup Database**
   ```bash
   docker exec developer_portal_db pg_dump -U postgres developer_portal > backup.sql
   ```

---

## ✨ What You Can Do Now

✅ Manage code projects in the browser  
✅ Save code versions with commit messages  
✅ Restore previous code versions  
✅ Trigger GitHub Actions workflows  
✅ View workflow logs in real-time  
✅ Authenticate with Active Directory  
✅ Manage user roles and permissions  
✅ Download and upload packages  
✅ Execute unit tests  

---

## �� You're Ready!

Your Developer Portal is ready to use. Just add your AD and GitHub credentials, and you're all set!

**Next:** Read `AD_AND_EDITOR_GUIDE.md` for detailed configuration.
