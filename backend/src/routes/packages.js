const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const router = express.Router();

// Setup multer for file uploads
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.tar.gz', '.zip', '.jar', '.whl', '.tgz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.some(e => file.originalname.endsWith(e))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'));
    }
  },
});

// Helper function to parse semantic versioning
const parseVersion = (versionStr) => {
  const parts = versionStr.split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
    full: versionStr,
  };
};

// Helper function to check if version satisfies constraint
const versionSatisfies = (actualVersion, constraint) => {
  if (!constraint) return true;
  
  const actual = parseVersion(actualVersion);
  
  // Handle ^X.Y.Z (compatible with version)
  if (constraint.startsWith('^')) {
    const required = parseVersion(constraint.substring(1));
    return actual.major === required.major && 
           (actual.minor > required.minor || 
            (actual.minor === required.minor && actual.patch >= required.patch));
  }
  
  // Handle ~X.Y.Z (approximately)
  if (constraint.startsWith('~')) {
    const required = parseVersion(constraint.substring(1));
    return actual.major === required.major && actual.minor === required.minor && actual.patch >= required.patch;
  }
  
  // Handle >=X.Y.Z
  if (constraint.startsWith('>=')) {
    const required = parseVersion(constraint.substring(2));
    return actual.major > required.major || 
           (actual.major === required.major && actual.minor > required.minor) ||
           (actual.major === required.major && actual.minor === required.minor && actual.patch >= required.patch);
  }
  
  // Handle exact version
  return actualVersion === constraint;
};

// Upload package
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { packageName, version, description, packageType, dependencies } = req.body;

    if (!req.file || !packageName || !version || !packageType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate package name format (myorg@package)
    const parts = packageName.split('@');
    if (parts.length !== 2) {
      return res.status(400).json({ error: 'Package name must be in format: myorg@package' });
    }

    const [org, name] = parts;

    // Check if user has permission to upload to this organization
    const userOrg = await db.query(
      'SELECT organization FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userOrg.rows[0].organization !== org) {
      return res.status(403).json({ error: 'Not authorized to upload to this organization' });
    }

    // Check if package version exists
    const existingPackage = await db.query(
      'SELECT id FROM packages WHERE name = $1 AND version = $2',
      [packageName, version]
    );

    if (existingPackage.rows.length > 0) {
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      return res.status(400).json({ error: 'Package version already exists' });
    }

    // Parse dependencies (JSON format or comma-separated)
    let parsedDeps = [];
    if (dependencies) {
      try {
        parsedDeps = typeof dependencies === 'string' ? JSON.parse(dependencies) : dependencies;
      } catch (e) {
        parsedDeps = [];
      }
    }

    // Insert into database
    const result = await db.query(
      `INSERT INTO packages (name, version, description, package_type, file_path, uploaded_by, organization, dependencies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [packageName, version, description || '', packageType, req.file.filename, req.user.id, org, JSON.stringify(parsedDeps)]
    );

    res.status(201).json({
      message: 'Package uploaded successfully',
      package: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download package with version compatibility check
router.get('/download/:packageName/:version', async (req, res) => {
  try {
    const { packageName, version } = req.params;
    const requiredVersions = req.query.require || {}; // e.g., ?require.numpy=^1.20.0

    const result = await db.query(
      'SELECT * FROM packages WHERE name = $1 AND version = $2',
      [packageName, version]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const pkg = result.rows[0];
    
    // Check dependencies compatibility
    if (pkg.dependencies && pkg.dependencies.length > 0) {
      const deps = JSON.parse(pkg.dependencies);
      const incompatibleDeps = [];

      for (const dep of deps) {
        const depName = dep.name || dep;
        const constraint = dep.version || '^1.0.0';
        
        if (requiredVersions[depName]) {
          if (!versionSatisfies(requiredVersions[depName], constraint)) {
            incompatibleDeps.push({
              name: depName,
              required: constraint,
              provided: requiredVersions[depName],
            });
          }
        }
      }

      if (incompatibleDeps.length > 0) {
        return res.status(409).json({
          error: 'Dependency version conflict',
          conflicts: incompatibleDeps,
          required: pkg.dependencies,
        });
      }
    }

    const filePath = path.join(uploadsDir, pkg.file_path);

    // Update download count
    await db.query(
      'UPDATE packages SET downloads = downloads + 1 WHERE id = $1',
      [pkg.id]
    );

    res.download(filePath, `${packageName}-${version}.tar.gz`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get package details
router.get('/:packageName/:version', async (req, res) => {
  try {
    const { packageName, version } = req.params;

    const result = await db.query(
      `SELECT p.*, u.full_name as uploaded_by_name 
       FROM packages p
       JOIN users u ON p.uploaded_by = u.id
       WHERE p.name = $1 AND p.version = $2`,
      [packageName, version]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

// List all packages for an organization
router.get('/org/:organization', async (req, res) => {
  try {
    const { organization } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, u.full_name as uploaded_by_name
       FROM packages p
       JOIN users u ON p.uploaded_by = u.id
       WHERE p.organization = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [organization, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM packages WHERE organization = $1',
      [organization]
    );

    res.json({
      packages: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Search packages
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;

    let query = 'SELECT * FROM packages WHERE name ILIKE $1';
    let params = [`%${q}%`];

    if (type) {
      query += ' AND package_type = $2';
      params.push(type);
    }

    query += ' ORDER BY downloads DESC LIMIT 50';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all versions of a package
router.get('/versions/:packageName', async (req, res) => {
  try {
    const { packageName } = req.params;

    const result = await db.query(
      `SELECT version, created_at, downloads, description 
       FROM packages 
       WHERE name = $1 
       ORDER BY created_at DESC`,
      [packageName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({
      packageName,
      versions: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Check version compatibility
router.post('/check-compatibility', async (req, res) => {
  try {
    const { packageName, version, dependencies } = req.body;

    // Get package info
    const pkg = await db.query(
      'SELECT * FROM packages WHERE name = $1 AND version = $2',
      [packageName, version]
    );

    if (pkg.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const packageData = pkg.rows[0];
    const packageDeps = packageData.dependencies ? JSON.parse(packageData.dependencies) : [];
    
    // Check compatibility with provided dependencies
    const compatibility = {
      compatible: true,
      conflicts: [],
      satisfiedDependencies: [],
    };

    for (const dep of packageDeps) {
      const depName = dep.name || dep;
      const constraint = dep.version || '^1.0.0';
      const providedVersion = dependencies?.[depName];

      if (providedVersion) {
        if (versionSatisfies(providedVersion, constraint)) {
          compatibility.satisfiedDependencies.push({
            name: depName,
            required: constraint,
            provided: providedVersion,
            compatible: true,
          });
        } else {
          compatibility.compatible = false;
          compatibility.conflicts.push({
            name: depName,
            required: constraint,
            provided: providedVersion,
            compatible: false,
          });
        }
      } else {
        compatibility.compatible = false;
        compatibility.conflicts.push({
          name: depName,
          required: constraint,
          provided: 'missing',
          compatible: false,
        });
      }
    }

    res.json(compatibility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Compatibility check failed' });
  }
});

// Delete package version
router.delete('/:packageName/:version', async (req, res) => {
  try {
    const { packageName, version } = req.params;

    const pkg = await db.query(
      'SELECT * FROM packages WHERE name = $1 AND version = $2',
      [packageName, version]
    );

    if (pkg.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Check if user is owner or admin
    if (pkg.rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this package' });
    }

    // Delete file
    const filePath = path.join(uploadsDir, pkg.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query('DELETE FROM packages WHERE id = $1', [pkg.rows[0].id]);

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
