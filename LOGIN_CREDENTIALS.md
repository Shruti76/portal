# Developer Portal - Login Credentials & Setup Guide

## Issues Fixed

### 1. **Login Failed Error**
**Problem:** The authentication route was failing due to a middleware initialization error.

**Root Cause:** In `/backend/src/routes/auth.js`, the `authenticateToken` middleware was defined **after** it was being used in the `/me` route, causing a "Cannot access 'authenticateToken' before initialization" error.

**Solution:** 
- Moved the middleware import from `middleware/auth.js` to the top of the file
- Removed duplicate middleware definition
- Updated docker-compose and .env to use consistent ports (5001)

### 2. **Missing UUID Package**
**Problem:** Backend crashed with "Cannot find module 'uuid'"

**Solution:** 
- Added `uuid@^9.0.0` to `backend/package.json`
- Reinstalled dependencies and rebuilt Docker image

### 3. **Port Configuration Mismatch**
**Problem:** Backend was running on port 5000 but docker-compose exposed 5001

**Solution:**
- Updated `backend/.env` from `PORT=5000` to `PORT=5001`
- Added `PORT: 5001` to docker-compose.yml backend environment
- Changed `DB_HOST` from `localhost` to `postgres` for Docker networking

## Test User Credentials

Use these credentials to test the application:

| Email | Password | Role |
|-------|----------|------|
| `dev@example.com` | `password123` | Developer |
| `admin@example.com` | `password123` | Admin |
| `maint@example.com` | `password123` | Maintainer |

## Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **Database:** localhost:5432

## Database Credentials

- **Database:** `developer_portal`
- **User:** `postgres`
- **Password:** `postgres`
- **Host:** `localhost:5432`

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Packages
- `GET /api/packages` - List packages
- `POST /api/packages` - Upload package
- `GET /api/packages/:id` - Get package details
- `GET /api/packages/:id/download` - Download package

### Tests
- `POST /api/tests/execute` - Execute tests
- `GET /api/tests/:id/results` - Get test results
- `GET /api/tests/history` - Get test execution history

### RBAC
- `GET /api/rbac/roles` - List roles
- `POST /api/rbac/assign-role` - Assign role to user
- `GET /api/rbac/permissions` - Get user permissions

## Login Test

To test the login functionality:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"password123"}'
```

Expected response:
```json
{
  "user": {
    "id": 2,
    "email": "dev@example.com",
    "fullName": "Developer User",
    "role": "developer",
    "organization": "example"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Status

✅ **Backend Running** - Port 5001  
✅ **Frontend Running** - Port 3000  
✅ **Database Running** - Port 5432  
✅ **Authentication Working**  

All systems are operational and ready for development!
