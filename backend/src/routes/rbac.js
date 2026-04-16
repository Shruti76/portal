const express = require('express');
const db = require('../config/database');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Roles and permissions mapping
const rolePermissions = {
  admin: [
    'manage_users',
    'manage_roles',
    'upload_package',
    'download_package',
    'execute_tests',
    'delete_package',
    'view_all_packages',
    'manage_organizations',
    'view_test_reports',
  ],
  maintainer: [
    'upload_package',
    'download_package',
    'execute_tests',
    'delete_package',
    'view_test_reports',
  ],
  developer: [
    'download_package',
    'execute_tests',
    'view_test_reports',
  ],
  viewer: [
    'download_package',
    'view_test_reports',
  ],
};

// Get user role and permissions
router.get('/user/:userId', authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      'SELECT id, email, full_name, role, organization FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const permissions = rolePermissions[user.role] || [];

    res.json({
      user,
      permissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
});

// Update user role
router.put('/user/:userId/role', authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'maintainer', 'developer', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated',
      user: result.rows[0],
      permissions: rolePermissions[role],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all users in organization
router.get('/organization/:organization', authorize(['admin']), async (req, res) => {
  try {
    const { organization } = req.params;

    const result = await db.query(
      'SELECT id, email, full_name, role, organization FROM users WHERE organization = $1 ORDER BY created_at DESC',
      [organization]
    );

    const usersWithPermissions = result.rows.map(user => ({
      ...user,
      permissions: rolePermissions[user.role] || [],
    }));

    res.json(usersWithPermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch organization users' });
  }
});

// Check permission
router.post('/check-permission', async (req, res) => {
  try {
    const { permission } = req.body;

    const result = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = result.rows[0].role;
    const permissions = rolePermissions[userRole] || [];
    const hasPermission = permissions.includes(permission);

    res.json({
      hasPermission,
      permission,
      role: userRole,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Permission check failed' });
  }
});

// Get all available roles
router.get('/roles', (req, res) => {
  const roles = Object.keys(rolePermissions).map(role => ({
    name: role,
    permissions: rolePermissions[role],
    description: getRoleDescription(role),
  }));

  res.json(roles);
});

function getRoleDescription(role) {
  const descriptions = {
    admin: 'Full access to all resources and user management',
    maintainer: 'Can upload, manage packages and execute tests',
    developer: 'Can download packages and execute tests',
    viewer: 'Can only download packages and view reports',
  };
  return descriptions[role] || '';
}

module.exports = router;
