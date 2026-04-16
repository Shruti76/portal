# Package Management Guide

## Overview

Your Developer Portal includes a comprehensive **package management system** with version control and dependency restrictions. This guide explains how to upload Python modules, download packages, and enforce version constraints.

---

## 📦 Package Format: `myorg@package`

All packages follow a specific naming convention:

```
myorg@packagename@version
```

**Examples:**
- `techcorp@numpy@1.24.0` - NumPy scientific computing library
- `acme@pandas@2.0.0` - Data analysis library  
- `myorg@requests@2.31.0` - HTTP client library
- `company@flask@3.0.0` - Web framework

---

## 🔧 Uploading Packages

### Step 1: Navigate to Package Upload

1. Log in to the portal: `http://localhost:3000`
2. Click **"Upload Package"** in the navigation menu

### Step 2: Fill in Package Details

| Field | Format | Example |
|-------|--------|---------|
| **Package Name** | `org@name` | `techcorp@numpy` |
| **Version** | Semantic versioning | `1.24.0` |
| **Description** | Free text | "NumPy: scientific computing" |
| **Package Type** | python, nodejs, java, dotnet, go | `python` |
| **File** | .tar.gz, .whl, .zip, .jar, .tgz | `numpy-1.24.0.tar.gz` |
| **Dependencies** | JSON array (optional) | See below |

### Step 3: Add Dependencies (Optional)

Dependencies define what versions of other packages are required. Use JSON format:

```json
[
  { "name": "python-dateutil", "version": "^2.8.0" },
  { "name": "pytz", "version": "~2021.3" }
]
```

### Step 4: Upload

