const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Create a new project/code file
 */
router.post(
  '/projects',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('language').notEmpty().withMessage('Programming language is required'),
    body('description').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, language, description } = req.body;
    const projectId = uuidv4();

    try {
      const result = await db.query(
        'INSERT INTO code_projects (id, name, language, description, created_by, organization) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [projectId, name, language, description || '', req.user.id, req.user.organization || 'default']
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

/**
 * Get all projects for user's organization
 */
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM code_projects WHERE organization = $1 OR created_by = $2 ORDER BY created_at DESC',
      [req.user.organization || 'default', req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * Get project details and code
 */
router.get('/projects/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM code_projects WHERE id = $1',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * Update project code/content
 */
router.put(
  '/projects/:projectId',
  authenticateToken,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('name').optional(),
    body('description').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { code, name, description } = req.body;

    try {
      // Check if user has permission
      const projectCheck = await db.query(
        'SELECT created_by FROM code_projects WHERE id = $1',
        [projectId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (projectCheck.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const result = await db.query(
        'UPDATE code_projects SET code = $1, name = COALESCE($2, name), description = COALESCE($3, description), updated_at = NOW() WHERE id = $4 RETURNING *',
        [code, name, description, projectId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
);

/**
 * Delete project
 */
router.delete('/projects/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if user has permission
    const projectCheck = await db.query(
      'SELECT created_by FROM code_projects WHERE id = $1',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectCheck.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await db.query('DELETE FROM code_projects WHERE id = $1', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * Save project snapshot/version
 */
router.post(
  '/projects/:projectId/versions',
  authenticateToken,
  [
    body('message').notEmpty().withMessage('Commit message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { message } = req.body;
    const versionId = uuidv4();

    try {
      // Get current project code
      const projectResult = await db.query(
        'SELECT code FROM code_projects WHERE id = $1',
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const result = await db.query(
        'INSERT INTO code_versions (id, project_id, code, message, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [versionId, projectId, projectResult.rows[0].code, message, req.user.id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create version' });
    }
  }
);

/**
 * Get project versions/history
 */
router.get('/projects/:projectId/versions', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM code_versions WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

/**
 * Restore project to a previous version
 */
router.post(
  '/projects/:projectId/versions/:versionId/restore',
  authenticateToken,
  async (req, res) => {
    const { projectId, versionId } = req.params;

    try {
      // Check permission
      const projectCheck = await db.query(
        'SELECT created_by FROM code_projects WHERE id = $1',
        [projectId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (projectCheck.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Get version code
      const versionResult = await db.query(
        'SELECT code FROM code_versions WHERE id = $1 AND project_id = $2',
        [versionId, projectId]
      );

      if (versionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      // Update project with old code
      const result = await db.query(
        'UPDATE code_projects SET code = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [versionResult.rows[0].code, projectId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to restore version' });
    }
  }
);

module.exports = router;
