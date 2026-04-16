# ✅ Login Fix - Dual Authentication Mode

## Problem
Login was failing because the system required Active Directory authentication, but the LDAP server was not configured (still had placeholder values).

## Solution
Updated authentication to support **two modes**:

### Mode 1: Active Directory Authentication (When Configured)
- If LDAP server is properly configured in `.env`, the system attempts AD authentication first
- On success: User is created/updated in database from AD attributes
- Automatic role mapping based on AD group membership (Admin, Maintainer, Developer)

### Mode 2: Local Authentication (Fallback)
- If AD authentication fails or is not configured, system falls back to local auth
- Uses bcrypt to verify password against database
- Works with test users created during setup

## How It Works

```javascript
// 1. Check if AD is configured
const isADConfigured = process.env.LDAP_URL && 
                       !process.env.LDAP_URL.includes('localhost') &&
                       process.env.LDAP_BIND_DN && 
                       process.env.LDAP_BIND_PASSWORD;

// 2. If AD configured, try it first
if (isADConfigured) {
  try {
    // Authenticate against AD
    const adUser = await authenticateLDAP(username, password);
    // Create/update user in DB
  } catch (adError) {
    // Fall back to local auth
    const dbUser = await db.query('SELECT * FROM users WHERE email = ?');
    const validPassword = await bcrypt.compare(password, user.password);
  }
} else {
  // Direct local authentication
  const dbUser = await db.query('SELECT * FROM users WHERE email = ?');
  const validPassword = await bcrypt.compare(password, user.password);
}
```

## Test Credentials (Local Authentication)

When AD is not configured, use these test users:

| Email | Password | Role |
|-------|----------|------|
| dev@example.com | password123 | developer |
| admin@example.com | password123 | admin |
| maintainer@example.com | password123 | maintainer |

## Testing

### Test Local Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev@example.com","password":"password123"}'
```

Expected response:
```json
{
  "user": {
    "id": 2,
    "email": "dev@example.com",
    "fullName": "Developer User",
    "role": "developer"
  },
  "token": "eyJhbGc..."
}
```

### Configure AD Authentication (Optional)

To enable Active Directory authentication:

1. **Update `.env` file:**
   ```env
   LDAP_URL=ldap://your-ad-server:389
   LDAP_BIND_DN=CN=service_account,CN=Users,DC=yourcompany,DC=com
   LDAP_BIND_PASSWORD=your-password
   LDAP_BASE_DN=DC=yourcompany,DC=com
   ```

2. **Restart services:**
   ```bash
   docker-compose restart developer_portal_backend
   ```

3. **Login with AD credentials:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"your-ad-username","password":"your-ad-password"}'
   ```

## Logs

View authentication logs:
```bash
docker logs developer_portal_backend | grep -E "(AD authentication|Falling back|local authentication)"
```

You should see:
```
Attempting AD authentication for: dev@example.com
AD authentication failed: LDAP Bind Error: getaddrinfo ENOTFOUND your-ad-server
Falling back to local authentication...
```

This confirms the fallback is working correctly.

## Files Modified

- `backend/src/routes/auth.js` - Added dual authentication logic
- `backend/src/config/ldap.js` - No changes (handles errors gracefully)

## Status

✅ Local authentication working  
✅ Fallback logic implemented  
✅ AD authentication ready to enable  
✅ Test users functional  

## Next Steps

1. **Use local auth now:** Login with `dev@example.com` / `password123`
2. **Configure AD later:** Add AD credentials to `.env` when ready
3. **Switch automatically:** No code changes needed, just update `.env`
