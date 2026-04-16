# 🚀 Developer Portal - Quick Reference Card

## Access Portal

```
URL: http://localhost:3000
Email: dev@example.com
Password: password123
```

---

## Main Features

### 1. 🖥️ IDE Editor
**URL:** `/editor`
- VS Code-style interface
- Create projects
- Edit code
- Save & version
- View terminal

### 2. 🔐 Authentication
**Dual Mode:**
- ✅ Active Directory (needs config)
- ✅ Local Database (works now)
- Auto-fallback when AD unavailable

### 3. 🐙 GitHub Actions
**URL:** `/workflows`
- Trigger workflows
- View logs
- Track execution
- Real-time updates

### 4. 📦 Packages
**Upload:** `/upload`
**Download:** `/download`
- Versioned packages
- Multiple formats
- Team sharing

### 5. 🧪 Testing
**URL:** `/tests`
- Execute unit tests
- View results
- Test history

### 6. ⚙️ Settings
**URL:** `/settings`
- Profile info
- API tokens
- Preferences
- Timezone

### 7. 👥 Role Management
**URL:** `/rbac` (Admin only)
- User management
- Role assignment
- Permissions

---

## Browser Console (F12)

### Check Network
```
F12 → Network tab
Refresh page
Look for API calls
```

### Check Errors
```
F12 → Console tab
Look for red errors
Check for warnings
```

### Check Storage
```
F12 → Application tab
Check localStorage
See JWT token
```

---

## API Tests

### Login Test
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev@example.com","password":"password123"}'
```

### Health Check
```bash
curl http://localhost:5001/health
```

### Project List
```bash
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/editor/projects
```

---

## Docker Commands

### Check Services
```bash
docker ps
```

### View Logs
```bash
docker logs developer_portal_backend
docker logs developer_portal_frontend
docker logs developer_portal_db
```

### Restart Services
```bash
docker-compose restart
```

### Stop All
```bash
docker-compose down
```

### Start All
```bash
docker-compose up -d
```

---

## Configuration Files

### Environment Variables
```
Location: backend/.env
Contains: 
- Port settings
- Database credentials
- LDAP/AD config
- GitHub settings
- JWT secret
```

### Edit .env
```bash
cd /Users/shrutisohan/Desktop/shruti/portal
nano backend/.env
```

### Add AD Credentials
```env
LDAP_URL=ldap://your-server:389
LDAP_BIND_DN=CN=service,...
LDAP_BIND_PASSWORD=password
LDAP_BASE_DN=DC=domain,DC=com
```

### Add GitHub Token
```env
GITHUB_TOKEN=ghp_your_token
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-repo
GITHUB_REPO_BRANCH=main
```

---

## Database Access

### Connect to Database
```bash
docker exec -it developer_portal_db psql -U postgres
```

### List Tables
```sql
\dt
```

### Check Users
```sql
SELECT id, email, full_name, role FROM users;
```

### Backup Database
```bash
docker exec developer_portal_db pg_dump -U postgres developer_portal > backup.sql
```

---

## File Locations

### Frontend
```
/portal/frontend/src/
├── components/       (UI components)
├── pages/           (Page components)
├── context/         (Auth context)
└── App.jsx          (Main app)
```

### Backend
```
/portal/backend/src/
├── config/          (DB, LDAP, GitHub)
├── routes/          (API endpoints)
├── middleware/      (Auth, validation)
└── server.js        (Main server)
```

### Database
```
/portal/database/
├── schema.sql       (Table creation)
└── seed.sql         (Test data)
```

---

## Keyboard Shortcuts

### IDE Editor
```
Ctrl+S / Cmd+S - Save
Ctrl+R / Cmd+R - Run
Ctrl+B / Cmd+B - Toggle sidebar
```

### Browser
```
F12             - Developer tools
Ctrl+Shift+C    - Inspect element
Ctrl+L          - Focus address bar
Ctrl+R          - Refresh
Ctrl+Shift+R    - Hard refresh
```

---

## Common Issues & Fixes

### Issue: Can't login
```
✓ Check test user exists: dev@example.com
✓ Check password: password123
✓ Clear browser cache: Ctrl+Shift+Delete
✓ Try incognito mode
✓ Check backend logs: docker logs developer_portal_backend
```

### Issue: IDE won't load
```
✓ Ensure you're logged in
✓ Check URL: http://localhost:3000/editor
✓ Verify backend: curl http://localhost:5001/health
✓ Check console: F12 → Console tab
```

### Issue: Workflows not showing
```
✓ Configure GitHub token in .env
✓ Restart backend: docker-compose restart
✓ Check GitHub token: curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### Issue: Projects not loading
```
✓ Check network: F12 → Network tab
✓ See API response status
✓ Check database: docker logs developer_portal_db
```

---

## Test Data

### Test User Account
```
Email:    dev@example.com
Password: password123
Role:     Developer
```

### Other Test Users
```
Admin:      admin@example.com / password123
Maintainer: maintainer@example.com / password123
```

---

## Documentation Map

```
README.md                    → Overview
QUICK_START.md              → 5-min setup
AD_AND_EDITOR_GUIDE.md      → AD config
CODE_EDITOR_GUIDE.md        → Editor usage
GITHUB_INTEGRATION.md       → GitHub setup
SETTINGS_GUIDE.md           → Settings page
IDE_EDITOR_GUIDE.md         → IDE features
IDE_TRANSFORMATION.md       → IDE design
LOGIN_FIX.md                → Auth help
PORTAL_SUMMARY.md           → Complete guide
```

---

## Support Resources

**For quick help:**
1. Check relevant .md file
2. View browser console (F12)
3. Check backend logs
4. Verify API with curl

**For issues:**
1. Check troubleshooting sections
2. Review documentation files
3. Check Docker logs
4. Verify configuration

---

## Useful Links

```
Portal:           http://localhost:3000
Dashboard:        http://localhost:3000/dashboard
IDE Editor:       http://localhost:3000/editor
Settings:         http://localhost:3000/settings
Backend API:      http://localhost:5001/api
Health Check:     http://localhost:5001/health
Database:         localhost:5432
```

---

## Key Credentials

```
Database:
  Host:     postgres (Docker) / localhost (Local)
  Port:     5432
  User:     postgres
  Password: postgres
  DB:       developer_portal

Test User:
  Email:    dev@example.com
  Password: password123
  Role:     Developer
```

---

## Next: Configuration

### Step 1: Setup GitHub (Optional)
- Generate token at: https://github.com/settings/tokens
- Add to backend/.env
- Create .github/workflows/ in repo
- Restart backend

### Step 2: Setup AD (Optional)
- Get AD/LDAP details from IT
- Add to backend/.env
- Test with AD credentials
- Restart backend

### Step 3: Deploy (Production)
- Update domain URLs
- Set secure JWT_SECRET
- Enable HTTPS
- Setup firewall
- Configure DNS

---

## Production Checklist

- [ ] Change JWT_SECRET to secure value
- [ ] Update database password
- [ ] Enable HTTPS/SSL
- [ ] Configure GitHub token
- [ ] Setup LDAP/AD (if needed)
- [ ] Review security settings
- [ ] Setup backups
- [ ] Configure monitoring
- [ ] Set up logging
- [ ] Test failover scenarios

---

**Ready? Start here:** http://localhost:3000 🚀
