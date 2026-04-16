# ⚙️ Settings Guide

## Where to Find Settings

### Access Settings:
1. **Login** to the Developer Portal
2. **Click "Settings" button** in the top-right header (next to Logout)
3. **URL:** `http://localhost:3000/settings`

---

## Settings Sections

### 1. Profile Information
View your account details (read-only):
- **Full Name** - Your account name
- **Email Address** - Your primary email
- **Organization** - Your organization name
- **Role** - Your access level (admin, maintainer, developer, viewer)

### 2. API Access
Manage API tokens for programmatic access:

**Generate API Token:**
1. Click **[Generate New Token]**
2. Token is displayed (masked by default)
3. Click **[Show]** to see full token
4. Click **[Copy]** to copy to clipboard
5. Use token for API authentication:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/editor/projects
   ```

**Using API Token:**
```bash
# Set token as environment variable
export API_TOKEN="your_token_here"

# Use in requests
curl -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:5001/api/workflows/workflows
```

### 3. Notifications
Control how you receive updates:

- **Email Notifications**
  - ✅ Enabled: Get email on workflow completion
  - ❌ Disabled: No email notifications

- **Auto-Refresh Logs**
  - ✅ Enabled: Automatically refresh workflow logs
  - ❌ Disabled: Manual refresh only
  - Set refresh interval: 1-60 seconds (default: 5)

### 4. Appearance
Customize your experience:

- **Theme**
  - **Light:** Bright white interface
  - **Dark:** Dark background interface
  - **Auto:** Follow system preference

- **Timezone**
  - Choose your timezone for timestamp display
  - Supported: UTC, EST, CST, MST, PST, GMT, IST
  - Affects all timestamps in logs and history

---

## API Token Usage

### Example: Fetch Projects
```bash
TOKEN="your_api_token"

curl -X GET http://localhost:5001/api/editor/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Example: Create Project
```bash
TOKEN="your_api_token"

curl -X POST http://localhost:5001/api/editor/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Project",
    "language": "javascript",
    "description": "Created via API"
  }'
```

### Example: Trigger Workflow
```bash
TOKEN="your_api_token"

curl -X POST http://localhost:5001/api/workflows/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowFile": "test.yml",
    "projectId": "project-uuid",
    "inputs": {"customParam": "value"}
  }'
```

---

## Profile Information

### Your Role & Permissions

| Role | Capabilities |
|------|---|
| **Admin** | Full access to all features, manage users, RBAC |
| **Maintainer** | Upload packages, create projects, manage versions |
| **Developer** | Create/edit projects, download packages, run tests |
| **Viewer** | Download packages, view-only access |

### How to Check Your Role
- View in **Profile Information** section
- Display in dashboard header (next to name)
- Affects which features you can access

---

## Notification Settings

### Email Notifications
When enabled, you'll receive emails for:
- ✉️ Workflow completion
- ✉️ Test execution results
- ✉️ Package upload confirmation
- ✉️ Important alerts

To enable:
1. Go to **Settings** → **Notifications**
2. Check **"Email Notifications"**
3. Click **[Save Settings]**

### Auto-Refresh Logs
Keep workflow logs automatically updated:
1. Go to **Settings** → **Notifications**
2. Check **"Auto-Refresh Logs"**
3. Set interval (5-60 seconds)
4. Click **[Save Settings]**

This is especially useful for:
- Long-running workflows
- Real-time test monitoring
- Build pipeline tracking

---

## Appearance Settings

### Theme Selection
- **Light:** Best for bright environments
- **Dark:** Reduces eye strain in low light
- **Auto:** Matches your system preference

### Timezone Configuration
Change timezone to see timestamps in your local time:
- UTC (Coordinated Universal Time)
- EST (Eastern Standard Time)
- CST (Central Standard Time)
- MST (Mountain Standard Time)
- PST (Pacific Standard Time)
- GMT (Greenwich Mean Time)
- IST (Indian Standard Time)

**Example Impact:**
- Workflow triggered at 14:00 UTC
- With PST timezone: Displays as 06:00 PST
- With IST timezone: Displays as 19:30 IST

---

## Security Best Practices

### API Token Management
- ⚠️ **Never share your token** with others
- 🔒 **Keep token secret** like a password
- 🔄 **Regenerate regularly** (recommended: monthly)
- 📋 **Copy & paste carefully** to avoid exposure

### When to Regenerate Token
1. Token exposed publicly
2. Regular security rotation
3. Changing permissions/access level
4. No longer needed by application

### Token Storage
- ✅ Store in secure password manager
- ✅ Store in environment variables
- ✅ Store in `.env` file (excluded from git)
- ❌ Don't hardcode in source code
- ❌ Don't share in messages/emails

---

## Common Tasks

### Task: Use API for Automation
```bash
# 1. Generate token in Settings
# 2. Save to environment
export PORTAL_TOKEN="ghp_xxxx..."

# 3. Use in scripts
curl -H "Authorization: Bearer $PORTAL_TOKEN" \
  http://localhost:5001/api/editor/projects

# 4. Integrate with CI/CD
# .github/workflows/sync.yml:
#   env:
#     PORTAL_TOKEN: ${{ secrets.PORTAL_TOKEN }}
```

### Task: Change Timezone
1. Click **Settings** button
2. Go to **Appearance** section
3. Select your timezone from dropdown
4. Click **[Save Settings]**
5. All timestamps now show in selected timezone

### Task: Disable Email Notifications
1. Go to **Settings** → **Notifications**
2. Uncheck **"Email Notifications"**
3. Click **[Save Settings]**
4. No more notification emails sent

### Task: Speed Up Auto-Refresh
1. Go to **Settings** → **Notifications**
2. Ensure **"Auto-Refresh Logs"** is checked
3. Change **"Refresh Interval"** to 2 seconds
4. Click **[Save Settings]**
5. Logs update every 2 seconds

---

## Troubleshooting

### Can't Find Settings Button
- ✓ Ensure you're logged in
- ✓ Check header top-right corner
- ✓ Try direct URL: `http://localhost:3000/settings`

### API Token Won't Generate
- ✓ Check backend is running: `docker ps`
- ✓ Verify authentication: Logout and re-login
- ✓ Check logs: `docker logs developer_portal_backend`

### Settings Won't Save
- ✓ Ensure form is filled correctly
- ✓ Check network connection
- ✓ Try refreshing page
- ✓ Check browser console for errors (F12)

### Token Shows as Invalid
- ✓ Copy token exactly as shown
- ✓ Ensure no extra spaces
- ✓ Try regenerating new token
- ✓ Verify Authorization header format: `Bearer YOUR_TOKEN`

---

## FAQ

**Q: Can I have multiple API tokens?**
A: Currently, one token per user. Regenerating creates a new one (invalidating old).

**Q: How long do API tokens last?**
A: Tokens don't expire. They're valid until regenerated.

**Q: Can I reset my password from Settings?**
A: Not yet. Contact your admin for password reset.

**Q: Will changing timezone affect stored timestamps?**
A: No, only display format. Actual data stored in UTC.

**Q: Can I share my API token with colleagues?**
A: Not recommended. Each user should generate their own token.

---

## Next Steps

1. ✅ Access Settings from dashboard
2. ✅ Review your profile information
3. ✅ Generate an API token (if needed)
4. ✅ Configure notification preferences
5. ✅ Set your timezone
6. ✅ Select preferred theme
7. ✅ Click **[Save Settings]**

**Settings saved! Your preferences are now active.** 🎉
