# Package Management API Testing Guide

## Quick Test Examples

### 1. Upload a Package with Dependencies

```bash
curl -X POST http://localhost:5001/api/packages/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "packageName=myorg@numpy" \
  -F "version=1.24.0" \
  -F "description=NumPy - scientific computing library" \
  -F "packageType=python" \
  -F "file=@numpy-1.24.0.tar.gz" \
  -F 'dependencies=[{"name": "python-dateutil", "version": "^2.8.0"}, {"name": "pytz", "version": "^2021.3"}]'
```

### 2. Search for Packages

```bash
# Search by name
curl http://localhost:5001/api/packages/search?q=numpy

# Search by type
curl http://localhost:5001/api/packages/search?q=numpy&type=python

# Search pandas packages
curl http://localhost:5001/api/packages/search?q=pandas
```

### 3. Get All Versions of a Package

```bash
curl http://localhost:5001/api/packages/versions/myorg@numpy
```

### 4. Check Dependency Compatibility

```bash
curl -X POST http://localhost:5001/api/packages/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "myorg@pandas",
    "version": "2.0.0",
    "dependencies": {
      "numpy": "1.24.0",
      "python-dateutil": "2.8.2",
      "pytz": "2021.3"
    }
  }'
```

### 5. Download a Package

```bash
curl http://localhost:5001/api/packages/download/myorg@numpy/1.24.0 \
  -o myorg@numpy-1.24.0.tar.gz
```

### 6. Get Package Details

```bash
curl http://localhost:5001/api/packages/myorg@numpy/1.24.0
```

### 7. List Organization Packages

```bash
# Page 1, 20 results per page
curl "http://localhost:5001/api/packages/org/myorg?page=1&limit=20"
```

### 8. Delete Package Version

```bash
curl -X DELETE http://localhost:5001/api/packages/myorg@numpy/1.24.0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Authentication

All write operations (upload, delete) require JWT token:

```bash
# Get token first (login)
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "password123"
  }' | jq -r '.token')

# Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/packages/org/myorg
```

---

## Version Constraint Examples

### Understanding Version Matchers

```javascript
// ^1.24.0 - Compatible versions
"^1.24.0" allows: 1.24.0, 1.24.1, 1.25.0, 1.99.9
"^1.24.0" rejects: 2.0.0 (major version mismatch)

// ~2.0.0 - Approximately
"~2.0.0" allows: 2.0.0, 2.0.1, 2.0.99
"~2.0.0" rejects: 2.1.0 (minor version mismatch)

// >=2.5.1 - Greater or equal
">=2.5.1" allows: 2.5.1, 2.6.0, 3.0.0, 999.0.0
">=2.5.1" rejects: 2.5.0 (less than required)

// 2.0.0 - Exact match
"2.0.0" allows: 2.0.0 (only this version)
"2.0.0" rejects: 2.0.1, 2.1.0 (any other version)
```

---

## Real-World Scenarios

### Scenario 1: Data Science Stack

**Upload numpy, pandas, matplotlib together**

```bash
# Upload numpy (foundation)
curl -X POST http://localhost:5001/api/packages/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "packageName=acme@numpy" \
  -F "version=1.24.0" \
  -F "description=NumPy - numerical computing" \
  -F "packageType=python" \
  -F "file=@numpy-1.24.0.tar.gz" \
  -F 'dependencies=[{"name": "python-dateutil", "version": "^2.8.0"}]'

# Upload pandas (depends on numpy)
curl -X POST http://localhost:5001/api/packages/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "packageName=acme@pandas" \
  -F "version=2.0.0" \
  -F "description=Data analysis library" \
  -F "packageType=python" \
  -F "file=@pandas-2.0.0.tar.gz" \
  -F 'dependencies=[{"name": "numpy", "version": "^1.20.0"}, {"name": "python-dateutil", "version": "^2.8.0"}]'

# Verify compatibility
curl -X POST http://localhost:5001/api/packages/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "acme@pandas",
    "version": "2.0.0",
    "dependencies": {
      "numpy": "1.24.0",
      "python-dateutil": "2.8.2"
    }
  }'
```

### Scenario 2: Web Development Stack

**Upload Flask with its dependencies**

```bash
curl -X POST http://localhost:5001/api/packages/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "packageName=techcorp@flask" \
  -F "version=3.0.0" \
  -F "description=Web microframework for Python" \
  -F "packageType=python" \
  -F "file=@flask-3.0.0.tar.gz" \
  -F 'dependencies=[
    {"name": "werkzeug", "version": "^2.3.0"},
    {"name": "click", "version": "^8.0.0"},
    {"name": "Jinja2", "version": ">=3.0.0"}
  ]'
```

### Scenario 3: Version Migration

**Track multiple versions during Python upgrade**

```bash
# List all Flask versions
curl http://localhost:5001/api/packages/versions/techcorp@flask

# Download legacy Flask 2.0.0
curl http://localhost:5001/api/packages/download/techcorp@flask/2.0.0 \
  -o flask-2.0.0.tar.gz

# Download new Flask 3.0.0
curl http://localhost:5001/api/packages/download/techcorp@flask/3.0.0 \
  -o flask-3.0.0.tar.gz

# Check compatibility with Flask 3.0.0
curl -X POST http://localhost:5001/api/packages/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "techcorp@flask",
    "version": "3.0.0",
    "dependencies": {
      "werkzeug": "2.3.0",
      "click": "8.1.0"
    }
  }'
```

---

## Error Handling

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized to upload to this organization"
}
```

### 404 Not Found
```json
{
  "error": "Package not found"
}
```

### 409 Conflict (Version Exists)
```json
{
  "error": "Package version already exists"
}
```

### 409 Conflict (Dependency Mismatch)
```json
{
  "error": "Dependency version conflict",
  "conflicts": [
    {
      "name": "numpy",
      "required": "^1.20.0",
      "provided": "1.19.0",
      "compatible": false
    }
  ],
  "required": [...]
}
```

---

## Supported Package Types

- `python` - Python packages (.whl, .tar.gz)
- `nodejs` - Node.js packages (.tgz, .zip)
- `java` - Java packages (.jar, .zip)
- `dotnet` - .NET packages (.zip, .nupkg)
- `go` - Go packages (.tar.gz, .zip)

---

## Database Schema

### packages table

```sql
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  package_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  organization VARCHAR(255) NOT NULL,
  downloads INTEGER DEFAULT 0,
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);
```

### Dependencies JSON Structure

```json
[
  {
    "name": "numpy",
    "version": "^1.24.0"
  },
  {
    "name": "python-dateutil",
    "version": "~2.8.0"
  },
  {
    "name": "pytz",
    "version": ">=2021.3"
  }
]
```

---

## Performance Optimization

- Packages indexed on: `name`, `organization`, `version`
- Download counter incremented on each download
- Supports pagination: `?page=1&limit=20`
- Version history ordered by creation date (newest first)

---

## Troubleshooting

### Token Expired
```
Error: "Unauthorized - Invalid token"
Solution: Re-login to get new token
```

### Upload Fails
```
Error: "Invalid file format"
Solution: Use supported formats (.tar.gz for Python, .jar for Java, etc.)
```

### Dependency Check Fails
```
Error: "Dependency version conflict"
Solution: Update dependencies list to match installed versions
```

---

**API Version:** 1.0  
**Last Updated:** April 14, 2026