Click **"Upload Package"** button. The system validates:
- ✅ Package name format (`org@name`)
- ✅ Version format (semantic versioning)
- ✅ File format and size (max 100MB)
- ✅ Unique package version (no duplicates)
- ✅ Organization authorization (user's org matches)

---

## 📥 Downloading Packages

### View Available Packages

1. Navigate to **"Download Packages"** section
2. Search by package name: `myorg@numpy`
3. Filter by type: Python, Node.js, Java, etc.

### Download a Specific Version

Each package shows:
- Current version with download button
- All version history (click "Show All Versions")
- Download count and upload date
- Dependencies list (if any)

### Download Process

```bash
# Downloads as myorg@packagename-version.tar.gz
GET /packages/download/myorg@numpy/1.24.0
```

The system automatically:
- Increments download counter
- Validates the package exists
- Streams file to your browser
- Checks dependency compatibility

---

## 🔒 Version Restrictions

When uploading packages with dependencies, use semantic versioning constraints:

### Version Constraint Syntax

| Constraint | Meaning | Example | Allows |
|-----------|---------|---------|--------|
| `^1.24.0` | Compatible version | `numpy@^1.24.0` | 1.24.0, 1.24.1, 1.25.0, but NOT 2.0.0 |
| `~2.0.0` | Approximately | `pandas~2.0.0` | 2.0.0, 2.0.1, 2.0.5, but NOT 2.1.0 |
| `>=2.5.1` | Greater or equal | `requests>=2.5.1` | 2.5.1, 2.6.0, 3.0.0, etc. |
| `2.0.0` | Exact match | `flask@2.0.0` | Only 2.0.0 |

### Real Examples

**Example 1: pandas package**
```json
{
  "name": "myorg@pandas",
  "version": "2.0.0",
  "dependencies": [
    { "name": "numpy", "version": "^1.20.0" },
    { "name": "python-dateutil", "version": "^2.8.0" },
    { "name": "pytz", "version": "~2021.3" }
  ]
}
```

This means:
- ✅ Requires numpy version 1.20.0 or compatible (1.20.x, 1.21.x, etc.)
- ✅ Requires python-dateutil ^2.8.0 (2.8.x, 2.9.x, but not 3.0.0)
- ✅ Requires pytz ~2021.3 (approximately 2021.3.x)

**Example 2: flask package**
```json
{
  "name": "myorg@flask",
  "version": "3.0.0",
  "dependencies": [
    { "name": "werkzeug", "version": "^2.3.0" },
    { "name": "click", "version": "^8.0.0" },
    { "name": "Jinja2", "version": ">=3.0.0" }
  ]
}
```

---

## ✅ Python Module Examples

The portal includes pre-configured examples for common Python packages:

### 1. NumPy 1.24.0
- **Description:** Fundamental package for numerical and scientific computing
- **Dependencies:** python-dateutil ^2.8.0, pytz ^2021.3
- **Use case:** Matrix operations, mathematical functions, linear algebra

### 2. Pandas 2.0.0
- **Description:** Data structures and data analysis tools
- **Dependencies:** numpy ^1.20.0, python-dateutil ^2.8.0
- **Use case:** Data manipulation, analysis, tabular data processing

### 3. Requests 2.31.0
- **Description:** HTTP library for Python
- **Dependencies:** charset-normalizer ^2.0.0, idna ^3.0
- **Use case:** Making HTTP requests, REST API calls

### 4. Flask 3.0.0
- **Description:** Micro web framework for Python
- **Dependencies:** werkzeug ^2.3.0, click ^8.0.0
- **Use case:** Building REST APIs, web applications

### How to Use Examples

1. Click **"📦 Python Module Examples"** on the upload form
2. Review the package details and dependencies
3. Click **"Use Example"** button
4. Form auto-fills with realistic data
5. Prepare your package file and upload

---

## 🔄 Dependency Compatibility Checking

### Check Compatibility (API)

The system provides an endpoint to verify if your environment meets package dependencies:

```bash
POST /packages/check-compatibility
Content-Type: application/json

{
  "packageName": "myorg@pandas",
  "version": "2.0.0",
  "dependencies": {
    "numpy": "1.24.0",
    "python-dateutil": "2.8.2",
    "pytz": "2021.3"
  }
}
```

**Response (Compatible):**
```json
{
  "compatible": true,
  "satisfiedDependencies": [
    {
      "name": "numpy",
      "required": "^1.20.0",
      "provided": "1.24.0",
      "compatible": true
    }
  ],
  "conflicts": []
}
```

**Response (Incompatible):**
```json
{
  "compatible": false,
  "conflicts": [
    {
      "name": "numpy",
      "required": "^1.20.0",
      "provided": "1.19.0",
      "compatible": false
    }
  ]
}
```

### Download with Version Check

When downloading, the system validates your current environment:

```bash
GET /packages/download/myorg@pandas/2.0.0?require.numpy=1.24.0&require.dateutil=2.8.2
```

Returns `409 Conflict` if dependency versions don't match.

---

## 📊 Package Management Features

### List All Versions of a Package

View the complete version history:

```bash
GET /packages/versions/myorg@numpy
```

**Response:**
```json
{
  "packageName": "myorg@numpy",
  "versions": [
    {
      "version": "1.24.0",
      "created_at": "2026-04-14T10:00:00Z",
      "downloads": 42,
      "description": "Scientific computing library"
    },
    {
      "version": "1.23.5",
      "created_at": "2026-04-13T15:30:00Z",
      "downloads": 18,
      "description": "Scientific computing library"
    }
  ]
}
```

### Search Packages

Find packages by name and type:

```bash
GET /packages/search?q=numpy&type=python
GET /packages/search?q=pandas
```

### Get Package Details

Get full information about a specific version:

```bash
GET /packages/myorg@numpy/1.24.0
```

**Response:**
```json
{
  "id": 1,
  "name": "myorg@numpy",
  "version": "1.24.0",
  "description": "Scientific computing library",
  "package_type": "python",
  "downloads": 42,
  "dependencies": [
    { "name": "python-dateutil", "version": "^2.8.0" },
    { "name": "pytz", "version": "^2021.3" }
  ],
  "created_at": "2026-04-14T10:00:00Z",
  "uploaded_by_name": "John Doe"
}
```

---

## 🗑️ Delete Package Version

Remove a specific package version (only owner or admin):

```bash
DELETE /packages/myorg@numpy/1.24.0
```

---

## 📋 Best Practices

### 1. **Version Naming**
- Use semantic versioning: MAJOR.MINOR.PATCH (e.g., 1.24.0)
- Increment MAJOR for breaking changes
- Increment MINOR for backward-compatible features
- Increment PATCH for bug fixes

### 2. **Dependency Management**
- Document all dependencies when uploading
- Use compatible versions (`^`) for library packages
- Use approximate versions (`~`) for minor version constraints
- Use exact versions for production deployments

### 3. **Organization Format**
- Keep organization names consistent
- Use lowercase letters and hyphens
- Examples: `techcorp`, `acme-labs`, `mycompany`

### 4. **Documentation**
- Write clear, descriptive package descriptions
- Include version-specific changes in description
- Mention breaking changes prominently

### 5. **Testing**
- Test packages locally before uploading
- Verify dependencies in test environment
- Check compatibility with dependent packages

---

## 🚀 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/packages/upload` | Upload new package |
| **GET** | `/packages/download/:name/:version` | Download package |
| **GET** | `/packages/:name/:version` | Get package details |
| **GET** | `/packages/versions/:name` | List all versions |
| **GET** | `/packages/search` | Search packages |
| **GET** | `/packages/org/:organization` | List org packages (paginated) |
| **POST** | `/packages/check-compatibility` | Verify dependency compatibility |
| **DELETE** | `/packages/:name/:version` | Delete package version |

---

## 🔐 Access Control

- **Upload:** Only users can upload to their organization
- **Download:** All authenticated users can download
- **Delete:** Only package owner or admin
- **Organization:** Enforced on upload - `user.organization` must match package org

---

## 📝 Example Workflow

### Scenario: Upload and Download numpy

**Step 1: Prepare Package**
```bash
# Create numpy package (1.24.0)
tar -czf numpy-1.24.0.tar.gz numpy/
```

**Step 2: Upload via Portal**
1. Navigate to "Upload Package"
2. Enter:
   - Package Name: `techcorp@numpy`
   - Version: `1.24.0`
   - Description: "NumPy 1.24.0 - numerical computing"
   - Type: Python
   - Dependencies: `[{"name": "python-dateutil", "version": "^2.8.0"}]`
   - File: `numpy-1.24.0.tar.gz`
3. Click "Upload"

**Step 3: Verify Upload**
- Package appears in "Download Packages" section
- Shows v1.24.0 with dependencies listed

**Step 4: Download**
1. Navigate to "Download Packages"
2. Search for `techcorp@numpy`
3. Click "Download" for v1.24.0
4. File saves as `techcorp@numpy-1.24.0.tar.gz`

**Step 5: Check Version History**
1. Click "Show All Versions"
2. See all uploaded versions
3. Download any historical version

---

## 🐛 Troubleshooting

### Issue: "Package version already exists"
**Solution:** Use a new version number. Check existing versions with "Show All Versions".

### Issue: "Not authorized to upload to this organization"
**Solution:** Package name organization must match your user's organization. Contact admin to change your org.

### Issue: "Dependency version conflict" when downloading
**Solution:** Check compatibility with `POST /packages/check-compatibility`. Install the required dependency versions.

### Issue: File format not accepted
**Solution:** Use supported formats: `.tar.gz`, `.zip`, `.jar`, `.whl`, `.tgz`. Max file size is 100MB.

---

## 📞 Support

For issues or questions:
1. Check the examples in the upload form
2. Review dependency version constraints
3. Verify your file format (tar.gz for Python)
4. Contact your portal administrator

---

**Last Updated:** April 14, 2026  
**Version:** 1.0
