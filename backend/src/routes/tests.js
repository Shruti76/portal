const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const db = require('../config/database');

const router = express.Router();
const execPromise = promisify(exec);

// Test execution service
const testExecutors = {
  'java': executeJavaTests,
  'python': executePythonTests,
  'nodejs': executeNodeTests,
  'dotnet': executeDotNetTests,
  'go': executeGoTests,
};

async function executeJavaTests(packagePath, packageName) {
  try {
    // Look for Maven or Gradle build files
    const pom = path.join(packagePath, 'pom.xml');
    const gradle = path.join(packagePath, 'build.gradle');

    if (fs.existsSync(pom)) {
      const { stdout, stderr } = await execPromise('mvn test', { cwd: packagePath, timeout: 300000 });
      return { success: true, output: stdout, errors: stderr };
    } else if (fs.existsSync(gradle)) {
      const { stdout, stderr } = await execPromise('./gradlew test', { cwd: packagePath, timeout: 300000 });
      return { success: true, output: stdout, errors: stderr };
    } else {
      return { success: false, error: 'No Java build configuration found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executePythonTests(packagePath, packageName) {
  try {
    // Check for requirements.txt or setup.py
    const requirements = path.join(packagePath, 'requirements.txt');
    const setup = path.join(packagePath, 'setup.py');

    if (fs.existsSync(requirements)) {
      await execPromise('pip install -r requirements.txt', { cwd: packagePath });
    }

    // Run pytest or unittest
    let { stdout, stderr } = await execPromise('python -m pytest -v', { cwd: packagePath, timeout: 300000 });
    if (!fs.existsSync(path.join(packagePath, 'pytest.ini'))) {
      ({ stdout, stderr } = await execPromise('python -m unittest discover -v', { cwd: packagePath, timeout: 300000 }));
    }

    return { success: true, output: stdout, errors: stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeNodeTests(packagePath, packageName) {
  try {
    const packageJson = path.join(packagePath, 'package.json');

    if (!fs.existsSync(packageJson)) {
      return { success: false, error: 'package.json not found' };
    }

    // Install dependencies
    await execPromise('npm install', { cwd: packagePath, timeout: 300000 });

    // Run tests
    const { stdout, stderr } = await execPromise('npm test', { cwd: packagePath, timeout: 300000 });
    return { success: true, output: stdout, errors: stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeDotNetTests(packagePath, packageName) {
  try {
    const { stdout, stderr } = await execPromise('dotnet test', { cwd: packagePath, timeout: 300000 });
    return { success: true, output: stdout, errors: stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeGoTests(packagePath, packageName) {
  try {
    const { stdout, stderr } = await execPromise('go test ./...', { cwd: packagePath, timeout: 300000 });
    return { success: true, output: stdout, errors: stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Execute tests endpoint
router.post('/execute', async (req, res) => {
  try {
    const { packageId, packageType, packagePath } = req.body;

    if (!packageId || !packageType || !packagePath) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const testExecutor = testExecutors[packageType];
    if (!testExecutor) {
      return res.status(400).json({ error: `Unsupported package type: ${packageType}` });
    }

    // Create test run record
    const testRunResult = await db.query(
      `INSERT INTO test_runs (package_id, executed_by, status, started_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [packageId, req.user.id, 'running']
    );

    const testRunId = testRunResult.rows[0].id;

    // Execute tests asynchronously
    testExecutor(packagePath, req.body.packageName)
      .then(async (result) => {
        await db.query(
          `UPDATE test_runs SET status = $1, output = $2, error_output = $3, finished_at = NOW()
           WHERE id = $4`,
          [result.success ? 'passed' : 'failed', result.output || '', result.errors || '', testRunId]
        );
      })
      .catch(async (error) => {
        await db.query(
          `UPDATE test_runs SET status = $1, error_output = $2, finished_at = NOW()
           WHERE id = $3`,
          ['failed', error.message, testRunId]
        );
      });

    res.status(202).json({
      message: 'Test execution started',
      testRunId,
      status: 'running',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Test execution failed' });
  }
});

// Get test results
router.get('/results/:testRunId', async (req, res) => {
  try {
    const { testRunId } = req.params;

    const result = await db.query(
      `SELECT tr.*, p.name, p.version, u.full_name
       FROM test_runs tr
       JOIN packages p ON tr.package_id = p.id
       JOIN users u ON tr.executed_by = u.id
       WHERE tr.id = $1`,
      [testRunId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

// Get test history for a package
router.get('/package/:packageId/history', async (req, res) => {
  try {
    const { packageId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT tr.*, u.full_name
       FROM test_runs tr
       JOIN users u ON tr.executed_by = u.id
       WHERE tr.package_id = $1
       ORDER BY tr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [packageId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM test_runs WHERE package_id = $1',
      [packageId]
    );

    res.json({
      history: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
});

module.exports = router;
