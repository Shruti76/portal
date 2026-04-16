# API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
All endpoints except `/auth/*` require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register
Create a new user account.

**Request:**
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "organization": "myorg"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "developer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login
Authenticate and get JWT token.

**Request:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "developer",
    "organization": "myorg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User
Get authenticated user details.

**Request:**
```
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization": "myorg",
  "role": "developer",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Package Endpoints

### Upload Package
Upload a new package version.

**Request:**
```
POST /packages/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

multipart fields:
- file: <binary> (required)
- packageName: "myorg@package-name" (required)
- version: "1.0.0" (required)
- packageType: "nodejs" (required) - java, python, nodejs, dotnet, go
- description: "Package description" (optional)
```

**Response:**
```json
{
  "message": "Package uploaded successfully",
  "package": {
    "id": 1,
    "name": "myorg@package-name",
    "version": "1.0.0",
    "description": "Package description",
    "package_type": "nodejs",
    "file_path": "uuid-filename.tar.gz",
    "uploaded_by": 1,
    "organization": "myorg",
    "downloads": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Download Package
Download a specific package version.

**Request:**
```
GET /packages/download/:packageName/:version
Authorization: Bearer <token>

Example:
GET /packages/download/myorg@package-name/1.0.0
```

**Response:**
- Binary file download
- Downloads counter incremented

---

### Get Package Details
Get metadata for a specific package version.

**Request:**
```
GET /packages/:packageName/:version
Authorization: Bearer <token>

Example:
GET /packages/myorg@package-name/1.0.0
```

**Response:**
```json
{
  "id": 1,
  "name": "myorg@package-name",
  "version": "1.0.0",
  "description": "Package description",
  "package_type": "nodejs",
  "file_path": "uuid-filename.tar.gz",
  "uploaded_by": 1,
  "uploaded_by_name": "John Doe",
  "organization": "myorg",
  "downloads": 5,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### List Organization Packages
Get all packages for an organization with pagination.

**Request:**
```
GET /packages/org/:organization?page=1&limit=20
Authorization: Bearer <token>

Example:
GET /packages/org/myorg?page=1&limit=20
```

**Response:**
```json
{
  "packages": [
    {
      "id": 1,
      "name": "myorg@package-name",
      "version": "1.0.0",
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### Search Packages
Search packages by name and/or type.

**Request:**
```
GET /packages/search?q=package&type=nodejs
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (optional): Search query
- `type` (optional): Package type (java, python, nodejs, dotnet, go)

**Response:**
```json
[
  {
    "id": 1,
    "name": "myorg@package-name",
    "version": "1.0.0",
    "package_type": "nodejs",
    ...
  }
]
```

---

### Delete Package Version
Delete a specific package version.

**Request:**
```
DELETE /packages/:packageName/:version
Authorization: Bearer <token>

Example:
DELETE /packages/myorg@package-name/1.0.0
```

**Response:**
```json
{
  "message": "Package deleted successfully"
}
```

---

## Test Endpoints

### Execute Tests
Start unit test execution for a package.

**Request:**
```
POST /tests/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": 1,
  "packageName": "myorg@package-name",
  "packageType": "nodejs",
  "packagePath": "/tmp/myorg@package-name"
}
```

**Response:** (HTTP 202 - Accepted)
```json
{
  "message": "Test execution started",
  "testRunId": 1,
  "status": "running"
}
```

---

### Get Test Results
Get results of a test execution.

**Request:**
```
GET /tests/results/:testRunId
Authorization: Bearer <token>

Example:
GET /tests/results/1
```

**Response:**
```json
{
  "id": 1,
  "package_id": 1,
  "executed_by": 1,
  "status": "passed",
  "output": "Test output...",
  "error_output": "",
  "started_at": "2024-01-15T10:30:00Z",
  "finished_at": "2024-01-15T10:31:00Z",
  "package": {
    "name": "myorg@package-name",
    "version": "1.0.0"
  },
  "full_name": "John Doe"
}
```

**Status Values:**
- `running`: Tests currently executing
- `passed`: All tests passed
- `failed`: One or more tests failed

---

### Get Test History
Get test execution history for a package.

**Request:**
```
GET /tests/package/:packageId/history?page=1&limit=20
Authorization: Bearer <token>

Example:
GET /tests/package/1/history?page=1&limit=20
```

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "package_id": 1,
      "status": "passed",
      "started_at": "2024-01-15T10:30:00Z",
      "finished_at": "2024-01-15T10:31:00Z",
      "full_name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

---

## RBAC Endpoints

### Get User Role
Get user's current role and permissions.

**Request:**
```
GET /rbac/user/:userId
Authorization: Bearer <token> (must be admin)

Example:
GET /rbac/user/1
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "developer",
    "organization": "myorg"
  },
  "permissions": [
    "download_package",
    "execute_tests",
    "view_test_reports"
  ]
}
```

---

### Update User Role
Change a user's role and permissions.

**Request:**
```
PUT /rbac/user/:userId/role
Authorization: Bearer <token> (must be admin)
Content-Type: application/json

{
  "role": "maintainer"
}
```

**Response:**
```json
{
  "message": "User role updated",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "maintainer",
    "organization": "myorg"
  },
  "permissions": [
    "upload_package",
    "download_package",
    "execute_tests",
    "delete_package",
    "view_test_reports"
  ]
}
```

---

### List Organization Users
Get all users in an organization.

**Request:**
```
GET /rbac/organization/:organization
Authorization: Bearer <token> (must be admin)

Example:
GET /rbac/organization/myorg
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "developer",
    "organization": "myorg",
    "permissions": [...]
  }
]
```

---

### Check Permission
Check if current user has a specific permission.

**Request:**
```
POST /rbac/check-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "permission": "upload_package"
}
```

**Response:**
```json
{
  "hasPermission": true,
  "permission": "upload_package",
  "role": "developer"
}
```

---

### Get Available Roles
Get all available roles and their permissions.

**Request:**
```
GET /rbac/roles
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "name": "admin",
    "permissions": [
      "manage_users",
      "manage_roles",
      "upload_package",
      ...
    ],
    "description": "Full access to all resources and user management"
  },
  {
    "name": "maintainer",
    "permissions": [...],
    "description": "Can upload, manage packages and execute tests"
  },
  ...
]
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `202 Accepted`: Async operation started (e.g., tests)
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently no rate limiting. Implement based on your needs.

---

## Pagination

For paginated endpoints:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

---

## Examples

### Complete Workflow

```bash
# 1. Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "securepass123",
    "fullName": "Dev User",
    "organization": "myorg"
  }'

# 2. Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "securepass123"
  }'

# 3. Upload Package (requires token)
curl -X POST http://localhost:5001/api/packages/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@package.tar.gz" \
  -F "packageName=myorg@my-package" \
  -F "version=1.0.0" \
  -F "packageType=nodejs" \
  -F "description=My awesome package"

# 4. Execute Tests
curl -X POST http://localhost:5001/api/tests/execute \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": 1,
    "packageName": "myorg@my-package",
    "packageType": "nodejs"
  }'

# 5. Get Test Results
curl -X GET http://localhost:5001/api/tests/results/1 \
  -H "Authorization: Bearer <token>"
```
