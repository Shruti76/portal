const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const {
  triggerWorkflow,
  getWorkflowRun,
  getJobLogs,
  getRecentRuns,
  getAvailableWorkflows,
  cancelWorkflowRun,
} = require('../config/github');

const router = express.Router();

/**
 * Get available workflows
 */
router.get('/workflows', authenticateToken, async (req, res) => {
  try {
    const workflows = await getAvailableWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch workflows' });
  }
});

/**
 * Trigger a workflow execution
 */
router.post(
  '/execute',
  authenticateToken,
  [
    body('workflowFile').notEmpty().withMessage('Workflow file is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('inputs').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workflowFile, projectId, inputs = {} } = req.body;
    const executionId = uuidv4();

    try {
      // Verify project exists
      const projectResult = await db.query(
        'SELECT * FROM code_projects WHERE id = $1',
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Trigger GitHub Actions workflow
      const triggerResult = await triggerWorkflow(workflowFile, {
        ...inputs,
        projectId,
        executedBy: req.user.email,
      });

      // Store execution record in database
      const executionResult = await db.query(
        'INSERT INTO workflow_executions (id, project_id, workflow_file, status, triggered_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [executionId, projectId, workflowFile, 'triggered', req.user.id]
      );

      res.status(201).json({
        execution: executionResult.rows[0],
        workflowStatus: triggerResult,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to trigger workflow' });
    }
  }
);

/**
 * Get execution details with logs
 */
router.get('/executions/:executionId', authenticateToken, async (req, res) => {
  const { executionId } = req.params;

  try {
    // Get execution from database
    const executionResult = await db.query(
      'SELECT * FROM workflow_executions WHERE id = $1',
      [executionId]
    );

    if (executionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const execution = executionResult.rows[0];

    // Get GitHub Actions run details
    let runDetails = null;
    let jobLogs = null;

    if (execution.github_run_id) {
      try {
        runDetails = await getWorkflowRun(execution.github_run_id);
        jobLogs = await getJobLogs(execution.github_run_id);
      } catch (logError) {
        console.error('Error fetching GitHub details:', logError);
      }
    }

    res.json({
      execution,
      runDetails,
      jobLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch execution details' });
  }
});

/**
 * Get execution logs
 */
router.get('/executions/:executionId/logs', authenticateToken, async (req, res) => {
  const { executionId } = req.params;

  try {
    const executionResult = await db.query(
      'SELECT * FROM workflow_executions WHERE id = $1',
      [executionId]
    );

    if (executionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const execution = executionResult.rows[0];

    if (!execution.github_run_id) {
      return res.status(400).json({ error: 'No GitHub run associated with this execution' });
    }

    // Get job logs from GitHub
    const jobLogs = await getJobLogs(execution.github_run_id);

    res.json({
      executionId,
      logs: jobLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch logs' });
  }
});

/**
 * Get execution history for a project
 */
router.get(
  '/projects/:projectId/executions',
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    try {
      const result = await db.query(
        'SELECT * FROM workflow_executions WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [projectId, parseInt(limit), parseInt(offset)]
      );

      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM workflow_executions WHERE project_id = $1',
        [projectId]
      );

      res.json({
        executions: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch execution history' });
    }
  }
);

/**
 * Cancel a workflow execution
 */
router.post(
  '/executions/:executionId/cancel',
  authenticateToken,
  async (req, res) => {
    const { executionId } = req.params;

    try {
      const executionResult = await db.query(
        'SELECT * FROM workflow_executions WHERE id = $1',
        [executionId]
      );

      if (executionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      const execution = executionResult.rows[0];

      if (!execution.github_run_id) {
        return res.status(400).json({ error: 'Cannot cancel execution without GitHub run ID' });
      }

      // Cancel on GitHub
      const cancelResult = await cancelWorkflowRun(execution.github_run_id);

      // Update database
      await db.query(
        'UPDATE workflow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', executionId]
      );

      res.json({
        message: 'Execution cancelled successfully',
        githubStatus: cancelResult,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to cancel execution' });
    }
  }
);

/**
 * Update execution with GitHub run ID (called after workflow is triggered)
 */
router.patch(
  '/executions/:executionId',
  authenticateToken,
  [body('github_run_id').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { executionId } = req.params;
    const { github_run_id, status } = req.body;

    try {
      const result = await db.query(
        'UPDATE workflow_executions SET github_run_id = $1, status = COALESCE($2, status), updated_at = NOW() WHERE id = $3 RETURNING *',
        [github_run_id, status, executionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update execution' });
    }
  }
);

module.exports = router;
